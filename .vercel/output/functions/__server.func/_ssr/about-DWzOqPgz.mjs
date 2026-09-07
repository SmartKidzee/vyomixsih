import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Layers, a as ShieldCheck, v as Globe, x as Eye } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-DWzOqPgz.js
var import_jsx_runtime = require_jsx_runtime();
function AboutSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "panel mt-12 p-6 sm:p-10 bg-white w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3.5 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Product Overview" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4",
					children: "About Earth Query Lens"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-base sm:text-lg leading-relaxed text-slate-700 font-medium max-w-4xl",
					children: "Earth Query Lens is a multimodal satellite-imagery analysis platform designed to help users interact with optical and SAR imagery using natural-language queries."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-6 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-slate-200 bg-slate-50/60 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800 mb-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-bold text-slate-900",
									children: "Multimodal Fusion"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-slate-600 font-medium leading-relaxed",
									children: "Analyze both optical imagery and Synthetic Aperture Radar (SAR) for cloud-invariant insights."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-slate-200 bg-slate-50/60 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 mb-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-bold text-slate-900",
									children: "Spatial Grounding"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-slate-600 font-medium leading-relaxed",
									children: "Receive bounding-box coordinates for detected objects directly on satellite scenes."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-slate-200 bg-slate-50/60 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 mb-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-bold text-slate-900",
									children: "Transparent Tracing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-slate-600 font-medium leading-relaxed",
									children: "Inspect observable step-by-step execution summaries for full model transparency."
								})
							]
						})
					]
				})
			]
		})
	});
}
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AboutSection, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { AboutPage as component };
