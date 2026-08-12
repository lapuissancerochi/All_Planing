import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
  created_at?: string;
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
  fetchData: () => Promise<void>;
  setMonthlyGoal: (goal: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  changeTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  changeTaskQuadrant: (id: string, quadrant: Quadrant) => Promise<void>;
  incrementFocusSessions: () => Promise<void>;
  
  // Internals
  syncProfileStats: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  focusSessionsCompletedToday: 0,
  tasksCompletedToday: 0,
  tasksCreatedToday: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalTasksCompleted: 0,
  totalTasksCreated: 0,
  streakDays: 1,
  monthlyGoal: '',

  fetchData: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    // Fetch Tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', authData.user.id);
      
    if (tasksData && !tasksError) {
      set({ tasks: tasksData as Task[] });
    }

    // Fetch Profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileData && !profileError) {
      const today = new Date().toISOString().split('T')[0];
      let lastActive = profileData.last_active_date;
      let streak = profileData.streak_days;
      
      // Reset daily stats if it's a new day
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastActive === yesterday.toISOString().split('T')[0];
        
        streak = isConsecutive ? streak + 1 : 1;
        lastActive = today;
        
        set({
          focusSessionsCompletedToday: 0,
          tasksCompletedToday: 0,
          tasksCreatedToday: 0,
          streakDays: streak,
          lastActiveDate: lastActive,
        });
        
        await supabase.from('profiles').update({
          focus_sessions_today: 0,
          tasks_completed_today: 0,
          tasks_created_today: 0,
          streak_days: streak,
          last_active_date: lastActive,
        }).eq('id', authData.user.id);
      } else {
        set({
          focusSessionsCompletedToday: profileData.focus_sessions_today || 0,
          tasksCompletedToday: profileData.tasks_completed_today || 0,
          tasksCreatedToday: profileData.tasks_created_today || 0,
          streakDays: streak,
          lastActiveDate: lastActive,
          totalTasksCompleted: profileData.total_tasks_completed || 0,
          totalTasksCreated: profileData.total_tasks_created || 0,
          monthlyGoal: profileData.monthly_goal || '',
        });
      }
    }
  },

  syncProfileStats: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const state = get();
    await supabase.from('profiles').update({
      total_tasks_completed: state.totalTasksCompleted,
      total_tasks_created: state.totalTasksCreated,
      focus_sessions_today: state.focusSessionsCompletedToday,
      tasks_completed_today: state.tasksCompletedToday,
      tasks_created_today: state.tasksCreatedToday,
      streak_days: state.streakDays,
      monthly_goal: state.monthlyGoal,
    }).eq('id', authData.user.id);
  },

  setMonthlyGoal: async (goal: string) => {
    set({ monthlyGoal: goal });
    await get().syncProfileStats();
  },

  addTask: async (task) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const newTask = {
      ...task,
      user_id: authData.user.id,
    };

    // Mettre à jour la base de données
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (data && !error) {
      set((state) => ({
        tasks: [...state.tasks, data[0]],
        tasksCreatedToday: state.tasksCreatedToday + 1,
        totalTasksCreated: state.totalTasksCreated + 1,
      }));
      await get().syncProfileStats();
    }
  },

  updateTask: async (id, updatedTask) => {
    // Mettre à jour l'interface optimiste
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, ...updatedTask } : task
      )
    }));
    // Envoyer à Supabase en arrière-plan
    await supabase.from('tasks').update(updatedTask).eq('id', id);
  },

  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
    await supabase.from('tasks').delete().eq('id', id);
  },

  changeTaskStatus: async (id, status) => {
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

    await supabase.from('tasks').update({ status }).eq('id', id);
    await get().syncProfileStats();
  },

  changeTaskQuadrant: async (id, quadrant) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, quadrant } : task
      )
    }));
    await supabase.from('tasks').update({ quadrant }).eq('id', id);
  },

  incrementFocusSessions: async () => {
    set((state) => ({ 
      focusSessionsCompletedToday: state.focusSessionsCompletedToday + 1 
    }));
    await get().syncProfileStats();
  }
}));
