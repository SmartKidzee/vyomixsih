import { useEffect, useId, useRef, useState } from "react";
import { History, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { parseCoordinates, searchPlaces, type GeocodingResult } from "@/services/geocoding";

interface LocationSearchProps {
  onSelect: (location: GeocodingResult) => void;
  className?: string;
}

const coordinateInputPattern = /^\(?\s*-?\d+(?:\.\d+)?\s*(?:,|\s)\s*-?\d+(?:\.\d+)?\s*\)?$/;
const recentSearchesStorageKey = "vyomix.recent-location-searches";

function loadRecentSearches(): GeocodingResult[] {
  try {
    const stored = window.localStorage.getItem(recentSearchesStorageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is GeocodingResult =>
      item !== null &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude)
    ).slice(0, 4);
  } catch {
    return [];
  }
}

export function LocationSearch({ onSelect, className = "" }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>(loadRecentSearches);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedQueryRef = useRef<string | null>(null);
  const listId = useId();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (selectedQueryRef.current === query) {
      selectedQueryRef.current = null;
      return;
    }
    selectedQueryRef.current = null;

    const trimmed = query.trim();
    setActiveIndex(-1);
    setError(null);
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setResults([]);

    if (coordinateInputPattern.test(trimmed)) {
      setLoading(false);
      const coordinates = parseCoordinates(trimmed);
      if (!coordinates) {
        setResults([]);
        setError("Enter a latitude from -90 to 90 and longitude from -180 to 180.");
      } else {
        setResults([{
          id: "coordinates",
          name: `Coordinates · ${coordinates.latitude}, ${coordinates.longitude}`,
          ...coordinates,
        }]);
      }
      setOpen(true);
      return;
    }

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setOpen(true);
    const timer = window.setTimeout(() => {
      void searchPlaces(trimmed, controller.signal)
        .then((places) => {
          if (controller.signal.aborted) return;
          setResults(places);
          setActiveIndex(places.length > 0 ? 0 : -1);
          setError(null);
        })
        .catch((reason: unknown) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setError(reason instanceof Error ? reason.message : "Unable to search locations right now.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const selectLocation = (location: GeocodingResult) => {
    const updatedRecentSearches = [
      location,
      ...recentSearches.filter((recent) => recent.latitude !== location.latitude || recent.longitude !== location.longitude),
    ].slice(0, 4);
    setRecentSearches(updatedRecentSearches);
    try {
      window.localStorage.setItem(recentSearchesStorageKey, JSON.stringify(updatedRecentSearches));
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
    selectedQueryRef.current = location.name;
    setQuery(location.name);
    setOpen(false);
    setResults([]);
    setError(null);
    onSelect(location);
  };

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      const recent = recentSearches[activeIndex] ?? recentSearches[0];
      if (recent) selectLocation(recent);
      return;
    }

    const coordinates = parseCoordinates(trimmed);
    if (coordinates) {
      selectLocation({
        id: "coordinates",
        name: `Coordinates · ${coordinates.latitude}, ${coordinates.longitude}`,
        ...coordinates,
      });
      return;
    }
    if (coordinateInputPattern.test(trimmed)) {
      setError("Enter a latitude from -90 to 90 and longitude from -180 to 180.");
      setOpen(true);
      return;
    }
    const place = results[activeIndex] ?? results[0];
    if (place) selectLocation(place);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const visibleResults = query.trim() ? results : recentSearches;
    if (event.key === "ArrowDown" && visibleResults.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % visibleResults.length);
    } else if (event.key === "ArrowUp" && visibleResults.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => current <= 0 ? visibleResults.length - 1 : current - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const visibleResults = query.trim() ? results : recentSearches;
  const showingRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div ref={rootRef} className={`w-full min-w-0 ${className}`}>
      <div className="relative flex h-12 items-center rounded-2xl border border-white/15 bg-[#0c1428]/95 px-3.5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-colors focus-within:border-cyan-400/50">
        <Search aria-hidden="true" className="size-4 shrink-0 text-cyan-300" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => { if (query.trim() || recentSearches.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search places or coordinates"
          autoComplete="off"
          role="combobox"
          aria-label="Search places or coordinates"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-400"
        />
        {loading ? (
          <LoaderCircle aria-label="Searching locations" className="size-4 shrink-0 animate-spin text-cyan-300" />
        ) : query ? (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setError(null); setOpen(recentSearches.length > 0); inputRef.current?.focus(); }}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Clear location search"
          >
            <X className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={submitSearch}
          disabled={!query.trim() || loading}
          className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:cursor-default disabled:opacity-40"
          aria-label="Go to searched location"
        >
          <Search className="size-3.5" />
        </button>
      </div>

      {open && (loading || visibleResults.length > 0 || error) && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#0c1428]/95 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
          <ul id={listId} role="listbox" aria-label="Location suggestions" className="max-h-64 overflow-y-auto p-1.5">
            {showingRecentSearches && (
              <li className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <History className="size-3" /> Recent searches
              </li>
            )}
            {visibleResults.map((place, index) => (
              <li key={place.id} role="option" aria-selected={index === activeIndex} id={`${listId}-${index}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectLocation(place)}
                  className={`flex min-h-12 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    index === activeIndex ? "bg-cyan-500/15 text-white" : "text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {showingRecentSearches
                    ? <History className="size-4 shrink-0 text-slate-400" />
                    : <MapPin className="size-4 shrink-0 text-cyan-300" />}
                  <span className="truncate text-sm">{place.name}</span>
                </button>
              </li>
            ))}
            {loading && results.length === 0 && (
              <li className="flex min-h-12 items-center gap-3 px-3 text-sm text-slate-400">
                <LoaderCircle className="size-4 animate-spin text-cyan-300" /> Searching locations…
              </li>
            )}
            {!loading && !error && query.trim() && results.length === 0 && (
              <li className="px-3 py-3 text-sm text-slate-400">No locations found. Try a different search.</li>
            )}
            {error && <li role="status" className="px-3 py-3 text-xs leading-relaxed text-amber-200/90">{error}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
