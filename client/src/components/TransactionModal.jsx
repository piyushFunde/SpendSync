import { useState } from 'react';
import { X } from 'lucide-react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '../utils/constants';
import toast from 'react-hot-toast';

const createInitialForm = (transaction = null) => ({
  type: transaction?.type || 'EXPENSE',
  category: transaction?.category || EXPENSE_CATEGORIES[0].label,
  amount: transaction?.amount ?? '',
  description: transaction?.description || '',
  notes: transaction?.notes || '',
  date: transaction?.date || new Date().toISOString().split('T')[0],
  recurring: transaction?.recurring || false,
  recurringFrequency: transaction?.recurringFrequency || 'MONTHLY',
});

const TransactionDialog = ({ onClose, onSuccess, editTransaction = null }) => {
  const [form, setForm] = useState(() => createInitialForm(editTransaction));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTransaction, updateTransaction } = useTransactionStore();
  const currencyCode = useAuthStore((state) => state.user?.currency || 'USD');
  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const currencySymbol = CURRENCIES.find((currency) => currency.code === currencyCode)?.symbol || '$';

  const validate = () => {
    const nextErrors = {};
    if (!form.category) nextErrors.category = 'Category is required';
    if (!form.amount || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      nextErrors.amount = 'Enter a valid amount';
    }
    if (!form.date) nextErrors.date = 'Date is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = {
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
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
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="modal-overlay transaction-modal-overlay"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        <header className="transaction-modal-header">
          <h2 id="transaction-modal-title">
            {editTransaction ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <X size={15} />
          </button>
        </header>

        <div className="transaction-modal-type" role="group" aria-label="Transaction type">
          {['EXPENSE', 'INCOME'].map((type) => (
            <button
              type="button"
              key={type}
              className={form.type === type ? 'selected' : ''}
              aria-pressed={form.type === type}
              onClick={() => setForm({
                ...form,
                type,
                category: type === 'INCOME' ? INCOME_CATEGORIES[0].label : EXPENSE_CATEGORIES[0].label,
              })}
            >
              {type === 'EXPENSE' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>

        <form className="transaction-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount-input">Amount ({currencyCode})</label>
            <div className="transaction-modal-amount">
              <span>{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                id="amount-input"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {errors.amount && <p className="form-error">{errors.amount}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description-input">Description</label>
            <input
              type="text"
              id="description-input"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="e.g. Groceries"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category-select">Category</label>
            <select
              id="category-select"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="form-select"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          <details className="transaction-modal-extra">
            <summary>More details</summary>
            <div className="form-group">
              <label htmlFor="date-input">Date</label>
              <input
                type="date"
                id="date-input"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                className="form-input"
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="notes-input">Notes</label>
              <input
                type="text"
                id="notes-input"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="form-input"
              />
            </div>
            <label className="transaction-recurring-toggle">
              <input
                type="checkbox"
                checked={form.recurring}
                onChange={(event) => setForm({ ...form, recurring: event.target.checked })}
              />
              <span>Recurring transaction</span>
              {form.recurring && (
                <select
                  value={form.recurringFrequency}
                  onChange={(event) => setForm({ ...form, recurringFrequency: event.target.value })}
                  aria-label="Recurring frequency"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              )}
            </label>
          </details>

          <footer className="transaction-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving…'
                : editTransaction
                  ? 'Save changes'
                  : 'Save transaction'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

const TransactionModal = ({ isOpen, ...props }) => (
  isOpen
    ? <TransactionDialog key={props.editTransaction?.id || 'new-transaction'} {...props} />
    : null
);

export default TransactionModal;
