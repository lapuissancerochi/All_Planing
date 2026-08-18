import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirige immédiatement vers le Dashboard (app 100% hors-ligne)
    router.replace('/(tabs)');
  }, []);
  
  return null;
}
