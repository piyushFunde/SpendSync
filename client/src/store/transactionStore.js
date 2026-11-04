import { create } from 'zustand';
import { transactionsApi } from '../api/client';
import useAuthStore from './authStore';

const isOfflineOr502 = (err) => {
  if (!err) return false;
  const status = err?.response?.status;
  return status === 502 || status === 503 || status === 504 || status === 404 || !err.response;
};

const getRequestErrorMessage = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.status) return `${fallback} (HTTP ${err.response.status})`;
  if (err?.request) return `${fallback} Check your connection and try again.`;
  return err?.message || fallback;
};

// Vault helpers
const isVaultMode = () => {
  const user = useAuthStore.getState().user;
  const token = localStorage.getItem('token');
  return Boolean(user?.isLocalVault || !token || token.startsWith('vault-jwt-'));
};

const getUserStorageKey = () => {
  const user = useAuthStore.getState().user;
  return user?.id ? `spendsync_tx_${user.id}` : 'spendsync_transactions';
};

const getLocalTransactions = () => {
  try {
    const raw = localStorage.getItem(getUserStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalTransactions = (txs) => {
  try {
    localStorage.setItem(getUserStorageKey(), JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
};

// Compute summary stats matching Spring Boot's DashboardSummaryResponse
const computeDashboardSummary = (transactions = []) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const cat = t.category || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (parseFloat(t.amount) || 0);
    });

  const incomeByCategory = {};
  transactions
    .filter((t) => t.type === 'INCOME')
    .forEach((t) => {
      const cat = t.category || 'Other';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + (parseFloat(t.amount) || 0);
    });

  // Last 6 months data in "MMM yyyy" format (e.g., "Nov 2026")
  const monthlyData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    const yearMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const monthTxs = transactions.filter((t) => String(t.date || '').startsWith(yearMonthStr));
    const income = monthTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expense = monthTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    monthlyData.push({
      month: monthLabel,
      income,
      expense,
    });
  }

  const recentTransactions = [...transactions]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: transactions.length,
    expenseByCategory,
    incomeByCategory,
    monthlyData,
    recentTransactions,
  };
};

