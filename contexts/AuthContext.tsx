import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase-client';
import { registerForPushNotificationsAsync, removePushToken } from '../utils/pushNotifications';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Check current session
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Register for push notifications if user is already logged in
        if (currentUser) {
          try {
            await registerForPushNotificationsAsync(currentUser.id);
          } catch (error) {
            console.error('Error registering for push notifications:', error);
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Register for push notifications when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await registerForPushNotificationsAsync(session.user.id);
        } catch (error) {
          console.error('Error registering for push notifications:', error);
        }
      }

      // Remove push token when user signs out
      if (event === 'SIGNED_OUT' && user) {
        try {
          await removePushToken(user.id);
        } catch (error) {
          console.error('Error removing push token:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Remove push token before signing out
    if (user) {
      try {
        await removePushToken(user.id);
      } catch (error) {
        console.error('Error removing push token on sign out:', error);
      }
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    userId: user?.id ?? null,
    isLoading,
    isAuthenticated: !!user,
    signOut,
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
