// Supabase configuration constants
// The anonymous key is safe to expose in client-side code
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://qhevnbzpqkmglendhiur.supabase.co",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZXZuYnpwcWttZ2xlbmRoaXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDQxNDksImV4cCI6MjA1MTQyMDE0OX0.daeLOMyU8s6W1Y_t6MmmT0-sSoqj_edQjWSRUj18dKA"
};