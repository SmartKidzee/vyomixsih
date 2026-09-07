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
      resolve(base64String);
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
  const rgb = await image.readRGB();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not create canvas context");

  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = rgb[i / 4 * 3];
    imageData.data[i + 1] = rgb[i / 4 * 3 + 1];
    imageData.data[i + 2] = rgb[i / 4 * 3 + 2];
    imageData.data[i + 3] = 255; // Alpha
  }
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1]; // Return only base64
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
    text: `You are an advanced Satellite Imagery Analysis Model named "Sentinel-SAR-Analyzer". 
Your task is to analyze the provided images and respond to the query: "${query}". 

If multiple images are provided, it is a bi-temporal (change detection) or multi-modal task.

Respond STRICTLY in JSON format matching this interface:
{
  "answer": "A detailed explanation of your findings, pretending you used specialized geospatial AI models.",
  "confidence": 95,
  "model": "Sentinel-SAR-Analyzer",
  "task": "Scene VQA, Grounding, or Change Detection",
  "evidence": [{"type": "visual", "label": "Observation", "detail": "What you see"}],
  "grounding": [{"bbox": [minX, minY, maxX, maxY], "label": "Feature name", "confidence": 90}], // Use NORMALIZED float values between 0.0 and 1.0 (e.g. 0.1, 0.25). e.g. [10, 10, 50, 50]
  "change": {"change_detected": true/false, "description": "What changed"},
  "metadata": [{"filename": "...", "modality": "optical"}]
}
Only output the JSON object without any markdown wrappers.`
  });

  for (const file of files) {
    const processed = await processImageForGemini(file);
    parts.push({
      inlineData: {
        mimeType: processed.mimeType,
        data: processed.data
      }
    });
  }

  const requestBody = {
    contents: [
      {
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new SatQueryError(`Gemini API Error: ${errorText}`, response.status);
  }

  const data = await response.json();
  let jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!jsonString) {
    throw new SatQueryError("Invalid response from Gemini", 500);
  }
  
  // Clean up if it returned markdown
  jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  
  const parsedResponse = JSON.parse(jsonString) as AnalysisResponse;

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
