import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Satellite, Send, Paperclip, X, Loader2, AlertCircle, ChevronDown,
  ChevronRight, Check, Layers, FileImage, Bot, User, Sparkles, BarChart3
} from "lucide-react";
import { BackendSettings } from "@/components/BackendSettings";
import { useAuth } from "@/lib/auth-context";
import { runOrchestration } from "@/services/geminiService";
import {
  humanizeError, formatConfidence, confidenceRatio,
  type AnalysisResponse, type BoundingBox
} from "@/lib/satquery";
import type { UploadedImage } from "@/components/UploadPanel";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Earth Query Lens — VYOMIX" },
      { name: "description", content: "Satellite imagery analysis powered by multimodal AI." },
    ],
  }),
  component: Index,
} as any));

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  images?: UploadedImage[];
  result?: AnalysisResponse;
  error?: string;
}

/* BBox canvas overlay */
function BboxCanvas({ url, boxes }: { url: string; boxes: BoundingBox[] }) {
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
        const [x1, y1, x2, y2] = b.bbox;
        const norm = [x1, y1, x2, y2].every((v) => v >= 0 && v <= 1);
        const rx = norm ? x1 * img.naturalWidth : x1;
        const ry = norm ? y1 * img.naturalHeight : y1;
        const rw = norm ? (x2 - x1) * img.naturalWidth : x2 - x1;
        const rh = norm ? (y2 - y1) * img.naturalHeight : y2 - y1;
        const isWater = /water|lake|river|sea|ocean|pond|wetland/i.test(b.label ?? "");
        ctx.strokeStyle = isWater ? "#06b6d4" : "#38bdf8";
        ctx.lineWidth = Math.max(2, img.naturalWidth * 0.003);
        ctx.strokeRect(rx, ry, rw, rh);
        if (b.label) {
          ctx.fillStyle = isWater ? "rgba(6,182,212,0.85)" : "rgba(56,189,248,0.85)";
          const fontSize = Math.max(11, img.naturalWidth * 0.016);
          ctx.font = `bold ${fontSize}px system-ui`;
          const tw = ctx.measureText(b.label).width;
          ctx.fillRect(rx, ry - fontSize - 4, tw + 12, fontSize + 8);
          ctx.fillStyle = "#fff";
          ctx.fillText(b.label, rx + 6, ry - 4);
        }
      });
    };
  }, [url, boxes]);
  return (
    <canvas ref={canvasRef} className="w-full rounded-xl border border-slate-200 max-h-72 object-contain" />
  );
}

