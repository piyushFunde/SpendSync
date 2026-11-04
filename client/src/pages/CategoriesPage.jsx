import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTransactionStore from '../store/transactionStore';
import { formatCurrency, formatDate, getCategoryByLabel } from '../utils/constants';
import RequestError from '../components/RequestError';

const CATEGORY_COLORS = ['#9587ff', '#47d8c0', '#c5a6ff', '#f28fc2', '#f3bd35', '#70a5ff'];

const CategoriesPage = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedCategory, setSelectedCategory] = useState('');
  const {
    transactions,
    fetchTransactions,
    isLoadingTransactions,
    transactionsError,
  } = useTransactionStore();
  const currency = useAuthStore((state) => state.user?.currency || 'USD');

  useEffect(() => {
    fetchTransactions({ ignoreFilters: true });
  }, [fetchTransactions]);

  const monthDate = new Date(`${month}-01T00:00:00`);
  const monthLabel = Number.isNaN(monthDate.getTime())
    ? 'Selected month'
    : monthDate.toLocaleDateString(undefined, { month: 'long' });

  const { categories, totalSpent } = useMemo(() => {
    const expenses = transactions.filter(
      (transaction) =>
        transaction.type !== 'INCOME' &&
        String(transaction.date || '').slice(0, 7) === month
    );
    const totals = new Map();
    expenses.forEach((transaction) => {
      const name = transaction.category || 'Other';
      const current = totals.get(name) || { name, amount: 0, transactions: [] };
      current.amount += Number(transaction.amount) || 0;
      current.transactions.push(transaction);
      totals.set(name, current);
    });

    const sorted = [...totals.values()]
      .map((category, index) => ({
        ...category,
        color: getCategoryByLabel(category.name).color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        transactions: category.transactions.sort((a, b) => String(b.date).localeCompare(String(a.date))),
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      categories: sorted,
      totalSpent: expenses.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0),
    };
  }, [month, transactions]);

  const activeCategory = categories.find((category) => category.name === selectedCategory)
    || categories[0];

  const activeShare = activeCategory && totalSpent > 0
    ? (activeCategory.amount / totalSpent) * 100
    : 0;

  return (
    <div className="workspace-page categories-page">
      <header className="page-heading">
        <div>
          <span className="page-eyebrow">WHERE IT GOES</span>
          <h1 className="page-title">Categories</h1>
          <p className="page-description">
            {monthLabel} spending · {formatCurrency(totalSpent, currency)} total
          </p>
        </div>
        <label className="categories-month-picker">
          <span className="sr-only">Choose month</span>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </label>
      </header>

      {transactionsError ? (
        <RequestError
          message={transactionsError}
          onRetry={() => fetchTransactions({ ignoreFilters: true })}
          isLoading={isLoadingTransactions}
        />
      ) : isLoadingTransactions && transactions.length === 0 ? (
        <div className="workspace-card loading-panel" role="status">Loading your categories…</div>
      ) : (
        <div className="categories-layout">
          <section className="workspace-card category-overview">
            <div className="workspace-card-heading">
              <div>
                <h2>All categories</h2>
                <p>
                  {activeCategory
                    ? `${activeCategory.name} is ${Math.round(activeShare)}% of this month’s spending.`
                    : 'Spending by category for the selected month.'}
                </p>
              </div>
            </div>

            {categories.length ? (
              <div className="category-bars">
                {categories.map((category) => {
                  const share = totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;
                  return (
                    <button
                      type="button"
                      key={category.name}
                      className={`category-bar-row${category.name === activeCategory?.name ? ' active' : ''}`}
                      onClick={() => setSelectedCategory(category.name)}
                      aria-pressed={category.name === activeCategory?.name}
                    >
                      <span className="category-bar-label">
                        <span>{category.name}</span>
                        <strong>{formatCurrency(category.amount, currency)} · {Math.round(share)}%</strong>
                      </span>
                      <span className="category-bar-track">
                        <span
                          className="category-bar-fill"
                          style={{ width: `${share}%`, background: category.color }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="category-empty">
                No expenses recorded for {monthLabel}.
                <Link to="/transactions">View transactions</Link>
              </div>
            )}
          </section>

          {activeCategory && (
            <section className="workspace-card category-detail">
              <div className="category-detail-heading">
                <span className="category-color-dot" style={{ background: activeCategory.color }} />
                <h2>{activeCategory.name}</h2>
              </div>
              <div className="category-metrics">
                <article>
                  <span>Total spent</span>
                  <strong>{formatCurrency(activeCategory.amount, currency)}</strong>
                </article>
                <article>
                  <span>Share of spending</span>
                  <strong>{Math.round(activeShare)}%</strong>
                </article>
                <article>
                  <span>Transactions</span>
                  <strong>{activeCategory.transactions.length}</strong>
                </article>
              </div>

              <h3 className="category-transactions-heading">Transactions in this category</h3>
              <div className="category-transactions">
                {activeCategory.transactions.map((transaction) => (
                  <article className="category-transaction-row" key={transaction.id}>
                    <span className="category-transaction-icon">
                      {(transaction.description || activeCategory.name).slice(0, 1).toUpperCase()}
                    </span>
                    <div className="category-transaction-copy">
                      <strong>{transaction.description || activeCategory.name}</strong>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                    <strong className="category-transaction-amount">
                      −{formatCurrency(transaction.amount, currency)}
                    </strong>
                  </article>
                ))}
              </div>
              <Link to="/transactions" className="category-see-all">
                See all transactions <ArrowUpRight size={14} />
              </Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
