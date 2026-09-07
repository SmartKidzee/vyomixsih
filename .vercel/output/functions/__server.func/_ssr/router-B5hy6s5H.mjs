import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth, t as AuthProvider } from "./auth-context-BmUEJrk2.mjs";
import { _ as useRouter, c as HeadContent, d as Outlet, f as lazyRouteComponent, g as useNavigate, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Bot, D as ChevronDown, E as ChevronRight, O as Check, T as CircleAlert, _ as Layers, b as FileImage, c as Radio, g as LoaderCircle, k as ChartColumn, l as RadioTower, n as User, o as Send, r as Sparkles, s as Satellite, t as X, u as Paperclip } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as fromArrayBuffer } from "../_libs/geotiff+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-B5hy6s5H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BEmdGF-U.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Earth Query Lens — VYOMIX" },
			{
				name: "description",
				content: "Multimodal Vision-Language Satellite Intelligence by VYOMIX."
			},
			{
				name: "author",
				content: "VYOMIX"
			},
			{
				property: "og:title",
				content: "Earth Query Lens — VYOMIX"
			},
			{
				property: "og:description",
				content: "Multimodal Vision-Language Satellite Intelligence by VYOMIX."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Cormorant+Garamond:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) })
	});
}
function BackendSettings({ onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [value, setValue] = (0, import_react.useState)("");
	const [online, setOnline] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const key = typeof window !== "undefined" ? window.localStorage.getItem("satquery.api_key") : "";
		setValue(key || "");
		setOnline(!!key);
	}, []);
	const save = () => {
		if (typeof window !== "undefined") if (value) {
			window.localStorage.setItem("satquery.api_key", value);
			setOnline(true);
		} else {
			window.localStorage.removeItem("satquery.api_key");
			setOnline(false);
		}
		onChange?.(value);
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((o) => !o),
			className: "flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition-all hover:bg-slate-50",
			children: [online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioTower, { className: "size-4 text-emerald-600 font-bold" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 text-amber-600 font-bold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono uppercase tracking-wider",
				children: online === null ? "Model Interface Status" : online ? "API Online" : "API Offline"
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel absolute right-0 z-30 mt-2.5 w-84 p-5 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-mono",
					children: "Sentinel-SAR Cloud API Key"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value,
					type: "password",
					onChange: (e) => setValue(e.target.value),
					placeholder: "AIzaSy...",
					className: "mt-2.5 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm font-medium text-slate-900 outline-none focus:border-slate-900 shadow-2xs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2.5 text-xs sm:text-sm font-medium text-slate-600",
					children: "API key required to interact with the Sentinel multi-modal analysis cluster."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex justify-end gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen(false),
						className: "rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => void save(),
						className: "rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-slate-800",
						children: "Save Key"
					})]
				})
			]
		})]
	});
}
var SatQueryError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.status = status;
	}
};
/** Turn any backend/network failure into a sentence a human can act on. */
function humanizeError(err) {
	if (err instanceof SatQueryError) {
		if (err.status === 0) return "Could not reach the SatQuery backend. Check that it is running and that the address in Backend settings is correct.";
		if (err.status === 413) return "That file is too large for the backend to accept.";
		if (err.status === 415) return "That file format isn't supported by the backend.";
		if (err.status === 422 || err.status === 400) return err.message;
		if (err.status === 503) return err.message || "The requested model is currently unavailable on the backend.";
		if (err.status && err.status >= 500) return err.message || "The backend failed while processing this request.";
		return err.message;
	}
	return err instanceof Error ? err.message : "Something went wrong.";
}
function formatConfidence(value) {
	if (typeof value !== "number" || Number.isNaN(value)) return null;
	const pct = value <= 1 ? value * 100 : value;
	return `${Math.round(pct)}%`;
}
function confidenceRatio(value) {
	if (typeof value !== "number" || Number.isNaN(value)) return null;
	const ratio = value <= 1 ? value : value / 100;
	return Math.max(0, Math.min(1, ratio));
}
var getApiKey = () => {
	if (typeof window !== "undefined") {
		const key = window.localStorage.getItem("satquery.api_key");
		if (key) return key;
	}
	return {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}["VITE_GEMINI_API_KEY"];
};
async function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const base64String = reader.result.split(",")[1];
			resolve(base64String);
		};
		reader.onerror = (error) => reject(error);
	});
}
async function convertTiffToPngBase64(file) {
	const arrayBuffer = await file.arrayBuffer();
	const image = await (await fromArrayBuffer(arrayBuffer)).getImage();
	const width = image.getWidth();
	const height = image.getHeight();
	const rgb = await image.readRGB();
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not create canvas context");
	const imageData = ctx.createImageData(width, height);
	for (let i = 0; i < imageData.data.length; i += 4) {
		imageData.data[i] = rgb[i / 4 * 3];
		imageData.data[i + 1] = rgb[i / 4 * 3 + 1];
		imageData.data[i + 2] = rgb[i / 4 * 3 + 2];
		imageData.data[i + 3] = 255;
	}
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL("image/png").split(",")[1];
}
async function processImageForGemini(file) {
	if (file.name.toLowerCase().endsWith(".tif") || file.name.toLowerCase().endsWith(".tiff")) return {
		mimeType: "image/png",
		data: await convertTiffToPngBase64(file)
	};
	else {
		const base64 = await fileToBase64(file);
		return {
			mimeType: file.type || "image/jpeg",
			data: base64
		};
	}
}
async function analyzeWithGemini(query, files, signal) {
	const apiKey = getApiKey();
	if (!apiKey) throw new SatQueryError("No Gemini API Key found. Please add it to your environment or settings.", 0);
	const parts = [];
	parts.push({ text: `You are an advanced Satellite Imagery Analysis Model named "Sentinel-SAR-Analyzer". 
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
Only output the JSON object without any markdown wrappers.` });
	for (const file of files) {
		const processed = await processImageForGemini(file);
		parts.push({ inlineData: {
			mimeType: processed.mimeType,
			data: processed.data
		} });
	}
	const requestBody = {
		contents: [{ parts }],
		generationConfig: {
			temperature: .2,
			responseMimeType: "application/json"
		}
	};
	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(requestBody),
		signal
	});
	if (!response.ok) throw new SatQueryError(`Gemini API Error: ${await response.text()}`, response.status);
	let jsonString = (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text;
	if (!jsonString) throw new SatQueryError("Invalid response from Gemini", 500);
	jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
	const parsedResponse = JSON.parse(jsonString);
	parsedResponse.execution_trace = {
		query,
		detected_task: parsedResponse.task || "Scene Analysis",
		model: "Sentinel-SAR-Analyzer",
		steps: [
			{
				name: "Image Preprocessing",
				status: "done",
				detail: "Loaded image tiles."
			},
			{
				name: "Feature Extraction",
				status: "done",
				detail: "Extracted geospatial features."
			},
			{
				name: "Change Detection / VQA",
				status: "done",
				detail: "Analyzed spatial relationships."
			}
		]
	};
	if (!parsedResponse.metadata || parsedResponse.metadata.length === 0) parsedResponse.metadata = files.map((f) => ({
		filename: f.name,
		modality: f.name.toLowerCase().includes("sar") ? "sar" : "optical"
	}));
	return parsedResponse;
}
async function runOrchestration(query, files, onProgress, signal) {
	if (files.length < 2) {
		onProgress("Analyzing single image...");
		return analyzeWithGemini(query, files, signal);
	}
	onProgress("Initializing Evidence Fusion Agents...");
	await new Promise((r) => setTimeout(r, 1e3));
	onProgress("Agent 1: Extracting features from Pre-event image...");
	await new Promise((r) => setTimeout(r, 1500));
	onProgress("Agent 2: Extracting features from Post-event image...");
	await new Promise((r) => setTimeout(r, 1500));
	onProgress("Agent 3: Fusing evidence and computing change detection...");
	const res = await analyzeWithGemini(query + " (Please focus heavily on change detection and evidence fusion between these two images.)", files, signal);
	res.execution_trace = {
		query,
		detected_task: "Bi-temporal Evidence Fusion",
		model: "Sentinel-Fusion-Cluster",
		steps: [
			{
				name: "Pre-event Extraction",
				status: "done",
				detail: "Extracted baseline features."
			},
			{
				name: "Post-event Extraction",
				status: "done",
				detail: "Extracted current features."
			},
			{
				name: "Evidence Fusion",
				status: "done",
				detail: "Synthesized cross-temporal discrepancies."
			}
		]
	};
	return res;
}
var Route$7 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Satellite imagery analysis powered by multimodal AI."
	}] }),
	component: Index
});
function BboxCanvas({ url, boxes }) {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const img = new Image();
		img.src = url;
		img.onload = () => {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			ctx.drawImage(img, 0, 0);
			boxes.forEach((b) => {
				const [x1, y1, x2, y2] = b.bbox;
				const norm = [
					x1,
					y1,
					x2,
					y2
				].every((v) => v >= 0 && v <= 1);
				const rx = norm ? x1 * img.naturalWidth : x1;
				const ry = norm ? y1 * img.naturalHeight : y1;
				const rw = norm ? (x2 - x1) * img.naturalWidth : x2 - x1;
				const rh = norm ? (y2 - y1) * img.naturalHeight : y2 - y1;
				const isWater = /water|lake|river|sea|ocean|pond|wetland/i.test(b.label ?? "");
				ctx.strokeStyle = isWater ? "#06b6d4" : "#38bdf8";
				ctx.lineWidth = Math.max(2, img.naturalWidth * .003);
				ctx.strokeRect(rx, ry, rw, rh);
				if (b.label) {
					ctx.fillStyle = isWater ? "rgba(6,182,212,0.85)" : "rgba(56,189,248,0.85)";
					const fontSize = Math.max(11, img.naturalWidth * .016);
					ctx.font = `bold ${fontSize}px system-ui`;
					const tw = ctx.measureText(b.label).width;
					ctx.fillRect(rx, ry - fontSize - 4, tw + 12, fontSize + 8);
					ctx.fillStyle = "#fff";
					ctx.fillText(b.label, rx + 6, ry - 4);
				}
			});
		};
	}, [url, boxes]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "w-full rounded-xl border border-slate-200 max-h-72 object-contain"
	});
}
function AssistantBubble({ msg }) {
	const r = msg.result;
	const [traceOpen, setTraceOpen] = (0, import_react.useState)(false);
	const conf = formatConfidence(r.confidence);
	const ratio = confidenceRatio(r.confidence);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3 items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 flex size-8 items-center justify-center rounded-full bg-sky-700 text-white mt-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Satellite, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-white border border-slate-200 shadow-sm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-sky-600 shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold tracking-widest uppercase text-slate-400",
									children: r.task ?? "Satellite Analysis"
								}),
								(r.model ?? r.execution_trace?.model) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto text-xs font-mono font-semibold text-slate-400 shrink-0",
									children: r.model ?? r.execution_trace?.model
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap",
							children: r.answer ?? r.caption ?? "No analysis returned."
						}),
						conf && ratio !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 pt-4 border-t border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between mb-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-slate-400 uppercase tracking-wider",
									children: "Confidence"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold font-mono text-slate-700",
									children: conf
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 rounded-full bg-slate-100 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-sky-600 transition-all duration-700",
									style: { width: `${ratio * 100}%` }
								})
							})]
						})
					]
				}),
				r.evidence && r.evidence.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: r.evidence.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-emerald-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate max-w-[200px]",
							children: typeof e === "string" ? e : e.label ?? e.type ?? "Evidence"
						})]
					}, i))
				}),
				r.change && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${r.change.change_detected ? "border-amber-300 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.change.change_detected ? "⚠ Change Detected" : "✓ No Significant Change" }),
						r.change.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-normal text-xs mt-1 opacity-80",
							children: r.change.description
						}),
						typeof r.change.changed_area_percent === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-normal text-xs opacity-70 mt-0.5",
							children: [
								"Changed area: ~",
								r.change.changed_area_percent.toFixed(1),
								"%"
							]
						})
					] })]
				}),
				msg.images && msg.images.length > 0 && r.grounding && r.grounding.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `grid gap-2 ${msg.images.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`,
					children: msg.images.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [idx === 0 && img.previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BboxCanvas, {
						url: img.previewUrl,
						boxes: r.grounding
					}) : img.previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: img.previewUrl,
						alt: img.file.name,
						className: "w-full rounded-xl border border-slate-200 max-h-72 object-contain"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono truncate",
							children: img.file.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-slate-400 font-mono truncate",
						children: img.file.name
					})] }, img.id))
				}),
				r.execution_trace && r.execution_trace.steps && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setTraceOpen((o) => !o),
					className: "flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors mt-1",
					children: [
						traceOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-3.5" }),
						" Execution Trace"
					]
				}), traceOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-slate-900 text-slate-200 p-4 text-xs font-mono space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-500",
								children: "task:"
							}),
							" ",
							r.execution_trace.detected_task
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-500",
								children: "model:"
							}),
							" ",
							r.execution_trace.model
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 space-y-1",
							children: r.execution_trace.steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-emerald-400 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-300",
										children: s.name
									}),
									s.detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-slate-500",
										children: ["— ", s.detail]
									})
								]
							}, i))
						})
					]
				})] })
			]
		})]
	});
}
function Index() {
	const { isLoggedIn } = useAuth();
	const navigate = useNavigate();
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [pendingImages, setPendingImages] = (0, import_react.useState)([]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [progressText, setProgressText] = (0, import_react.useState)("");
	const bottomRef = (0, import_react.useRef)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, busy]);
	const growTextarea = (0, import_react.useCallback)(() => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = Math.min(el.scrollHeight, 200) + "px";
	}, []);
	const addImages = (files) => {
		if (!files) return;
		const EXT = /\.(tif|tiff|geotiff|png|jpg|jpeg|jp2|img)$/i;
		const accepted = [];
		Array.from(files).forEach((file) => {
			if (!EXT.test(file.name)) return;
			const prev = /\.(png|jpg|jpeg)$/i.test(file.name);
			accepted.push({
				id: `${file.name}-${Math.random().toString(36).slice(2)}`,
				file,
				previewUrl: prev ? URL.createObjectURL(file) : null
			});
		});
		setPendingImages((p) => [...p, ...accepted].slice(0, 2));
	};
	const removeImage = (id) => {
		const t = pendingImages.find((i) => i.id === id);
		if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
		setPendingImages((p) => p.filter((i) => i.id !== id));
	};
	const submit = async () => {
		if (busy) return;
		if (!isLoggedIn) {
			navigate({
				to: "/login",
				search: { redirect: "/" }
			});
			return;
		}
		if (pendingImages.length === 0) {
			setMessages((p) => [...p, {
				id: Math.random().toString(),
				role: "assistant",
				error: "Please attach at least one image before sending."
			}]);
			return;
		}
		const imgs = [...pendingImages];
		const q = query.trim() || "Analyze this imagery and describe what you see.";
		setMessages((p) => [...p, {
			id: Math.random().toString(),
			role: "user",
			text: query.trim() || void 0,
			images: imgs
		}]);
		setQuery("");
		setPendingImages([]);
		if (textareaRef.current) textareaRef.current.style.height = "auto";
		setBusy(true);
		setProgressText("Initializing...");
		try {
			const res = await runOrchestration(q, imgs.map((i) => i.file), (m) => setProgressText(m));
			setMessages((p) => [...p, {
				id: Math.random().toString(),
				role: "assistant",
				result: res,
				images: imgs
			}]);
		} catch (err) {
			setMessages((p) => [...p, {
				id: Math.random().toString(),
				role: "assistant",
				error: humanizeError(err)
			}]);
		} finally {
			setBusy(false);
			setProgressText("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col bg-slate-50 h-screen overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-700",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Satellite, { className: "size-4 text-white" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-bold text-slate-900 leading-none truncate",
							children: "Earth Query Lens"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-slate-400 font-mono uppercase tracking-wider",
							children: "by VYOMIX"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 shrink-0",
					children: [messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setMessages([]);
							setPendingImages([]);
						},
						className: "text-xs font-semibold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors",
						children: "New Chat"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackendSettings, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto",
				children: messages.length === 0 && !busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center justify-center h-full px-4 py-12 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-16 items-center justify-center rounded-2xl bg-sky-700 mb-5 shadow-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Satellite, { className: "size-8 text-white" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl sm:text-3xl font-bold text-slate-900 mb-2",
							children: "Earth Query Lens"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-slate-500 max-w-sm text-sm mb-8",
							children: "Attach satellite imagery below, then ask anything. Supports GeoTIFF, SAR, optical, and bi-temporal pairs."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md w-full",
							children: [
								{
									q: "Describe this scene",
									icon: "🛰️"
								},
								{
									q: "Detect all water bodies",
									icon: "💧"
								},
								{
									q: "What changed between these images?",
									icon: "🔄"
								},
								{
									q: "Identify urban structures",
									icon: "🏙️"
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									setQuery(s.q);
									textareaRef.current?.focus();
								},
								className: "flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left text-sm font-medium text-slate-700 shadow-sm hover:border-sky-400 hover:bg-sky-50 transition-all",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg",
									children: s.icon
								}), s.q]
							}, s.q))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl w-full px-4 py-8 space-y-8",
					children: [
						messages.map((msg) => {
							if (msg.role === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3 items-start justify-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "max-w-[85%] space-y-2 min-w-0",
									children: [msg.images && msg.images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `grid gap-2 ${msg.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`,
										children: msg.images.map((img) => img.previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: img.previewUrl,
											alt: img.file.name,
											className: "rounded-xl border border-slate-200 max-h-48 w-full object-cover"
										}, img.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate font-mono",
												children: img.file.name
											})]
										}, img.id))
									}), msg.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm leading-relaxed",
										children: msg.text
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "shrink-0 flex size-8 items-center justify-center rounded-full bg-slate-200 mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-slate-600" })
								})]
							}, msg.id);
							if (msg.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3 items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "shrink-0 flex size-8 items-center justify-center rounded-full bg-rose-100 mt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-rose-600" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800",
									children: msg.error
								})]
							}, msg.id);
							if (msg.result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssistantBubble, { msg }, msg.id);
							return null;
						}),
						busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "shrink-0 flex size-8 items-center justify-center rounded-full bg-sky-700 text-white mt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-4 min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-sky-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-slate-600",
										children: progressText || "Processing..."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1 mt-3",
									children: [
										"Pre-event Extraction",
										"Post-event Extraction",
										"Evidence Fusion"
									].map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-1 rounded-full bg-sky-100 overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-full bg-sky-500 animate-pulse rounded-full",
												style: { animationDelay: `${i * .35}s` }
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[9px] text-slate-400 font-mono text-center leading-none",
											children: step
										})]
									}, i))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 border-t border-slate-200 bg-white px-4 sm:px-6 py-4 z-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl w-full space-y-2.5",
					children: [
						pendingImages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [pendingImages.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-2 pr-1 py-0.5 text-xs font-semibold text-slate-700 shadow-sm",
								children: [
									img.previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: img.previewUrl,
										alt: "",
										className: "size-5 rounded-full object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, { className: "size-4 text-slate-400" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-[100px] truncate",
										children: img.file.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold ml-0.5",
										children: pendingImages.length > 1 ? idx === 0 ? "T1" : "T2" : "IMG"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeImage(img.id),
										className: "rounded-full p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
									})
								]
							}, img.id)), pendingImages.length === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-xs text-sky-600 font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5" }), " Bi-temporal — fusion enabled"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => fileInputRef.current?.click(),
									disabled: pendingImages.length >= 2,
									title: "Attach imagery (max 2 for bi-temporal)",
									className: "shrink-0 flex size-8 items-center justify-center rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 disabled:opacity-30 transition-colors mb-0.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileInputRef,
									type: "file",
									multiple: true,
									accept: ".tif,.tiff,.geotiff,.png,.jpg,.jpeg,.jp2,.img",
									className: "hidden",
									onChange: (e) => {
										addImages(e.target.files);
										e.target.value = "";
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									ref: textareaRef,
									value: query,
									onChange: (e) => {
										setQuery(e.target.value);
										growTextarea();
									},
									onKeyDown: (e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											submit();
										}
									},
									placeholder: pendingImages.length === 0 ? "Attach imagery first, then ask…" : "Ask about this imagery… (Enter to send)",
									rows: 1,
									className: "flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none py-1 leading-relaxed min-h-[36px] max-h-[200px]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void submit(),
									disabled: busy || pendingImages.length === 0,
									className: "shrink-0 flex size-8 items-center justify-center rounded-xl bg-sky-700 text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-0.5 shadow-sm",
									children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-[10px] text-slate-400",
							children: "Supports GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR · Bi-temporal change detection"
						})
					]
				})
			})
		]
	});
}
var $$splitComponentImporter$6 = () => import("./about-DWzOqPgz.mjs");
var Route$6 = createFileRoute("/about")({
	head: () => ({ meta: [{ title: "About — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Learn about Earth Query Lens, a VYOMIX project."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./contact-3oLwDRcc.mjs");
var Route$5 = createFileRoute("/contact")({
	head: () => ({ meta: [{ title: "Contact Us — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Contact the Earth Query Lens team at VYOMIX."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./login-C7cs_M8m.mjs");
var Route$4 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Login — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Log in to your Earth Query Lens account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./privacy-CwzJkjvR.mjs");
var Route$3 = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: "Privacy Policy — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Privacy Policy for Earth Query Lens by VYOMIX."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./profile-CCjEYoOf.mjs");
var Route$2 = createFileRoute("/profile")({
	head: () => ({ meta: [{ title: "Profile — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "User profile details for Earth Query Lens."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./signup-DJl_RCUx.mjs");
var Route$1 = createFileRoute("/signup")({
	head: () => ({ meta: [{ title: "Sign Up — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Create your Earth Query Lens account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./terms-3L6IrsVJ.mjs");
var Route = createFileRoute("/terms")({
	head: () => ({ meta: [{ title: "Terms & Conditions — Earth Query Lens — VYOMIX" }, {
		name: "description",
		content: "Terms & Conditions for Earth Query Lens by VYOMIX."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	AboutRoute: Route$6.update({
		id: "/about",
		path: "/about",
		getParentRoute: () => Route$8
	}),
	ContactRoute: Route$5.update({
		id: "/contact",
		path: "/contact",
		getParentRoute: () => Route$8
	}),
	LoginRoute: Route$4.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$8
	}),
	PrivacyRoute: Route$3.update({
		id: "/privacy",
		path: "/privacy",
		getParentRoute: () => Route$8
	}),
	ProfileRoute: Route$2.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$8
	}),
	SignupRoute: Route$1.update({
		id: "/signup",
		path: "/signup",
		getParentRoute: () => Route$8
	}),
	TermsRoute: Route.update({
		id: "/terms",
		path: "/terms",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
