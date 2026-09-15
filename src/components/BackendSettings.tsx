import { useEffect, useState, useRef } from "react";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";

export function BackendSettings({ onChange }: { onChange?: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = typeof window !== "undefined" ? window.localStorage.getItem("satquery.apikey") : "";
    setValue(key || "");
    setOnline(!!key);
    
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const save = () => {
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem("satquery.apikey", value);
        setOnline(true);
      } else {
        window.localStorage.removeItem("satquery.apikey");
        setOnline(false);
      }
    }
    onChange?.(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex size-9 items-center justify-center rounded-full border border-[#E5E0D8] bg-[#FAF9F5] shadow-sm transition-all hover:bg-white"
      >
        <Settings className="size-4.5 text-[#1F1E1B]" />
        <div className="absolute -right-0.5 -top-0.5 rounded-full bg-white">
          {online ? (
            <CheckCircle2 className="size-3 text-[#3D7E5D]" />
          ) : (
            <AlertCircle className="size-3 text-[#D94636]" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 shadow-[0_10px_40px_-10px_rgba(31,30,27,0.1)]">
          <h3 className="mb-4 text-sm font-bold text-[#1F1E1B] font-serif">Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#7D786F]">
                API Key
              </label>
              <input
                value={value}
                type="password"
                onChange={(e) => setValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-[#E5E0D8] bg-[#FAF9F5] p-2.5 font-mono text-sm text-[#1F1E1B] outline-none transition-colors focus:border-[#1F1E1B] focus:ring-1 focus:ring-[#1F1E1B]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#7D786F] hover:text-[#1F1E1B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void save()}
                className="rounded-xl bg-[#1F1E1B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4B473F] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
