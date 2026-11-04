import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/client';

const isOfflineOrServerUnavailable = (err) => {
  if (!err) return false;
  const status = err?.response?.status;
  // 502 Bad Gateway (Vite proxy can't reach port 8080), 503, 504, or no response (network down)
  return status === 502 || status === 503 || status === 504 || status === 404 || !err.response;
};

const getAuthErrorMessage = (err, fallback) => (
  err?.response?.data?.message || err?.message || fallback
);

// Storage helper for local vault accounts
const getVaultUsers = () => {
  try {
    const raw = localStorage.getItem('spendsync_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveVaultUsers = (users) => {
  try {
    localStorage.setItem('spendsync_users', JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save vault users', err);
  }
};

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
        const emailLower = credentials.email?.toLowerCase().trim();

        // 1. Try real backend first (Spring Boot + MongoDB)
        try {
          const { data } = await authApi.login({
            email: emailLower,
            password: credentials.password,
          });
          localStorage.setItem('token', data.token);
          set({
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              avatarColor: data.avatarColor || '#10b981',
              currency: data.currency || 'USD',
              isLocalVault: false,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          // If server is offline / 502, seamlessly check local vault accounts
          if (isOfflineOrServerUnavailable(err)) {
            const users = getVaultUsers();
            const matched = users.find(
              (u) => u.email === emailLower && u.password === credentials.password
            );

            if (matched) {
              const token = `vault-jwt-${matched.id}`;
              localStorage.setItem('token', token);
              set({
                user: {
                  id: matched.id,
                  name: matched.name,
                  email: matched.email,
                  avatarColor: matched.avatarColor || '#10b981',
                  currency: matched.currency || 'USD',
                  isLocalVault: true,
                },
                token,
                isAuthenticated: true,
                isLoading: false,
              });
              return { success: true, isVault: true };
            }

            const emailExists = users.some((u) => u.email === emailLower);
            const error = emailExists
              ? 'Invalid password for this account.'
              : 'Account not found. Please click "Create an account" to get started.';

            set({ error, isLoading: false });
            return { success: false, error };
          }

          const error = getAuthErrorMessage(err, 'Login failed. Please check your credentials.');
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        const emailLower = userData.email?.toLowerCase().trim();

        // 1. Try real backend first (Spring Boot + MongoDB)
        try {
          const { data } = await authApi.register({
            name: userData.name?.trim(),
            email: emailLower,
            password: userData.password,
            currency: userData.currency || 'USD',
          });
          localStorage.setItem('token', data.token);
          set({
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              avatarColor: data.avatarColor || '#10b981',
              currency: data.currency || 'USD',
              isLocalVault: false,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          // If server is offline / 502, seamlessly provision local account
          if (isOfflineOrServerUnavailable(err)) {
            const users = getVaultUsers();
            if (users.some((u) => u.email === emailLower)) {
              const error = 'Email is already registered. Please sign in instead.';
              set({ error, isLoading: false });
              return { success: false, error };
            }

            const newUser = {
              id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: userData.name?.trim() || 'User',
              email: emailLower,
              password: userData.password,
              currency: userData.currency || 'USD',
              avatarColor: '#10b981',
              createdAt: new Date().toISOString(),
              isLocalVault: true,
            };

            users.push(newUser);
            saveVaultUsers(users);

            // Clean start: ensure this new user has empty transactions (NO DEMO DATA)
            localStorage.setItem(`spendsync_tx_${newUser.id}`, JSON.stringify([]));

            const token = `vault-jwt-${newUser.id}`;
            localStorage.setItem('token', token);
            set({
              user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                avatarColor: newUser.avatarColor,
                currency: newUser.currency,
                isLocalVault: true,
              },
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, isVault: true };
          }

          const error = getAuthErrorMessage(err, 'Registration failed. Please try again.');
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      updateUserPreferences: (prefs) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, ...prefs };
          if (state.user.isLocalVault) {
            const users = getVaultUsers();
            const idx = users.findIndex((u) => u.id === state.user.id);
            if (idx !== -1) {
              users[idx] = { ...users[idx], ...prefs };
              saveVaultUsers(users);
            }
          }
          return { user: updated };
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'spendsync-auth',
      version: 2,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
