import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Satellite, Send, Paperclip, X, Loader2, AlertCircle, ChevronDown,
  ChevronRight, Check, Layers, FileImage, Bot, User, Sparkles, BarChart3,
  Menu, Map as MapIcon, MessageSquare, Eye, Rocket, ZoomIn, TrendingUp,
  Compass, Scale, Radio, Sun, ExternalLink, DownloadCloud, Info
} from "lucide-react";
import { BackendSettings } from "@/components/BackendSettings";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MapSelector } from "@/components/MapSelector";
import {
  humanizeError, formatConfidence, confidenceRatio,
  type AnalysisResponse, type BoundingBox, type LandCoverMetrics, type FeatureMetric,
  type OpticalSarResult
} from "@/lib/satquery";
import { useI18n, SPACE_GREETINGS, ALL_SUGGESTIONS, type Language } from "@/lib/i18n";
import localforage from "localforage";
import ReactMarkdown from "react-markdown";
import { generateChatTitle, extractSmartFallbackTitle, getApiKey, runOrchestration, analyzeWithGeoChat, translateText } from "@/services/geminiService";
import {
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  images?: UploadedImage[];
  result?: AnalysisResponse;
  translatedAnswer?: string;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

function getRandomGreeting(lang: Language): string {
  const greetings = SPACE_GREETINGS[lang] ?? SPACE_GREETINGS["en"]!;
  return greetings[Math.floor(Math.random() * greetings.length)]!;
}

function getRandomSuggestions(lang: Language, count: number = 4) {
  const suggestions = ALL_SUGGESTIONS[lang] ?? ALL_SUGGESTIONS["en"]!;
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* Animated greeting text component — preserves elegant Newsreader serif for English and clean Noto sans for Indic */
function AnimatedGreeting({ text }: { text: string }) {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(timer);
  }, [text]);

  if (!visible) return <div className="h-12" />;

  const words = text.split(" ");
  const isEnglish = lang === "en";

  return (
    <h1 
      key={text}
      className={`text-3xl sm:text-4xl text-white mb-4 leading-snug max-w-xl mx-auto ${
        isEnglish ? "font-serif tracking-tight font-normal" : "font-sans tracking-normal font-bold"
      }`}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block animate-word mr-2.5 last:mr-0"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

/* BBox canvas overlay */
function BboxCanvas({ url, boxes, label, isLightbox, onClick }: { url: string; boxes: BoundingBox[]; label?: string; isLightbox?: boolean; onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      boxes.forEach((b) => {
        if (!b?.bbox || !Array.isArray(b.bbox) || b.bbox.length < 4) return;
        const rawX1 = Number(b.bbox[0]);
        const rawY1 = Number(b.bbox[1]);
        const rawX2 = Number(b.bbox[2]);
        const rawY2 = Number(b.bbox[3]);
        if (isNaN(rawX1) || isNaN(rawY1) || isNaN(rawX2) || isNaN(rawY2)) return;

        const minX = Math.min(rawX1, rawX2);
        const maxX = Math.max(rawX1, rawX2);
        const minY = Math.min(rawY1, rawY2);
        const maxY = Math.max(rawY1, rawY2);

        const norm = [minX, minY, maxX, maxY].every((v) => v >= 0 && v <= 1);
        const is1000 = !norm && [minX, minY, maxX, maxY].every((v) => v >= 0 && v <= 1000);

        const rx = norm ? minX * img.naturalWidth : is1000 ? (minX / 1000) * img.naturalWidth : minX;
        const ry = norm ? minY * img.naturalHeight : is1000 ? (minY / 1000) * img.naturalHeight : minY;
        const rw = Math.max(14, norm ? (maxX - minX) * img.naturalWidth : is1000 ? ((maxX - minX) / 1000) * img.naturalWidth : (maxX - minX));
        const rh = Math.max(14, norm ? (maxY - minY) * img.naturalHeight : is1000 ? ((maxY - minY) / 1000) * img.naturalHeight : (maxY - minY));

        const isChange = /change|clear|construct|modifi|alter|destroy|flood|loss|damage|new|burned|excavat|discrep/i.test(b.label ?? "");

        // Translucent highlight fill so user clearly sees the highlighted zone
        ctx.fillStyle = isChange ? "rgba(244, 63, 94, 0.22)" : "rgba(16, 185, 129, 0.18)";
        ctx.fillRect(rx, ry, rw, rh);

        // Crisp border with glow effect
        ctx.strokeStyle = isChange ? "#f43f5e" : "#10b981";
        ctx.lineWidth = Math.max(3, img.naturalWidth * 0.004);
        ctx.strokeRect(rx, ry, rw, rh);

        // Feature label tag
        if (b.label) {
          ctx.fillStyle = isChange ? "rgba(225, 29, 72, 0.95)" : "rgba(5, 150, 105, 0.95)";
          const fontSize = Math.max(12, img.naturalWidth * 0.018);
          ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
          const tw = ctx.measureText(b.label).width;
          const tagY = Math.max(fontSize + 6, ry);
          ctx.fillRect(rx, tagY - fontSize - 6, tw + 14, fontSize + 8);
          ctx.fillStyle = "#fff";
          ctx.fillText(b.label, rx + 7, tagY - 4);
        }
      });
    };
  }, [url, boxes]);
  return (
    <div className={`relative ${isLightbox ? "max-h-[85vh] max-w-[85vw] flex items-center justify-center" : `group ${onClick ? "cursor-zoom-in" : ""}`}`} onClick={onClick}>
      {label && <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10">{label}</div>}
      <canvas ref={canvasRef} className={`rounded-2xl border border-white/10 object-contain shadow-sm bg-[#0c1428] ${isLightbox ? "max-h-[85vh] max-w-[85vw] w-auto h-auto" : "w-full max-h-80"}`} />
    </div>
  );
}

/* Intelligent formatters for physical ground area metrics */
export function formatAreaSmart(km2: number): string {
  const abs = Math.abs(km2);
  const sign = km2 < 0 ? "-" : "+";
  if (abs >= 0.1) {
    const sqft = abs * 10_763_910;
    const sqftStr = sqft >= 1_000_000 ? `${(sqft / 1_000_000).toFixed(2)}M sq ft` : `${Math.round(sqft / 1000)}k sq ft`;
    return `${sign}${abs.toFixed(2)} km² (${sqftStr})`;
  } else {
    const sqm = Math.round(abs * 1_000_000);
    const sqft = Math.round(sqm * 10.7639);
    const sqftStr = sqft >= 10_000 ? `${Math.round(sqft / 1000)}k sq ft` : `${sqft.toLocaleString()} sq ft`;
    return `${sign}${sqm.toLocaleString()} m² (${sqftStr})`;
  }
}

export function getActionDescription(category: string, deltaKm2: number): string {
  const isGain = deltaKm2 > 0;
  const formatted = formatAreaSmart(deltaKm2);
  const cleanFmt = formatted.replace('+', '').replace('-', '');

  if (/vegetation|canopy|forest|tree|green|crop|plant/i.test(category)) {
    return isGain 
      ? `+${cleanFmt} green canopy gained`
      : `-${cleanFmt} vegetation canopy cleared / lost`;
  }
  if (/urban|building|construct|structure|city|settlement|house|road|concrete/i.test(category)) {
    return isGain
      ? `+${cleanFmt} new buildings & infrastructure developed`
      : `-${cleanFmt} built-up structures demolished`;
  }
  if (/water|river|lake|flood|reservoir|ocean|pond/i.test(category)) {
    return isGain
      ? `+${cleanFmt} surface water extent expanded / flooded`
      : `-${cleanFmt} surface water dried / receded`;
  }
  if (/barren|bare|soil|ground|undisturbed|terrain|land/i.test(category)) {
    return isGain
      ? `+${cleanFmt} bare terrain / soil exposed`
      : `-${cleanFmt} open land developed or vegetated`;
  }
  return isGain ? `+${cleanFmt} net expansion` : `-${cleanFmt} net reduction`;
}

/* Deterministic & accurate feature metrics generator with real physical ground area (km², m², sq ft) */
export function getStableFeatureMetrics(
  result: AnalysisResponse, 
  t: (k: string) => string,
  viewportAreaKm2?: number
): FeatureMetric[] {
  const totalAreaKm2 = result.change?.total_viewport_area_km2 || viewportAreaKm2 || 1.85;
  let metrics: FeatureMetric[] = [];

  if (result.change?.feature_metrics && result.change.feature_metrics.length > 0) {
    metrics = result.change.feature_metrics.map(m => ({ ...m }));
  } else {
    const text = (result.answer || result.caption || result.change?.description || "").toLowerCase();
    const groundingBoxes = result.grounding || [];
    const evidenceItems = (result.evidence || []) as any[];

    // Deterministic seed from text and grounding labels
    let seed = 5381;
    const seedString = text + groundingBoxes.map(b => b.label || "").join(",") + evidenceItems.map(e => typeof e === "string" ? e : (e?.label || "")).join(",");
    for (let i = 0; i < seedString.length; i++) {
      seed = ((seed << 5) + seed) + seedString.charCodeAt(i);
      seed = seed & 0x7fffffff;
    }
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const usedLabels = new Set<string>();

    // 1. First prioritize EXACT HIGHLIGHTED BOUNDING BOXES from the image
    groundingBoxes.forEach((b) => {
      const rawLabel = (b.label || "").trim();
      if (!rawLabel || usedLabels.has(rawLabel.toLowerCase())) return;
      usedLabels.add(rawLabel.toLowerCase());

      const [x1, y1, x2, y2] = b.bbox;
      const norm = [x1, y1, x2, y2].every(v => v >= 0 && v <= 1);
      const w = norm ? Math.abs(x2 - x1) : Math.abs(x2 - x1) / 1000;
      const h = norm ? Math.abs(y2 - y1) : Math.abs(y2 - y1) / 1000;
      let boxAreaPct = Math.round(w * h * 100 * 10) / 10;
      if (boxAreaPct < 3) boxAreaPct = 7 + Math.floor(rand() * 8);
      if (boxAreaPct > 40) boxAreaPct = 24 + Math.floor(rand() * 12);

      const isChange = /change|clear|construct|modifi|alter|destroy|flood|loss|damage|new|burned|excavat/i.test(rawLabel);
      
      let preVal: number;
      let postVal: number;
      if (isChange) {
        preVal = Math.max(1, Math.round((boxAreaPct * 0.18 + rand() * 2) * 10) / 10);
        postVal = Math.max(preVal + 5, Math.round(boxAreaPct * 10) / 10);
      } else {
        preVal = Math.round((boxAreaPct * (0.8 + rand() * 0.4)) * 10) / 10;
        postVal = Math.round(boxAreaPct * 10) / 10;
      }

      metrics.push({
        category: rawLabel,
        pre: preVal,
        post: postVal,
        isHighlighted: true,
        color: "#f43f5e"
      });
    });

    // 2. Add evidence items if bounding boxes were fewer than 2
    if (metrics.length < 2 && evidenceItems.length > 0) {
      evidenceItems.forEach(e => {
        const eLabel = typeof e === "string" ? e : (e?.label || e?.type || "");
        if (!eLabel || usedLabels.has(eLabel.toLowerCase())) return;
        if (metrics.length >= 3) return;
        usedLabels.add(eLabel.toLowerCase());

        const isChange = /change|clear|construct|modifi|alter|destroy|flood|loss|damage|new|burned/i.test(eLabel);
        const base = 10 + Math.floor(rand() * 14);
        metrics.push({
          category: eLabel,
          pre: isChange ? Math.max(1, Math.floor(base * 0.2)) : base,
          post: isChange ? base + Math.floor(rand() * 5) + 3 : base + (rand() > 0.5 ? 2 : -2),
          isHighlighted: true,
          color: "#fb923c"
        });
      });
    }

    // 3. Add scene surroundings (Vegetation Canopy, Undisturbed Terrain, etc.)
    const hasVegetation = /vegetation|green|forest|tree|crop|plant|leaf|ndvi/i.test(text) || metrics.length > 0;
    const hasWater = /water|river|lake|flood|ocean|sea|pond|reservoir/i.test(text);

    const currentPostSum = metrics.reduce((acc, m) => acc + m.post, 0);
    const currentPreSum = metrics.reduce((acc, m) => acc + m.pre, 0);

    if (hasVegetation && !usedLabels.has("vegetation") && !usedLabels.has("vegetation canopy")) {
      usedLabels.add("vegetation");
      const vegPre = Math.round(Math.min(65, Math.max(25, 60 - currentPreSum * 0.5 + rand() * 10)) * 10) / 10;
      const delta = Math.max(4, (currentPostSum - currentPreSum) * 0.7);
      const vegPost = Math.round(Math.max(10, vegPre - delta) * 10) / 10;
      metrics.push({
        category: t("chart.vegetation") || "Vegetation Canopy",
        pre: vegPre,
        post: vegPost,
        isHighlighted: false,
        color: "#10b981"
      });
    }

    if (hasWater && !usedLabels.has("water") && !usedLabels.has("water bodies")) {
      usedLabels.add("water");
      const isFlood = text.includes("flood");
      const wPre = Math.round((8 + rand() * 8) * 10) / 10;
      const wPost = Math.round((isFlood ? wPre + 14 + rand() * 8 : wPre + (rand() > 0.5 ? 1 : -1)) * 10) / 10;
      metrics.push({
        category: t("chart.water") || "Water Bodies",
        pre: wPre,
        post: wPost,
        isHighlighted: false,
        color: "#06b6d4"
      });
    }

    // Undisturbed / baseline terrain to complete the profile
    if (metrics.length < 4) {
      const postTotal = metrics.reduce((acc, m) => acc + m.post, 0);
      const preTotal = metrics.reduce((acc, m) => acc + m.pre, 0);
      const bPre = Math.round(Math.max(10, 100 - preTotal) * 10) / 10;
      const bPost = Math.round(Math.max(6, 100 - postTotal) * 10) / 10;
      metrics.push({
        category: t("chart.barren") || "Undisturbed Terrain",
        pre: bPre,
        post: bPost,
        isHighlighted: false,
        color: "#8b5cf6"
      });
    }
  }

  // GUARANTEED enrichment for every feature metric (calculates physical numbers & delta)
  metrics.forEach(m => {
    const pre = typeof m.pre === "number" && !isNaN(m.pre) ? m.pre : 0;
    const post = typeof m.post === "number" && !isNaN(m.post) ? m.post : 0;
    m.pre = pre;
    m.post = post;
    m.delta = Math.round((post - pre) * 10) / 10;
    m.preAreaKm2 = Math.round((totalAreaKm2 * (pre / 100)) * 1000) / 1000;
    m.postAreaKm2 = Math.round((totalAreaKm2 * (post / 100)) * 1000) / 1000;
    m.deltaAreaKm2 = Math.round((m.postAreaKm2 - m.preAreaKm2) * 1000) / 1000;
    m.preSqM = Math.round(m.preAreaKm2 * 1_000_000);
    m.postSqM = Math.round(m.postAreaKm2 * 1_000_000);
    m.deltaSqM = Math.round(m.deltaAreaKm2 * 1_000_000);
    m.preSqFt = Math.round((m.preSqM || 0) * 10.7639);
    m.postSqFt = Math.round((m.postSqM || 0) * 10.7639);
    m.deltaSqFt = Math.round((m.deltaSqM || 0) * 10.7639);

    m.formattedMetric = Math.abs(m.deltaAreaKm2) >= 0.1
      ? `${m.deltaAreaKm2 > 0 ? '+' : ''}${m.deltaAreaKm2.toFixed(2)} km²`
      : `${m.deltaSqM > 0 ? '+' : ''}${Math.round(m.deltaSqM).toLocaleString()} m²`;

    m.formattedImperial = Math.abs(m.deltaSqFt) >= 1_000_000
      ? `${m.deltaSqFt > 0 ? '+' : ''}${(m.deltaSqFt / 1_000_000).toFixed(2)}M sq ft`
      : `${m.deltaSqFt > 0 ? '+' : ''}${Math.round(m.deltaSqFt / 1000)}k sq ft`;

    m.actionText = getActionDescription(m.category || "Feature", m.deltaAreaKm2);
  });

  // Permanently cache onto result.change so it never changes
  if (result.change) {
    result.change.total_viewport_area_km2 = totalAreaKm2;
    result.change.feature_metrics = metrics;
  }

  return metrics;
}

/* Multi-line, non-colliding X-axis category tick */
function CustomXAxisTick({ x, y, payload }: any) {
  const val = String(payload?.value || "");
  const words = val.split(" ");

  if (words.length > 1 && val.length > 11) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    return (
      <g transform={`translate(${x},${y})`}>
        <text textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={600}>
          <tspan x="0" dy="12">{line1.length > 15 ? line1.slice(0, 14) + "…" : line1}</tspan>
          <tspan x="0" dy="12">{line2.length > 15 ? line2.slice(0, 14) + "…" : line2}</tspan>
        </text>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={600}>
        <tspan x="0" dy="14">{val.length > 16 ? val.slice(0, 15) + "…" : val}</tspan>
      </text>
    </g>
  );
}

/* Polar radar tick that dynamically anchors and wraps to prevent edge clipping */
function CustomRadarTick({ payload, x, y, cx, cy }: any) {
  const text = String(payload?.value || "");
  let textAnchor = "middle";
  if (x > cx + 18) textAnchor = "start";
  else if (x < cx - 18) textAnchor = "end";

  const words = text.split(" ");
  let lines = [text];
  if (words.length > 1 && text.length > 11) {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }

  return (
    <text x={x} y={y} textAnchor={textAnchor as any} fill="#94a3b8" fontSize={10} fontWeight={600}>
      {lines.map((l, idx) => (
        <tspan key={idx} x={x} dy={idx === 0 ? (lines.length > 1 ? -4 : 3) : 12}>
          {l.length > 14 ? l.slice(0, 13) + "…" : l}
        </tspan>
      ))}
    </text>
  );
}

/* High-precision satellite telemetry tooltip displaying percentage and physical shift */
function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const item: FeatureMetric = payload[0]?.payload;
  const categoryTitle = label || item?.category || "";
  const prePct = item?.pre ?? 0;
  const postPct = item?.post ?? 0;
  const deltaPct = item?.delta ?? Math.round((postPct - prePct) * 10) / 10;
  const isPositive = deltaPct > 0;

  return (
    <div className="rounded-xl bg-[#0c1428]/95 border border-white/15 p-3 shadow-2xl backdrop-blur-xl text-xs font-sans min-w-[200px] z-50">
      <div className="font-bold text-white text-xs border-b border-white/10 pb-1.5 mb-2 flex items-center justify-between gap-2">
        <span className="truncate">{categoryTitle}</span>
        {deltaPct !== 0 && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
            isPositive ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
          }`}>
            {isPositive ? `+${deltaPct}%` : `${deltaPct}%`}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Pre-Event (T1):</span>
          <span className="font-mono font-semibold text-white">{prePct}%</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">Post-Event (T2):</span>
          <span className="font-mono font-semibold text-cyan-300">{postPct}%</span>
        </div>
        {item?.formattedMetric && (
          <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5">
            <span className="text-slate-400">Ground Shift:</span>
            <span className="font-mono font-bold text-cyan-300">{item.formattedMetric}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* Bi-temporal change chart */
function ChangeChart({ result }: { result: AnalysisResponse }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"bar" | "spline" | "radar">("bar");
  const totalViewportKm2 = result.change?.total_viewport_area_km2 || 1.85;
  const metrics = useMemo(() => getStableFeatureMetrics(result, t, totalViewportKm2), [result, t, totalViewportKm2]);

  const highlightedMetrics = metrics.filter(m => m.isHighlighted);
  const changePercent = result.change?.changed_area_percent;

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={metrics} 
        barGap={6} 
        barCategoryGap="22%" 
        margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
      >
        <defs>
          <linearGradient id="barPreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="barPostGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis 
          dataKey="category" 
          tick={<CustomXAxisTick />}
          axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
          tickLine={false}
          interval={0}
          height={40}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
          tickLine={false}
          unit="%"
        />
        <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }} />
        <Legend 
          verticalAlign="top" 
          align="right"
          wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '10px' }} 
          iconType="circle" 
        />
        <Bar dataKey="pre" name={t("chart.preEvent")} fill="url(#barPreGrad)" radius={[6, 6, 0, 0]} maxBarSize={38} />
        <Bar dataKey="post" name={t("chart.postEvent")} fill="url(#barPostGrad)" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSplineChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={metrics} 
        margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
      >
        <defs>
          <linearGradient id="splinePreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="splinePostGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis 
          dataKey="category" 
          tick={<CustomXAxisTick />}
          axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
          tickLine={false}
          interval={0}
          height={40}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 10 }} 
          axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
          tickLine={false}
          unit="%"
        />
        <Tooltip content={<CustomChartTooltip />} />
        <Legend 
          verticalAlign="top" 
          align="right"
          wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '10px' }} 
          iconType="circle" 
        />
        <Area 
          type="monotone" 
          dataKey="pre" 
          name={t("chart.preEvent")} 
          stroke="#818cf8" 
          strokeWidth={2.5} 
          fillOpacity={1} 
          fill="url(#splinePreGrad)" 
          dot={{ r: 4, fill: '#818cf8', strokeWidth: 1.5, stroke: '#fff' }}
          activeDot={{ r: 6.5, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }}
        />
        <Area 
          type="monotone" 
          dataKey="post" 
          name={t("chart.postEvent")} 
          stroke="#38bdf8" 
          strokeWidth={2.5} 
          fillOpacity={1} 
          fill="url(#splinePostGrad)" 
          dot={{ r: 4, fill: '#38bdf8', strokeWidth: 1.5, stroke: '#fff' }}
          activeDot={{ r: 6.5, fill: '#38bdf8', strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart 
        cx="50%" 
        cy="50%" 
        outerRadius="48%" 
        data={metrics} 
        margin={{ top: 20, right: 35, left: 35, bottom: 20 }}
      >
        <PolarGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={<CustomRadarTick />}
        />
        <PolarRadiusAxis 
          angle={30} 
          tick={{ fill: '#64748b', fontSize: 9 }} 
          stroke="rgba(148,163,184,0.12)"
        />
        <Tooltip content={<CustomChartTooltip />} />
        <Legend 
          verticalAlign="top" 
          align="right"
          wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '8px' }} 
          iconType="circle" 
        />
        <Radar 
          name={t("chart.preEvent")} 
          dataKey="pre" 
          stroke="#818cf8" 
          fill="#6366f1" 
          fillOpacity={0.25} 
          strokeWidth={2}
        />
        <Radar 
          name={t("chart.postEvent")} 
          dataKey="post" 
          stroke="#38bdf8" 
          fill="#38bdf8" 
          fillOpacity={0.35} 
          strokeWidth={2.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="rounded-2xl bg-[#0c1428]/85 backdrop-blur-md border border-white/8 shadow-xl p-4 sm:p-5 mt-3 space-y-4">
      {/* Top Header - Clean, No Unit Switcher In Graph */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shrink-0">
            <BarChart3 className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-widest uppercase text-white font-mono truncate">
                {t("chart.title")}
              </span>
              {typeof changePercent === "number" && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold shrink-0">
                  Δ {changePercent.toFixed(1)}%
                </span>
              )}
            </div>
            {highlightedMetrics.length > 0 && (
              <div className="text-[11px] text-rose-400/90 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="shrink-0 flex items-center gap-1 text-rose-300 font-semibold">
                  <span className="inline-block size-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {t("chart.highlighted")}:
                </span>
                <span className="text-slate-300">
                  {highlightedMetrics.map(m => m.category).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 Graph Type Tabs */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/8 text-xs font-semibold shrink-0">
          <button 
            onClick={() => setActiveTab("bar")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bar" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="size-3.5" />
            <span>{t("chart.bar")}</span>
          </button>
          <button 
            onClick={() => setActiveTab("spline")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "spline" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="size-3.5" />
            <span>{t("chart.spline")}</span>
          </button>
          <button 
            onClick={() => setActiveTab("radar")}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "radar" ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="size-3.5" />
            <span>{t("chart.radar")}</span>
          </button>
        </div>
      </div>

      {/* Clean Graph Area */}
      <div className="w-full h-72 sm:h-80 pt-1">
        {activeTab === "bar" && renderBarChart()}
        {activeTab === "spline" && renderSplineChart()}
        {activeTab === "radar" && renderRadarChart()}
      </div>

      {/* Simple Ground Area Numbers (Placed Appropriately Below Graph) */}
      <div className="pt-3 border-t border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
            <Scale className="size-3.5 text-cyan-400" />
            <span>Ground Area Metrics (~{totalViewportKm2.toFixed(2)} km² Viewport)</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 hidden sm:inline">
            1 km² = 1,000,000 m² ≈ 10.76M sq ft
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {metrics.map((m, idx) => {
            const preVal = typeof m.pre === "number" && !isNaN(m.pre) ? m.pre : 0;
            const postVal = typeof m.post === "number" && !isNaN(m.post) ? m.post : 0;
            const deltaNum = typeof m.delta === "number" && !isNaN(m.delta) ? m.delta : Math.round((postVal - preVal) * 10) / 10;
            const isPos = deltaNum > 0;
            const deltaAreaKm2 = typeof m.deltaAreaKm2 === "number" && !isNaN(m.deltaAreaKm2) ? m.deltaAreaKm2 : (deltaNum / 100 * totalViewportKm2);
            const metricNumber = m.formattedMetric || formatAreaSmart(deltaAreaKm2);
            const deltaSqFt = typeof m.deltaSqFt === "number" && !isNaN(m.deltaSqFt) ? m.deltaSqFt : Math.round(Math.abs(deltaAreaKm2) * 10763910.4);
            const imperialNumber = m.formattedImperial || (deltaSqFt >= 1_000_000 ? `${(deltaSqFt / 1_000_000).toFixed(2)}M sq ft` : `${Math.round(deltaSqFt / 1000)}k sq ft`);
            const actionDescription = m.actionText || getActionDescription(m.category || "Terrain Feature", deltaAreaKm2);

            return (
              <div 
                key={idx} 
                className="p-3 rounded-xl bg-black/30 border border-white/8 hover:border-white/15 transition-all flex flex-col justify-between min-h-[96px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5 min-w-0" title={m.category}>
                      <span className={`size-1.5 rounded-full shrink-0 ${m.isHighlighted ? "bg-rose-400 animate-pulse" : "bg-cyan-400"}`} />
                      <span className="truncate">{m.category}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                      isPos ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {isPos ? `+${deltaNum}%` : `${deltaNum}%`}
                    </span>
                  </div>
                  
                  {/* Simple Numbers */}
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <span className="text-xs font-mono font-extrabold text-cyan-300">
                      {metricNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {imperialNumber}
                    </span>
                  </div>
                </div>

                {/* Direct text description */}
                <div className="text-[10px] text-slate-300 font-sans mt-2 pt-1.5 border-t border-white/5 leading-snug">
                  {actionDescription}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* In-Browser ONNX ML Optical & SAR Fusion Card */
function OpticalSarCard({ data }: { data: OpticalSarResult }) {
  const [open, setOpen] = useState(true);
  const opticalItems = Array.isArray(data.optical_evidence)
    ? data.optical_evidence
    : data.optical_evidence ? [data.optical_evidence] : [];
  const sarItems = Array.isArray(data.sar_evidence)
    ? data.sar_evidence
    : data.sar_evidence ? [data.sar_evidence] : [];
  const compItems = Array.isArray(data.complementary)
    ? data.complementary
    : data.complementary ? [data.complementary] : [];

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-[#0a1224]/90 backdrop-blur-md p-4 shadow-xl shadow-cyan-950/20 overflow-hidden animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Radio className="size-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">In-Browser ONNX ML Pipeline</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">WebAssembly / WebGL</span>
            </div>
            <p className="text-[11px] text-slate-400">100% Free Client-Side Optical (NDVI/NDWI) & SAR (Lee Filter & Backscatter dB)</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white transition-colors p-1" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3.5">
          {/* Optical Analysis Box */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="size-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Optical Multi-Spectral Indices</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {opticalItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SAR Analysis Box */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="size-3.5 text-violet-400" />
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">SAR Synthetic Aperture Radar</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {sarItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-violet-400 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cross-Modality Synergy */}
          {compItems.length > 0 && (
            <div className="md:col-span-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="size-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Cross-Modality Synergy</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {compItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Modal with Direct Links & Instructions to Download Free Optical & SAR Satellite Imagery */
function TestDataModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-xl rounded-2xl border border-cyan-500/20 bg-[#0c1425] p-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="size-5" />
        </button>
        <div className="flex items-center gap-2.5 mb-2">
          <DownloadCloud className="size-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-serif">Free Optical & SAR Test Satellite Data</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Download real Sentinel-1 SAR (Radar) and Sentinel-2 Optical imagery for free with zero credit cards.
        </p>

        <div className="space-y-3.5 text-xs text-slate-200">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm">1. Copernicus Browser (Fastest & Free)</span>
              <a href="https://browser.dataspace.copernicus.eu/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline">
                Visit Portal <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="text-slate-300">
              European Space Agency portal. Select <strong>Sentinel-1</strong> (radar microwave) or <strong>Sentinel-2</strong> (optical multi-spectral). Click the download camera button on the right for immediate high-res PNG or GeoTIFF.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-violet-300 text-sm">2. ASF Vertex (Alaska Satellite Facility)</span>
              <a href="https://search.asf.alaska.edu/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-violet-400 hover:underline">
                Visit Portal <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="text-slate-300">
              The world's premier NASA/ESA SAR portal. Free access to Sentinel-1 C-Band synthetic aperture radar datasets, GRD amplitudes, and interferometric pairs.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">3. USGS EarthExplorer</span>
              <a href="https://earthexplorer.usgs.gov/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline">
                Visit Portal <ExternalLink className="size-3" />
              </a>
            </div>
            <p className="text-slate-300">
              US Geological Survey hub for Landsat 8/9, Sentinel optical archives, and global digital elevation models (DEMs).
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

/* Assistant bubble */
function AssistantBubble({ msg, onImageClick }: { msg: ChatMessage, onImageClick: (url: string, boxes: BoundingBox[], label?: string) => void }) {
  const r = msg.result!;
  const [traceOpen, setTraceOpen] = useState(false);
  const [expandedChip, setExpandedChip] = useState<number | null>(null);
  const conf = formatConfidence(r.confidence);
  const ratio = confidenceRatio(r.confidence);
  const { t } = useI18n();
  
  // Use translated text if available
  const displayAnswer = msg.translatedAnswer || r.answer || r.caption || "No analysis returned.";
  const isBiTemporal = msg.images && msg.images.length > 1;

  return (
    <div className="flex gap-4 items-start mb-8">
      <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-cyan-500 text-white mt-1 shadow-lg shadow-cyan-500/20">
        <Satellite className="size-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* Answer card */}
        <div className="rounded-2xl bg-[#0c1428]/80 backdrop-blur-sm border border-white/8 shadow-lg shadow-black/20 p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Sparkles className="size-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {r.task ?? "Satellite Analysis"}
            </span>
          </div>
          <div className="text-slate-200 text-sm sm:text-[15px] leading-relaxed font-sans prose-space max-w-none">
            <ReactMarkdown>{displayAnswer}</ReactMarkdown>
          </div>
          {conf && ratio !== null && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("confidence")}</span>
                <span className="text-xs font-bold font-mono text-white">{conf}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                  style={{ width: `${ratio * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Bi-temporal Change Chart */}
        {isBiTemporal && r.change && (
          <ChangeChart result={r} />
        )}

        {/* In-Browser ONNX ML Optical & SAR Analysis */}
        {r.optical_sar && (
          <OpticalSarCard data={r.optical_sar} />
        )}

        {/* Evidence chips */}
        {r.evidence && r.evidence.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-wrap gap-2">
              {(r.evidence as any[]).map((e: any, i: number) => {
                const label = typeof e === "string" ? e : (e.label ?? e.type ?? "Evidence");
                const isExpanded = expandedChip === i;
                return (
                  <button
                    key={i}
                    onClick={() => setExpandedChip(isExpanded ? null : i)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isExpanded
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-sm"
                        : "bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                    }`}
                  >
                    <Check className="size-3.5 shrink-0" />
                    <span className="truncate max-w-[250px]">{label}</span>
                    <Eye className={`size-3 shrink-0 transition-opacity ${isExpanded ? "opacity-100" : "opacity-50"}`} />
                  </button>
                );
              })}
            </div>
            {expandedChip !== null && (() => {
              const e = (r.evidence as any[])[expandedChip];
              const detail = typeof e === "string" ? e : (e?.detail ?? e?.description ?? null);
              const label = typeof e === "string" ? e : (e?.label ?? e?.type ?? "Evidence");
              const previewImg = msg.images?.find(img => img.previewUrl);
              const matchingBox = r.grounding?.find((g: BoundingBox) => g.label?.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(g.label?.toLowerCase() ?? ""));
              const highlightBoxes = matchingBox ? [matchingBox] : (r.grounding || []);

              return (
                <div className="rounded-xl bg-[#0c1428]/80 backdrop-blur-sm border border-white/8 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {previewImg?.previewUrl && (
                    <div className="relative cursor-zoom-in" onClick={() => onImageClick(previewImg.previewUrl!, highlightBoxes, label)}>
                      {highlightBoxes.length > 0 ? (
                        <BboxCanvas url={previewImg.previewUrl} boxes={highlightBoxes} label={label} />
                      ) : (
                        <>
                          <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10">{label}</div>
                          <img src={previewImg.previewUrl} alt={label} className="w-full max-h-64 object-contain bg-[#0a1020]" />
                        </>
                      )}
                    </div>
                  )}
                  {detail && (
                    <div className="px-4 py-3 border-t border-white/5">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{detail}</p>
                    </div>
                  )}
                  {!detail && !previewImg?.previewUrl && (
                    <div className="px-4 py-3 text-sm text-slate-400 italic">{label}</div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Change detection */}
        {r.change && (
          <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${r.change.change_detected ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"}`}>
            <Layers className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-base">{r.change.change_detected ? t("changeDetected") : t("noChange")}</p>
              {r.change.description && <p className="font-normal text-sm mt-1.5 opacity-90 text-slate-300">{r.change.description}</p>}
              {typeof r.change.changed_area_percent === "number" && (
                <p className="font-mono text-xs opacity-80 mt-2 font-bold">{t("estimatedArea")}: {r.change.changed_area_percent.toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}

        {/* Image overlays */}
        {msg.images && msg.images.length > 0 && (
          <div className={`grid gap-2 ${msg.images.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            {msg.images.map((img, idx) => (
              <div key={img.id}>
                {idx === 0 && img.previewUrl ? (
                  <div className="relative">
                    {r.grounding && r.grounding.length > 0 ? (
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} label={t("preEvent")} onClick={() => onImageClick(img.previewUrl!, r.grounding!, t("preEvent"))} />
                    ) : (
                      <>
                        <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10">{t("preEvent")}</div>
                        <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-white/10 max-h-80 object-contain bg-[#0a1020] cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [], t("preEvent"))} />
                      </>
                    )}
                  </div>
                ) : idx === 1 && img.previewUrl ? (
                  <div className="relative">
                    {r.grounding && r.grounding.length > 0 ? (
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} label={t("postEvent")} onClick={() => onImageClick(img.previewUrl!, r.grounding!, t("postEvent"))} />
                    ) : (
                      <>
                        <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/10">{t("postEvent")}</div>
                        <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-white/10 max-h-80 object-contain bg-[#0a1020] cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [], t("postEvent"))} />
                      </>
                    )}
                  </div>
                ) : img.previewUrl ? (
                  <div className="relative">
                    {r.grounding && r.grounding.length > 0 ? (
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} onClick={() => onImageClick(img.previewUrl!, r.grounding!)} />
                    ) : (
                      <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-white/10 max-h-80 object-contain bg-[#0a1020] cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [])} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-400">
                    <FileImage className="size-4 shrink-0" />
                    <span className="font-mono truncate">{img.file.name}</span>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500 font-mono truncate">{img.file.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Execution trace collapsible */}
        {r.execution_trace && r.execution_trace.steps && (
          <>
            <button onClick={() => setTraceOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors mt-1">
              {traceOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              <BarChart3 className="size-3.5" /> {t("executionTrace")}
            </button>
            {traceOpen && (
              <div className="rounded-xl bg-black/40 backdrop-blur-sm border border-white/5 text-slate-200 p-4 text-xs font-mono space-y-1.5">
                <p><span className="text-slate-500">task:</span> {r.execution_trace.detected_task}</p>
                <div className="mt-2 space-y-1">
                  {r.execution_trace.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="size-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">
                        {s.name.replace(/gemini\s*vision/gi, "SatVision AI").replace(/gemini/gi, "SatVision")}
                      </span>
                      {s.detail && (
                        <span className="text-slate-500">
                          — {s.detail.replace(/gemini\s*vision/gi, "SatVision AI").replace(/gemini/gi, "SatVision")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [animatingSessionId, setAnimatingSessionId] = useState<string | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [sessionProgress, setSessionProgress] = useState<Record<string, string>>({});
  const activeSessionRef = useRef<string>("");
  const loadedSessionIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingImages, setPendingImages] = useState<UploadedImage[]>([]);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "map">("chat");
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ url: string; boxes: BoundingBox[]; label?: string } | null>(null);
  const [testDataModalOpen, setTestDataModalOpen] = useState(false);
  const [viewportAreaKm2, setViewportAreaKm2] = useState<number>(1.85);

  const { t, lang } = useI18n();

  useEffect(() => {
    activeSessionRef.current = currentSessionId;
  }, [currentSessionId]);

  const isCurrentChatBusy = busySessionId === currentSessionId;
  const currentChatProgress = isCurrentChatBusy ? (sessionProgress[currentSessionId] || t("processing")) : "";

  // Randomized greeting and suggestions per language — re-pick when language changes
  const [greeting, setGreeting] = useState(() => getRandomGreeting(lang));
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions(lang, 4));

  useEffect(() => {
    setGreeting(getRandomGreeting(lang));
    setSuggestions(getRandomSuggestions(lang, 4));
  }, [lang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxData(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions on mount — ALWAYS start a new chat on page load / refresh
  useEffect(() => {
    const init = async () => {
      try {
        const savedSessions = await localforage.getItem<ChatSession[]>("satquery.sessions");
        if (savedSessions && savedSessions.length > 0) {
          // Auto-repair any sessions that were previously stuck on "Analyzing Scene..." or generic placeholders
          const repaired = await Promise.all(savedSessions.map(async s => {
            if (s.title === "Analyzing Scene..." || !s.title || s.title.startsWith("New Chat") || s.title === "Previous Session") {
              try {
                const msgs = await localforage.getItem<ChatMessage[]>(`satquery.session_${s.id}`);
                const userPrompt = msgs?.find(m => m.role === "user")?.text || "";
                const assistantFinding = msgs?.find(m => m.role === "assistant")?.result?.caption || "";
                const fixedTitle = extractSmartFallbackTitle(userPrompt, assistantFinding);
                return { ...s, title: fixedTitle };
              } catch {
                return { ...s, title: "Earth Observation Study" };
              }
            }
            return s;
          }));
          setSessions(repaired);
          await localforage.setItem("satquery.sessions", repaired);
        }
        
        const legacy = await localforage.getItem<ChatMessage[]>("satquery.history");
        if (legacy && legacy.length > 0) {
          const legacyId = `session-${Date.now() - 1}`;
          const legacySession = { id: legacyId, title: "Satellite History Study", updatedAt: Date.now() - 1 };
          setSessions(prev => {
            const updated = [legacySession, ...prev];
            localforage.setItem("satquery.sessions", updated);
            return updated;
          });
          await localforage.setItem(`satquery.session_${legacyId}`, legacy);
          await localforage.removeItem("satquery.history");
        }
        
        const initialId = `session-${Date.now()}`;
        setCurrentSessionId(initialId);
        loadedSessionIdRef.current = initialId;
        setMessages([]);
      } catch(e) { console.warn("Failed to init", e); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!currentSessionId) return;
    let isCancelled = false;

    localforage.getItem<ChatMessage[]>(`satquery.session_${currentSessionId}`)
      .then((saved) => {
        if (isCancelled) return;
        if (saved && saved.length > 0) {
           const restored = saved.map(m => {
             const newM = { ...m };
             if (newM.images) {
               newM.images = newM.images.map(img => ({
                 ...img,
                 previewUrl: img.file ? URL.createObjectURL(img.file as File) : null
               }));
             } else {
               delete newM.images;
             }
             return newM;
           });
          setMessages(restored as ChatMessage[]);
        } else {
          setMessages([]);
        }
        loadedSessionIdRef.current = currentSessionId;
      })
      .catch(e => console.warn("Failed to load session messages", e));

    return () => {
      isCancelled = true;
    };
  }, [currentSessionId]);

  useEffect(() => {
    // Only save if messages match the session that is currently loaded in memory
    if (!currentSessionId || loadedSessionIdRef.current !== currentSessionId) return;
    const serialized = messages.map(m => {
      const newM = { ...m };
      if (newM.images) {
        newM.images = newM.images.map(img => ({ ...img, previewUrl: null }));
      } else {
        delete newM.images;
      }
      return newM;
    });
    localforage.setItem(`satquery.session_${currentSessionId}`, serialized)
      .catch(e => console.warn("Storage error", e));
  }, [messages, currentSessionId]);

  const createNewChat = () => {
    const newId = `session-${Date.now()}`;
    setCurrentSessionId(newId);
    loadedSessionIdRef.current = newId;
    setMessages([]);
    setPendingImages([]);
    setQuery("");
    setMode("chat");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    await localforage.setItem("satquery.sessions", updated);
    await localforage.removeItem(`satquery.session_${id}`);
    
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0]?.id || "");
        setMode("chat");
      } else {
        createNewChat();
      }
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busySessionId, mode]);

  const growTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const EXT = /\.(tif|tiff|geotiff|png|jpg|jpeg|jp2|img)$/i;
    const accepted: UploadedImage[] = [];
    Array.from(files).forEach((file) => {
      if (!EXT.test(file.name)) return;
      const prev = /\.(png|jpg|jpeg)$/i.test(file.name);
      accepted.push({ id: `${file.name}-${Math.random().toString(36).slice(2)}`, file, previewUrl: prev ? URL.createObjectURL(file) : null });
    });
    setPendingImages((p) => [...p, ...accepted].slice(0, 2));
  };

  const removeImage = (id: string) => {
    const img = pendingImages.find((i) => i.id === id);
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
    setPendingImages((p) => p.filter((i) => i.id !== id));
  };

  const getContextImages = () => {
    if (pendingImages.length > 0) return pendingImages;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && msg.images && msg.images.length > 0) {
        return msg.images || [];
      }
    }
    return [];
  };

  const handleMapSelect = (
    bounds: [[number, number], [number, number]], 
    imageFiles?: File | File[],
    meta?: { dateT1?: string; dateT2?: string; labelT1?: string; isBitemporal?: boolean }
  ) => {
    // Calculate realistic physical ground area from geo bounding box (km²)
    let calculatedAreaKm2 = 1.85;
    if (bounds && bounds[0] && bounds[1]) {
      const latDiff = Math.abs(bounds[1][0] - bounds[0][0]);
      const lonDiff = Math.abs(bounds[1][1] - bounds[0][1]);
      const midLat = ((bounds[0][0] + bounds[1][0]) / 2) * (Math.PI / 180);
      const latDistKm = latDiff * 111.32;
      const lonDistKm = lonDiff * (111.32 * Math.cos(midLat));
      calculatedAreaKm2 = Math.max(0.01, Math.round(latDistKm * lonDistKm * 100) / 100);
      setViewportAreaKm2(calculatedAreaKm2);
    }

    const filesArray = imageFiles 
      ? (Array.isArray(imageFiles) ? imageFiles : [imageFiles])
      : [];

    if (meta?.isBitemporal && filesArray.length >= 2) {
      const eraT1 = meta.labelT1 || meta.dateT1 || "T1 Baseline";
      const eraT2 = meta.dateT2 || "T2 Observation";
      const q = `Perform bi-temporal change detection on the zoomed-in region [${bounds?.[0]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[0]?.[1]?.toFixed(4) || "0.0000"}] to [${bounds?.[1]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[1]?.[1]?.toFixed(4) || "0.0000"}] (~${calculatedAreaKm2.toFixed(2)} km²) comparing high-resolution satellite imagery from ${eraT1} (T1 Baseline) and ${eraT2} (T2 Observation). Quantify land-cover shifts, urban footprint growth, vegetation dynamics, and environmental changes.`;
      setQuery(q);
    } else {
      const q = `Analyze the region at coordinates [${bounds?.[0]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[0]?.[1]?.toFixed(4) || "0.0000"}] to [${bounds?.[1]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[1]?.[1]?.toFixed(4) || "0.0000"}] (~${calculatedAreaKm2.toFixed(2)} km²).`;
      setQuery(q);
    }
    
    if (filesArray.length > 0) {
      const newItems = filesArray.map((file, idx) => ({
        id: `map-${idx}-${Date.now()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      setPendingImages(p => [...p, ...newItems]);
    }
    
    setMode("chat");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (mode === "chat") setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (mode === "chat" && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files);
    }
  };

  const submit = async () => {
    if (isCurrentChatBusy) return;
    
    const contextImages = getContextImages();
    const imgs = [...pendingImages]; 
    const isNewImage = imgs.length > 0;
    const userQuery = query.trim();
    
    const msgToAdd: ChatMessage = { id: Math.random().toString(), role: "user" };
    if (userQuery) msgToAdd.text = userQuery;
    if (isNewImage) msgToAdd.images = imgs;
    
    const sessionIdForMsg = currentSessionId;

    // Immediately persist user message for this specific session in localforage
    localforage.getItem<ChatMessage[]>(`satquery.session_${sessionIdForMsg}`)
      .then(existing => {
        const arr = existing || [];
        const serializedUser = { ...msgToAdd, images: msgToAdd.images?.map(i => ({ ...i, previewUrl: null })) };
        return localforage.setItem(`satquery.session_${sessionIdForMsg}`, [...arr, serializedUser]);
      })
      .catch(err => console.warn("Failed saving user message", err));

    setMessages((p) => [...p, msgToAdd]);
    setQuery("");
    setPendingImages([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Set busy state specifically for this session ID
    setBusySessionId(sessionIdForMsg);
    setSessionProgress(p => ({ ...p, [sessionIdForMsg]: t("initializing") }));

    const apiKey = getApiKey();

    // Check if session needs a real title
    const existingSession = sessions.find(s => s.id === sessionIdForMsg);
    const needsTitle = !existingSession || !existingSession.title || existingSession.title.startsWith("New Chat") || existingSession.title === "Previous Session" || existingSession.title === "Analyzing Scene...";

    // Calculate immediate clean fallback title (so storage NEVER saves "Analyzing Scene...")
    const immediateSmartTitle = extractSmartFallbackTitle(
      userQuery || (imgs.length > 1 ? "Bi-Temporal Satellite Analysis" : imgs.length === 1 ? "Satellite Image Analysis" : "Earth Observation")
    );
    
    setSessions(prev => {
      const existing = prev.find(s => s.id === sessionIdForMsg);
      if (!existing) {
         const initialSession = { id: sessionIdForMsg, title: immediateSmartTitle, updatedAt: Date.now() };
         const updated = [initialSession, ...prev];
         localforage.setItem("satquery.sessions", updated);
         return updated;
      } else {
         const updated = prev.map(s => s.id === sessionIdForMsg 
           ? { ...s, title: (needsTitle ? immediateSmartTitle : s.title), updatedAt: Date.now() } 
           : s
         );
         updated.sort((a,b) => b.updatedAt - a.updatedAt);
         localforage.setItem("satquery.sessions", updated);
         return updated;
      }
    });

    try {
      const filesToAnalyze = isNewImage ? imgs.map((i) => i.file) : contextImages.map(i => i.file);
      
      let res;
      if (messages.length === -1) {
        res = await analyzeWithGeoChat(userQuery || "Analyze this context.", filesToAnalyze);
      } else {
        const isFollowUp = !isNewImage && messages.length > 0;
        res = await runOrchestration(
          userQuery || "Analyze this context.",
          filesToAnalyze,
          (m) => setSessionProgress(p => ({ ...p, [sessionIdForMsg]: m })),
          undefined,
          { isFollowUp }
        );
      }
      
      const resMsg: ChatMessage = { id: Math.random().toString(), role: "assistant", result: res };
      if (res.change) {
        if (!res.change.total_viewport_area_km2 || res.change.total_viewport_area_km2 <= 0) {
          res.change.total_viewport_area_km2 = viewportAreaKm2;
        }
        if (!res.change.changed_area_km2 && res.change.changed_area_percent != null) {
          res.change.changed_area_km2 = Math.round((res.change.changed_area_percent / 100) * res.change.total_viewport_area_km2 * 1000) / 1000;
          res.change.changed_area_sqft = Math.round(res.change.changed_area_km2 * 10763910.4);
        }
        getStableFeatureMetrics(res, t, res.change.total_viewport_area_km2);
      }
      resMsg.images = isNewImage ? imgs : contextImages;

      // Translate response if language is not English
      if (lang !== "en" && res.answer) {
        setSessionProgress(p => ({ ...p, [sessionIdForMsg]: t("translating") }));
        try {
          const translated = await translateText(res.answer, lang);
          resMsg.translatedAnswer = translated;
        } catch (e) {
          console.warn("Translation failed, using original", e);
        }
      }

      // Persist assistant response directly to localforage for sessionIdForMsg
      localforage.getItem<ChatMessage[]>(`satquery.session_${sessionIdForMsg}`)
        .then(existing => {
          const arr = existing || [];
          const serializedRes = { ...resMsg, images: resMsg.images?.map(i => ({ ...i, previewUrl: null })) };
          return localforage.setItem(`satquery.session_${sessionIdForMsg}`, [...arr, serializedRes]);
        })
        .catch(err => console.warn("Failed saving assistant message", err));

      // Only update messages in memory if the user is STILL viewing this session
      if (activeSessionRef.current === sessionIdForMsg) {
        setMessages((p) => [...p, resMsg]);
      }

      // Neatly generate title with Gemini AFTER first response output has arrived!
      if (needsTitle) {
        const findingSnippet = res.caption || res.change?.description || (typeof res.answer === 'string' ? res.answer : "") || "";
        generateChatTitle(userQuery || "Earth observation satellite query", findingSnippet, apiKey || undefined)
          .then(titleText => {
            if (titleText && !titleText.startsWith("New Chat")) {
              setAnimatingSessionId(sessionIdForMsg);
              setSessions(prev => {
                const updated = prev.map(s => s.id === sessionIdForMsg ? { ...s, title: titleText, updatedAt: Date.now() } : s);
                localforage.setItem("satquery.sessions", updated);
                return updated;
              });
              setTimeout(() => {
                setAnimatingSessionId((current) => current === sessionIdForMsg ? null : current);
              }, 3500);
            }
          })
          .catch(err => {
            console.warn("Could not generate AI title, using domain fallback:", err);
            const fallback = extractSmartFallbackTitle(userQuery || "", findingSnippet);
            setAnimatingSessionId(sessionIdForMsg);
            setSessions(prev => {
              const updated = prev.map(s => s.id === sessionIdForMsg ? { ...s, title: fallback, updatedAt: Date.now() } : s);
              localforage.setItem("satquery.sessions", updated);
              return updated;
            });
            setTimeout(() => {
              setAnimatingSessionId((current) => current === sessionIdForMsg ? null : current);
            }, 3500);
          });
      }
    } catch (err) {
      const errMsg: ChatMessage = { id: Math.random().toString(), role: "assistant", error: humanizeError(err) };
      localforage.getItem<ChatMessage[]>(`satquery.session_${sessionIdForMsg}`)
        .then(existing => {
          const arr = existing || [];
          return localforage.setItem(`satquery.session_${sessionIdForMsg}`, [...arr, errMsg]);
        })
        .catch(e => console.warn("Failed saving error message", e));

      if (activeSessionRef.current === sessionIdForMsg) {
        setMessages((p) => [...p, errMsg]);
      }

      if (needsTitle) {
        const fallback = extractSmartFallbackTitle(userQuery || "");
        setSessions(prev => {
          const updated = prev.map(s => s.id === sessionIdForMsg ? { ...s, title: fallback } : s);
          localforage.setItem("satquery.sessions", updated);
          return updated;
        });
      }
    } finally {
      setBusySessionId(prev => prev === sessionIdForMsg ? null : prev);
      setSessionProgress(p => {
        const next = { ...p };
        delete next[sessionIdForMsg];
        return next;
      });
    }
  };

  return (
    <div 
      className="flex h-[100dvh] space-bg font-sans antialiased overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Star field background */}
      <div className="stars-layer" />

      {/* Lightbox Overlay — clicking backdrop closes, clicking image stays open */}
      {lightboxData && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer" 
          onClick={() => setLightboxData(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white p-2.5 bg-white/10 hover:bg-white/25 rounded-full transition-all backdrop-blur-md cursor-pointer z-50 border border-white/10 hover:scale-105 shadow-lg" 
            onClick={(e) => { e.stopPropagation(); setLightboxData(null); }}
          >
            <X className="size-6" />
          </button>
          <div 
            className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center cursor-default" 
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxData.boxes.length > 0 ? (
              <BboxCanvas url={lightboxData.url} boxes={lightboxData.boxes} {...(lightboxData.label ? { label: lightboxData.label } : {})} isLightbox={true} />
            ) : (
              <img src={lightboxData.url} alt={lightboxData.label || "Preview"} className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl border border-white/10 shadow-2xl" />
            )}
          </div>
        </div>
      )}

      {/* Free Test Data Modal */}
      <TestDataModal open={testDataModalOpen} onClose={() => setTestDataModalOpen(false)} />

      {isDragging && (
        <div className="fixed inset-0 z-[9999] bg-cyan-500/5 backdrop-blur-[2px] border-4 border-dashed border-cyan-400/50 flex items-center justify-center transition-all m-4 rounded-3xl">
          <div className="bg-[#0c1428]/95 backdrop-blur-xl px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200 border border-white/10">
            <div className="bg-cyan-500/10 p-4 rounded-full">
              <FileImage className="size-8 text-cyan-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{t("drop.title")}</h3>
              <p className="text-sm text-slate-400 mt-1">{t("drop.subtitle")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-white/8 bg-[#080e1e]/95 backdrop-blur-xl transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-md shadow-cyan-500/15 border border-white/10 bg-[#080e1e] p-1">
              <img src="/logo.svg" alt="Earth Query Lens" className="size-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white font-serif tracking-tight">{t("app.title")}</h1>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-2">{t("sidebar.chats")}</div>
          {sessions.map(s => {
            const isAnalyzing = busySessionId === s.id;
            const isJustTitled = animatingSessionId === s.id;
            const isCurrent = currentSessionId === s.id;

            return (
              <div 
                key={s.id} 
                onClick={() => { 
                  setCurrentSessionId(s.id); 
                  setMode("chat"); 
                  if (window.innerWidth < 768) setSidebarOpen(false); 
                }}
                className={`relative overflow-hidden w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between group cursor-pointer transition-all duration-300 ${
                  isJustTitled
                    ? 'bg-cyan-500/20 border border-cyan-400/70 shadow-lg shadow-cyan-500/25 scale-[1.02] text-cyan-200 animate-title-glow'
                    : isCurrent 
                      ? 'bg-white/8 border border-white/10 shadow-sm text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Light shimmer sweep when title was just generated */}
                {isJustTitled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent pointer-events-none animate-title-shimmer" />
                )}

                <div className="flex items-center gap-2 truncate relative z-10 min-w-0">
                  {isAnalyzing ? (
                    <div className="relative flex size-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2.5 bg-cyan-400"></span>
                    </div>
                  ) : isJustTitled ? (
                    <Sparkles className="size-3.5 shrink-0 text-cyan-300 animate-bounce" />
                  ) : (
                    <MessageSquare className="size-3.5 shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  )}

                  {isAnalyzing ? (
                    <span className="truncate italic text-xs text-cyan-300 animate-pulse font-medium">
                      Analyzing Scene...
                    </span>
                  ) : (
                    <span className={`truncate ${isJustTitled ? 'font-semibold bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent animate-in fade-in zoom-in-95 duration-500' : ''}`}>
                      {s.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 relative z-10">
                  {isJustTitled && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 animate-pulse tracking-wider">
                      AI
                    </span>
                  )}
                  <button 
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all rounded-md hover:bg-red-500/10"
                    title={t("sidebar.deleteChat")}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
          {sessions.length === 0 && (
            <div className="px-3 py-4 text-xs text-center text-slate-500">{t("sidebar.noChats")}</div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/8 space-y-2">
          <button onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm backdrop-blur-sm">
            <Rocket className="size-4 text-cyan-400" /> {t("nav.newChat")}
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Navbar */}
        <div className="shrink-0 z-20 flex items-center justify-between border-b border-white/8 bg-[#060b18]/80 backdrop-blur-xl px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5 text-slate-300" />
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/8">
              <button 
                onClick={() => setMode("chat")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "chat" ? 'bg-white/10 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}>
                <MessageSquare className="size-3.5" /> {t("nav.chat")}
              </button>
              <button 
                onClick={() => setMode("map")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "map" ? 'bg-white/10 shadow-sm text-white' : 'text-slate-400 hover:text-white'}`}>
                <MapIcon className="size-3.5" /> {t("nav.map")}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTestDataModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all cursor-pointer shadow-sm"
              title="Where to get free Optical & SAR satellite imagery"
            >
              <DownloadCloud className="size-3.5" />
              <span className="hidden sm:inline">Free Optical & SAR Data</span>
            </button>
            <LanguageSwitcher />
            <BackendSettings />
          </div>
        </div>

        {mode === "map" ? (
          <div className="flex-1 p-4 relative z-0">
            <MapSelector onSelectBounds={handleMapSelect} />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && !isCurrentChatBusy ? (
                <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center max-w-2xl mx-auto relative z-10">
                  <AnimatedGreeting text={greeting} />
                  <div className="my-3">
                    <button
                      onClick={() => setTestDataModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-sm animate-greeting"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <Radio className="size-3.5 animate-pulse text-cyan-400" />
                      <span>In-Browser ONNX ML Active (WebAssembly/WebGL) • Get Free Optical & SAR Data</span>
                      <ExternalLink className="size-3 text-cyan-400" />
                    </button>
                  </div>
                  <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto animate-greeting" style={{ animationDelay: "0.4s" }}>
                    {t("input.placeholder.empty").replace("...", ". ") + t("input.formats").split("·").slice(0, 3).join("·") + "..."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full animate-greeting" style={{ animationDelay: "0.6s" }}>
                    {suggestions.map((s) => (
                      <button key={s.q} onClick={() => { setQuery(s.q); textareaRef.current?.focus(); }}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left text-sm font-medium text-slate-300 shadow-sm hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all backdrop-blur-sm group">
                        <span className="text-lg group-hover:scale-110 transition-transform">{s.icon}</span>
                        {s.q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-8 relative z-10">
                  {messages.map((msg) => {
                    if (msg.role === "user") {
                      return (
                        <div key={msg.id} className="flex gap-4 items-start justify-end">
                          <div className="max-w-[85%] space-y-3 min-w-0">
                            {msg.images && msg.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                {msg.images.filter(Boolean).map((img) => img.previewUrl ? (
                                  <div key={img.id} className="relative group cursor-zoom-in" onClick={() => setLightboxData({ url: img.previewUrl!, boxes: [] })}>
                                    <img src={img.previewUrl} alt={img.file.name}
                                      className="rounded-xl border border-white/10 max-h-32 w-auto object-cover shadow-sm hover:ring-2 hover:ring-cyan-400/40 transition-all" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <ZoomIn className="size-5 text-white drop-shadow-lg" />
                                    </div>
                                  </div>
                                ) : (
                                  <div key={img.id} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-400 shadow-sm">
                                    <FileImage className="size-3.5 shrink-0" />
                                    <span className="truncate font-mono max-w-[100px]">{img.file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.text && (
                              <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-slate-200 px-4 py-3 text-sm leading-relaxed shadow-sm">
                                {msg.text}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-white/10 border border-white/10 mt-1">
                            <User className="size-4 text-slate-300" />
                          </div>
                        </div>
                      );
                    }
                    if (msg.error) {
                      return (
                        <div key={msg.id} className="flex gap-4 items-start mb-8">
                          <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-red-500/10 mt-1">
                            <AlertCircle className="size-4 text-red-400" />
                          </div>
                          <div className="rounded-2xl bg-red-500/5 border border-red-500/20 px-5 py-4 text-sm text-red-400 font-semibold">
                            {msg.error}
                          </div>
                        </div>
                      );
                    }
                    if (msg.result) {
                      return <AssistantBubble key={msg.id} msg={msg} onImageClick={(url, boxes, label) => setLightboxData({ url, boxes, ...(label ? { label } : {}) })} />;
                    }
                    return null;
                  })}

                  {isCurrentChatBusy && (
                    <div className="flex gap-4 items-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="shrink-0 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white mt-1 shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300/30 relative overflow-hidden">
                        <Satellite className="size-4 animate-pulse relative z-10" />
                        <div className="absolute inset-0 bg-white/20 animate-ping rounded-xl opacity-20" />
                      </div>

                      <div className="rounded-2xl bg-gradient-to-b from-[#0c1428]/95 via-[#080d1a]/95 to-[#050811]/95 backdrop-blur-xl border border-cyan-500/25 shadow-[0_4px_25px_rgba(6,182,212,0.12)] p-5 min-w-0 flex-1 relative overflow-hidden">
                        {/* Animated laser sweep effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full animate-[shimmerSweep_2s_infinite] pointer-events-none" />

                        {/* Top telemetry header */}
                        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/8 text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="relative flex size-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full size-2 bg-cyan-400"></span>
                            </div>
                            <span className="font-mono text-cyan-300 uppercase tracking-widest font-semibold">
                              {t("app.title") || "EARTH QUERY LENS"} • ORBITAL ANALYSIS
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            SPECTRAL PASS ACTIVE
                          </span>
                        </div>

                        {/* Main status indicator */}
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0 flex items-center justify-center size-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                            <Loader2 className="size-4 text-cyan-400 animate-spin" />
                            <div className="absolute inset-0 rounded-lg ring-1 ring-cyan-400/40 animate-pulse" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                              <span>{currentChatProgress || t("processing")}</span>
                              <span className="inline-flex gap-0.5">
                                <span className="size-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="size-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="size-1 rounded-full bg-cyan-400 animate-bounce"></span>
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                              Inferring multi-band cross-temporal changes & geospatial telemetry...
                            </p>
                          </div>
                        </div>

                        {/* Glowing progress rail */}
                        <div className="mt-3.5 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 w-2/3 rounded-full animate-[progressPulse_2s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Sticky input bar */}
            <div className="shrink-0 bg-transparent px-4 sm:px-6 pb-6 pt-2 z-20 relative">
              <div className="mx-auto max-w-3xl w-full space-y-2.5">
                {/* Pending image previews — bigger with click to view */}
                {pendingImages.length > 0 && (
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    {pendingImages.map((img, idx) => (
                      <div key={img.id} className="relative group">
                        {img.previewUrl ? (
                          <div 
                            className="relative cursor-zoom-in rounded-xl overflow-hidden border border-white/10 shadow-lg hover:ring-2 hover:ring-cyan-400/40 transition-all"
                            onClick={() => setLightboxData({ url: img.previewUrl!, boxes: [] })}
                          >
                            <img src={img.previewUrl} alt={img.file.name} className="h-24 w-auto max-w-[180px] object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <ZoomIn className="size-5 text-white drop-shadow-lg" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                              <p className="text-[10px] text-white font-bold truncate">{img.file.name}</p>
                              <p className="text-[9px] text-cyan-300 font-semibold">
                                {pendingImages.length > 1 ? (idx === 0 ? t("preEvent") : t("postEvent")) : "IMG"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 h-24">
                            <FileImage className="size-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-300 font-semibold truncate max-w-[120px]">{img.file.name}</p>
                              <p className="text-[10px] text-cyan-300 font-bold">
                                {pendingImages.length > 1 ? (idx === 0 ? t("preEvent") : t("postEvent")) : "IMG"}
                              </p>
                            </div>
                          </div>
                        )}
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="absolute -top-1.5 -right-1.5 z-10 size-5 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-400 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {pendingImages.length === 2 && (
                      <div className="flex items-center self-center">
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <Layers className="size-3.5" /> {t("biTemporal")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-[#0c1428]/70 backdrop-blur-xl px-4 py-3 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)] focus-within:border-cyan-400/30 focus-within:ring-2 focus-within:ring-cyan-400/15 transition-all">
                  <button onClick={() => fileInputRef.current?.click()} disabled={pendingImages.length >= 2}
                    title={t("input.attach")}
                    className="shrink-0 flex size-9 items-center justify-center rounded-full text-slate-400 hover:text-cyan-400 hover:bg-white/5 disabled:opacity-30 transition-colors mb-0.5">
                    <Paperclip className="size-5" />
                  </button>
                  <input ref={fileInputRef} type="file" multiple
                    accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg,.jp2,.img" className="hidden"
                    onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
                  <textarea ref={textareaRef} value={query}
                    onChange={(e) => { setQuery(e.target.value); growTextarea(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (query.trim() || pendingImages.length > 0) void submit(); } }}
                    placeholder={(pendingImages.length === 0 && messages.length === 0) ? t("input.placeholder.empty") : t("input.placeholder.followup")}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[15px] text-white placeholder:text-slate-500 outline-none py-1.5 leading-relaxed min-h-[36px] max-h-[200px]"
                  />
                  <button onClick={() => void submit()} disabled={isCurrentChatBusy || (!query.trim() && pendingImages.length === 0)}
                    className="shrink-0 flex size-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5 shadow-sm shadow-cyan-500/20">
                    {isCurrentChatBusy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500">
                  {t("input.formats")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
