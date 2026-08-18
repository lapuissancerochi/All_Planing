import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type TaskImportance = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  estimatedDuration?: number; // en minutes
  reminder?: boolean;
  importance: TaskImportance;
  status: TaskStatus;
  created_at?: string;
  // NOTE: 'quadrant' a été supprimé. Il est calculé dynamiquement par priorityEngine.
  // Pour la rétrocompatibilité temporaire des anciens JSON, on peut le garder en optionnel
  quadrant?: Quadrant; 
}

interface TaskState {
  tasks: Task[];
  
  // Statistiques
  focusSessionsCompletedToday: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  streakDays: number;
  monthlyGoal: string;
  
  // Actions
  setMonthlyGoal: (goal: string) => void;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;
  incrementFocusSessions: () => void;
  checkNewDay: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
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
        const wasDone = task?.status === 'done';
        const isDone = status === 'done';
        
        let tasksCompletedToday = state.tasksCompletedToday;
        let totalTasksCompleted = state.totalTasksCompleted;
        if (!wasDone && isDone) {
          tasksCompletedToday++;
          totalTasksCompleted++;
        } else if (wasDone && !isDone) {
          tasksCompletedToday--;
          totalTasksCompleted--;
        }
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, status } : task
          ),
          tasksCompletedToday,
          totalTasksCompleted,
        }));
      },

      incrementFocusSessions: () => {
        get().checkNewDay();
        set((state) => ({ 
          focusSessionsCompletedToday: state.focusSessionsCompletedToday + 1 
        }));
      }
    }),
    {
      name: 'allplaning-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
