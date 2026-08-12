import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

// Configuration du comportement natif des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      // 1. Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      setHasPermission(finalStatus === 'granted');

      // Pour Android, configuration du channel
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    })();
  }, []);

  // 2. Les "Smart Nudges" (Notifications Contextuelles)
  const scheduleDailyNudge = async () => {
    if (!hasPermission) return;

    // Supprimer les anciennes pour éviter les doublons
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Nudge du matin (9h00) : "Quelle est votre priorité ?"
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bonjour ! ☕",
        body: "Avez-vous défini vos tâches pour aujourd'hui ? La Matrice Eisenhower vous attend.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    // Nudge de l'après-midi (14h00)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Baisse d'énergie ? 🎯",
        body: "C'est le moment idéal pour lancer une session Focus de 15 minutes sur une tâche prioritaire.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 14,
        minute: 0,
      },
    });
  };

  // 3. Rappels personnalisés pour une tâche (avec délai)
  const scheduleTaskReminder = async (taskTitle: string, delayMinutes: number = 10) => {
    if (!hasPermission) return;

    // Respect de la "plage de silence" (Pas de notif entre 22h et 7h)
    const now = new Date();
    const triggerTime = new Date(now.getTime() + delayMinutes * 60000);
    const hour = triggerTime.getHours();

    if (hour >= 22 || hour < 7) {
      console.log("Plage de silence : Le rappel est ignoré.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Tâche en attente ⏳",
        body: `Avez-vous oublié de terminer : "${taskTitle}" ?`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayMinutes * 60,
      },
    });
  };

  return {
    hasPermission,
    scheduleDailyNudge,
    scheduleTaskReminder
  };
}
