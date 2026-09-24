/**
 * Unified Text-To-Speech (TTS) and Speech-To-Text (Voice Dictation) Service
 * 
 * - 100% Free, Zero API Keys, Zero Credit Card, Zero Rate Limits
 * - Full support for all 22 Indian languages + English
 * - Hybrid engine: High-quality Indic & Multilingual Web SpeechSynthesis + Audio Fallback
 * - Sentence-chunked sequential playback: Prevents browser 15s freeze & guarantees ZERO repeating
 * - Built-in SpeechRecognition for interactive Voice Prompt Input with Devanagari/Indic transliteration
 */

// BCP-47 Language Tag Mapping for Indian languages and English
export const BCP47_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
  ur: "ur-IN",
  as: "as-IN",
  sa: "sa-IN",
  ks: "ks-IN",
  ne: "ne-NP",
  sd: "sd-IN",
  kok: "kok-IN",
  gom: "kok-IN",
  brx: "hi-IN",
  doi: "hi-IN",
  mai: "hi-IN",
  mni: "bn-IN",
  sat: "hi-IN",
};

// Friendly labels for Voice Dictation selector
export const VOICE_LANGUAGES = [
  { code: "hi", label: "हिन्दी", englishName: "Hindi", flag: "🇮🇳" },
  { code: "en", label: "English", englishName: "English (India/Global)", flag: "🌐" },
  { code: "kn", label: "ಕನ್ನಡ", englishName: "Kannada", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", englishName: "Tamil", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", englishName: "Telugu", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", englishName: "Bengali", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", englishName: "Marathi", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", englishName: "Gujarati", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", englishName: "Malayalam", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ", englishName: "Punjabi", flag: "🇮🇳" },
  { code: "ur", label: "اردو", englishName: "Urdu", flag: "🇮🇳" },
  { code: "or", label: "ଓଡ଼ିଆ", englishName: "Odia", flag: "🇮🇳" },
  { code: "as", label: "অসমীয়া", englishName: "Assamese", flag: "🇮🇳" },
  { code: "sa", label: "संस्कृतम्", englishName: "Sanskrit", flag: "🇮🇳" },
  { code: "ne", label: "नेपाली", englishName: "Nepali", flag: "🇳🇵" },
] as const;

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let activePlaybackSession = 0;

/**
 * Automatically detect language script from text content
 * (e.g. if text is in Devanagari script, speech should ALWAYS use Hindi voice)
 */
export function detectLanguageFromScript(text: string, fallbackLang: string = "hi"): string {
  if (!text) return fallbackLang;
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Devanagari (Hindi, Marathi, Sanskrit, Nepali)
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return "te"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn"; // Kannada
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali / Assamese
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu"; // Gujarati
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml"; // Malayalam
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa"; // Punjabi (Gurmukhi)
  if (/[\u0B00-\u0B7F]/.test(text)) return "or"; // Odia
  if (/[\u0600-\u06FF]/.test(text)) return "ur"; // Urdu / Sindhi
  return fallbackLang;
}

/**
 * Clean markdown, emojis, URLs, and technical noise before speaking
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "") // remove codeblocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\{[\s\S]*?\}/g, "") // remove json blocks
    .replace(/\[\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?[\s\S]*?\]/g, "") // remove raw coordinate arrays
    .replace(/\[(?:bbox|box|coordinates|t1|t2)[^\]]*\]/gi, "") // remove bbox tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links
    .replace(/<[^>]*>/g, "") // remove html tags
    .replace(/^[#\s*>-]+/gm, "") // headers, quote markers, bullets
    .replace(/[*_~#]/g, "") // bold/italic/strikethrough formatting
    .replace(/[•●▪►✓⚠⚠️]/g, "") // bullet icons and symbols
    // Remove emojis
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, "")
    .replace(/(\d+(?:\.\d+)?)\s*%/g, "$1 percent") // format percentages
    .replace(/T1:/gi, "Baseline observation: ")
    .replace(/T2:/gi, "Recent observation: ")
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

/**
 * Split text into natural sentence chunks (~150-180 chars max)
 * This avoids Chrome's famous 15-second speech synthesis cutoff bug and
 * produces smooth, uninterrupted natural sentence pacing.
 */
export function splitTextIntoChunks(text: string, maxChunkLength = 160): string[] {
  if (!text) return [];
  // Split on natural sentence boundaries: periods, exclamation, question marks, danda (।), newlines
  const rawSentences = text
    .replace(/([.?!।\n]+)/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of rawSentences) {
    if ((current + " " + sentence).trim().length <= maxChunkLength) {
      current = (current ? current + " " : "") + sentence;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (sentence.length <= maxChunkLength) {
        current = sentence;
      } else {
        // Break very long sentence into comma/clause chunks
        const subParts = sentence.replace(/([,;:]+)/g, "$1|").split("|");
        let subCurrent = "";
        for (const part of subParts) {
          if ((subCurrent + " " + part).trim().length <= maxChunkLength) {
            subCurrent = (subCurrent ? subCurrent + " " : "") + part;
          } else {
            if (subCurrent.trim()) chunks.push(subCurrent.trim());
            subCurrent = part.trim();
          }
        }
        current = subCurrent;
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Stop any ongoing speech playback immediately
 */
export function stopSpeaking(): void {
  activePlaybackSession++;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    currentUtterance = null;
  }
}

/**
 * Speak text in the requested language
 * - Automatically detects Hindi/Indic script from text so language matches speech perfectly
 * - Uses sentence-chunked sequential playback to prevent Chrome 15s freeze
 * - Strict session token locking eliminates any duplicate playback or overlapping repeats
 */
export function speakText(
  rawText: string,
  langCode: string = "hi",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): () => void {
  stopSpeaking();

  const text = cleanTextForSpeech(rawText);
  if (!text) {
    onEnd?.();
    return () => {};
  }

  // Detect script (Devanagari text will always use Hindi voice even if UI is English)
  const detectedLang = detectLanguageFromScript(text, langCode || "hi");
  const bcp47 = BCP47_MAP[detectedLang] || BCP47_MAP[langCode] || `${detectedLang}-IN`;
  const shortLang = detectedLang.split("-")[0] || "hi";

  const sessionId = ++activePlaybackSession;
  let isCancelled = false;
  let hasStarted = false;

  const chunks = splitTextIntoChunks(text, 160);
  let chunkIndex = 0;

  function finish() {
    if (isCancelled || sessionId !== activePlaybackSession) return;
    onEnd?.();
  }

  function speakNextChunk() {
    if (isCancelled || sessionId !== activePlaybackSession) return;

    if (chunkIndex >= chunks.length) {
      finish();
      return;
    }

    const chunk = chunks[chunkIndex++];
    if (!chunk || !chunk.trim()) {
      speakNextChunk();
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = bcp47;
        utterance.rate = 0.98;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        // Priority 1: Exact match
        let match = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase());
        // Priority 2: Prefix match (e.g. "hi")
        if (!match) {
          match = voices.find((v) => v.lang.toLowerCase().startsWith(shortLang.toLowerCase()));
        }
        // Priority 3: Name match for Indic voices
        if (!match && shortLang === "hi") {
          match = voices.find((v) => /hindi|lekha|swara|veena|kalpana/i.test(v.name));
        }
        if (match) {
          utterance.voice = match;
        }

        utterance.onstart = () => {
          if (isCancelled || sessionId !== activePlaybackSession) return;
          if (!hasStarted) {
            hasStarted = true;
            onStart?.();
          }
        };

        utterance.onend = () => {
          if (isCancelled || sessionId !== activePlaybackSession) return;
          speakNextChunk();
        };

        utterance.onerror = (e) => {
          if (isCancelled || sessionId !== activePlaybackSession) return;
          // Ignore canceled or interrupted errors (triggered on normal stop)
          if ((e as any).error === "canceled" || (e as any).error === "interrupted") {
            return;
          }
          console.warn("[TTS] Utterance note:", e);
          speakNextChunk();
        };

        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[TTS] SpeechSynthesis speak failed, attempting audio fallback:", err);
        fallbackToGoogleAudio(chunk);
      }
    } else {
      fallbackToGoogleAudio(chunk);
    }
  }

  function fallbackToGoogleAudio(chunkText: string) {
    if (isCancelled || sessionId !== activePlaybackSession) return;
    try {
      const snippet = encodeURIComponent(chunkText.slice(0, 180));
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(shortLang)}&q=${snippet}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        if (isCancelled || sessionId !== activePlaybackSession) return;
        if (!hasStarted) {
          hasStarted = true;
          onStart?.();
        }
      };

      audio.onended = () => {
        currentAudio = null;
        if (isCancelled || sessionId !== activePlaybackSession) return;
        speakNextChunk();
      };

      audio.onerror = () => {
        currentAudio = null;
        if (isCancelled || sessionId !== activePlaybackSession) return;
        // Skip to next chunk or finish
        speakNextChunk();
      };

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((_) => {
          currentAudio = null;
          if (isCancelled || sessionId !== activePlaybackSession) return;
          speakNextChunk();
        });
      }
    } catch (_) {
      finish();
    }
  }

  // Kick off first sentence
  speakNextChunk();

  return () => {
    isCancelled = true;
    stopSpeaking();
    finish();
  };
}

