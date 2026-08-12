import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Configuration URL et Clé
const supabaseUrl = 'https://hgsurqomsoynvufgfvsd.supabase.co';
const supabaseAnonKey = 'sb_publishable_YDLh4koPNtzc5wTPVt48vQ_g4TU8zdL'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
