import { useEffect, useState } from "react";
import { Radio, RadioTower } from "lucide-react";

export function BackendSettings({ onChange }: { onChange?: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const key = typeof window !== "undefined" ? window.localStorage.getItem("satquery.api_key") : "";
    setValue(key || "");
    setOnline(!!key);
  }, []);

  const save = () => {
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem("satquery.api_key", value);
        setOnline(true);
      } else {
        window.localStorage.removeItem("satquery.api_key");
        setOnline(false);
      }
    }
    onChange?.(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition-all hover:bg-slate-50"
      >
        {online ? (
          <RadioTower className="size-4 text-emerald-600 font-bold" />
        ) : (
          <Radio className="size-4 text-amber-600 font-bold" />
        )}
        <span className="font-mono uppercase tracking-wider">
          {online === null ? "Model Interface Status" : online ? "API Online" : "API Offline"}
        </span>
      </button>

      {open && (
        <div className="panel absolute right-0 z-30 mt-2.5 w-84 p-5 shadow-xl">
          <p className="label-mono">Sentinel-SAR Cloud API Key</p>
          <input
            value={value}
            type="password"
            onChange={(e) => setValue(e.target.value)}
            placeholder="AIzaSy..."
            className="mt-2.5 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm font-medium text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
          />
          <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-600">
            API key required to interact with the Sentinel multi-modal analysis cluster.
          </p>
          <div className="mt-4 flex justify-end gap-2.5">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void save()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-slate-800"
            >
              Save Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
