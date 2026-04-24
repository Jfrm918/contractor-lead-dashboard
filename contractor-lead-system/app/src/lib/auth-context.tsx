'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string;
  signIn: (email: string, password: string) => void;
  signInDemo: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const signIn = useCallback((email: string, _password: string) => {
    setUserName(email.split('@')[0]);
    setIsAuthenticated(true);
  }, []);

  const signInDemo = useCallback(() => {
    setUserName('Jason');
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserName('');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, signIn, signInDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
