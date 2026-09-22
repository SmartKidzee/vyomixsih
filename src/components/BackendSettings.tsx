import { useEffect, useState, useRef } from "react";
import { Settings, CheckCircle2, AlertCircle, KeyRound, Sparkles, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BackendSettings({ onChange }: { onChange?: (keys: any) => void }) {
  const [open, setOpen] = useState(false);
  const [apiKey1, setApiKey1] = useState("");
  const [apiKey2, setApiKey2] = useState("");
  const [hfToken, setHfToken] = useState("");
  const [bhashiniUserId, setBhashiniUserId] = useState("");
  const [bhashiniApiKey, setBhashiniApiKey] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const getStorage = (key: string) => typeof window !== "undefined" ? window.localStorage.getItem(key) : "";
    const k1 = getStorage("satquery.apikey1") || getStorage("satquery.apikey") || "";
    const k2 = getStorage("satquery.apikey2") || "";
    const hf = getStorage("satquery.hftoken") || "";
    const buid = getStorage("satquery.bhashini_userid") || "";
    const bkey = getStorage("satquery.bhashini_apikey") || "";

    setApiKey1(k1);
    setApiKey2(k2);
    setHfToken(hf);
    setBhashiniUserId(buid);
    setBhashiniApiKey(bkey);
    setOnline(!!k1 || !!k2 || !!hf);

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const save = () => {
    if (typeof window !== "undefined") {
      const setStorage = (k: string, v: string) => v ? window.localStorage.setItem(k, v.trim()) : window.localStorage.removeItem(k);
      setStorage("satquery.apikey1", apiKey1);
      setStorage("satquery.apikey", apiKey1);
      setStorage("satquery.apikey2", apiKey2);
      setStorage("satquery.hftoken", hfToken);
      setStorage("satquery.bhashini_userid", bhashiniUserId);
      setStorage("satquery.bhashini_apikey", bhashiniApiKey);
      setOnline(!!apiKey1 || !!apiKey2 || !!hfToken);
    }
    onChange?.({ apiKey1, apiKey2, hfToken, bhashiniUserId, bhashiniApiKey });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-all hover:bg-white/10 backdrop-blur-sm cursor-pointer"
        title="Settings"
      >
        <Settings className="size-4 text-slate-300" />
        <div className="absolute -right-0.5 -top-0.5 rounded-full bg-[#0c1428]">
          {online ? (
            <CheckCircle2 className="size-3 text-emerald-400" />
          ) : (
            <AlertCircle className="size-3 text-amber-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0c1425]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/40 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="size-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-serif">{t("settings.title")}</h3>
          </div>
          
          <div className="space-y-4">
            {/* In-Browser ONNX ML Status */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-bold text-cyan-200">In-Browser ONNX (WASM)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Active & Free</span>
            </div>

            {/* ── Primary AI Vision Engine API Keys ─────────────────────────── */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>API Key 1</span>
                <span className="text-[10px] text-cyan-400 font-bold lowercase bg-cyan-500/10 px-1.5 py-0.5 rounded">primary</span>
              </label>
              <input
                value={apiKey1}
                type="password"
                onChange={(e) => setApiKey1(e.target.value)}
                placeholder="Enter Primary API Key..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-slate-500"
              />
            </div>
            
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>API Key 2</span>
                <span className="text-[10px] text-slate-400 font-bold lowercase bg-white/5 px-1.5 py-0.5 rounded">backup</span>
              </label>
              <input
                value={apiKey2}
                type="password"
                onChange={(e) => setApiKey2(e.target.value)}
                placeholder="Enter Backup API Key..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-slate-500"
              />
            </div>

            {/* ── Separator ─────────────────────────────── */}
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="size-3.5 text-violet-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">Change Detection</span>
              </div>
            </div>

            {/* ── Hugging Face Token ─────────────────────── */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Hugging Face Token</span>
                <span className="text-[10px] text-emerald-400 font-bold lowercase bg-emerald-500/10 px-1.5 py-0.5 rounded">free</span>
              </label>
              <input
                value={hfToken}
                type="password"
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_... (huggingface.co/settings/tokens)"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-violet-400/50 focus:ring-1 focus:ring-violet-400/30 placeholder:text-slate-500"
              />
              <p className="mt-1 text-[10px] text-slate-500">EuroSAT Sentinel-2 Swin model for Earth observation change detection (Free Serverless API)</p>
            </div>

            {/* ── Separator ─────────────────────────────── */}
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="size-3.5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Bhashini (22 Languages)</span>
              </div>
            </div>

            {/* ── Bhashini User ID ───────────────────────── */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Bhashini User ID</span>
                <span className="text-[10px] text-emerald-400 font-bold lowercase bg-emerald-500/10 px-1.5 py-0.5 rounded">free · gigw</span>
              </label>
              <input
                value={bhashiniUserId}
                type="text"
                onChange={(e) => setBhashiniUserId(e.target.value)}
                placeholder="Your userID from bhashini.gov.in"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 placeholder:text-slate-500"
              />
            </div>

            {/* ── Bhashini API Key ───────────────────────── */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Bhashini API Key</span>
                <span className="text-[10px] text-emerald-400 font-bold lowercase bg-emerald-500/10 px-1.5 py-0.5 rounded">free · gigw</span>
              </label>
              <input
                value={bhashiniApiKey}
                type="password"
                onChange={(e) => setBhashiniApiKey(e.target.value)}
                placeholder="ulcaApiKey from bhashini.gov.in"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 placeholder:text-slate-500"
              />
              <p className="mt-1 text-[10px] text-slate-500">Government of India's official translation API</p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t("settings.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                {t("settings.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
