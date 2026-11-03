// Category definitions for income and expenses
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'housing', label: 'Housing & Rent', icon: '🏠', color: '#8b5cf6' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#6366f1' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', color: '#ef4444' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#f97316' },
  { id: 'education', label: 'Education', icon: '📚', color: '#14b8a6' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#06b6d4' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#a855f7' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️', color: '#64748b' },
  { id: 'personal', label: 'Personal Care', icon: '💄', color: '#f43f5e' },
  { id: 'fitness', label: 'Fitness', icon: '💪', color: '#22c55e' },
  { id: 'gifts', label: 'Gifts & Donations', icon: '🎁', color: '#d946ef' },
  { id: 'other_expense', label: 'Other', icon: '💸', color: '#94a3b8' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: '#10b981' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#06b6d4' },
  { id: 'business', label: 'Business', icon: '🏢', color: '#6366f1' },
  { id: 'investments', label: 'Investments', icon: '📈', color: '#f59e0b' },
  { id: 'rental', label: 'Rental Income', icon: '🏘️', color: '#8b5cf6' },
  { id: 'bonus', label: 'Bonus', icon: '🎉', color: '#ec4899' },
  { id: 'refund', label: 'Refund', icon: '↩️', color: '#14b8a6' },
  { id: 'gift', label: 'Gift Received', icon: '🎁', color: '#d946ef' },
  { id: 'other_income', label: 'Other', icon: '💰', color: '#94a3b8' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id) =>
  ALL_CATEGORIES.find((c) => c.id === id) || { id, label: id, icon: '💰', color: '#94a3b8' };

export const getCategoryByLabel = (label) =>
  ALL_CATEGORIES.find((c) => c.label === label || c.id === label)
  || { id: label, label, icon: '💰', color: '#94a3b8' };

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
];

export const getCurrencySymbol = (code) =>
  CURRENCIES.find((c) => c.code === code)?.symbol || code;

export const formatCurrency = (amount, currencyCode = 'USD') => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatCompactCurrency = (amount, currencyCode = 'USD') => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(dateStr);
};

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16',
  '#d946ef', '#06b6d4', '#a855f7', '#22c55e', '#f43f5e',
];

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
