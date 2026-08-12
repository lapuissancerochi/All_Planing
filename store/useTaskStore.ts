import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  reminder?: boolean;
  quadrant: Quadrant;
  status: TaskStatus;
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  
  // Statistiques journalières (Dashboard)
  focusSessionsCompletedToday: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
  lastActiveDate: string;
  
  // Statistiques Globales (Profil)
  totalTasksCompleted: number;
  totalTasksCreated: number;
  streakDays: number;
  
  // Profil
  monthlyGoal: string;
  setMonthlyGoal: (goal: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;
  changeTaskQuadrant: (id: string, quadrant: Quadrant) => void;
  incrementFocusSessions: () => void;
  checkAndResetDailyStats: () => void;
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
      
      setMonthlyGoal: (goal: string) => set({ monthlyGoal: goal }),
      
      checkAndResetDailyStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = get().lastActiveDate;
        if (lastActive !== today) {
          // Increment streak if it was yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutive = lastActive === yesterday.toISOString().split('T')[0];
          
          set((state) => ({
            focusSessionsCompletedToday: 0,
            tasksCompletedToday: 0,
            tasksCreatedToday: 0,
            lastActiveDate: today,
            streakDays: isConsecutive ? state.streakDays + 1 : 1,
          }));
        }
      },

      addTask: (task) => {
        get().checkAndResetDailyStats();
        const newTask = {
          ...task,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
          tasksCreatedToday: state.tasksCreatedToday + 1,
          totalTasksCreated: state.totalTasksCreated + 1,
        }));
      },
      
      updateTask: (id, updatedTask) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? { ...task, ...updatedTask } : task
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      })),

      changeTaskStatus: (id, status) => {
        get().checkAndResetDailyStats();
        set((state) => {
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
          
          return {
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, status } : task
            ),
            tasksCompletedToday,
            totalTasksCompleted,
          };
        });
      },

      changeTaskQuadrant: (id, quadrant) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? { ...task, quadrant } : task
        )
      })),

      incrementFocusSessions: () => {
        get().checkAndResetDailyStats();
        set((state) => ({ 
          focusSessionsCompletedToday: state.focusSessionsCompletedToday + 1 
        }));
      }
    }),
    {
      name: 'allplaning-task-storage', 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
