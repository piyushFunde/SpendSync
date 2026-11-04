import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/client';

const getAuthErrorMessage = (err, fallback) => (
  err?.response?.data?.message || err?.message || fallback
);

const useAuthStore = create(
  persist(
    (set) => ({
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
          const error = getAuthErrorMessage(err, 'Login failed');
          set({ error, isLoading: false });
          return { success: false, error };
        }
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
          const error = getAuthErrorMessage(err, 'Registration failed');
          set({ error, isLoading: false });
          return { success: false, error };
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
      version: 1,
      migrate: (state) => {
        localStorage.removeItem('spendsync_vault_users');

        const hasLegacySession = state?.user?.isLocalVault
          || state?.user?.isDemo
          || state?.token === 'demo-spendsync-token-jwt'
          || state?.token?.startsWith('vault-jwt-');

        if (hasLegacySession) {
          localStorage.removeItem('token');
          return {
            user: null,
            token: null,
            isAuthenticated: false,
          };
        }

        return state;
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
