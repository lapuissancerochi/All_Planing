import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Storage adapter sécurisé pour le Web (SSR) et le Mobile
const ExpoStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return null;
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return null;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') return null;
    return AsyncStorage.removeItem(key);
  },
};

// Configuration URL et Clé
const supabaseUrl = 'https://hgsurqomsoynvufgfvsd.supabase.co';
const supabaseAnonKey = 'sb_publishable_YDLh4koPNtzc5wTPVt48vQ_g4TU8zdL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
