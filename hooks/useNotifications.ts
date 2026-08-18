// import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

// Configuration du comportement natif des notifications (Désactivé pour Expo Go)
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
*/

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Les notifications sont temporairement désactivées
    // car expo-notifications fait crasher Expo Go sur Android (SDK 53+).
    // Il faudra un 'development build' (EAS) pour les réactiver plus tard.
    setHasPermission(false);
  }, []);

  const scheduleDailyNudge = async () => {
    // console.log("Nudge planifié (Simulé)");
  };

  const scheduleTaskReminder = async (taskTitle: string, delayMinutes: number = 10) => {
    // console.log(`Rappel planifié pour ${taskTitle} dans ${delayMinutes} minutes (Simulé)`);
  };

  return {
    hasPermission,
    scheduleDailyNudge,
    scheduleTaskReminder
  };
}
