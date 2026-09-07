import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { d as MessageSquare, o as Send, p as Mail, r as Sparkles, v as Globe, w as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-3oLwDRcc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name || !email || !message) return;
		setSent(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-8 lg:grid-cols-12 items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-5 space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6 sm:p-8 bg-white",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Get in Touch" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-4",
									children: "Contact VYOMIX"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm sm:text-base leading-relaxed font-medium text-slate-700",
									children: "Have questions about Earth Query Lens, dataset integration, or remote sensing analysis features? Send us a message and our team will get back to you."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-800 shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold uppercase tracking-wider text-slate-500",
												children: "Contact Inquiry"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm sm:text-base font-semibold text-slate-900",
												children: "contact@vyomix.org"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold uppercase tracking-wider text-slate-500",
												children: "Project Initiative"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm sm:text-base font-semibold text-slate-900",
												children: "Earth Query Lens (VYOMIX)"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold uppercase tracking-wider text-slate-500",
												children: "Specialization"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm sm:text-base font-semibold text-slate-900",
												children: "Multimodal Remote Sensing Intelligence"
											})] })]
										})
									]
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6 sm:p-8 bg-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 border-b border-slate-200 pb-4 mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-5 text-sky-400" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-bold text-slate-900",
									children: "Send Us a Message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-500 font-medium",
									children: "Fill out the form below to connect with our team"
								})] })]
							}), sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto size-10 text-emerald-600" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-lg font-bold text-emerald-950",
										children: "Message Received!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-emerald-800",
										children: "Thank you for reaching out to Earth Query Lens. Your message has been recorded successfully."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setSent(false);
											setName("");
											setEmail("");
											setSubject("");
											setMessage("");
										},
										className: "mt-2 inline-block rounded-xl bg-emerald-900 px-5 py-2 text-xs font-semibold text-white",
										children: "Send Another Message"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSubmit,
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
											children: "Your Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											required: true,
											value: name,
											onChange: (e) => setName(e.target.value),
											placeholder: "Alex Morgan",
											className: "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
											children: "Email Address"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "alex@example.com",
											className: "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
										children: "Subject"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: subject,
										onChange: (e) => setSubject(e.target.value),
										placeholder: "Question about optical & SAR dataset analysis",
										className: "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
										children: "Message"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										required: true,
										rows: 5,
										value: message,
										onChange: (e) => setMessage(e.target.value),
										placeholder: "Write your inquiry or feedback here...",
										className: "w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										className: "inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Send Message" })]
									})
								]
							})]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { ContactPage as component };
