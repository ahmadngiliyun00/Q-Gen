import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface User {
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isGuest: boolean;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setUser({ accessToken: tokenResponse.access_token });
      setIsGuest(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
  });

  const login = () => {
    googleLogin();
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isGuest, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
