import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '../lib/supabase';
import { apiClient } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.setAuthToken(session?.access_token ?? null);
    socketService.refreshIdentity();
  }, [session]);

  useEffect(() => {
    if (!hasSupabase()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!hasSupabase()) {
      throw new Error('Authentication is not configured');
    }

    // Sign up with Supabase
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile in backend
    if (data.user) {
      await apiClient.registerUser({
        supabaseUserId: data.user.id,
        email: data.user.email!,
        displayName: displayName || null,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabase()) {
      throw new Error('Authentication is not configured');
    }

    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    if (!hasSupabase()) return;
    
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  };

  const getToken = async (): Promise<string | null> => {
    if (!hasSupabase() || !session) return null;
    return session.access_token;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
