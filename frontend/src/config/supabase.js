import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mshlqqsvhdqixoosqbsc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zaGxxcXN2aGRxaXhvb3NxYnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTkxNTIsImV4cCI6MjEwMjA5NTE1Mn0.3n7pUpYt5sM5qPZ-2j-Sg8M3m6X3k4_1A-9p0L3Z9k8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;