import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ACCESS_KEY, REFRESH_KEY } from "../lib/api";
import type { User } from "./types";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: User["role"];
  phone?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const { data } = await api.get<User>("/auth/me/");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem(ACCESS_KEY)) loadMe();
    else setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    const me = await api.get<User>("/auth/me/");
    setUser(me.data);
    return me.data;
  }

  async function register(payload: RegisterPayload) {
    await api.post("/auth/register/", payload);
  }

  function logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
