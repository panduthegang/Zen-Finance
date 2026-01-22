import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, Transaction, Theme, User } from './types';

// App state interface - simplified for Firestore integration
interface AppState {
  // Data from Firestore (populated by listeners)
  transactions: Transaction[];
  categories: Category[];
  user: User | null;

  // Local preferences (stored in localStorage)
  theme: Theme;
  sidebarOpen: boolean;

  // Loading states
  isDataLoading: boolean;

  // Setters for Firestore listeners
  setTransactions: (transactions: Transaction[]) => void;
  setCategories: (categories: Category[]) => void;
  setUser: (user: User | null) => void;
  setDataLoading: (loading: boolean) => void;

  // Local preference actions
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Clear all data (on logout)
  clearData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state - empty, will be populated by Firestore listeners
      transactions: [],
      categories: [],
      user: null,

      theme: 'light',
      sidebarOpen: true,
      isDataLoading: true,

      // Setters for Firestore data
      setTransactions: (transactions) => set({ transactions }),
      setCategories: (categories) => set({ categories }),
      setUser: (user) => set({ user }),
      setDataLoading: (isDataLoading) => set({ isDataLoading }),

      // Local preference actions
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Clear all data on logout
      clearData: () => set({
        transactions: [],
        categories: [],
        user: null,
        isDataLoading: false,
      }),
    }),
    {
      name: 'zenbudget-preferences',
      // Only persist local preferences, not Firestore data
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);