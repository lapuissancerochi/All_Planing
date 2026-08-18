import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type TaskImportance = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  goalId?: string;
  deadline?: string;
  status: 'active' | 'completed';
  color: string;
  created_at: string;
}

export interface Habit {
  id: string;
  title: string;
  goalId?: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  bestStreak: number;
  completionHistory: string[]; // dates ISO YYYY-MM-DD
  created_at: string;
}

export interface CoachAlert {
  id: string;
  type: 'stagnant' | 'postponed' | 'overload' | 'suggestion';
  taskId?: string;
  message: string;
  createdAt: string;
  isDismissed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  estimatedDuration?: number; // en minutes
  actualTimeSpent?: number; // en secondes
  reminder?: boolean;
  importance: TaskImportance;
  status: TaskStatus;
  subtasks?: Subtask[];
  projectId?: string; 
  postponedCount?: number; // NOUVEAU: Tracker le nombre de reports
  created_at?: string;
  quadrant?: Quadrant; 
}

interface TaskState {
  tasks: Task[];
  goals: Goal[];
  projects: Project[];
  habits: Habit[];
  coachAlerts: CoachAlert[];
  
  // Phase 5 : Gamification & Stats
  xp: number;
  level: number;
  badges: string[];
  gameStats: {
    tasksCompletedByHour: Record<number, number>;
    focusTimeTotal: number;
    dailyXpEarned: number;
    lastXpDate: string;
    tasksCompleted: number;
    q1Completed: number;
  };
  
  
  // Statistiques
  focusSessionsCompletedToday: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  streakDays: number;
  monthlyGoal: string;
  
  // Actions Tâches
  setMonthlyGoal: (goal: string) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;
  incrementFocusSessions: () => void;
  checkNewDay: () => void;
  
  // Actions Sous-tâches
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addTimeSpent: (taskId: string, seconds: number) => void;

