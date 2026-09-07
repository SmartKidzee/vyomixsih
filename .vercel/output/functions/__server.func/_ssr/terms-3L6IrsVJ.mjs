import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { y as FileText } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-3L6IrsVJ.js
var import_jsx_runtime = require_jsx_runtime();
function TermsPage() {
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Terms of Service" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4",
							children: "Terms & Conditions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500",
							children: "Effective Date: September 2026 · VYOMIX"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-6 text-sm sm:text-base font-medium text-slate-700 leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "1. Acceptance of Terms"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "By accessing Earth Query Lens, users agree to abide by these terms of service. Earth Query Lens provides vision-language intelligence tools for satellite imagery research and observation."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "2. Appropriate Usage"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "Users are responsible for ensuring they possess legitimate rights or public clearance to upload satellite scenes for processing. Reverse-engineering of model pipelines or automated flooding of backend endpoints is prohibited."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "3. Limitation of Model Outputs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "Confidence metrics, grounding coordinates, and answer outputs provided by model specialists are observational assistance tools and should be validated for mission-critical operations."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm font-medium text-slate-600",
									children: "Note: Earth Query Lens is an official VYOMIX project."
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
export { TermsPage as component };
