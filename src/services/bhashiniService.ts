/**
 * Bhashini Translation Service
 * 
 * Government of India's official NLP API (FREE) for GIGW-compliant
 * multilingual support across all 22 scheduled Indian languages.
 * 
 * Flow:
 *   1. Call ULCA pipeline config to get translation service URL + model
 *   2. Call the actual translation service with text
 * 
 * Credentials needed:
 *   - userID   (from bhashini.gov.in/ulca → My Profile)
 *   - apiKey   (ulcaApiKey from the same page)
 */

// All 22 scheduled Indian language codes (ISO 639-1 / BCP 47)
export const BHASHINI_LANGUAGES = [
  "as",   // Assamese
  "bn",   // Bengali
  "brx",  // Bodo
  "doi",  // Dogri
  "gom",  // Konkani (Goan)
  "gu",   // Gujarati
  "hi",   // Hindi
  "kn",   // Kannada
  "ks",   // Kashmiri
  "mai",  // Maithili
  "ml",   // Malayalam
  "mni",  // Manipuri (Meitei)
  "mr",   // Marathi
  "ne",   // Nepali
  "or",   // Odia
  "pa",   // Punjabi
  "sa",   // Sanskrit
  "sat",  // Santali
  "sd",   // Sindhi
  "ta",   // Tamil
  "te",   // Telugu
  "ur",   // Urdu
] as const;

export type BhashiniLanguageCode = typeof BHASHINI_LANGUAGES[number];

const PIPELINE_CONFIG_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline";
const STORAGE_USERID_KEY = "satquery.bhashini_userid";
const STORAGE_APIKEY_KEY = "satquery.bhashini_apikey";

// ── Credential Management ──────────────────────────────────────────

export function getBhashiniConfig(): { userID: string; apiKey: string } | null {
  if (typeof window === "undefined") return null;
  const userID = window.localStorage.getItem(STORAGE_USERID_KEY)?.trim();
  const apiKey = window.localStorage.getItem(STORAGE_APIKEY_KEY)?.trim();
  if (userID && apiKey) return { userID, apiKey };
  return null;
}

export function setBhashiniConfig(userID: string, apiKey: string): void {
  if (typeof window === "undefined") return;
  if (userID.trim()) {
    window.localStorage.setItem(STORAGE_USERID_KEY, userID.trim());
  } else {
    window.localStorage.removeItem(STORAGE_USERID_KEY);
  }
  if (apiKey.trim()) {
    window.localStorage.setItem(STORAGE_APIKEY_KEY, apiKey.trim());
  } else {
    window.localStorage.removeItem(STORAGE_APIKEY_KEY);
  }
}

// ── Pipeline Config ────────────────────────────────────────────────

interface PipelineResponse {
  pipelineResponseConfig: Array<{
    taskType: string;
    config: Array<{
      serviceId: string;
      modelId: string;
      language: { sourceLanguage: string; targetLanguage: string };
    }>;
  }>;
  pipelineInferenceAPIEndPoint: {
    callbackUrl: string;
    inferenceApiKey: {
      name: string;
      value: string;
    };
  };
}

async function getPipelineConfig(
  sourceLang: string,
  targetLang: string,
  userID: string,
  apiKey: string
): Promise<{
  serviceUrl: string;
  inferenceApiKey: { name: string; value: string };
  serviceId: string;
}> {
  const body = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          },
        },
      },
    ],
    pipelineRequestConfig: {
      pipelineId: "64392f96daac500b55c543cd",
    },
  };

  const res = await fetch(PIPELINE_CONFIG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "userID": userID,
      "ulcaApiKey": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Bhashini pipeline config failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as PipelineResponse;

  const translationConfig = data.pipelineResponseConfig?.find(
    (c) => c.taskType === "translation"
  );
  if (!translationConfig?.config?.[0]) {
    throw new Error("No translation model found for this language pair");
  }

  return {
    serviceUrl: data.pipelineInferenceAPIEndPoint.callbackUrl,
    inferenceApiKey: data.pipelineInferenceAPIEndPoint.inferenceApiKey,
    serviceId: translationConfig.config[0].serviceId,
  };
}

// ── Translation ────────────────────────────────────────────────────

interface TranslationResponse {
  pipelineResponse: Array<{
    taskType: string;
    output: Array<{
      source: string;
      target: string;
    }>;
  }>;
}

// Simple in-memory cache for pipeline configs (they don't change often)
const pipelineCache = new Map<string, {
  serviceUrl: string;
  inferenceApiKey: { name: string; value: string };
  serviceId: string;
  expiry: number;
}>();

/**
 * Translate text using Bhashini ULCA pipeline.
 * 
 * @param text       The text to translate
 * @param sourceLang Source language code (e.g., "en")
 * @param targetLang Target language code (e.g., "hi", "ta", "bn", etc.)
 * @returns          Translated text, or throws on failure
 */
export async function translateWithBhashini(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text?.trim()) return text;
  if (sourceLang === targetLang) return text;

  const config = getBhashiniConfig();
  if (!config) {
    throw new Error("Bhashini credentials not configured");
  }

  // Check pipeline config cache
  const cacheKey = `${sourceLang}-${targetLang}`;
  let pipeline = pipelineCache.get(cacheKey);
  
  if (!pipeline || Date.now() > pipeline.expiry) {
    const freshPipeline = await getPipelineConfig(
      sourceLang,
      targetLang,
      config.userID,
      config.apiKey
    );
    pipeline = { ...freshPipeline, expiry: Date.now() + 30 * 60 * 1000 }; // Cache for 30 min
    pipelineCache.set(cacheKey, pipeline);
  }

  // Call the actual translation service
  const translationBody = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          },
          serviceId: pipeline.serviceId,
        },
      },
    ],
    inputData: {
      input: [{ source: text }],
    },
  };

  const res = await fetch(pipeline.serviceUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [pipeline.inferenceApiKey.name]: pipeline.inferenceApiKey.value,
    },
    body: JSON.stringify(translationBody),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Bhashini translation failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as TranslationResponse;
  
  const output = data.pipelineResponse?.find(
    (r) => r.taskType === "translation"
  )?.output?.[0]?.target;

  if (!output) {
    throw new Error("Empty translation response from Bhashini");
  }

  return output;
}

/**
 * Check if Bhashini credentials are configured and valid-looking.
 */
export function isBhashiniConfigured(): boolean {
  const config = getBhashiniConfig();
  return !!(config?.userID && config?.apiKey);
}

/**
 * Check if a language code is supported by Bhashini.
 */
export function isBhashiniLanguage(langCode: string): boolean {
  return (BHASHINI_LANGUAGES as readonly string[]).includes(langCode);
}
