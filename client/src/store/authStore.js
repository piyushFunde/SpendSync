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

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem('spendsync_vault_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem('spendsync_vault_users', JSON.stringify(users));
  } catch (e) {}
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
              isLocalVault: false,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          // If server is unreachable (502, 503, 504, or network error), fallback to local vault
          const isServerUnreachable = !err.response || [500, 502, 503, 504].includes(err.response.status);

          if (isServerUnreachable) {
            const users = getLocalUsers();
            const localUser = users.find(
              (u) => u.email?.toLowerCase() === credentials.email?.toLowerCase()
            );

            if (localUser) {
              if (localUser.password && localUser.password !== credentials.password) {
                set({ error: 'Invalid password for this vault account', isLoading: false });
                return { success: false, error: 'Invalid password for this vault account' };
              }

              const token = `vault-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
              localStorage.setItem('token', token);

              set({
                user: {
                  id: localUser.id,
                  name: localUser.name,
                  email: localUser.email,
                  avatarColor: localUser.avatarColor || '#10b981',
                  currency: localUser.currency || 'USD',
                  isLocalVault: true,
                },
                token,
                isAuthenticated: true,
                isLoading: false,
              });

              return { success: true };
            }

            // If user previously logged in or wants instant vault session with their email
            const fallbackUser = {
              id: `vault-user-${Date.now()}`,
              name: credentials.email.split('@')[0],
              email: credentials.email,
              avatarColor: '#6366f1',
              currency: 'USD',
              isLocalVault: true,
            };

            const token = `vault-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            localStorage.setItem('token', token);

            set({
              user: fallbackUser,
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

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
              isLocalVault: false,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          // If server is unreachable (502, 503, 504, or network error), seamlessly create local vault account
          const isServerUnreachable = !err.response || [500, 502, 503, 504].includes(err.response.status);

          if (isServerUnreachable) {
            const users = getLocalUsers();
            const existing = users.find((u) => u.email?.toLowerCase() === userData.email?.toLowerCase());
            if (existing) {
              set({ error: 'An account with this email already exists in your vault.', isLoading: false });
              return { success: false, error: 'An account with this email already exists in your vault.' };
            }

            const localUser = {
              id: `vault-user-${Date.now()}`,
              name: userData.name,
              email: userData.email,
              currency: userData.currency || 'USD',
              password: userData.password,
              avatarColor: '#10b981',
              isLocalVault: true,
              createdAt: new Date().toISOString(),
            };

            users.push(localUser);
            saveLocalUsers(users);

            const token = `vault-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            localStorage.setItem('token', token);

            set({
              user: {
                id: localUser.id,
                name: localUser.name,
                email: localUser.email,
                avatarColor: localUser.avatarColor,
                currency: localUser.currency,
                isLocalVault: true,
              },
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          const msg = err.response?.data?.message || err.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      updateUserPreferences: (prefs) => {
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...prefs } : null;
          // Also persist in local users if present
          if (updatedUser?.isLocalVault) {
            const users = getLocalUsers().map((u) => (u.id === updatedUser.id ? { ...u, ...prefs } : u));
            saveLocalUsers(users);
          }
          return { user: updatedUser };
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
