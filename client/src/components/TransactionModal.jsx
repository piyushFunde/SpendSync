import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  type: 'EXPENSE',
  category: '',
  amount: '',
  description: '',
  notes: '',
  date: new Date().toISOString().split('T')[0],
  recurring: false,
  recurringFrequency: '',
};

const TransactionModal = ({ isOpen, onClose, onSuccess, editTransaction = null }) => {
  const [form, setForm] = useState(
    editTransaction
      ? {
          type: editTransaction.type,
          category: editTransaction.category,
          amount: editTransaction.amount,
          description: editTransaction.description || '',
          notes: editTransaction.notes || '',
          date: editTransaction.date,
          recurring: editTransaction.recurring || false,
          recurringFrequency: editTransaction.recurringFrequency || '',
        }
      : INITIAL_FORM
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTransaction, updateTransaction } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currencyCode = user?.currency || 'USD';
  const currencySymbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol || '$';

  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Category is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPreset = (val) => {
    const current = parseFloat(form.amount) || 0;
    setForm({ ...form, amount: (current + val).toFixed(2) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      type: form.type,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description,
      notes: form.notes,
      date: form.date,
      recurring: form.recurring,
      recurringFrequency: form.recurring ? form.recurringFrequency : null,
    };

    const result = editTransaction
      ? await updateTransaction(editTransaction.id, payload)
      : await addTransaction(payload);

    if (result.success) {
      toast.success(editTransaction ? 'Transaction updated' : 'Transaction added');
      onSuccess?.();
      onClose();
      setForm(INITIAL_FORM);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <h2 className="text-xl font-extrabold text-white">
                {editTransaction ? 'Edit transaction' : 'Add transaction'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">Enter the details for this transaction.</p>
          </div>
          <button onClick={onClose} className="btn-icon p-2" id="close-transaction-modal">
            <X size={16} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-white/5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'EXPENSE', category: '' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all ${
              form.type === 'EXPENSE'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown size={15} />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, type: 'INCOME', category: '' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all ${
              form.type === 'INCOME'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={15} />
            <span>Income</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input with Quick Presets */}
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label text-[11px]">Amount ({currencyCode})</label>
              {/* Quick Amount Add Pills */}
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-indigo-300 border border-white/5 transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className={`form-input pl-9 text-lg font-mono font-bold text-white ${errors.amount ? 'error' : ''}`}
                id="amount-input"
                autoFocus
              />
            </div>
            {errors.amount && <p className="form-error">{errors.amount}</p>}
          </div>

          {/* Category Grid */}
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label text-[11px]">Select Category</label>
              {form.category && (
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">{form.category}</span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 p-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.label })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all border ${
                    form.category === cat.label || form.category === cat.id
                      ? 'border-indigo-500 bg-indigo-500/20 shadow-md shadow-indigo-500/20'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                  }`}
                  id={`category-${cat.id}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[11px] text-slate-300 truncate w-full font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label text-[11px]">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`form-input ${errors.date ? 'error' : ''}`}
                id="date-input"
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>

            <div className="form-group">
              <label className="form-label text-[11px]">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Blue Bottle Coffee"
                className="form-input"
                id="description-input"
              />
            </div>
          </div>

          {/* Recurring Transaction Toggle */}
          <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.recurring}
                  onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                  className="sr-only peer"
                  id="recurring-toggle"
                />
                <div className="w-9 h-5 bg-white/10 peer-checked:bg-indigo-600 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow" />
              </div>
              <span className="text-xs text-slate-300 font-medium">Mark as recurring</span>
            </label>

            {form.recurring && (
              <select
                value={form.recurringFrequency || 'MONTHLY'}
                onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value })}
                className="form-select text-xs py-1 px-2.5 w-auto"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 text-xs py-2.5"
              id="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
              id="submit-transaction-btn"
            >
              {isSubmitting ? (
                <span className="spinner" />
              ) : (
                <>
                  <Plus size={14} />
                  <span>{editTransaction ? 'Save changes' : 'Add transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
