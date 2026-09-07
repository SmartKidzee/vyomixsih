import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useAuth } from "./auth-context-BmUEJrk2.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Earth, f as Menu, m as LogOut, n as User, r as Sparkles, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Footer-lr_KQj-g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Navbar() {
	const { user, isLoggedIn, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const handleLogout = () => {
		logout();
		navigate({ to: "/" });
	};
	const handleAuthGatedClick = (e, targetHash = "#workspace") => {
		if (!isLoggedIn) {
			e.preventDefault();
			navigate({
				to: "/login",
				search: { redirect: targetHash }
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8 lg:px-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3 group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition-transform group-hover:scale-105",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-sky-400" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] font-bold uppercase tracking-widest text-sky-700 leading-none",
							children: "VYOMIX presents"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-950 leading-tight",
							children: "Earth Query Lens"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#workspace",
							onClick: (e) => handleAuthGatedClick(e, "#workspace"),
							className: "hover:text-slate-950 transition-colors",
							children: "Analyse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#workspace",
							onClick: (e) => handleAuthGatedClick(e, "#workspace"),
							className: "hover:text-slate-950 transition-colors",
							children: "Evidence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#workspace",
							onClick: (e) => handleAuthGatedClick(e, "#workspace"),
							className: "hover:text-slate-950 transition-colors",
							children: "Execution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/#workspace",
							onClick: (e) => handleAuthGatedClick(e, "#workspace"),
							className: "hover:text-slate-950 transition-colors",
							children: "Report"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/about",
							className: "hover:text-slate-950 transition-colors",
							children: "About"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden sm:flex items-center gap-4",
					children: isLoggedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/profile",
							className: "flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-all shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: user?.name })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleLogout,
							className: "flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-all shadow-2xs",
							title: "Log out",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Logout" })]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors px-3 py-1.5",
								children: "Login"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/signup",
								className: "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-2xs hover:bg-slate-50 transition-all",
								children: "Sign Up"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/#workspace",
								onClick: (e) => handleAuthGatedClick(e, "#workspace"),
								className: "rounded-full bg-slate-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all",
								children: "Start Analysis"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setMobileMenuOpen((o) => !o),
					className: "flex sm:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100",
					"aria-label": "Toggle Navigation Menu",
					children: mobileMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-6" })
				})
			]
		}), mobileMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sm:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/#workspace",
					onClick: (e) => {
						setMobileMenuOpen(false);
						handleAuthGatedClick(e, "#workspace");
					},
					className: "block text-sm font-semibold text-slate-800 py-1.5",
					children: "Analyse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/#workspace",
					onClick: (e) => {
						setMobileMenuOpen(false);
						handleAuthGatedClick(e, "#workspace");
					},
					className: "block text-sm font-semibold text-slate-800 py-1.5",
					children: "Evidence"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/#workspace",
					onClick: (e) => {
						setMobileMenuOpen(false);
						handleAuthGatedClick(e, "#workspace");
					},
					className: "block text-sm font-semibold text-slate-800 py-1.5",
					children: "Execution"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/#workspace",
					onClick: (e) => {
						setMobileMenuOpen(false);
						handleAuthGatedClick(e, "#workspace");
					},
					className: "block text-sm font-semibold text-slate-800 py-1.5",
					children: "Report"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/about",
					onClick: () => setMobileMenuOpen(false),
					className: "block text-sm font-semibold text-slate-800 py-1.5",
					children: "About"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-3 border-t border-slate-200 space-y-2",
					children: isLoggedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/profile",
						onClick: () => setMobileMenuOpen(false),
						className: "flex items-center gap-2 text-sm font-semibold text-slate-900 py-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Profile (",
							user?.name,
							")"
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setMobileMenuOpen(false);
							handleLogout();
						},
						className: "flex w-full items-center gap-2 text-sm font-semibold text-rose-600 py-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Logout" })]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							onClick: () => setMobileMenuOpen(false),
							className: "w-full text-center rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-900",
							children: "Login"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/signup",
							onClick: () => setMobileMenuOpen(false),
							className: "w-full text-center rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-md",
							children: "Sign Up"
						})]
					})
				})
			]
		})]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-16 border-t border-slate-200 bg-white/80 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-10 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-2 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 text-sky-400" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[10px] font-bold uppercase tracking-widest text-sky-700 leading-none",
									children: "VYOMIX PRESENTS"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-serif text-2xl font-bold tracking-tight text-slate-950",
									children: "Earth Query Lens"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium leading-relaxed text-slate-600 max-w-sm",
								children: "Multimodal Vision-Language Satellite Intelligence. Interact with optical and SAR remote sensing imagery using plain language."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "size-3.5 text-sky-700" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VYOMIX Earth Intelligence Suite" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-bold uppercase tracking-wider text-slate-900 mb-4",
						children: "Navigation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2.5 text-sm font-medium text-slate-600",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "hover:text-slate-950 transition-colors",
								children: "Home"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/#workspace",
								className: "hover:text-slate-950 transition-colors",
								children: "Analyse"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/#workspace",
								className: "hover:text-slate-950 transition-colors",
								children: "Evidence"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/#workspace",
								className: "hover:text-slate-950 transition-colors",
								children: "Execution"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/#workspace",
								className: "hover:text-slate-950 transition-colors",
								children: "Report"
							}) })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-bold uppercase tracking-wider text-slate-900 mb-4",
						children: "Account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2.5 text-sm font-medium text-slate-600",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "hover:text-slate-950 transition-colors",
								children: "Login"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/signup",
								className: "hover:text-slate-950 transition-colors",
								children: "Sign Up"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/profile",
								className: "hover:text-slate-950 transition-colors",
								children: "Profile"
							}) })
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs font-bold uppercase tracking-wider text-slate-900 mb-4",
						children: "Information"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2.5 text-sm font-medium text-slate-600",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/about",
								className: "hover:text-slate-950 transition-colors",
								children: "About"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/privacy",
								className: "hover:text-slate-950 transition-colors",
								children: "Privacy Policy"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/terms",
								className: "hover:text-slate-950 transition-colors",
								children: "Terms & Conditions"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/contact",
								className: "hover:text-slate-950 transition-colors",
								children: "Contact"
							}) })
						]
					})] })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs font-medium text-slate-500",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 VYOMIX. All rights reserved." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-slate-700",
					children: "Earth Query Lens is a VYOMIX project."
				})]
			})]
		})
	});
}
//#endregion
export { Navbar as n, Footer as t };
