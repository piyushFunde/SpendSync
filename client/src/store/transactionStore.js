import { create } from 'zustand';
import { transactionsApi } from '../api/client';
import useAuthStore from './authStore';

const INITIAL_DEMO_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'INCOME',
    category: 'Salary',
    amount: 5200.00,
    description: 'Monthly Tech Lead Salary',
    notes: 'Direct deposit',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'MONTHLY',
  },
  {
    id: 'tx-2',
    type: 'INCOME',
    category: 'Freelance',
    amount: 1450.00,
    description: 'UI/UX Design Sprint for Client',
    notes: 'Stripe payout',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
  {
    id: 'tx-3',
    type: 'INCOME',
    category: 'Investments',
    amount: 320.00,
    description: 'Q3 S&P 500 Dividend Payout',
    notes: 'Vanguard brokerage',
    date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'QUARTERLY',
  },
  {
    id: 'tx-4',
    type: 'EXPENSE',
    category: 'Housing & Rent',
    amount: 1650.00,
    description: 'Apartment Monthly Rent',
    notes: 'Wire transfer',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'MONTHLY',
  },
  {
    id: 'tx-5',
    type: 'EXPENSE',
    category: 'Food & Dining',
    amount: 215.40,
    description: 'Organic Groceries at Whole Foods',
    notes: 'Card payment',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
  {
    id: 'tx-6',
    type: 'EXPENSE',
    category: 'Utilities',
    amount: 125.80,
    description: 'Power & Gas Utility Bill',
    notes: 'Auto-debit',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'MONTHLY',
  },
  {
    id: 'tx-7',
    type: 'EXPENSE',
    category: 'Subscriptions',
    amount: 29.98,
    description: 'Netflix 4K & Spotify Family',
    notes: 'Entertainment subs',
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'MONTHLY',
  },
  {
    id: 'tx-8',
    type: 'EXPENSE',
    category: 'Shopping',
    amount: 149.99,
    description: 'Mechanical Keyboard & Desk Mat',
    notes: 'Workspace upgrade',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
  {
    id: 'tx-9',
    type: 'EXPENSE',
    category: 'Fitness',
    amount: 85.00,
    description: 'Gym & Bouldering Membership',
    notes: 'Monthly pass',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    recurring: true,
    recurringFrequency: 'MONTHLY',
  },
  {
    id: 'tx-10',
    type: 'EXPENSE',
    category: 'Food & Dining',
    amount: 118.50,
    description: 'Weekend Japanese Sushi Dinner',
    notes: 'Dining out with team',
    date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
  {
    id: 'tx-11',
    type: 'EXPENSE',
    category: 'Transport',
    amount: 54.20,
    description: 'Shell Gas Station Fill-up',
    notes: 'Fuel',
    date: new Date(Date.now() - 18 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
  {
    id: 'tx-12',
    type: 'EXPENSE',
    category: 'Education',
    amount: 120.00,
    description: 'Cloud Architecture Masterclass',
    notes: 'Professional skill cert',
    date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    recurring: false,
  },
];

const calculateDashboardFromTransactions = (txList) => {
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory = {};
  const incomeByCategory = {};
  const monthTotals = new Map();

  txList.forEach((t) => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'INCOME') {
      totalIncome += amt;
      const cat = t.category || 'Other';
      incomeByCategory[cat] = (incomeByCategory[cat] || 0) + amt;
    } else {
      totalExpense += amt;
      const cat = t.category || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + amt;
    }

    const monthKey = String(t.date || '').slice(0, 7);
    if (monthKey.length === 7) {
      const month = monthTotals.get(monthKey) || { income: 0, expense: 0 };
      month[t.type === 'INCOME' ? 'income' : 'expense'] += amt;
      monthTotals.set(monthKey, month);
    }
  });

  const now = new Date();
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const totals = monthTotals.get(monthKey) || { income: 0, expense: 0 };
    monthlyData.push({
      month: d.toLocaleDateString(undefined, { month: 'short' }),
      income: Number(totals.income.toFixed(2)),
      expense: Number(totals.expense.toFixed(2)),
    });
  }

  const sortedRecent = [...txList].sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    balance: Number((totalIncome - totalExpense).toFixed(2)),
    transactionCount: txList.length,
    expenseByCategory,
    incomeByCategory,
    monthlyData,
    recentTransactions: sortedRecent.slice(0, 5),
  };
};

const getLocalDemoTransactions = () => {
  const saved = localStorage.getItem('spendsync_transactions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // parse error, fallback
    }
  }
  localStorage.setItem('spendsync_transactions', JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
  return INITIAL_DEMO_TRANSACTIONS;
};

const saveLocalDemoTransactions = (list) => {
  localStorage.setItem('spendsync_transactions', JSON.stringify(list));
};

const isFallbackNeeded = (err) => {
  const user = useAuthStore.getState().user;
  if (!user || user.isDemo || user.isLocalVault) return true;
  if (!err?.response || [500, 502, 503, 504].includes(err.response.status)) return true;
  return false;
};

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
      if (!isFallbackNeeded(err)) {
        set({
          isLoadingTransactions: false,
          transactionsError: getRequestErrorMessage(err, 'Could not load transactions.'),
        });
        return;
      }

      let localList = getLocalDemoTransactions();

      if (activeFilters.type) {
        localList = localList.filter((t) => t.type === activeFilters.type);
      }
      if (activeFilters.category) {
        localList = localList.filter((t) => t.category === activeFilters.category);
      }
      if (activeFilters.startDate) {
        localList = localList.filter((t) => t.date >= activeFilters.startDate);
      }
      if (activeFilters.endDate) {
        localList = localList.filter((t) => t.date <= activeFilters.endDate);
      }

      set({ transactions: localList, isLoadingTransactions: false });
    }
  },

  fetchDashboard: async () => {
    set({ isLoadingDashboard: true, dashboardError: null });
    try {
      const { data } = await transactionsApi.getDashboard();
      set({ dashboard: data, isLoadingDashboard: false });
    } catch (err) {
      if (!isFallbackNeeded(err)) {
        set({
          dashboard: null,
          isLoadingDashboard: false,
          dashboardError: getRequestErrorMessage(err, 'Could not load your financial overview.'),
        });
        return;
      }

      const localList = getLocalDemoTransactions();
      const calculated = calculateDashboardFromTransactions(localList);
      set({ dashboard: calculated, isLoadingDashboard: false });
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
      if (!isFallbackNeeded(err)) {
        const error = getRequestErrorMessage(err, 'Could not save this transaction.');
        return { success: false, error };
      }

      const newTx = {
        ...transactionData,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const allTx = [newTx, ...getLocalDemoTransactions()];
      saveLocalDemoTransactions(allTx);

      set((state) => ({
        transactions: [newTx, ...state.transactions],
        dashboard: calculateDashboardFromTransactions(allTx),
      }));
      return { success: true, data: newTx };
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
      if (!isFallbackNeeded(err)) {
        const error = getRequestErrorMessage(err, 'Could not update this transaction.');
        return { success: false, error };
      }

      const allTx = getLocalDemoTransactions().map((t) =>
        t.id === id ? { ...t, ...transactionData } : t
      );
      saveLocalDemoTransactions(allTx);

      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...transactionData } : t
        ),
        dashboard: calculateDashboardFromTransactions(allTx),
      }));
      return { success: true, data: { ...transactionData, id } };
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
      if (!isFallbackNeeded(err)) {
        const error = getRequestErrorMessage(err, 'Could not delete this transaction.');
        return { success: false, error };
      }

      const allTx = getLocalDemoTransactions().filter((t) => t.id !== id);
      saveLocalDemoTransactions(allTx);

      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        dashboard: calculateDashboardFromTransactions(allTx),
      }));
      return { success: true };
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
