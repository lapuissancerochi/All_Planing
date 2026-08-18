import { Task } from '@/store/useTaskStore';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical' | 'overdue';
export type VisualColor = 'green' | 'yellow' | 'orange' | 'red' | 'black';

export interface CalculatedTaskDetails {
  urgency: UrgencyLevel;
  priorityScore: number;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  timeRemainingMinutes: number | null;
  visualColor: VisualColor;
  formattedTimeRemaining: string | null;
}

export const analyzeTask = (task: Task): CalculatedTaskDetails => {
  const now = new Date();
  let timeRemainingMinutes: number | null = null;
  let urgency: UrgencyLevel = 'low';
  let visualColor: VisualColor = 'green';
  let priorityScore = 0;

  // 1. Calcul de l'importance
  const importanceScore = task.importance === 'high' ? 50 : task.importance === 'medium' ? 25 : 0;
  priorityScore += importanceScore;

  // 2. Calcul du temps restant si une date est définie
  if (task.date) {
    const dueDateTime = new Date(task.date);
    if (task.time) {
      const [hours, minutes] = task.time.split(':').map(Number);
      dueDateTime.setHours(hours, minutes, 0, 0);
    } else {
      // Par défaut, fin de journée si pas d'heure précise
      dueDateTime.setHours(23, 59, 59, 999);
    }

    const diffMs = dueDateTime.getTime() - now.getTime();
    timeRemainingMinutes = Math.floor(diffMs / 1000 / 60);

    // Si on a une durée estimée, le "temps de jeu" est (Temps restant - Durée estimée)
    // Mais pour l'urgence simple, on se base sur le temps avant l'échéance.
    const duration = task.estimatedDuration || 0;
    const paddingMinutes = timeRemainingMinutes - duration;

    if (timeRemainingMinutes < 0) {
      urgency = 'overdue';
      visualColor = 'black';
      priorityScore += 100; // Très haute priorité car en retard
    } else if (paddingMinutes <= 60) {
      // Moins d'une heure de marge !
      urgency = 'critical';
      visualColor = 'red';
      priorityScore += 80;
    } else if (timeRemainingMinutes <= 3 * 60) {
      // Moins de 3 heures
      urgency = 'high';
      visualColor = 'orange';
      priorityScore += 60;
    } else if (timeRemainingMinutes <= 12 * 60) {
      // Moins de 12 heures
      urgency = 'medium';
      visualColor = 'yellow';
      priorityScore += 30;
    } else {
      // Plus de 12 heures
      urgency = 'low';
      visualColor = 'green';
      priorityScore += 10;
    }
  } else {
    // Règle d'or : Pas d'échéance = Pas d'urgence
    urgency = 'low';
    visualColor = 'green';
  }

  // 3. Détermination du Quadrant (Eisenhower Automatique)
  let quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  const isUrgent = urgency === 'high' || urgency === 'critical' || urgency === 'overdue';
  const isImportant = task.importance === 'high';

  if (isImportant && isUrgent) {
    quadrant = 'Q1'; // Important + Urgent
  } else if (isImportant && !isUrgent) {
    quadrant = 'Q2'; // Important + Non urgent
  } else if (!isImportant && isUrgent) {
    quadrant = 'Q3'; // Pas important + Urgent
  } else {
    quadrant = 'Q4'; // Pas important + Pas urgent
  }

  // 4. Formatage du temps
  let formattedTimeRemaining = null;
  if (timeRemainingMinutes !== null) {
    if (timeRemainingMinutes < 0) {
      formattedTimeRemaining = 'En retard';
    } else {
      const h = Math.floor(timeRemainingMinutes / 60);
      const m = timeRemainingMinutes % 60;
      if (h > 48) {
        formattedTimeRemaining = `${Math.floor(h / 24)} jours`;
      } else if (h > 0) {
        formattedTimeRemaining = `${h}h ${m}m`;
      } else {
        formattedTimeRemaining = `${m} min`;
      }
    }
  }

  return {
    urgency,
    priorityScore,
    quadrant,
    timeRemainingMinutes,
    visualColor,
    formattedTimeRemaining
  };
};
