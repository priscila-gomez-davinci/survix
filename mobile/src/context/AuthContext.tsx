import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/src/services/firebase";
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
  loginWithGoogle: (firebase_uid: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearStoredToken();
      setToken(null);
      setUser(null);
    });
  }, []);

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
        await clearStoredToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Email/password → backend endpoints directly (firebase_uid queda nullable)
  const register = async (email: string, password: string) => {
    const { access_token } = await authApi.register(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
  };

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
  };

  // Google → Firebase para obtener uid real → firebase-sync
  const loginWithGoogle = async (firebase_uid: string, email: string) => {
    const { access_token } = await authApi.firebaseSync(firebase_uid, email);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
  };

  const logout = async () => {
    await signOut(firebaseAuth).catch(() => {});
    await clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, isLoading, login, register, loginWithGoogle, logout }}
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
