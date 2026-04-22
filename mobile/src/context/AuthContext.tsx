import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  setUnauthorizedHandler,
  type User,
} from "@/src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Register auto-logout for expired tokens (401 responses)
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearStoredToken();
      setToken(null);
      setUser(null);
    });
  }, []);

  // Rehydrate session on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredToken();
        if (stored) {
          setToken(stored);
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        // Token expired or invalid — start fresh
        await clearStoredToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
  };

  const register = async (email: string, password: string) => {
    const { access_token } = await authApi.register(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
  };

  const logout = async () => {
    await clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
