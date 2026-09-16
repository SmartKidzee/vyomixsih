import { useState, useRef, useEffect, useCallback } from "react";
import {
  Satellite, Send, Paperclip, X, Loader2, AlertCircle, ChevronDown,
  ChevronRight, Check, Layers, FileImage, Bot, User, Sparkles, BarChart3,
  Menu, Map as MapIcon, MessageSquare, Eye
} from "lucide-react";
import { BackendSettings } from "@/components/BackendSettings";
import { MapSelector } from "@/components/MapSelector";
import {
  humanizeError, formatConfidence, confidenceRatio,
  type AnalysisResponse, type BoundingBox
} from "@/lib/satquery";
import localforage from "localforage";
import ReactMarkdown from "react-markdown";
import { generateChatTitle, runOrchestration, analyzeWithGeoChat } from "@/services/geminiService";

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
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
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
        const [x1, y1, x2, y2] = b.bbox;
        const norm = [x1, y1, x2, y2].every((v) => v >= 0 && v <= 1);
        const rx = norm ? x1 * img.naturalWidth : x1;
        const ry = norm ? y1 * img.naturalHeight : y1;
        const rw = norm ? (x2 - x1) * img.naturalWidth : x2 - x1;
        const rh = norm ? (y2 - y1) * img.naturalHeight : y2 - y1;
        const isChange = /change|new|destroyed|flood|loss/i.test(b.label ?? "");
        ctx.strokeStyle = isChange ? "#CC5A37" : "#3D7E5D";
        ctx.lineWidth = Math.max(2, img.naturalWidth * 0.003);
        ctx.strokeRect(rx, ry, rw, rh);
        if (b.label) {
          ctx.fillStyle = isChange ? "rgba(204,90,55,0.9)" : "rgba(61,126,93,0.9)";
          const fontSize = Math.max(12, img.naturalWidth * 0.018);
          ctx.font = `bold ${fontSize}px system-ui`;
          const tw = ctx.measureText(b.label).width;
          ctx.fillRect(rx, ry - fontSize - 6, tw + 12, fontSize + 10);
          ctx.fillStyle = "#fff";
          ctx.fillText(b.label, rx + 6, ry - 4);
        }
      });
    };
  }, [url, boxes]);
  return (
    <div className={`relative group ${onClick ? "cursor-zoom-in" : ""}`} onClick={onClick}>
      {label && <div className="absolute top-2 left-2 z-10 bg-[#1F1E1B]/80 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm">{label}</div>}
      <canvas ref={canvasRef} className={`w-full rounded-2xl border border-[#E5E0D8] object-contain shadow-sm bg-white ${isLightbox ? "max-h-[85vh] max-w-[85vw]" : "max-h-80"}`} />
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

  return (
    <div className="flex gap-4 items-start mb-8">
      <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-[#CC5A37] text-white mt-1">
        <Satellite className="size-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        {/* Answer card */}
        <div className="rounded-2xl bg-white border border-[#E5E0D8] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Sparkles className="size-4 text-[#CC5A37] shrink-0" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#7D786F]">
              {r.task ?? "Satellite Analysis"}
            </span>
          </div>
          <div className="text-[#1F1E1B] text-sm sm:text-[15px] leading-relaxed font-sans prose-sm max-w-none [&>strong]:font-extrabold [&>strong]:text-[#CC5A37]">
            <ReactMarkdown>{r.answer ?? r.caption ?? "No analysis returned."}</ReactMarkdown>
          </div>
          {conf && ratio !== null && (
            <div className="mt-4 pt-4 border-t border-[#F2EFEA]">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#7D786F] uppercase tracking-wider">Confidence</span>
                <span className="text-xs font-bold font-mono text-[#1F1E1B]">{conf}</span>
              </div>
              <div className="h-2 rounded-full bg-[#F2EFEA] overflow-hidden">
                <div className="h-full rounded-full bg-[#CC5A37] transition-all duration-700"
                  style={{ width: `${ratio * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Evidence chips — clickable to expand with image preview */}
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
                        ? "bg-[#3D7E5D] text-white border border-[#3D7E5D] shadow-sm"
                        : "bg-[#3D7E5D]/10 border border-[#3D7E5D]/20 text-[#3D7E5D] hover:bg-[#3D7E5D]/20"
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
              // Find the first image that has a previewUrl
              const previewImg = msg.images?.find(img => img.previewUrl);
              // Find matching grounding box for this evidence label
              const matchingBox = r.grounding?.find((g: BoundingBox) => g.label?.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(g.label?.toLowerCase() ?? ""));
              const highlightBoxes = matchingBox ? [matchingBox] : (r.grounding || []);

              return (
                <div className="rounded-xl bg-white border border-[#E5E0D8] shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Image preview */}
                  {previewImg?.previewUrl && (
                    <div className="relative cursor-zoom-in" onClick={() => onImageClick(previewImg.previewUrl!, highlightBoxes, label)}>
                      {highlightBoxes.length > 0 ? (
                        <BboxCanvas url={previewImg.previewUrl} boxes={highlightBoxes} label={label} />
                      ) : (
                        <>
                          <div className="absolute top-2 left-2 z-10 bg-[#1F1E1B]/80 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm">{label}</div>
                          <img src={previewImg.previewUrl} alt={label} className="w-full max-h-64 object-contain bg-[#F8F7F4]" />
                        </>
                      )}
                    </div>
                  )}
                  {/* Detail text */}
                  {detail && (
                    <div className="px-4 py-3 border-t border-[#F2EFEA]">
                      <p className="text-xs font-bold text-[#3D7E5D] uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-[#1F1E1B] leading-relaxed">{detail}</p>
                    </div>
                  )}
                  {!detail && !previewImg?.previewUrl && (
                    <div className="px-4 py-3 text-sm text-[#7D786F] italic">{label}</div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Change detection */}
        {r.change && (
          <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${r.change.change_detected ? "border-[#CC5A37]/30 bg-[#CC5A37]/10 text-[#B45309]" : "border-[#3D7E5D]/30 bg-[#3D7E5D]/10 text-[#3D7E5D]"}`}>
            <Layers className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-base">{r.change.change_detected ? "⚠ Significant Change Detected" : "✓ No Significant Change"}</p>
              {r.change.description && <p className="font-normal text-sm mt-1.5 opacity-90 text-[#1F1E1B]">{r.change.description}</p>}
              {typeof r.change.changed_area_percent === "number" && (
                <p className="font-mono text-xs opacity-80 mt-2 font-bold">Estimated Affected Area: {r.change.changed_area_percent.toFixed(1)}%</p>
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
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} label="T1: Pre-Event" onClick={() => onImageClick(img.previewUrl!, r.grounding!, "T1: Pre-Event")} />
                    ) : (
                      <>
                        <div className="absolute top-2 left-2 z-10 bg-[#1F1E1B]/80 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm">T1: Pre-Event</div>
                        <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-[#E5E0D8] max-h-80 object-contain bg-white cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [], "T1: Pre-Event")} />
                      </>
                    )}
                  </div>
                ) : idx === 1 && img.previewUrl ? (
                  <div className="relative">
                    {r.grounding && r.grounding.length > 0 ? (
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} label="T2: Post-Event" onClick={() => onImageClick(img.previewUrl!, r.grounding!, "T2: Post-Event")} />
                    ) : (
                      <>
                        <div className="absolute top-2 left-2 z-10 bg-[#1F1E1B]/80 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-md shadow-sm">T2: Post-Event</div>
                        <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-[#E5E0D8] max-h-80 object-contain bg-white cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [], "T2: Post-Event")} />
                      </>
                    )}
                  </div>
                ) : img.previewUrl ? (
                  <div className="relative">
                    {r.grounding && r.grounding.length > 0 ? (
                      <BboxCanvas url={img.previewUrl} boxes={r.grounding} onClick={() => onImageClick(img.previewUrl!, r.grounding!)} />
                    ) : (
                      <img src={img.previewUrl} alt={img.file.name} className="w-full rounded-xl border border-[#E5E0D8] max-h-80 object-contain bg-white cursor-zoom-in" onClick={() => onImageClick(img.previewUrl!, [])} />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-[#E5E0D8] bg-[#FAF9F5] px-3 py-3 text-xs text-[#7D786F]">
                    <FileImage className="size-4 shrink-0" />
                    <span className="font-mono truncate">{img.file.name}</span>
                  </div>
                )}
                <p className="mt-1 text-xs text-[#7D786F] font-mono truncate">{img.file.name}</p>
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

export default function Index() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingImages, setPendingImages] = useState<UploadedImage[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "map">("chat");
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ url: string; boxes: BoundingBox[]; label?: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions and handle migration on mount
  useEffect(() => {
    const init = async () => {
      try {
        const savedSessions = await localforage.getItem<ChatSession[]>("satquery.sessions");
        if (savedSessions && savedSessions.length > 0) {
          setSessions(savedSessions);
          // Load the most recent session
          const latest = [...savedSessions].sort((a,b) => b.updatedAt - a.updatedAt)[0];
          setCurrentSessionId(latest?.id || "");
        } else {
          // Check for legacy migration
          const legacy = await localforage.getItem<ChatMessage[]>("satquery.history");
          if (legacy && legacy.length > 0) {
            const legacyId = `session-${Date.now()}`;
            const legacySession = { id: legacyId, title: "Previous Session", updatedAt: Date.now() };
            setSessions([legacySession]);
            setCurrentSessionId(legacyId);
            await localforage.setItem("satquery.sessions", [legacySession]);
            
            // Re-create object URLs for legacy files
            const restored = legacy.map(m => {
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
            await localforage.setItem(`satquery.session_${legacyId}`, legacy); // save stripped version
            setMessages(restored as ChatMessage[]);
            await localforage.removeItem("satquery.history"); // cleanup
          } else {
            // Start fresh
            setCurrentSessionId(`session-${Date.now()}`);
          }
        }
      } catch(e) { console.warn("Failed to init", e); }
    };
    init();
  }, []);

  // Load specific session messages when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) return;
    localforage.getItem<ChatMessage[]>(`satquery.session_${currentSessionId}`)
      .then((saved) => {
        if (saved) {
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
          setMessages([]); // New session
        }
      });
  }, [currentSessionId]);

  // Save current session messages on change
  useEffect(() => {
    if (!currentSessionId) return;
    
    // Strip Object URLs before saving
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
    setCurrentSessionId(`session-${Date.now()}`);
    setMessages([]);
    setPendingImages([]);
    setQuery("");
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
      } else {
        createNewChat();
      }
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, mode]);

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

  const getContextImages = () => {
    if (pendingImages.length > 0) return pendingImages;
    // Look backward in history for the last uploaded images
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && msg.images && msg.images.length > 0) {
        // Reconstruct basic structure (preview might be missing due to serialization)
        return msg.images || [];
      }
    }
    return [];
  };

  const handleMapSelect = (bounds: [[number, number], [number, number]], imageFile?: File) => {
    const q = `Analyze the region at coordinates [${bounds?.[0]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[0]?.[1]?.toFixed(4) || "0.0000"}] to [${bounds?.[1]?.[0]?.toFixed(4) || "0.0000"}, ${bounds?.[1]?.[1]?.toFixed(4) || "0.0000"}].`;
    setQuery(q);
    
    if (imageFile) {
      try {
        const dt = new DataTransfer();
        dt.items.add(imageFile);
        addImages(dt.files);
      } catch (e) {
        // Fallback for environments lacking DataTransfer
        const id = `map-${Date.now()}`;
        setPendingImages(p => [...p, { id, file: imageFile, previewUrl: URL.createObjectURL(imageFile) }]);
      }
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
    if (busy) return;
    
    const contextImages = getContextImages();
    const imgs = [...pendingImages]; 
    const isNewImage = imgs.length > 0;
    
    const msgToAdd: ChatMessage = { id: Math.random().toString(), role: "user" };
    if (query.trim()) msgToAdd.text = query.trim();
    if (isNewImage) msgToAdd.images = imgs;
    
    setMessages((p) => [...p, msgToAdd]);
    setQuery("");
    setPendingImages([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setBusy(true);
    setProgressText("Initializing...");

    // Session logic: Update timestamp and title only when actually submitting
    const apiKey = localStorage.getItem("satquery.apikey");
    // Check if session exists BEFORE calling setSessions, so the variable is
    // captured synchronously (the setter callback is batched by React).
    const needsTitle = !sessions.find(s => s.id === currentSessionId);
    
    setSessions(prev => {
      const existing = prev.find(s => s.id === currentSessionId);
      if (!existing) {
         const initialSession = { id: currentSessionId, title: "New Chat...", updatedAt: Date.now() };
         const updated = [initialSession, ...prev];
         localforage.setItem("satquery.sessions", updated);
         return updated;
      } else {
         const updated = prev.map(s => s.id === currentSessionId ? { ...s, updatedAt: Date.now() } : s);
         updated.sort((a,b) => b.updatedAt - a.updatedAt);
         localforage.setItem("satquery.sessions", updated);
         return updated;
      }
    });

    if (apiKey && needsTitle) {
       generateChatTitle(query.trim() || "Analyze image", apiKey).then(t => {
          setSessions(prev => {
            const updated = prev.map(s => s.id === currentSessionId ? { ...s, title: t } : s);
            localforage.setItem("satquery.sessions", updated);
            return updated;
          });
       });
    }

    try {
      // Use either newly attached images, or carry forward the context ones
      const filesToAnalyze = isNewImage ? imgs.map((i) => i.file) : contextImages.map(i => i.file);
      
      let res;
      // TEMPORARILY DISABLED GEOCHAT: The user requested to strictly use Gemini for everything right now
      if (messages.length === -1) {
        res = await analyzeWithGeoChat(query.trim() || "Analyze this context.", filesToAnalyze);
      } else {
        res = await runOrchestration(query.trim() || "Analyze this context.", filesToAnalyze, (m) => setProgressText(m));
      }
      
      const resMsg: ChatMessage = { id: Math.random().toString(), role: "assistant", result: res };
      resMsg.images = isNewImage ? imgs : contextImages;
      setMessages((p) => [...p, resMsg]);
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
    <div 
      className="flex h-[100dvh] bg-[#FDFBF7] font-sans antialiased overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Lightbox Overlay */}
      {lightboxData && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setLightboxData(null)}>
          <button className="absolute top-6 right-6 text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setLightboxData(null); }}>
            <X className="size-6" />
          </button>
          <div className="w-full h-full flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <BboxCanvas url={lightboxData.url} boxes={lightboxData.boxes} {...(lightboxData.label ? { label: lightboxData.label } : {})} isLightbox={true} />
          </div>
        </div>
      )}

      {isDragging && (
        <div className="fixed inset-0 z-[9999] bg-[#CC5A37]/5 backdrop-blur-[2px] border-4 border-dashed border-[#CC5A37] flex items-center justify-center transition-all m-4 rounded-3xl">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#F2EFEA] p-4 rounded-full">
              <FileImage className="size-8 text-[#CC5A37]" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#1F1E1B]">Drop images to upload</h3>
              <p className="text-sm text-[#7D786F] mt-1">Supports TIFF, JPG, and PNG files</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-[#E5E0D8] bg-[#FAF9F5] transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#CC5A37]">
              <Satellite className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1F1E1B] font-serif tracking-tight">Earth Query Lens</h1>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="size-5 text-[#1F1E1B]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold text-[#7D786F] uppercase tracking-widest px-2 py-2">Chats</div>
          {sessions.map(s => (
            <div key={s.id} 
              onClick={() => { setCurrentSessionId(s.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between group cursor-pointer transition-colors ${currentSessionId === s.id ? 'bg-white border border-[#E5E0D8] shadow-sm text-[#1F1E1B]' : 'text-[#7D786F] hover:text-[#1F1E1B] hover:bg-white/60'}`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="size-3.5 shrink-0" /> 
                <span className="truncate">{s.title}</span>
              </div>
              <button 
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#7D786F] hover:text-[#D94636] transition-all rounded-md hover:bg-[#D94636]/10"
                title="Delete Chat"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-3 py-4 text-xs text-center text-[#7D786F]">No previous chats.</div>
          )}
        </div>
        
        <div className="p-4 border-t border-[#E5E0D8] space-y-2">
          <button onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[#E5E0D8] text-[#1F1E1B] hover:bg-[#F2EFEA] rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm">
            <Sparkles className="size-4 text-[#CC5A37]" /> New Chat
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        {/* Navbar */}
        <div className="shrink-0 z-20 flex items-center justify-between border-b border-[#E5E0D8] bg-[#FAF9F5] px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5 text-[#1F1E1B]" />
            </button>
            <div className="flex bg-[#E5E0D8] p-1 rounded-xl">
              <button 
                onClick={() => setMode("chat")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "chat" ? 'bg-white shadow-sm text-[#1F1E1B]' : 'text-[#7D786F] hover:text-[#1F1E1B]'}`}>
                <MessageSquare className="size-3.5" /> Chat
              </button>
              <button 
                onClick={() => setMode("map")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${mode === "map" ? 'bg-white shadow-sm text-[#1F1E1B]' : 'text-[#7D786F] hover:text-[#1F1E1B]'}`}>
                <MapIcon className="size-3.5" /> Map
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
              {messages.length === 0 && !busy ? (
                <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center max-w-2xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl font-serif text-[#1F1E1B] mb-4">Good morning.</h1>
                  <p className="text-[#7D786F] text-lg mb-8 max-w-md mx-auto">
                    Attach satellite imagery (GeoTIFF, SAR, optical) to begin analysis. Future queries will remember your images.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {SUGGESTIONS.map((s) => (
                      <button key={s.q} onClick={() => { setQuery(s.q); textareaRef.current?.focus(); }}
                        className="flex items-center gap-3 rounded-2xl border border-[#E5E0D8] bg-white p-4 text-left text-sm font-medium text-[#1F1E1B] shadow-sm hover:border-[#CC5A37] hover:bg-[#FAF9F5] transition-all">
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
                        <div key={msg.id} className="flex gap-4 items-start justify-end">
                          <div className="max-w-[85%] space-y-3 min-w-0">
                            {msg.images && msg.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2 justify-end">
                                {msg.images.filter(Boolean).map((img) => img.previewUrl ? (
                                  <img key={img.id} src={img.previewUrl} alt={img.file.name}
                                    onClick={() => setLightboxData({ url: img.previewUrl!, boxes: [] })}
                                    className="rounded-lg border border-[#E5E0D8] max-h-16 w-auto object-cover shadow-sm cursor-zoom-in hover:ring-2 hover:ring-[#CC5A37]/40 transition-all" />
                                ) : (
                                  <div key={img.id} className="flex items-center gap-1.5 rounded-lg border border-[#E5E0D8] bg-white px-2 py-1.5 text-xs text-[#7D786F] shadow-sm">
                                    <FileImage className="size-3.5 shrink-0" />
                                    <span className="truncate font-mono max-w-[100px]">{img.file.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {msg.text && (
                              <div className="rounded-2xl bg-[#F2EFEA] text-[#1F1E1B] px-4 py-3 text-sm leading-relaxed shadow-sm">
                                {msg.text}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-[#E5E0D8] mt-1">
                            <User className="size-4 text-[#4B473F]" />
                          </div>
                        </div>
                      );
                    }
                    if (msg.error) {
                      return (
                        <div key={msg.id} className="flex gap-4 items-start mb-8">
                          <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-[#D94636]/10 mt-1">
                            <AlertCircle className="size-4 text-[#D94636]" />
                          </div>
                          <div className="rounded-2xl bg-[#D94636]/5 border border-[#D94636]/20 px-5 py-4 text-sm text-[#D94636] font-semibold">
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

                  {busy && (
                    <div className="flex gap-4 items-start mb-8">
                      <div className="shrink-0 flex size-8 items-center justify-center rounded-full bg-[#CC5A37] text-white mt-1">
                        <Bot className="size-4" />
                      </div>
                      <div className="rounded-2xl bg-white border border-[#E5E0D8] shadow-sm px-6 py-5 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <Loader2 className="size-4 animate-spin text-[#CC5A37] shrink-0" />
                          <p className="text-[15px] font-bold text-[#1F1E1B]">{progressText || "Processing..."}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Sticky input bar */}
            <div className="shrink-0 bg-transparent px-4 sm:px-6 pb-6 pt-2 z-20">
              <div className="mx-auto max-w-3xl w-full space-y-2.5">
                {pendingImages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {pendingImages.map((img, idx) => (
                      <div key={img.id} className="flex items-center gap-1.5 rounded-full border border-[#E5E0D8] bg-white pl-2 pr-1 py-1 text-xs font-semibold text-[#1F1E1B] shadow-sm">
                        {img.previewUrl ? (
                          <img src={img.previewUrl} alt="" className="size-5 rounded-full object-cover" />
                        ) : (
                          <FileImage className="size-4 text-[#7D786F]" />
                        )}
                        <span className="max-w-[120px] truncate">{img.file.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEA] text-[#1F1E1B] font-bold ml-1">
                          {pendingImages.length > 1 ? (idx === 0 ? "T1: Pre-event" : "T2: Post-event") : "IMG"}
                        </span>
                        <button onClick={() => removeImage(img.id)}
                          className="rounded-full p-1 text-[#7D786F] hover:text-[#D94636] hover:bg-[#D94636]/10 transition-colors ml-1">
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {pendingImages.length === 2 && (
                      <span className="flex items-center gap-1 text-xs text-[#3D7E5D] font-semibold ml-2">
                        <Layers className="size-3.5" /> Bi-temporal mode
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-3xl border border-[#E5E0D8] bg-white px-4 py-3 shadow-[0_4px_20px_-8px_rgba(31,30,27,0.08)] focus-within:border-[#CC5A37] focus-within:ring-2 focus-within:ring-[#CC5A37]/20 transition-all">
                  <button onClick={() => fileInputRef.current?.click()} disabled={pendingImages.length >= 2}
                    title="Attach imagery (max 2 for bi-temporal)"
                    className="shrink-0 flex size-9 items-center justify-center rounded-full text-[#7D786F] hover:text-[#CC5A37] hover:bg-[#FAF9F5] disabled:opacity-30 transition-colors mb-0.5">
                    <Paperclip className="size-5" />
                  </button>
                  <input ref={fileInputRef} type="file" multiple
                    accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg,.jp2,.img" className="hidden"
                    onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
                  <textarea ref={textareaRef} value={query}
                    onChange={(e) => { setQuery(e.target.value); growTextarea(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (query.trim() || pendingImages.length > 0) void submit(); } }}
                    placeholder={(pendingImages.length === 0 && messages.length === 0) ? "Ask about your satellite imagery..." : "Ask follow-up questions or drag to map..."}
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-[15px] text-[#1F1E1B] placeholder:text-[#7D786F] outline-none py-1.5 leading-relaxed min-h-[36px] max-h-[200px]"
                  />
                  <button onClick={() => void submit()} disabled={busy || (!query.trim() && pendingImages.length === 0)}
                    className="shrink-0 flex size-9 items-center justify-center rounded-full bg-[#CC5A37] text-white hover:bg-[#B54A2B] disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5 shadow-sm">
                    {busy ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                  </button>
                </div>

                <p className="text-center text-xs text-[#7D786F]">
                  Supports GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