const useTransactionStore = create((set, get) => ({
  transactions: [],
  dashboard: null,
  isLoadingTransactions: false,
  isLoadingDashboard: false,
  isExporting: false,
  transactionsError: null,
  dashboardError: null,
  filters: {
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({
      filters: { type: '', category: '', startDate: '', endDate: '' },
    });
  },

  fetchTransactions: async ({ ignoreFilters = false } = {}) => {
    set({ isLoadingTransactions: true, transactionsError: null });
    const { filters } = get();
    const activeFilters = ignoreFilters
      ? { type: '', category: '', startDate: '', endDate: '' }
      : filters;

    if (isVaultMode()) {
      let list = getLocalTransactions();
      if (activeFilters.type) list = list.filter((t) => t.type === activeFilters.type);
      if (activeFilters.category) list = list.filter((t) => t.category === activeFilters.category);
      if (activeFilters.startDate) list = list.filter((t) => t.date >= activeFilters.startDate);
      if (activeFilters.endDate) list = list.filter((t) => t.date <= activeFilters.endDate);
      list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      set({ transactions: list, isLoadingTransactions: false });
      return;
    }

    try {
      const params = {};
      if (activeFilters.type) params.type = activeFilters.type;
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;

      const { data } = await transactionsApi.getAll(params);
      set({ transactions: data, isLoadingTransactions: false });
    } catch (err) {
      if (isOfflineOr502(err)) {
        let list = getLocalTransactions();
        set({ transactions: list, isLoadingTransactions: false });
      } else {
        set({
          isLoadingTransactions: false,
          transactionsError: getRequestErrorMessage(err, 'Could not load transactions.'),
        });
      }
    }
  },

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, dashboardError: null });

    if (isVaultMode()) {
      const txs = getLocalTransactions();
      set({ dashboard: computeDashboardSummary(txs), isLoadingDashboard: false });
      return;
    }

    try {
      const { data } = await transactionsApi.getDashboard();
      set({ dashboard: data, isLoadingDashboard: false });
    } catch (err) {
      if (isOfflineOr502(err)) {
        const txs = getLocalTransactions();
        set({ dashboard: computeDashboardSummary(txs), isLoadingDashboard: false });
      } else {
        set({
          dashboard: null,
          isLoadingDashboard: false,
          dashboardError: getRequestErrorMessage(err, 'Could not load your financial overview.'),
        });
      }
    }
  },

  addTransaction: async (transactionData) => {
    if (isVaultMode()) {
      const newTx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...transactionData,
        createdAt: new Date().toISOString(),
      };
      const list = [newTx, ...getLocalTransactions()];
      saveLocalTransactions(list);
      set({
        transactions: list,
        dashboard: computeDashboardSummary(list),
      });
      return { success: true, data: newTx };
    }

    try {
      const { data } = await transactionsApi.create(transactionData);
      set((state) => ({
        transactions: [data, ...state.transactions],
        dashboard: null,
      }));
      return { success: true, data };
    } catch (err) {
      if (isOfflineOr502(err)) {
        const newTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          ...transactionData,
          createdAt: new Date().toISOString(),
        };
        const list = [newTx, ...getLocalTransactions()];
        saveLocalTransactions(list);
        set({
          transactions: list,
          dashboard: computeDashboardSummary(list),
        });
        return { success: true, data: newTx };
      }
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not save this transaction.'),
      };
    }
  },

  updateTransaction: async (id, transactionData) => {
    if (isVaultMode()) {
      const list = getLocalTransactions().map((t) => (t.id === id ? { ...t, ...transactionData } : t));
      saveLocalTransactions(list);
      set({
        transactions: list,
        dashboard: computeDashboardSummary(list),
      });
      return { success: true, data: { id, ...transactionData } };
    }

    try {
      const { data } = await transactionsApi.update(id, transactionData);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? data : t)),
        dashboard: null,
      }));
      return { success: true, data };
    } catch (err) {
      if (isOfflineOr502(err)) {
        const list = getLocalTransactions().map((t) => (t.id === id ? { ...t, ...transactionData } : t));
        saveLocalTransactions(list);
        set({
          transactions: list,
          dashboard: computeDashboardSummary(list),
        });
        return { success: true, data: { id, ...transactionData } };
      }
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not update this transaction.'),
      };
    }
  },

  deleteTransaction: async (id) => {
    if (isVaultMode()) {
      const list = getLocalTransactions().filter((t) => t.id !== id);
      saveLocalTransactions(list);
      set({
        transactions: list,
        dashboard: computeDashboardSummary(list),
      });
      return { success: true };
    }

    try {
      await transactionsApi.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        dashboard: null,
      }));
      return { success: true };
    } catch (err) {
      if (isOfflineOr502(err)) {
        const list = getLocalTransactions().filter((t) => t.id !== id);
        saveLocalTransactions(list);
        set({
          transactions: list,
          dashboard: computeDashboardSummary(list),
        });
        return { success: true };
      }
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not delete this transaction.'),
      };
    }
  },

  exportCsv: async ({ type = '', sourceTransactions } = {}) => {
    set({ isExporting: true });
    try {
      if (!isVaultMode()) {
        const params = {};
        if (type) params.type = type;
        const response = await transactionsApi.exportCsv(params);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        set({ isExporting: false });
        return { success: true };
      }
    } catch (err) {
      if (!isOfflineOr502(err)) {
        set({ isExporting: false });
        return { success: false, error: getRequestErrorMessage(err, 'CSV Export failed.') };
      }
    }

    // Local CSV generation
    try {
      const currentList = sourceTransactions ?? (isVaultMode() ? getLocalTransactions() : get().transactions);
      const filtered = currentList.filter((t) => !type || t.type === type);
      const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
      const rows = filtered.map((t) => [
        quote(t.date),
        quote(t.description || t.category),
        quote(t.category),
        quote(String(t.type || 'EXPENSE').toLowerCase()),
        Number(t.amount || 0).toFixed(2),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      set({ isExporting: false });
      return { success: true };
    } catch (err) {
      set({ isExporting: false });
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not export transactions.'),
      };
    }
  },
}));

export default useTransactionStore;
