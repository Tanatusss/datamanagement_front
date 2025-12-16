"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  username: string;
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "mockUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // โหลด user จาก localStorage ตอนเปิดเว็บครั้งแรก
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as User;
      if (parsed?.username) {
        setUser(parsed);
      }
    } catch (e) {
      console.error("Failed to parse mockUser", e);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      // 👇 mock logic: เช็คแค่ admin007 / 1234567
      await new Promise((r) => setTimeout(r, 500));

      if (username === "admin007" && password === "1234567") {
        const nextUser = { username };
        setUser(nextUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        }
        return true;
      }

      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
