import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige immédiatement vers le Dashboard (app 100% hors-ligne)
  return <Redirect href="/(tabs)" />;
}
