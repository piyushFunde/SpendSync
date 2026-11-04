import { create } from 'zustand';
import { transactionsApi } from '../api/client';

const removeLegacySampleTransactions = () => {
  try {
    const saved = localStorage.getItem('spendsync_transactions');
    if (!saved) return;

    const transactions = JSON.parse(saved);
    if (!Array.isArray(transactions)) return;

    const remaining = transactions.filter(
      (transaction) => !/^tx-(?:[1-9]|1[0-2])$/.test(String(transaction.id))
    );
    if (remaining.length !== transactions.length) {
      localStorage.setItem('spendsync_transactions', JSON.stringify(remaining));
    }
  } catch (err) {
    console.error('Could not remove legacy sample transactions from local storage.', err);
  }
};

removeLegacySampleTransactions();

const getRequestErrorMessage = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.status) return `${fallback} (HTTP ${err.response.status})`;
  if (err?.request) return `${fallback} Check your connection and try again.`;
  return err?.message || fallback;
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

    try {
      const params = {};
      if (activeFilters.type) params.type = activeFilters.type;
      if (activeFilters.category) params.category = activeFilters.category;
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;

      const { data } = await transactionsApi.getAll(params);
      set({ transactions: data, isLoadingTransactions: false });
    } catch (err) {
      set({
        isLoadingTransactions: false,
        transactionsError: getRequestErrorMessage(err, 'Could not load transactions.'),
      });
    }
  },

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, dashboardError: null });
    try {
      const { data } = await transactionsApi.getDashboard();
      set({ dashboard: data, isLoadingDashboard: false });
    } catch (err) {
      set({
        dashboard: null,
        isLoadingDashboard: false,
        dashboardError: getRequestErrorMessage(err, 'Could not load your financial overview.'),
      });
    }
  },

  addTransaction: async (transactionData) => {
    try {
      const { data } = await transactionsApi.create(transactionData);
      set((state) => ({
        transactions: [data, ...state.transactions],
        dashboard: null,
      }));
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not save this transaction.'),
      };
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const { data } = await transactionsApi.update(id, transactionData);
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? data : t)),
        dashboard: null,
      }));
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not update this transaction.'),
      };
    }
  },

  deleteTransaction: async (id) => {
    try {
      await transactionsApi.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        dashboard: null,
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: getRequestErrorMessage(err, 'Could not delete this transaction.'),
      };
    }
  },

  exportCsv: async ({ type = '', sourceTransactions } = {}) => {
    set({ isExporting: true });
    try {
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
    } catch {
      const { transactions, transactionsError } = get();
      if (transactionsError) {
        set({ isExporting: false });
        return { success: false, error: transactionsError };
      }

      try {
        const exportTransactions = (sourceTransactions ?? transactions)
          .filter((transaction) => !type || transaction.type === type);
        const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const headers = ['date', 'description', 'category', 'type', 'amount'];
        const rows = exportTransactions.map((transaction) => [
          quote(transaction.date),
          quote(transaction.description || transaction.category),
          quote(transaction.category),
          quote(String(transaction.type || 'EXPENSE').toLowerCase()),
          Number(transaction.amount || 0).toFixed(2),
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
        return { success: true, usedLocalExport: true };
      } catch (err) {
        set({ isExporting: false });
        return {
          success: false,
          error: getRequestErrorMessage(err, 'Could not export transactions.'),
        };
      }
    }
  },
}));

export default useTransactionStore;
