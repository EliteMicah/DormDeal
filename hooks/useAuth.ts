import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessagingService } from '../lib/messaging';
import { User, AuthError } from '@supabase/supabase-js';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; username?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagingService = MessagingService.getInstance();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Create user profile when user signs up
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await messagingService.createUserProfile(
              session.user.id,
              session.user.user_metadata?.username,
              session.user.user_metadata?.full_name,
            );
          } catch (error) {
            console.error('Error creating user profile:', error);
          }
        }

        // Clear any previous errors on successful auth
        if (event === 'SIGNED_IN') {
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; username?: string }
  ) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      // Clean up messaging subscriptions
      messagingService.unsubscribeFromAll();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    error,
  };
}