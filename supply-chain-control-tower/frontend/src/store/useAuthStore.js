import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: 'sct-auth-storage',
    }
  )
);

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'dark',
      toggleTheme: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'sct-theme-storage',
    }
  )
);
