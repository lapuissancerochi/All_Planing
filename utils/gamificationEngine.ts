import { Task, Habit, Project, Goal } from '@/store/useTaskStore';
import Toast from 'react-native-toast-message';

export interface GameStats {
  tasksCompletedByHour: Record<number, number>;
  focusTimeTotal: number; // en secondes
  dailyXpEarned: number; // pour la limite anti-abus
  lastXpDate: string;
  tasksCompleted: number;
  q1Completed: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'early_bird', name: 'Lève-tôt', emoji: '🌅', description: '5 tâches terminées avant 10h' },
  { id: 'marathon', name: 'Marathon', emoji: '🏃', description: 'Plus de 2h de Focus dans une journée' },
  { id: 'inflexible', name: 'Inflexible', emoji: '🔥', description: 'Streak de 7 jours' },
  { id: 'prioritaire', name: 'Prioritaire', emoji: '🎯', description: '10 tâches Q1 terminées' },
  { id: 'maitre_temps', name: 'Maître du temps', emoji: '⏱️', description: '10 tâches dans le temps estimé' },
  { id: 'premier_projet', name: 'Premier projet', emoji: '🚀', description: 'Premier projet terminé' },
  { id: 'objectif_atteint', name: 'Objectif atteint', emoji: '🏆', description: 'Premier objectif terminé' }
];

export const gamificationEngine = {
  
  // Courbe exponentielle : 0, 100, 250, 450, 700, 1000, 1350...
  calculateLevel(xp: number): { level: number, nextLevelXp: number, progressPercent: number } {
    let level = 1;
    let nextLevelXp = 100;
    let base = 100;
    let increment = 150;
    let currentTierXp = 0;

    while (xp >= nextLevelXp) {
      level++;
      currentTierXp = nextLevelXp;
      nextLevelXp += increment;
      increment += 50;
    }

    const xpInCurrentLevel = xp - currentTierXp;
    const xpRequiredForNext = nextLevelXp - currentTierXp;
    const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100)));

    return { level, nextLevelXp, progressPercent };
  },

  // Limite d'XP par jour pour petites tâches : max 100 XP par jour
  canEarnDailyXp(currentDailyXp: number, amount: number): boolean {
    return currentDailyXp + amount <= 100;
  },

  checkBadges(
    currentBadges: string[],
    stats: GameStats,
    tasks: Task[],
    habits: Habit[],
    projects: Project[]
  ): string[] {
    const newlyUnlocked: string[] = [];
    const unlock = (id: string) => {
      if (!currentBadges.includes(id) && !newlyUnlocked.includes(id)) {
        newlyUnlocked.push(id);
        const b = BADGES.find(x => x.id === id);
        if (b) {
          Toast.show({
            type: 'success',
            text1: `Nouveau Badge : ${b.emoji} ${b.name}`,
            text2: b.description,
            position: 'top'
          });
        }
      }
    };

    // Marathon (> 2h focus = 7200 sec)
    if (stats.focusTimeTotal >= 7200) unlock('marathon');

    // Inflexible (Streak de 7 jours)
    if (habits.some(h => h.streak >= 7)) unlock('inflexible');

    // Prioritaire (10 tâches Q1 terminées)
    if (stats.q1Completed >= 10) unlock('prioritaire');

    // Premier projet
    if (projects.filter(p => p.status === 'completed').length >= 1) unlock('premier_projet');

    // Maître du temps (10 tâches faites <= temps estimé)
    const onTimeTasks = tasks.filter(t => t.status === 'done' && t.actualTimeSpent && t.estimatedDuration && t.actualTimeSpent <= t.estimatedDuration * 60);
    if (onTimeTasks.length >= 10) unlock('maitre_temps');

    // Lève-tôt : on regarde stats.tasksCompletedByHour
    let earlyTasks = 0;
    for (let i = 0; i < 10; i++) {
      earlyTasks += (stats.tasksCompletedByHour[i] || 0);
    }
    if (earlyTasks >= 5) unlock('early_bird');

    return newlyUnlocked;
  },

  generateInsights(stats: GameStats, tasks: Task[]): string {
    // Heure la plus productive
    let bestHour = -1;
    let maxTasks = 0;
    Object.entries(stats.tasksCompletedByHour).forEach(([hour, count]) => {
      if (count > maxTasks) {
        maxTasks = count;
        bestHour = parseInt(hour);
      }
    });

    if (bestHour !== -1 && maxTasks >= 3) {
      return `Tu termines le plus de tâches vers ${bestHour}h00. 💡 Conseil : réserve cette période à tes tâches Q1.`;
    }

    // Tâches longues vs taux de complétion
    const longTasks = tasks.filter(t => (t.estimatedDuration || 0) >= 120);
    if (longTasks.length > 0) {
      const longCompleted = longTasks.filter(t => t.status === 'done').length;
      const rate = Math.round((longCompleted / longTasks.length) * 100);
      if (rate < 60 && longTasks.length >= 3) {
        return `Attention : Tes tâches de plus de 2h ont un taux de complétion de seulement ${rate}%. 💡 Essaie de les diviser en sous-tâches.`;
      }
    }

    return "Tu as commencé à accumuler des statistiques. Continue sur cette lancée pour découvrir tes habitudes !";
  }

};
