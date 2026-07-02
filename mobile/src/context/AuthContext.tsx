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
  profilesApi,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  setUnauthorizedHandler,
  type User,
} from "@/src/services/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  profilePhoto: string | null;
  setProfilePhoto: (url: string | null) => void;
  // Best-effort display name for the current user (nombre + apellido). The
  // backend has no author id on posts/comments, so this is what's used to
  // tell "my content" apart from everyone else's — see PostsContext.
  profileName: string | null;
  setProfileName: (name: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (firebase_uid: string, email: string, id_token?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  const fetchProfile = async (userId: number) => {
    try {
      const p = await profilesApi.getById(userId);
      setProfilePhoto(p.foto_url ?? null);
      const name = [p.nombre, p.apellido].filter(Boolean).join(" ").trim();
      setProfileName(name || null);
    } catch {
      setProfilePhoto(null);
      setProfileName(null);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearStoredToken();
      setToken(null);
      setUser(null);
      setProfilePhoto(null);
      setProfileName(null);
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
          await fetchProfile(me.id_usuario);
        }
      } catch {
        await clearStoredToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = async (email: string, password: string) => {
    const { access_token } = await authApi.register(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
    await fetchProfile(me.id_usuario);
  };

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
    await fetchProfile(me.id_usuario);
  };

  const loginWithGoogle = async (firebase_uid: string, email: string, id_token?: string) => {
    const { access_token } = await authApi.firebaseSync(firebase_uid, email, id_token);
    await setStoredToken(access_token);
    setToken(access_token);
    const me = await authApi.me();
    setUser(me);
    await fetchProfile(me.id_usuario);
  };

  const logout = async () => {
    await signOut(firebaseAuth).catch(() => {});
    await clearStoredToken();
    setToken(null);
    setUser(null);
    setProfilePhoto(null);
    setProfileName(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, isLoading, profilePhoto, setProfilePhoto, profileName, setProfileName, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