  // Actions Phase 3 (Objectifs, Projets, Habitudes)
  addGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => void;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'status'>) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'streak' | 'bestStreak' | 'completionHistory'>) => void;
  toggleHabit: (habitId: string) => void;
  deleteGoal: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Actions Phase 4 (Coach & Procrastination)
  postponeTask: (taskId: string, newDate: string) => void;
  addCoachAlert: (alert: Omit<CoachAlert, 'id' | 'createdAt' | 'isDismissed'>) => void;
  dismissCoachAlert: (alertId: string) => void;

  // Actions Phase 5 (Gamification)
  addXP: (amount: number, reason: string, isMicroTask?: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      projects: [],
      habits: [],
      coachAlerts: [],
      
      // Phase 5 defaults
      xp: 0,
      level: 1,
      badges: [],
      gameStats: {
        tasksCompletedByHour: {},
        focusTimeTotal: 0,
        dailyXpEarned: 0,
        lastXpDate: new Date().toISOString().split('T')[0],
        tasksCompleted: 0,
        q1Completed: 0
      },

      focusSessionsCompletedToday: 0,
      tasksCompletedToday: 0,
      tasksCreatedToday: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalTasksCompleted: 0,
      totalTasksCreated: 0,
      streakDays: 1,
      monthlyGoal: '',

      checkNewDay: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        let lastActive = state.lastActiveDate;
        let streak = state.streakDays;
        
        // Reset daily stats if it's a new day
        if (lastActive !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutive = lastActive === yesterday.toISOString().split('T')[0];
          
          streak = isConsecutive ? streak + 1 : 1;
          
          set({
            focusSessionsCompletedToday: 0,
            tasksCompletedToday: 0,
            tasksCreatedToday: 0,
            streakDays: streak,
            lastActiveDate: today,
          });
        }
      },

      setMonthlyGoal: (goal: string) => {
        set({ monthlyGoal: goal });
      },

      addTask: (task) => {
        get().checkNewDay();
        const newTask: Task = {
          ...task,
          id: uuid.v4() as string,
          created_at: new Date().toISOString(),
          subtasks: task.subtasks || [],
          actualTimeSpent: 0,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
          tasksCreatedToday: state.tasksCreatedToday + 1,
          totalTasksCreated: state.totalTasksCreated + 1,
        }));
      },

      updateTask: (id, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id ? { ...task, ...updatedTask } : task
          )
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        }));
      },

      changeTaskStatus: (id, status) => {
        get().checkNewDay();
        const state = get();
        const task = state.tasks.find(t => t.id === id);
        if (!task) return;
        
        const wasDone = task.status === 'done';
        const isDone = status === 'done';
        
        let tasksCompletedToday = state.tasksCompletedToday;
        let totalTasksCompleted = state.totalTasksCompleted;
        let gameStats = state.gameStats;

        if (!wasDone && isDone) {
          tasksCompletedToday++;
          totalTasksCompleted++;
          gameStats = { ...gameStats, tasksCompleted: gameStats.tasksCompleted + 1 };
          
          // PHASE 5: XP pour complétion de tâche
          const { analyzeTask } = require('@/utils/priorityEngine');
          const details = analyzeTask(task);
          
          let xpEarned = 10;
          if (details.quadrant === 'Q1') {
            xpEarned += 5;
            gameStats.q1Completed += 1;
          } else if (details.quadrant === 'Q2') {
            xpEarned += 3;
          }

          // Maj heure de complétion
          const hour = new Date().getHours();
          gameStats.tasksCompletedByHour = { ...gameStats.tasksCompletedByHour, [hour]: (gameStats.tasksCompletedByHour[hour] || 0) + 1 };
          
          // setTimeout to call addXP to avoid nested set calls if needed, or we just call get().addXP
          setTimeout(() => get().addXP(xpEarned, "Tâche terminée", false), 0);
          
        } else if (wasDone && !isDone) {
          tasksCompletedToday--;
          totalTasksCompleted--;
          gameStats = { ...gameStats, tasksCompleted: Math.max(0, gameStats.tasksCompleted - 1) };
        }
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
          tasksCompletedToday,
          totalTasksCompleted,
          gameStats,
        }));
      },

      incrementFocusSessions: () => {
        get().checkNewDay();
        set((state) => ({ 
          focusSessionsCompletedToday: state.focusSessionsCompletedToday + 1 
        }));
      },

      // --- SOUS-TÂCHES & TEMPS ---

      addSubtask: (taskId, title) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const newSubtask: Subtask = { id: uuid.v4() as string, title, isCompleted: false };
            return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
          })
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => {
          const newTasks = state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            
            const updatedSubtasks = (task.subtasks || []).map(st => 
              st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            
            return { ...task, subtasks: updatedSubtasks };
          });
          
          return { tasks: newTasks };
        });

        // Appeler changeTaskStatus si on doit auto-compléter pour bien déclencher les stats du store
        const state = get();
        const task = state.tasks.find(t => t.id === taskId);
        
        // XP Sous-tâche (Micro-tâche)
        const st = (task?.subtasks || []).find(x => x.id === subtaskId);
        if (st && st.isCompleted) {
          setTimeout(() => get().addXP(2, "Sous-tâche terminée", true), 0);
        }

        if (task && (task.subtasks || []).length > 0 && (task.subtasks || []).every(st => st.isCompleted) && task.status !== 'done') {
          get().changeTaskStatus(taskId, 'done');
        } else if (task && task.status === 'done' && (task.subtasks || []).some(st => !st.isCompleted)) {
          get().changeTaskStatus(taskId, 'in_progress');
        }
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, subtasks: (task.subtasks || []).filter(st => st.id !== subtaskId) };
          })
        }));
      },

      addTimeSpent: (taskId, seconds) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const current = task.actualTimeSpent || 0;
            return { ...task, actualTimeSpent: current + seconds };
          }),
          gameStats: { ...state.gameStats, focusTimeTotal: state.gameStats.focusTimeTotal + seconds }
        }));
        
        // XP Focus Session
        if (seconds >= 25 * 60) {
          setTimeout(() => get().addXP(seconds >= 45 * 60 ? 10 : 5, "Session Focus réussie", false), 0);
        }
      },

      // --- PHASE 3: GOALS, PROJECTS, HABITS ---

      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: uuid.v4() as string,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ goals: [...(state.goals || []), newGoal] }));
      },

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: uuid.v4() as string,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        set((state) => ({ projects: [...(state.projects || []), newProject] }));
      },

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: uuid.v4() as string,
          streak: 0,
          bestStreak: 0,
          completionHistory: [],
          created_at: new Date().toISOString(),
        };
        set((state) => ({ habits: [...(state.habits || []), newHabit] }));
      },

      toggleHabit: (habitId) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          habits: (state.habits || []).map(habit => {
            if (habit.id !== habitId) return habit;
            
            const history = [...habit.completionHistory];
            const isCompletedToday = history.includes(today);
            let newStreak = habit.streak;
            let newBestStreak = habit.bestStreak;

            if (isCompletedToday) {
              // Uncheck
              const index = history.indexOf(today);
              history.splice(index, 1);
              // Simple calculation for streak decrement (could be improved)
              newStreak = Math.max(0, habit.streak - 1);
            } else {
              // Check
              history.push(today);
              // Calculate if it was consecutive
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (history.includes(yesterdayStr)) {
                newStreak += 1;
              } else {
                newStreak = 1;
              }
              newBestStreak = Math.max(habit.bestStreak, newStreak);
              
              // XP Habitude
              setTimeout(() => get().addXP(5, "Habitude validée", true), 0);
            }

            return { ...habit, completionHistory: history, streak: newStreak, bestStreak: newBestStreak };
          })
        }));
      },

      deleteGoal: (id) => set((state) => ({ goals: (state.goals || []).filter(g => g.id !== id) })),
      deleteProject: (id) => set((state) => ({ projects: (state.projects || []).filter(p => p.id !== id) })),
      deleteHabit: (id) => set((state) => ({ habits: (state.habits || []).filter(h => h.id !== id) })),

      // --- PHASE 4: COACH & ANTI-PROCRASTINATION ---

      postponeTask: (taskId, newDate) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const count = task.postponedCount || 0;
            return { ...task, date: newDate, postponedCount: count + 1 };
          })
        }));
      },

      addCoachAlert: (alert) => {
        const newAlert: CoachAlert = {
          ...alert,
          id: uuid.v4() as string,
          createdAt: new Date().toISOString(),
          isDismissed: false,
        };
        // On évite les doublons d'alertes non dismissées pour une même tâche/type
        set((state) => {
          const exists = state.coachAlerts?.find(a => !a.isDismissed && a.taskId === alert.taskId && a.type === alert.type);
          if (exists) return state;
          return { coachAlerts: [...(state.coachAlerts || []), newAlert] };
        });
      },

      dismissCoachAlert: (alertId) => {
        set((state) => ({
          coachAlerts: (state.coachAlerts || []).map(a => 
            a.id === alertId ? { ...a, isDismissed: true } : a
          )
        }));
      },

      // --- PHASE 5: GAMIFICATION ---

      addXP: (amount, reason, isMicroTask = false) => {
        const { gamificationEngine } = require('@/utils/gamificationEngine');
        
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          let { dailyXpEarned, lastXpDate } = state.gameStats;
          
          if (lastXpDate !== today) {
            dailyXpEarned = 0;
            lastXpDate = today;
          }

          if (isMicroTask && !gamificationEngine.canEarnDailyXp(dailyXpEarned, amount)) {
            return state; // Plafond atteint
          }

          const newXp = state.xp + amount;
          const { level: newLevel } = gamificationEngine.calculateLevel(newXp);
          
          if (newLevel > state.level) {
            Toast.show({
              type: 'success',
              text1: `Niveau Supérieur ! 🎉`,
              text2: `Vous avez atteint le niveau ${newLevel}`,
              position: 'top'
            });
          }

          // On retourne le nouveau state (qui déclenchera potentiellement des badges via un useEffect ou manuellement)
          return {
            xp: newXp,
            level: newLevel,
            gameStats: {
              ...state.gameStats,
              lastXpDate,
              dailyXpEarned: isMicroTask ? dailyXpEarned + amount : dailyXpEarned
            }
          };
        });

        // Vérification des badges
        setTimeout(() => {
          const state = get();
          const { gamificationEngine } = require('@/utils/gamificationEngine');
          const unlocked = gamificationEngine.checkBadges(state.badges, state.gameStats, state.tasks, state.habits, state.projects);
          if (unlocked.length > 0) {
            set({ badges: [...state.badges, ...unlocked] });
          }
        }, 500);
      }

    }),
    {
      name: 'allplaning-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // Phase 6: Sauvegarde et Migration
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration exemple (si on passait de 0 à 1)
          persistedState.xp = persistedState.xp || 0;
        }
        return persistedState as TaskState;
      }
    }
  )
);
