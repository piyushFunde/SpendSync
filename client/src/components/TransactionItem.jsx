import { useState } from 'react';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { getCategoryByLabel, formatCurrency, formatRelativeDate, formatDate } from '../utils/constants';
import TransactionModal from './TransactionModal';
import toast from 'react-hot-toast';

// Distinctive modern color palette matching the sleek letter badge design
const getLetterColor = (initial, isIncome, categoryColor) => {
  if (isIncome) return '#22c55e'; // Vibrant green (e.g. Monthly salary)
  const map = {
    G: '#2dd4bf', // Teal (e.g. Groceries)
    D: '#38bdf8', // Sky/Cyan (e.g. Dinner out)
    M: '#f59e0b', // Amber/Gold (e.g. Metro pass)
    C: '#c084fc', // Purple (e.g. Concert tickets)
    T: '#38bdf8', // Blue (Transport)
    H: '#818cf8', // Indigo (Housing)
    U: '#a78bfa', // Violet (Utilities)
    E: '#ec4899', // Pink (Entertainment)
    F: '#f59e0b', // Amber (Food)
    S: '#10b981', // Green (Salary/Savings)
    B: '#fb923c', // Orange (Bills)
    P: '#f43f5e', // Rose (Personal)
  };
  return map[initial] || categoryColor || '#38bdf8';
};

const TransactionItem = ({ transaction, variant = 'default' }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteTransaction, fetchDashboard, fetchTransactions } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency || 'USD';

  const cat = getCategoryByLabel(transaction.category);
  const isIncome = transaction.type === 'INCOME';

  const title = transaction.description || transaction.category || 'Transaction';
  const initial = title.trim().charAt(0).toUpperCase();
  const letterColor = getLetterColor(initial, isIncome, cat.color);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete ${title}?`)) return;
    setDeleting(true);
    const result = await deleteTransaction(transaction.id);
    if (result.success) {
      toast.success('Transaction deleted');
      fetchDashboard();
      fetchTransactions();
    } else {
      toast.error(result.error);
      setDeleting(false);
    }
  };

  // 1. Compact variant (used for "Recent activity" on Dashboard - matches Image 2)
  if (variant === 'compact') {
    const activityDate = transaction.date
      ? new Date(`${transaction.date}T00:00:00`).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      : '';

    return (
      <>
        <div
          onClick={() => setEditOpen(true)}
          className="activity-item"
          title="Edit transaction"
        >
          <div className="activity-item-main">
            <span
              className="activity-item-icon"
              style={{
                backgroundColor: `${letterColor}14`,
                borderColor: `${letterColor}30`,
                color: letterColor,
              }}
            >
              {initial}
            </span>
            <span className="activity-item-copy">
              <span className="activity-item-title">{title}</span>
              <span className="activity-item-meta">{cat.label} · {activityDate}</span>
            </span>
          </div>
          <span className={`activity-item-amount ${isIncome ? 'income' : ''}`}>
            {isIncome ? `+${formatCurrency(transaction.amount, currency)}` : `-${formatCurrency(transaction.amount, currency)}`}
          </span>
        </div>
        <TransactionModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            fetchDashboard();
            fetchTransactions();
          }}
          editTransaction={transaction}
        />
      </>
    );
  }

  // 2. Ledger variant (used on Transactions table / list)
  if (variant === 'ledger') {
    const activityDate = transaction.date
      ? new Date(`${transaction.date}T00:00:00`).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
      : '';

    return (
      <>
        <div
          onClick={() => setEditOpen(true)}
          className="transaction-item transaction-ledger-item group"
        >
          <div className="transaction-ledger-main">
            <span
              className="transaction-ledger-icon"
              style={{
                backgroundColor: `${letterColor}14`,
                borderColor: `${letterColor}30`,
                color: letterColor,
              }}
            >
              {initial}
            </span>
            <span className="transaction-ledger-copy">
              <span className="transaction-ledger-title">{title}</span>
              <span className="transaction-ledger-meta">{cat.label} · {activityDate}</span>
            </span>
          </div>
          <div className="transaction-ledger-actions">
            <span className={`transaction-ledger-amount ${isIncome ? 'income' : ''}`}>
              {isIncome ? `+${formatCurrency(transaction.amount, currency)}` : `-${formatCurrency(transaction.amount, currency)}`}
            </span>
            <span className="transaction-ledger-buttons">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditOpen(true);
                }}
                aria-label="Edit transaction"
                title="Edit transaction"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete transaction"
                title="Delete transaction"
              >
                {deleting ? <span className="spinner w-3 h-3" /> : <Trash2 size={12} />}
              </button>
            </span>
          </div>
        </div>
        <TransactionModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            fetchDashboard();
            fetchTransactions();
          }}
          editTransaction={transaction}
        />
      </>
    );
  }

  // 3. Default variant
  return (
    <>
      <div
        onClick={() => setEditOpen(true)}
        className="transaction-item group flex items-center justify-between gap-3 p-3.5 hover:bg-white/[0.035] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-indigo-500/25"
      >
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-inner border"
            style={{
              backgroundColor: `${letterColor}14`,
              borderColor: `${letterColor}30`,
              color: letterColor,
            }}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm truncate group-hover:text-indigo-200 transition-colors">
                {title}
              </span>
              {transaction.recurring && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-slate-300 border border-white/10">
                  <RefreshCw size={10} />
                  Recurring
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="text-slate-300">{cat.label}</span>
              <span>·</span>
              <span className="text-slate-500">{formatRelativeDate(transaction.date)} ({formatDate(transaction.date)})</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Quick Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div
              className={`font-mono font-bold text-sm sm:text-base flex items-center gap-1 justify-end ${
                isIncome ? 'text-emerald-400' : 'text-slate-100'
              }`}
            >
              <span>{isIncome ? `+${formatCurrency(transaction.amount, currency)}` : `-${formatCurrency(transaction.amount, currency)}`}</span>
            </div>
          </div>

          {/* Action buttons (revealed on hover) */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Edit Transaction"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Delete Transaction"
            >
              {deleting ? <span className="spinner w-3 h-3" /> : <Trash2 size={13} />}
            </button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          fetchDashboard();
          fetchTransactions();
        }}
        editTransaction={transaction}
      />
    </>
  );
};

export default TransactionItem;