/* Assistant bubble */
function AssistantBubble({ msg }: { msg: ChatMessage }) {
  const r = msg.result!;
  const [traceOpen, setTraceOpen] = useState(false);
  const conf = formatConfidence(r.confidence);
  const ratio = confidenceRatio(r.confidence);

  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-sky-700 text-white mt-1">
        <Satellite className="size-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* Answer card */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Sparkles className="size-4 text-sky-600 shrink-0" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {r.task ?? "Satellite Analysis"}
            </span>
            {(r.model ?? r.execution_trace?.model) && (
              <span className="ml-auto text-xs font-mono font-semibold text-slate-400 shrink-0">
                {r.model ?? r.execution_trace?.model}
              </span>
            )}
          </div>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {r.answer ?? r.caption ?? "No analysis returned."}
          </p>
          {conf && ratio !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confidence</span>
                <span className="text-xs font-bold font-mono text-slate-700">{conf}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-sky-600 transition-all duration-700"
                  style={{ width: `${ratio * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Evidence chips */}
        {r.evidence && r.evidence.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(r.evidence as any[]).map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Check className="size-3 text-emerald-500 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {typeof e === "string" ? e : (e.label ?? e.type ?? "Evidence")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Change detection */}
        {r.change && (
          <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${r.change.change_detected ? "border-amber-300 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            <Layers className="size-4 shrink-0 mt-0.5" />
            <div>
              <p>{r.change.change_detected ? "⚠ Change Detected" : "✓ No Significant Change"}</p>
              {r.change.description && <p className="font-normal text-xs mt-1 opacity-80">{r.change.description}</p>}
              {typeof r.change.changed_area_percent === "number" && (
                <p className="font-normal text-xs opacity-70 mt-0.5">Changed area: ~{r.change.changed_area_percent.toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}

        {/* Image overlays */}
        {msg.images && msg.images.length > 0 && r.grounding && r.grounding.length > 0 && (
          <div className={`grid gap-2 ${msg.images.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            {msg.images.map((img, idx) => (
              <div key={img.id}>
                {idx === 0 && img.previewUrl ? (
                  <BboxCanvas url={img.previewUrl} boxes={r.grounding!} />
                ) : img.previewUrl ? (
                  <img src={img.previewUrl} alt={img.file.name}
                    className="w-full rounded-xl border border-slate-200 max-h-72 object-contain" />
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-400">
                    <FileImage className="size-4 shrink-0" />
                    <span className="font-mono truncate">{img.file.name}</span>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400 font-mono truncate">{img.file.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Execution trace collapsible */}
        {r.execution_trace && r.execution_trace.steps && (
          <>
            <button onClick={() => setTraceOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors mt-1">
              {traceOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              <BarChart3 className="size-3.5" /> Execution Trace
            </button>
            {traceOpen && (
              <div className="rounded-xl bg-slate-900 text-slate-200 p-4 text-xs font-mono space-y-1.5">
                <p><span className="text-slate-500">task:</span> {r.execution_trace.detected_task}</p>
                <p><span className="text-slate-500">model:</span> {r.execution_trace.model}</p>
                <div className="mt-2 space-y-1">
                  {r.execution_trace.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="size-3 text-emerald-400 shrink-0" />
                      <span className="text-slate-300">{s.name}</span>
                      {s.detail && <span className="text-slate-500">— {s.detail}</span>}
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

/* Main component */
function Index() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingImages, setPendingImages] = useState<UploadedImage[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

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
    const t = pendingImages.find((i) => i.id === id);
    if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
    setPendingImages((p) => p.filter((i) => i.id !== id));
  };

  const submit = async () => {
    if (busy) return;
    if (!isLoggedIn) { void navigate({ to: "/login", search: { redirect: "/" } }); return; }
    if (pendingImages.length === 0) {
      setMessages((p) => [...p, { id: Math.random().toString(), role: "assistant", error: "Please attach at least one image before sending." }]);
      return;
    }
    const imgs = [...pendingImages];
    const q = query.trim() || "Analyze this imagery and describe what you see.";
    setMessages((p) => [...p, { id: Math.random().toString(), role: "user", text: query.trim() || undefined, images: imgs }]);
    setQuery("");
    setPendingImages([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setBusy(true);
    setProgressText("Initializing...");
    try {
      const res = await runOrchestration(q, imgs.map((i) => i.file), (m) => setProgressText(m));
      setMessages((p) => [...p, { id: Math.random().toString(), role: "assistant", result: res, images: imgs }]);
    } catch (err) {
      setMessages((p) => [...p, { id: Math.random().toString(), role: "assistant", error: humanizeError(err) }]);
    } finally {
      setBusy(false);
      setProgressText("");
    }
  };

  const SUGGESTIONS = [
    { q: "Describe this scene", icon: "🛰️" },
    { q: "Detect all water bodies", icon: "💧" },
    { q: "What changed between these images?", icon: "🔄" },
    { q: "Identify urban structures", icon: "🏙️" },
  ];

  return (
    <div className="flex flex-col bg-slate-50 h-screen overflow-hidden">
      {/* Navbar */}
      <div className="shrink-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-700">
            <Satellite className="size-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-none truncate">Earth Query Lens</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">by VYOMIX</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setPendingImages([]); }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              New Chat
            </button>
          )}
          <BackendSettings />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !busy ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-700 mb-5 shadow-lg">
              <Satellite className="size-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Earth Query Lens</h1>
            <p className="text-slate-500 max-w-sm text-sm mb-8">
              Attach satellite imagery below, then ask anything. Supports GeoTIFF, SAR, optical, and bi-temporal pairs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md w-full">
              {SUGGESTIONS.map((s) => (
                <button key={s.q} onClick={() => { setQuery(s.q); textareaRef.current?.focus(); }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50 transition-all">
                  <span className="text-lg">{s.icon}</span>
                  {s.q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl w-full px-4 py-8 space-y-8">
            {messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex gap-3 items-start justify-end">
                    <div className="max-w-[85%] space-y-2 min-w-0">
                      {msg.images && msg.images.length > 0 && (
                        <div className={`grid gap-2 ${msg.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                          {msg.images.map((img) => img.previewUrl ? (
                            <img key={img.id} src={img.previewUrl} alt={img.file.name}
                              className="rounded-xl border border-slate-200 max-h-48 w-full object-cover" />
                          ) : (
                            <div key={img.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500">
                              <FileImage className="size-4 shrink-0" />
                              <span className="truncate font-mono">{img.file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text && (
                        <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm leading-relaxed">
                          {msg.text}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-slate-200 mt-1">
                      <User className="size-4 text-slate-600" />
                    </div>
                  </div>
                );
              }
              if (msg.error) {
                return (
                  <div key={msg.id} className="flex gap-3 items-start">
                    <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-rose-100 mt-1">
                      <AlertCircle className="size-4 text-rose-600" />
                    </div>
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
                      {msg.error}
                    </div>
                  </div>
                );
              }
              if (msg.result) {
                return <AssistantBubble key={msg.id} msg={msg} />;
              }
              return null;
            })}

            {busy && (
              <div className="flex gap-3 items-start">
                <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-sky-700 text-white mt-1">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-4 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-4 animate-spin text-sky-600 shrink-0" />
                    <p className="text-sm font-semibold text-slate-600">{progressText || "Processing..."}</p>
                  </div>
                  <div className="flex gap-1 mt-3">
                    {["Pre-event Extraction", "Post-event Extraction", "Evidence Fusion"].map((step, i) => (
                      <div key={i} className="flex-1 space-y-1">
                        <div className="h-1 rounded-full bg-sky-100 overflow-hidden">
                          <div className="h-full bg-sky-500 animate-pulse rounded-full" style={{ animationDelay: `${i * 0.35}s` }} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono text-center leading-none">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Sticky input bar */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 sm:px-6 py-4 z-20">
        <div className="mx-auto max-w-3xl w-full space-y-2.5">
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {pendingImages.map((img, idx) => (
                <div key={img.id} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-2 pr-1 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                  {img.previewUrl ? (
                    <img src={img.previewUrl} alt="" className="size-5 rounded-full object-cover" />
                  ) : (
                    <FileImage className="size-4 text-slate-400" />
                  )}
                  <span className="max-w-[100px] truncate">{img.file.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold ml-0.5">
                    {pendingImages.length > 1 ? (idx === 0 ? "T1" : "T2") : "IMG"}
                  </span>
                  <button onClick={() => removeImage(img.id)}
                    className="rounded-full p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {pendingImages.length === 2 && (
                <span className="flex items-center gap-1 text-xs text-sky-600 font-semibold">
                  <Layers className="size-3.5" /> Bi-temporal — fusion enabled
                </span>
              )}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-sm">
            <button onClick={() => fileInputRef.current?.click()} disabled={pendingImages.length >= 2}
              title="Attach imagery (max 2 for bi-temporal)"
              className="shrink-0 flex size-8 items-center justify-center rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-30 transition-colors mb-0.5">
              <Paperclip className="size-5" />
            </button>
            <input ref={fileInputRef} type="file" multiple
              accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg,.jp2,.img" className="hidden"
              onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
            <textarea ref={textareaRef} value={query}
              onChange={(e) => { setQuery(e.target.value); growTextarea(); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } }}
              placeholder={pendingImages.length === 0 ? "Attach imagery first, then ask…" : "Ask about this imagery… (Enter to send)"}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none py-1 leading-relaxed min-h-[36px] max-h-[200px]"
            />
            <button onClick={() => void submit()} disabled={busy || pendingImages.length === 0}
              className="shrink-0 flex size-8 items-center justify-center rounded-xl bg-sky-700 text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5 shadow-sm">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400">
            Supports GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR · Bi-temporal change detection
          </p>
        </div>
      </div>
    </div>
  );
}
