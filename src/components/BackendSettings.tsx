import { useEffect, useState, useRef } from "react";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BackendSettings({ onChange }: { onChange?: (keys: any) => void }) {
  const [open, setOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [gradioUrl, setGradioUrl] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const getStorage = (key: string) => typeof window !== "undefined" ? window.localStorage.getItem(key) : "";
    const gKey = getStorage("satquery.apikey") || "";
    const grUrl = getStorage("satquery.gradiourl") || "";

    setGeminiKey(gKey);
    setGradioUrl(grUrl);
    
    // Consider online if at least Gemini or Gradio is configured
    setOnline(!!gKey || !!grUrl);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const save = () => {
    if (typeof window !== "undefined") {
      const setStorage = (k: string, v: string) => v ? window.localStorage.setItem(k, v) : window.localStorage.removeItem(k);
      setStorage("satquery.apikey", geminiKey);
      setStorage("satquery.gradiourl", gradioUrl);
      setOnline(!!geminiKey || !!gradioUrl);
    }
    onChange?.({ geminiKey, gradioUrl });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-sm transition-all hover:bg-white/10 backdrop-blur-sm"
      >
        <Settings className="size-4.5 text-slate-300" />
        <div className="absolute -right-0.5 -top-0.5 rounded-full bg-[#0c1428]">
          {online ? (
            <CheckCircle2 className="size-3 text-emerald-400" />
          ) : (
            <AlertCircle className="size-3 text-red-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0c1425]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/40 max-h-[80vh] overflow-y-auto">
          <h3 className="mb-4 text-sm font-bold text-white font-serif">{t("settings.title")}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("settings.geminiKey")}
              </label>
              <input
                value={geminiKey}
                type="password"
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-slate-500"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("settings.gradioUrl")}
              </label>
              <input
                value={gradioUrl}
                type="url"
                onChange={(e) => setGradioUrl(e.target.value)}
                placeholder="https://...gradio.live"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-slate-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={() => void save()}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-400 transition-colors"
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
