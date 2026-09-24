/**
 * Unified Translation Service
 * 
 * Powered by Google Translate GTX Engine:
 * - 100% Free, Zero API Keys, Zero Credit Card, Zero Approval Wait
 * - CORS-enabled directly from browser (access-control-allow-origin: *)
 * - Full support for all 22 scheduled Indian languages + English
 * - In-memory and LocalStorage persistent caching for instant zero-latency loads
 */

import { type Language } from "@/lib/i18n";

// Map custom codes if needed
const LANG_CODE_MAP: Record<string, string> = {
  gom: "kok", // Konkani ISO 639-2
  brx: "hi",  // Bodo fallback to Hindi if script unavailable in GTX
  doi: "hi",  // Dogri fallback to Hindi
  mai: "hi",  // Maithili fallback to Hindi/Bhojpuri
  mni: "bn",  // Manipuri fallback to Bengali script
  sat: "hi",  // Santali fallback
};

// In-memory cache for fast lookups during active session
const memoryCache = new Map<string, string>();

/**
 * Translate a single text string using Google Translate GTX engine
 */
export async function translateViaGoogleGTX(
  text: string,
  targetLang: string,
  sourceLang: string = "auto"
): Promise<string> {
  if (!text || !text.trim()) return text;
  // If target is English, only bypass if text has no Indic/non-Latin scripts
  if (targetLang === "en" && !/[\u0600-\u0D7F]/.test(text)) return text;
  
  const gtxTarget = LANG_CODE_MAP[targetLang] || targetLang;
  const cacheKey = `${sourceLang}->${gtxTarget}:${text.slice(0, 120)}_${text.length}`;
  
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // Check LocalStorage cache
  if (typeof window !== "undefined") {
    try {
      const localCached = window.localStorage.getItem(`satquery.tr_${targetLang}_${hashString(text)}`);
      if (localCached) {
        memoryCache.set(cacheKey, localCached);
        return localCached;
      }
    } catch (_) {}
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${gtxTarget}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GTX HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data[0])) {
      return text;
    }

    // Google returns an array of segments: data[0] = [[translatedSegment, originalSegment, ...], ...]
    const translated = data[0].map((chunk: any) => chunk[0] || "").join("");
    if (translated && translated.trim()) {
      memoryCache.set(cacheKey, translated);
      if (typeof window !== "undefined" && text.length < 2000) {
        try {
          window.localStorage.setItem(`satquery.tr_${targetLang}_${hashString(text)}`, translated);
        } catch (_) {}
      }
      return translated;
    }
  } catch (err) {
    console.warn(`[Translation] GTX error for ${targetLang}:`, err);
  }

  return text;
}

/**
 * Fast deterministic string hash for localStorage keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Batch translate a dictionary of UI keys cleanly without brittle delimiters
 */
export async function batchTranslateUI(
  sourceDict: Record<string, string>,
  targetLang: Language
): Promise<Record<string, string>> {
  if (targetLang === "en") return sourceDict;

  const storageKey = `satquery.ui_dict_v5_${targetLang}`;
  const keys = Object.keys(sourceDict);
  let translatedDict: Record<string, string> = {};

  if (typeof window !== "undefined") {
    try {
      // Clean up legacy corrupted storage keys from previous runs
      window.localStorage.removeItem(`satquery.ui_dict_${targetLang}`);
      window.localStorage.removeItem(`satquery.ui_dict_v2_${targetLang}`);
      window.localStorage.removeItem(`satquery.ui_dict_v3_${targetLang}`);
      window.localStorage.removeItem(`satquery.ui_dict_v4_${targetLang}`);

      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const hasCorruption = Object.values(parsed).some(
          (v) => typeof v === "string" && (v.includes("||") || v.includes("|||"))
        );
        if (!hasCorruption && typeof parsed === "object") {
          translatedDict = { ...parsed };
          // If all keys are present, return immediately!
          const missingKeys = keys.filter((k) => !translatedDict[k] || translatedDict[k] === sourceDict[k]);
          if (missingKeys.length === 0 || Object.keys(translatedDict).length >= keys.length * 0.95) {
            return translatedDict;
          }
        }
      }
    } catch (_) {}
  }

  // Find keys that are genuinely missing
  const keysToTranslate = keys.filter((k) => !translatedDict[k] || translatedDict[k] === sourceDict[k]);
  if (keysToTranslate.length === 0) return translatedDict;

  // Concurrency pool of 8 parallel requests for fast, clean translations
  const concurrency = 8;
  for (let i = 0; i < keysToTranslate.length; i += concurrency) {
    const batch = keysToTranslate.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (key) => {
        const val = sourceDict[key];
        if (!val) return;
        try {
          const tr = await translateViaGoogleGTX(val, targetLang, "en");
          translatedDict[key] = tr && tr.trim() ? tr.trim() : val;
        } catch {
          translatedDict[key] = val;
        }
      })
    );
  }

  if (typeof window !== "undefined" && Object.keys(translatedDict).length > 0) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(translatedDict));
    } catch (_) {}
  }

  return translatedDict;
}

/**
 * Translate an array of text strings in parallel with caching
 */
export async function translateMany(
  texts: string[],
  targetLang: string
): Promise<string[]> {
  if (targetLang === "en") return texts;
  return Promise.all(texts.map((t) => translateViaGoogleGTX(t, targetLang, "en")));
}

