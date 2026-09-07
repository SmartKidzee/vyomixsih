import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as Shield } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-CwzJkjvR.js
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-6 sm:p-10 bg-white w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legal Documentation" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4",
							children: "Privacy Policy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500",
							children: "Last Updated: September 2026 · VYOMIX"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-6 text-sm sm:text-base font-medium text-slate-700 leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "1. Data Collection Overview"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "Earth Query Lens processes satellite imagery uploaded directly by users to perform visual question answering, spatial grounding, and change detection analysis. Uploaded files are processed in-memory or securely streamed to backend analysis workers."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "2. Usage of Remote Sensing Data"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "User-provided GeoTIFF, Optical, and SAR imagery is strictly used for fulfilling user analysis queries and generating execution summary traces. Data is never shared with third-party advertising networks."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "3. User Security & Privacy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "Earth Query Lens enforces standard data encryption in transit. Session configuration preferences are maintained locally in browser storage."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm font-medium text-slate-600",
									children: "Note: This document serves as a product privacy disclosure for Earth Query Lens, a VYOMIX project."
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { PrivacyPage as component };
