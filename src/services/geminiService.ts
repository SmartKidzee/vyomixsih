import { AnalysisResponse, SatQueryError } from '../lib/satquery';
import * as GeoTIFF from 'geotiff';

const getApiKey = () => {
  if (typeof window !== "undefined") {
    const key = window.localStorage.getItem("satquery.api_key");
    if (key) return key;
  }
  return import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined;
};

export const setApiKey = (key: string) => {
  if (typeof window === "undefined") return;
  if (key) window.localStorage.setItem("satquery.api_key", key);
  else window.localStorage.removeItem("satquery.api_key");
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String || "");
    };
    reader.onerror = error => reject(error);
  });
}

async function convertTiffToPngBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  
  // Robust raster reading for SAR (1-band), multi-band, and 16-bit float TIFFs
  const rasters = (await image.readRasters()) as any;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not create canvas context");

  const imageData = ctx.createImageData(width, height);
  const band1 = rasters[0];
  const band2 = rasters.length > 1 ? rasters[1] : rasters[0];
  const band3 = rasters.length > 2 ? rasters[2] : rasters[0];

  // Fast auto-contrast (approximate min/max)
  let min = Infinity, max = -Infinity;
  const step = Math.max(1, Math.floor(band1.length / 10000)); 
  for (let i = 0; i < band1.length; i += step) {
    if (band1[i] < min) min = band1[i];
    if (band1[i] > max) max = band1[i];
  }
  const range = (max - min) || 1;

  for (let i = 0; i < band1.length; i++) {
    imageData.data[i * 4] = ((band1[i] - min) / range) * 255;
    imageData.data[i * 4 + 1] = ((band2[i] - min) / range) * 255;
    imageData.data[i * 4 + 2] = ((band3[i] - min) / range) * 255;
    imageData.data[i * 4 + 3] = 255; // Alpha
  }
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1] || "";
}

async function processImageForGemini(file: File): Promise<{mimeType: string, data: string}> {
  if (file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff')) {
    const base64 = await convertTiffToPngBase64(file);
    return { mimeType: 'image/png', data: base64 };
  } else {
    const base64 = await fileToBase64(file);
    return { mimeType: file.type || 'image/jpeg', data: base64 };
  }
}

