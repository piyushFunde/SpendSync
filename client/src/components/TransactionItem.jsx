import { useState } from 'react';
import { Pencil, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { getCategoryByLabel, formatCurrency, formatRelativeDate, formatDate } from '../utils/constants';
import TransactionModal from './TransactionModal';
import toast from 'react-hot-toast';

const TransactionItem = ({ transaction }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteTransaction, fetchDashboard, fetchTransactions } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency || 'USD';

  const cat = getCategoryByLabel(transaction.category);
  const isIncome = transaction.type === 'INCOME';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete ${transaction.description || transaction.category}?`)) return;
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

  return (
    <>
      <div
        onClick={() => setEditOpen(true)}
        className="transaction-item group flex items-center justify-between gap-3 p-3.5 hover:bg-white/[0.035] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-indigo-500/25"
      >
        {/* Left: Icon & Description */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner border"
            style={{
              background: `radial-gradient(circle, ${cat.color}25 0%, ${cat.color}10 100%)`,
              borderColor: `${cat.color}35`,
            }}
          >
            {cat.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate group-hover:text-indigo-200 transition-colors">
                {transaction.description || transaction.category}
              </span>
              {transaction.recurring && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-slate-300 border border-white/10">
                  <RefreshCw size={10} />
                  Recurring
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
              <span className="text-slate-300">{cat.label}</span>
              <span>•</span>
              <span className="text-slate-500">{formatRelativeDate(transaction.date)} ({formatDate(transaction.date)})</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Quick Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div
              className={`font-mono font-extrabold text-sm sm:text-base flex items-center gap-1 justify-end ${
                isIncome ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isIncome ? <ArrowUpRight size={14} className="stroke-[2.5]" /> : <ArrowDownRight size={14} className="stroke-[2.5]" />}
              <span>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}</span>
            </div>
            <span className={`text-[10px] font-medium ${isIncome ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
              {isIncome ? 'Income' : 'Expense'}
            </span>
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
