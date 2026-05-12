"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

// Effective view mode — separate from the user's actual role. Admin users
// can flip between "owner" (sees money/cost/admin info) and "installer"
// (the field crew view) to preview what the other side sees.
export type ViewMode = "owner" | "installer";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserSession | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  canSwitchView: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const VIEW_MODE_STORAGE_KEY = "fd-view-mode";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<ViewMode>("installer");

  const isAuthenticated = user !== null;
  // Only admin-role users can flip the toggle; everyone else is locked to installer view.
  const canSwitchView = user?.role === "admin";

  // Initialize view mode based on user role + localStorage preference.
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      try {
        const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setViewModeState(saved === "installer" ? "installer" : "owner");
      } catch {
         
        setViewModeState("owner");
      }
    } else {
       
      setViewModeState("installer");
    }
  }, [user]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const json = await res.json();
          if (json.success && !cancelled) {
            setUser(json.data);
            return;
          }
        }
      } catch {
        // No session
      }
      // Auto-login: skip sign-in screen
      if (!cancelled) {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "hadrava.business@gmail.com", password: "foamdial2026" }),
          });
          const json = await res.json();
          if (json.success && !cancelled) {
            setUser(json.data);
          }
        } catch {
          // fallback
        }
      }
    }
    checkSession().finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          return json.error?.message ?? "Invalid email or password";
        }
        setUser(json.data);
        return null;
      } catch {
        return "Network error - please try again";
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Clear regardless
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, viewMode, setViewMode, canSwitchView, signIn, signOut }}
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
