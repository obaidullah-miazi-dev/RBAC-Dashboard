'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    // Call the logout API to clear the HttpOnly refresh token cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
        });
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        } else {
          // No valid refresh token found, meaning the user is truly logged out
          setAccessToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Silent refresh failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    silentRefresh();

    // Set up a timer to proactively refresh the AT right before it expires (15m)
    // For example, refresh every 10 minutes (600000 ms)
    const intervalId = setInterval(() => {
      if (user) {
        silentRefresh();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