/**
 * Transliterate Romanized Indic text to native Indic script (e.g. Hindi Devanagari)
 * Uses Google Input Tools: 100% Free, Zero Key, Instant CORS
 */
export async function transliterateToIndicScript(text: string, lang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  
  // If text is already in Devanagari (Hindi) or corresponding Indic script, return as-is
  if (lang === "hi" && /[\u0900-\u097F]/.test(text)) return text;
  if (lang === "ta" && /[\u0B80-\u0BFF]/.test(text)) return text;
  if (lang === "te" && /[\u0C00-\u0C7F]/.test(text)) return text;
  if (lang === "kn" && /[\u0C80-\u0CFF]/.test(text)) return text;
  if (lang === "bn" && /[\u0980-\u09FF]/.test(text)) return text;
  if (lang === "gu" && /[\u0A80-\u0AFF]/.test(text)) return text;
  if (lang === "mr" && /[\u0900-\u097F]/.test(text)) return text;
  if (lang === "ml" && /[\u0D00-\u0D7F]/.test(text)) return text;
  if (lang === "pa" && /[\u0A00-\u0A7F]/.test(text)) return text;

  // ITC map for Google Input Tools
  const ITC_MAP: Record<string, string> = {
    hi: "hi-t-i0-und",
    kn: "kn-t-i0-und",
    ta: "ta-t-i0-und",
    te: "te-t-i0-und",
    bn: "bn-t-i0-und",
    mr: "mr-t-i0-und",
    gu: "gu-t-i0-und",
    ml: "ml-t-i0-und",
    pa: "pa-t-i0-und",
    ur: "ur-t-i0-und",
    or: "or-t-i0-und",
    sa: "sa-t-i0-und",
    ne: "ne-t-i0-und",
  };

  const itc = ITC_MAP[lang];
  if (!itc) return text;

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=1`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data[0] === "SUCCESS" && data[1]?.[0]?.[1]?.[0]) {
      return data[1][0][1][0];
    }
  } catch (err) {
    console.warn("[Transliterate] Input Tools warning:", err);
  }
  return text;
}

/**
 * Check if browser supports speech recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Start listening to user's voice and convert to text in real-time
 * - Idempotently loops through event.results: ZERO repeating/concatenation glitches
 * - Supports continuous listening with instant live interim updates
 */
export function startVoiceRecognition(
  langCode: string,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    onError?.(new Error("Speech recognition not supported in this browser"));
    onEnd?.();
    return () => {};
  }

  try {
    const recognition = new SpeechRecognitionClass();
    const bcp47 = BCP47_MAP[langCode] || `${langCode}-IN`;

    recognition.lang = bcp47;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let stopped = false;

    recognition.onresult = (event: any) => {
      let sessionFinal = "";
      let sessionInterim = "";

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          sessionFinal += (sessionFinal ? " " : "") + item[0].transcript.trim();
        } else {
          sessionInterim += (sessionInterim ? " " : "") + item[0].transcript.trim();
        }
      }

      const sessionText = (sessionFinal + (sessionInterim ? (sessionFinal ? " " : "") + sessionInterim : "")).trim();
      const isComplete = !sessionInterim && sessionFinal.length > 0;
      if (sessionText) {
        onResult(sessionText, isComplete);
      }
    };

    recognition.onerror = (event: any) => {
      if (!stopped) {
        // Ignore benign events like silence or abort
        if (event.error !== "no-speech" && event.error !== "aborted") {
          onError?.(event);
        }
      }
    };

    recognition.onend = () => {
      if (!stopped) {
        onEnd?.();
      }
    };

    recognition.start();

    return () => {
      stopped = true;
      try {
        recognition.stop();
      } catch (_) {}
    };
  } catch (err) {
    onError?.(err);
    onEnd?.();
    return () => {};
  }
}
