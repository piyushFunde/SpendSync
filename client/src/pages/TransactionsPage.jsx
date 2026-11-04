import { useEffect, useState, useMemo } from 'react';
import {
  Search, X, SlidersHorizontal, FileText, Plus
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import TransactionItem from '../components/TransactionItem';
import RequestError from '../components/RequestError';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatCurrency } from '../utils/constants';
import { generateFinancialStatementPdf } from '../utils/pdfExport';
import toast from 'react-hot-toast';

const TransactionsPage = () => {
  const { openTransactionModal } = useOutletContext();
  const [search, setSearch] = useState('');
  const [currentMonth] = useState(() => new Date().toLocaleDateString(undefined, { month: 'long' }));
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc
  const [quickType, setQuickType] = useState('ALL'); // ALL, INCOME, EXPENSE

  const { transactions, filters, setFilters, resetFilters, fetchTransactions, isLoadingTransactions, transactionsError } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchTransactions();
  }, [filters, fetchTransactions]);

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  // Filtered & Sorted transactions
  const processedTransactions = useMemo(() => {
    let list = transactions.filter((t) => {
      if (quickType !== 'ALL' && t.type !== quickType) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.category?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, search, quickType, sortBy]);

  // Dynamic calculations for the current filtered view
  const viewInflow = processedTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const viewOutflow = processedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const viewNet = viewInflow - viewOutflow;

  const handleExportPdf = () => {
    try {
      generateFinancialStatementPdf({
        user,
        transactions: processedTransactions,
      });
      toast.success('PDF statement downloaded');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate;

  return (
    <div className="workspace-page transactions-page">
      {/* Top Header */}
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">YOUR RECORDS</span>
          <h1 className="page-title">Transactions</h1>
          <p className="page-description">
            {currentMonth} · Search and manage your transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="btn-secondary btn-sm flex items-center gap-1.5"
            id="export-pdf-btn"
            title="Download PDF Financial Statement"
          >
            <FileText size={13} className="text-indigo-400" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={openTransactionModal}
            className="workspace-button workspace-button-primary"
          >
            <Plus size={15} /> Add transaction
          </button>
        </div>
      </div>

      {transactionsError && (
        <RequestError message={transactionsError} onRetry={fetchTransactions} isLoading={isLoadingTransactions} />
      )}

      <section className="transactions-panel">
      <div className="transaction-summary">
        <div className="summary-item">
          <div className="summary-label">Transactions shown</div>
          <div className="summary-value">{processedTransactions.length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Income</div>
          <div className="summary-value summary-income">{formatCurrency(viewInflow, currency)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Expenses</div>
          <div className="summary-value summary-expense">{formatCurrency(viewOutflow, currency)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Net</div>
          <div className={`summary-value ${viewNet >= 0 ? 'summary-net-positive' : 'summary-expense'}`}>
            {formatCurrency(viewNet, currency)}
          </div>
        </div>
      </div>

      {/* Search, Filter Pills & Sort Bar */}
      <div className="cyber-card transaction-controls p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category, amount..."
              className="form-input pl-10 pr-9 py-2.5 text-sm"
              id="search-transactions"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Type Pills */}
          <div className="transaction-type-tabs" aria-label="Filter by transaction type">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'INCOME', label: 'Income' },
              { id: 'EXPENSE', label: 'Expenses' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setQuickType(id)}
                className={`transaction-type-tab ${
                  quickType === id
                    ? 'active'
                    : ''
                }`}
                aria-pressed={quickType === id}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select py-2 text-xs font-medium w-auto min-w-[150px]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High → Low</option>
              <option value="amount-asc">Amount: Low → High</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary btn-sm px-3 ${hasActiveFilters ? 'border-indigo-500 text-indigo-300 bg-indigo-500/20' : ''}`}
              title="Advanced Date & Category Filters"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showFilters && (
          <div className="transaction-advanced-filters pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeInUp">
            <div>
              <label className="form-label text-[11px]">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ category: e.target.value })}
                className="form-select text-xs py-2 mt-1"
              >
                <option value="">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.label}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label text-[11px]">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                className="form-input text-xs py-2 mt-1"
              />
            </div>

            <div>
              <label className="form-label text-[11px]">End Date</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ endDate: e.target.value })}
                  className="form-input text-xs py-2 flex-1"
                />
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="btn-danger btn-sm text-xs px-2.5"
                    title="Reset Filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="transaction-sort-drawer">
              <label className="form-label text-[11px]" htmlFor="transaction-sort-drawer">Sort by</label>
              <select
                id="transaction-sort-drawer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select text-xs py-2 mt-1"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount: High → Low</option>
                <option value="amount-asc">Amount: Low → High</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="cyber-card transaction-list">
        {isLoadingTransactions ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : processedTransactions.length > 0 ? (
          <div className="divide-y divide-white/5">
            {processedTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} variant="ledger" />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <Search size={36} className="mx-auto mb-3 text-slate-600" />
            <p className="text-base font-semibold text-slate-300">No transactions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try different search terms or adjust your filters.
            </p>
            {(search || hasActiveFilters || quickType !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setQuickType('ALL');
                  resetFilters();
                }}
                className="btn-secondary btn-sm mt-4 inline-flex"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>
      </section>

    </div>
  );
};

export default TransactionsPage;
