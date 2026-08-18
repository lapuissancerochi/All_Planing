import { Task, CoachAlert } from '@/store/useTaskStore';
import { analyzeTask } from './priorityEngine';

export interface DailyLoadAnalysis {
  status: '🟢' | '🟡' | '🔴';
  message: string;
  totalPlannedMinutes: number;
}

export interface ScheduleItem {
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  type: 'task' | 'break';
  task?: Task;
  title: string;
}

export const coachEngine = {
  
  // 1. Analyse de la charge de travail de la journée
  analyzeDailyLoad(tasks: Task[]): DailyLoadAnalysis {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    
    // On somme les durées estimées. Si non défini, on suppose 25 min (1 Pomodoro)
    const totalMinutes = activeTasks.reduce((acc, t) => acc + (t.estimatedDuration || 25), 0);
    
    // Logique simplifiée :
    // < 4h = 🟢 Journée maîtrisée
    // 4h - 6h = 🟡 Charge élevée
    // > 6h = 🔴 Surcharge
    if (totalMinutes > 360) {
      return { 
        status: '🔴', 
        message: `Vous avez planifié ${Math.floor(totalMinutes/60)}h${totalMinutes%60} de travail. C'est le risque de burn-out ou de déception.`,
        totalPlannedMinutes: totalMinutes
      };
    }
    
    if (totalMinutes > 240) {
      return { 
        status: '🟡', 
        message: `Journée bien remplie (${Math.floor(totalMinutes/60)}h${totalMinutes%60}). N'oubliez pas de prendre des pauses.`,
        totalPlannedMinutes: totalMinutes
      };
    }

    return { 
      status: '🟢', 
      message: `Journée saine (${Math.floor(totalMinutes/60)}h${totalMinutes%60}). Vous avez le temps de vous concentrer.`,
      totalPlannedMinutes: totalMinutes
    };
  },

  // 2. Détection de la Procrastination
  detectProcrastination(tasks: Task[]): Omit<CoachAlert, 'id' | 'createdAt' | 'isDismissed'>[] {
    const alerts: Omit<CoachAlert, 'id' | 'createdAt' | 'isDismissed'>[] = [];
    const activeTasks = tasks.filter(t => t.status !== 'done');
    const now = new Date();

    activeTasks.forEach(task => {
      // Condition 1 : Reportée >= 2 fois
      if (task.postponedCount && task.postponedCount >= 2) {
        alerts.push({
          type: 'postponed',
          taskId: task.id,
          message: `La tâche "${task.title}" a été repoussée ${task.postponedCount} fois. Voulez-vous la diviser, la déléguer ou l'éliminer ?`
        });
      }
      // Condition 2 : Créée il y a > 7 jours et jamais avancée (0 temps passé)
      else if (task.created_at) {
        const createdAt = new Date(task.created_at);
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 7 && (!task.actualTimeSpent || task.actualTimeSpent === 0)) {
          alerts.push({
            type: 'stagnant',
            taskId: task.id,
            message: `La tâche "${task.title}" traîne depuis ${diffDays} jours. Elle semble bloquante.`
          });
        }
      }
    });

    return alerts;
  },

  // 3. Génération automatique de planning (Timeline)
  generateSchedule(tasks: Task[], startHour: number = 9): ScheduleItem[] {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    if (activeTasks.length === 0) return [];

    // On utilise Eisenhower pour trier les tâches par priorité absolue
    const tasksWithDetails = activeTasks.map(t => ({ task: t, details: analyzeTask(t) }));
    const sortedTasks = tasksWithDetails.sort((a, b) => b.details.priorityScore - a.details.priorityScore);

    const schedule: ScheduleItem[] = [];
    let currentMins = startHour * 60; // Commence à startHour h 00

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    sortedTasks.forEach(({ task }, index) => {
      const duration = task.estimatedDuration || 25; // 25 min par défaut
      
      schedule.push({
        startTime: formatTime(currentMins),
        endTime: formatTime(currentMins + duration),
        type: 'task',
        task: task,
        title: task.title
      });
      
      currentMins += duration;

      // Ajouter une pause de 15 min après chaque tâche sauf la dernière
      if (index < sortedTasks.length - 1) {
        schedule.push({
          startTime: formatTime(currentMins),
          endTime: formatTime(currentMins + 15),
          type: 'break',
          title: 'Pause / Respiration'
        });
        currentMins += 15;
      }
    });

    return schedule;
  }
};
