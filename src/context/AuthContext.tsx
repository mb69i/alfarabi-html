'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAdmin: false,
  isOwner: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-auth/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        setIsOwner(data.isOwner || false);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsOwner(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    setIsAdmin(false);
    setIsOwner(false);
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isOwner, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
