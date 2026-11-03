import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/client';

const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@spendsync.io',
  avatarColor: '#6366f1',
  currency: 'USD',
  isDemo: true,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(credentials);
          localStorage.setItem('token', data.token);
          set({
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              avatarColor: data.avatarColor || '#6366f1',
              currency: data.currency || 'USD',
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || err.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      loginDemo: () => {
        localStorage.setItem('token', 'demo-spendsync-token-jwt');
        set({
          user: DEMO_USER,
          token: 'demo-spendsync-token-jwt',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.register(userData);
          localStorage.setItem('token', data.token);
          set({
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              avatarColor: data.avatarColor || '#6366f1',
              currency: data.currency || 'USD',
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || err.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      updateUserPreferences: (prefs) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...prefs } : null,
        }));
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'spendsync-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
