import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-BmUEJrk2.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as EyeOff, T as CircleAlert, h as Lock, p as Mail, r as Sparkles, x as Eye } from "../_libs/lucide-react.mjs";
import { n as Navbar, t as Footer } from "./Footer-lr_KQj-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C7cs_M8m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: "size-5",
		viewBox: "0 0 24 24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
			})
		]
	});
}
function LoginPage() {
	const { login, loginWithGoogle } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [rememberMe, setRememberMe] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const handleSuccessRedirect = () => {
		navigate({ to: "/" });
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		setError(null);
		if (!email.trim()) {
			setError("Please enter your email address.");
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			setError("Please enter a valid email address.");
			return;
		}
		if (!password) {
			setError("Please enter your password.");
			return;
		}
		setBusy(true);
		try {
			login(email.trim());
			handleSuccessRedirect();
		} catch (err) {
			setError("Failed to sign in. Please try again.");
		} finally {
			setBusy(false);
		}
	};
	const handleGoogleSignIn = () => {
		loginWithGoogle();
		handleSuccessRedirect();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 flex items-center justify-center px-4 py-12 sm:px-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-8 sm:p-10 bg-white/95 shadow-xl backdrop-blur-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "inline-flex items-center justify-center size-12 rounded-2xl bg-slate-900 text-white shadow-md mb-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6 text-sky-400" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold uppercase tracking-widest text-sky-700",
										children: "VYOMIX presents"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-serif text-3xl font-bold tracking-tight text-slate-950 mt-1",
										children: "Earth Query Lens"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-lg font-semibold text-slate-700 mt-2",
										children: "Welcome back"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs sm:text-sm text-slate-500 font-medium mt-1",
										children: "Enter your credentials to access your workspace"
									})
								]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-xs sm:text-sm font-medium text-rose-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-4 shrink-0 text-rose-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleSubmit,
								className: "mt-6 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
										children: "Email Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "user@vyomix.com",
											className: "w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: showPassword ? "text" : "password",
												value: password,
												onChange: (e) => setPassword(e.target.value),
												placeholder: "••••••••",
												className: "w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setShowPassword((s) => !s),
												className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700",
												"aria-label": "Toggle password visibility",
												children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-xs sm:text-sm font-medium",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 cursor-pointer text-slate-700",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: rememberMe,
												onChange: (e) => setRememberMe(e.target.checked),
												className: "size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Remember me" })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "#forgot",
											className: "text-sky-700 font-semibold hover:underline",
											children: "Forgot password?"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: busy,
										className: "w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all disabled:opacity-50 mt-2",
										children: busy ? "Signing in..." : "Login"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "my-6 flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-slate-200" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-bold uppercase tracking-wider text-slate-400",
										children: "OR"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-slate-200" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleGoogleSignIn,
								className: "flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-all",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Continue with Google" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 text-center text-xs sm:text-sm font-medium text-slate-600",
								children: [
									"Don't have an account?",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/signup",
										className: "font-semibold text-slate-950 hover:underline",
										children: "Sign up"
									})
								]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { LoginPage as component };
