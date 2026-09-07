import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-BmUEJrk2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
var STORAGE_KEY = "earth_query_lens_user";
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) setUser(JSON.parse(saved));
		} catch {}
	}, []);
	const login = (email, name) => {
		const newUser = {
			email,
			name: name || email.split("@")[0] || "User",
			provider: "email"
		};
		setUser(newUser);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
	};
	const signup = (name, email) => {
		const newUser = {
			name,
			email,
			provider: "email"
		};
		setUser(newUser);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
	};
	const loginWithGoogle = () => {
		const newUser = {
			name: "Google User",
			email: "user@gmail.com",
			provider: "google"
		};
		setUser(newUser);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
	};
	const logout = () => {
		setUser(null);
		localStorage.removeItem(STORAGE_KEY);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			isLoggedIn: !!user,
			login,
			signup,
			loginWithGoogle,
			logout
		},
		children
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
//#endregion
export { useAuth as n, AuthProvider as t };