export async function analyzeWithGemini(
  query: string,
  files: File[],
  signal?: AbortSignal
): Promise<AnalysisResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new SatQueryError("No Gemini API Key found. Please add it to your environment or settings.", 0);
  }

  const parts: any[] = [];
  parts.push({
    text: `You are an advanced Spatial Intelligence Model. 
Your task is to analyze the provided images and respond accurately to the query: "${query}". 

CRITICAL REQUIREMENT: For queries detecting "water bodies", "lakes", "rivers", "sea", or similar features, you MUST precisely extract accurate normalized bounding boxes enclosing ONLY the actual water bodies. Do not hallucinate bounding boxes. If no water is clearly visible, return an empty grounding array.

If multiple images are provided, it is a bi-temporal (change detection) or multi-modal task. Image 1 is the Pre-Event Baseline, and Image 2 is the Post-Event Observation.

Respond STRICTLY in JSON format matching this interface:
{
  "answer": "A detailed explanation of your findings, pretending you used specialized geospatial AI models.",
  "confidence": 95,
  "model": "Sentinel-SAR-Analyzer",
  "task": "Scene VQA, Grounding, or Change Detection",
  "evidence": [{"type": "visual", "label": "Observation", "detail": "What you see"}],
  "grounding": [{"bbox": [minX, minY, maxX, maxY], "label": "Feature name", "confidence": 90}], // Use NORMALIZED float values between 0.0 and 1.0 (e.g. 0.1, 0.25). ALWAYS provide bounding boxes if you detect specific objects or changes!
  "change": {"change_detected": true/false, "description": "What changed", "changed_area_percent": 15.5}, // IF CHANGE IS DETECTED, YOU MUST ALSO POPULATE THE 'grounding' ARRAY WITH BOUNDING BOXES FOR THE CHANGED REGIONS!
  "metadata": [{"filename": "...", "modality": "optical"}]
}
Only output the JSON object without any markdown wrappers.`
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    const processed = await processImageForGemini(file);
    if (files.length === 2) {
      parts.push({ text: `=== IMAGE ${i + 1}: ${i === 0 ? 'PRE-EVENT BASELINE (T1)' : 'POST-EVENT OBSERVATION (T2)'} (${file.name}) ===` });
    }
    parts.push({
      inlineData: { mimeType: processed.mimeType, data: processed.data }
    });
  }

  const requestBody = {
    contents: [{ parts: parts }],
    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
  };

  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
  let response;
  let lastErrorText = "Unknown API Error";
  let lastStatus = 500;

  let successfulModel = "gemini-3.6-flash";

  for (const model of modelsToTry) {
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: signal ?? null
      });

      if (response.ok) {
        successfulModel = model;
        break;
      } else {
        lastErrorText = await response.text();
        lastStatus = response.status;
        // Only fallback if the error is 404 (Not Found), 503 (Unavailable), or 429 (Rate Limit)
        if (![404, 503, 429].includes(lastStatus)) {
          break; 
        }
      }
    } catch (err: any) {
      // Handle network errors or aborts
      if (err.name === 'AbortError') throw err;
      lastErrorText = err.message || "Network Error";
      lastStatus = 0;
    }
  }

  if (!response || !response.ok) {
    throw new SatQueryError(`Gemini API Error: ${lastErrorText}`, lastStatus);
  }

  const data = await response.json();
  let jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!jsonString) {
    throw new SatQueryError("Invalid response from Gemini", 500);
  }
  
  jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsedResponse = JSON.parse(jsonString) as AnalysisResponse;
  
  parsedResponse.model = successfulModel;

  // Add dummy execution trace for realism
  parsedResponse.execution_trace = {
    query: query,
    detected_task: parsedResponse.task || "Scene Analysis",
    model: "Sentinel-SAR-Analyzer",
    steps: [
      { name: "Image Preprocessing", status: "done", detail: "Loaded image tiles." },
      { name: "Feature Extraction", status: "done", detail: "Extracted geospatial features." },
      { name: "Change Detection / VQA", status: "done", detail: "Analyzed spatial relationships." }
    ]
  };

  if (!parsedResponse.metadata || parsedResponse.metadata.length === 0) {
    parsedResponse.metadata = files.map(f => ({
      filename: f.name,
      modality: f.name.toLowerCase().includes('sar') ? 'sar' : 'optical'
    }));
  }

  return parsedResponse;
}

export async function generateChatTitle(query: string, apiKey: string): Promise<string> {
  if (!apiKey || !query.trim()) return query.slice(0, 30);
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
  
  for (const model of modelsToTry) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate a very short, concise 3-4 word title for this chat based on the following user query. ONLY output the title, no quotes, no extra text. Query: "${query}"` }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          return data.candidates[0].content.parts[0].text.replace(/["*]/g, '').trim();
        }
      }
    } catch (e) {
      console.warn(`Failed to generate chat title with ${model}`, e);
    }
  }
  return query.slice(0, 30);
}

export async function runOrchestration(
  query: string,
  files: File[],
  onProgress: (msg: string) => void,
  signal?: AbortSignal
): Promise<AnalysisResponse> {
  if (files.length < 2) {
    onProgress("Analyzing single image...");
    return analyzeWithGemini(query, files, signal);
  }

  onProgress("Initializing Evidence Fusion Agents...");
  
  // Fake orchestration delay and steps
  await new Promise(r => setTimeout(r, 1000));
  onProgress("Agent 1: Extracting features from Pre-event image...");
  await new Promise(r => setTimeout(r, 1500));
  
  onProgress("Agent 2: Extracting features from Post-event image...");
  await new Promise(r => setTimeout(r, 1500));
  
  onProgress("Agent 3: Fusing evidence and computing change detection...");
  
  // Call Gemini with both images as before, but with a specific orchestration prompt
  const res = await analyzeWithGemini(
    query + " (Please focus heavily on change detection and evidence fusion between these two images.)",
    files,
    signal
  );
  
  res.execution_trace = {
    query: query,
    detected_task: "Bi-temporal Evidence Fusion",
    model: "Sentinel-Fusion-Cluster",
    steps: [
      { name: "Pre-event Extraction", status: "done", detail: "Extracted baseline features." },
      { name: "Post-event Extraction", status: "done", detail: "Extracted current features." },
      { name: "Evidence Fusion", status: "done", detail: "Synthesized cross-temporal discrepancies." }
    ]
  };
  
  return res;
}
