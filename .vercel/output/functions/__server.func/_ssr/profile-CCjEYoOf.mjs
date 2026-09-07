import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-BmUEJrk2.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Shield, m as LogOut, n as User, p as Mail, r as Sparkles } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-CCjEYoOf.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user, isLoggedIn, logout } = useAuth();
	const navigate = useNavigate();
	const handleLogout = () => {
		logout();
		navigate({ to: "/" });
	};
	if (!isLoggedIn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 flex items-center justify-center px-4 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8 text-center max-w-md bg-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold text-slate-900",
							children: "Access Restricted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-slate-600 font-medium",
							children: "Please log in to view your user profile details."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "mt-6 inline-block rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800",
							children: "Go to Login"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 w-full flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-6 sm:p-10 bg-white w-full max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 border-b border-slate-200 pb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md font-serif text-2xl font-bold",
								children: user?.name?.[0]?.toUpperCase() || "U"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider text-sky-700",
									children: "Registered Account"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-2xl font-bold text-slate-950",
									children: user?.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-slate-500",
									children: user?.email
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-5 text-slate-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold uppercase tracking-wider text-slate-500",
										children: "Full Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm sm:text-base font-semibold text-slate-900",
										children: user?.name
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5 text-slate-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold uppercase tracking-wider text-slate-500",
										children: "Email Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm sm:text-base font-semibold text-slate-900",
										children: user?.email
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5 text-slate-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold uppercase tracking-wider text-slate-500",
										children: "Product Ecosystem"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm sm:text-base font-semibold text-slate-900",
										children: "Earth Query Lens (VYOMIX)"
									})] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex justify-between items-center border-t border-slate-200 pt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								className: "inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Back to Workspace"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleLogout,
								className: "inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Log Out"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { ProfilePage as component };
