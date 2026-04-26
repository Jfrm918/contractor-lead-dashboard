'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

interface UserSession {
  userId: string;
  email: string;
  name: string | null;
  role: string;       // "admin" | "client" | "outreach"
  clientId: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  userName: string;
  user: UserSession | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null || isDemo;
  const userName = user?.name ?? user?.email?.split('@')[0] ?? (isDemo ? 'Read-only Demo' : '');

  // Check for existing session on mount
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === 'madison' || params.get('demo') === 'outreach') {
          if (!cancelled) {
            setUser({
              userId: 'demo-madison',
              email: 'madison@leadrecoverypro.demo',
              name: 'Madison',
              role: 'outreach',
              clientId: null,
            });
            setIsDemo(true);
          }
          return;
        }

        if (params.get('demo') === 'admin' || params.get('demo') === 'client') {
          if (!cancelled) setIsDemo(true);
          return;
        }

        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const json = await res.json();
          if (json.success && !cancelled) {
            setUser(json.data);
          }
        }
      } catch {
        // No session — that's fine
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return json.error?.message ?? 'Invalid email or password';
      }
      setUser(json.data);
      setIsDemo(false);
      return null; // no error
    } catch {
      return 'Network error — please try again';
    }
  }, []);

  const signInDemo = useCallback(() => {
    setUser(null);
    setIsDemo(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Clear local state regardless
    }
    setUser(null);
    setIsDemo(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, isDemo, userName, user, signIn, signInDemo, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
