'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { authApi } from '@/lib/api';
import { tokenStorage } from '@/lib/api/storage';
import { StudyPreferences, User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: StudyPreferences | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateAuthState: (nextUser: User, nextProfile: StudyPreferences | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudyPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (nextUser: User, nextProfile: StudyPreferences | null) => {
    setUser(nextUser);
    setProfile(nextProfile);
  };

  const refreshUser = async () => {
    try {
      const access = tokenStorage.getAccessToken();
      if (!access) {
        setUser(null);
        setProfile(null);
        return;
      }

      const payload = await authApi.me();
      setUser(payload.user);
      setProfile(payload.profile);
    } catch {
      tokenStorage.clear();
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const payload = await authApi.login(email, password);
      setUser(payload.user);
      setProfile(payload.profile);
      return payload.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    try {
      const payload = await authApi.signup(email, password, name);
      setUser(payload.user);
      setProfile(payload.profile);
      return payload.user;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, logout, signup, refreshUser, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
