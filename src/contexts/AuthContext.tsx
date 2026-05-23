import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

interface User {
  accessToken: string;
  name?: string;
  picture?: string;
  email?: string;
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
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('qgen_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('qgen_guest') === 'true';
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      let newUser: User = { accessToken: tokenResponse.access_token };
      
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          newUser = { ...newUser, name: profile.name, picture: profile.picture, email: profile.email };
        }
      } catch (err) {
        console.error("Gagal mengambil profil", err);
      }
      
      setUser(newUser);
      setIsGuest(false);
      localStorage.setItem('qgen_user', JSON.stringify(newUser));
      localStorage.removeItem('qgen_guest');
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  });

  const login = () => {
    googleLogin();
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('qgen_user');
    localStorage.removeItem('qgen_guest');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem('qgen_guest', 'true');
    localStorage.removeItem('qgen_user');
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
