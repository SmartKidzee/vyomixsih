import { useState, useRef, useEffect } from "react";
import { Globe, Search } from "lucide-react";
import { useI18n, LANGUAGES, type Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filteredLangs = LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeLabel.toLowerCase().includes(search.toLowerCase()) ||
      l.code.includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white backdrop-blur-sm"
        title={t("language")}
      >
        <Globe className="size-3.5" />
        <span className="hidden sm:inline">{currentLang?.nativeLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#0c1425]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Search className="size-3 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                autoFocus
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-white/10">
            {filteredLangs.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No matching language
              </div>
            ) : (
              filteredLangs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                    lang === l.code
                      ? "bg-cyan-500/15 text-cyan-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-sm min-w-[80px]">{l.nativeLabel}</span>
                  <span className="text-[11px] text-slate-500 ml-auto">
                    {l.label}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-white/5 text-center">
            <span className="text-[10px] font-mono text-cyan-400/80">
              22 Indian Languages + English
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
