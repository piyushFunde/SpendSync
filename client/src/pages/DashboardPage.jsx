import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import TransactionItem from '../components/TransactionItem';
import RequestError from '../components/RequestError';
import { formatCurrency } from '../utils/constants';

const DashboardPage = () => {
  const [rangeMonths, setRangeMonths] = useState(6);
  const { dashboard, fetchDashboard, isLoadingDashboard, dashboardError } = useTransactionStore();
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency || 'USD';
  const [currentDate] = useState(() => new Date());
  const currentMonth = currentDate.toLocaleDateString(undefined, { month: 'long' });
  const monthlyData = dashboard?.monthlyData || [];

  // Backend returns "Jan 2024" format (MMM yyyy via Java DateTimeFormatter)
  const currentMonthShort = currentDate.toLocaleString('en-US', { month: 'short' });
  const currentYear = currentDate.getFullYear();
  const currentMonthData = monthlyData.find(
    (m) => m.month === `${currentMonthShort} ${currentYear}` || m.month === currentMonthShort
  ) || monthlyData.at(-1) || { income: 0, expense: 0 };

  const chartData = monthlyData.slice(-rangeMonths);
  const maxAmount = Math.max(...chartData.flatMap((m) => [m.income, m.expense]), 1);
  const recentTransactions = dashboard?.recentTransactions || [];
  const savedThisMonth = currentMonthData.income - currentMonthData.expense;
  const savingsRate = currentMonthData.income > 0
    ? Math.max(0, Math.min(100, (savedThisMonth / currentMonthData.income) * 100))
    : 0;
  const spendingRate = currentMonthData.income > 0
    ? Math.max(0, Math.min(100, (currentMonthData.expense / currentMonthData.income) * 100))
    : 0;

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="workspace-page overview-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">WELCOME BACK</span>
          <h1 className="page-title">Your overview</h1>
          <p className="page-description">
            {currentMonth} · A clear view of your recorded finances
          </p>
        </div>
        <div className="page-heading-actions">
          <Link to="/transactions" className="workspace-button workspace-button-secondary">
            View transactions <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {dashboardError ? (
        <RequestError message={dashboardError} onRetry={fetchDashboard} isLoading={isLoadingDashboard} />
      ) : !dashboard && isLoadingDashboard ? (
        <div className="workspace-card loading-panel" role="status">Loading your overview…</div>
      ) : (
        <>
          <section className="overview-stats" aria-label="Monthly summary">
            <article className="workspace-card overview-stat overview-stat-balance">
              <span className="overview-stat-label">Total balance</span>
              <strong>{formatCurrency(dashboard?.balance || 0, currency)}</strong>
              <small>Across your records</small>
            </article>
            <article className="workspace-card overview-stat">
              <span className="overview-stat-label">Income</span>
              <strong className="text-income">{formatCurrency(currentMonthData.income, currency)}</strong>
              <small>This month</small>
            </article>
            <article className="workspace-card overview-stat">
              <span className="overview-stat-label">Expenses</span>
              <strong>{formatCurrency(-currentMonthData.expense, currency)}</strong>
              <small>This month</small>
            </article>
            <article className="workspace-card overview-stat">
              <span className="overview-stat-label">Net</span>
              <strong className={currentMonthData.income >= currentMonthData.expense ? 'text-income' : 'text-expense'}>
                {formatCurrency(currentMonthData.income - currentMonthData.expense, currency)}
              </strong>
              <small>Income minus expenses</small>
            </article>
          </section>

          <section className="overview-progress-grid" aria-label="Savings and spending progress">
            <article className="workspace-card progress-card">
              <span className="overview-stat-label">Savings this month</span>
              <strong>{formatCurrency(savedThisMonth, currency)}</strong>
              <div className="progress-track" role="progressbar" aria-label="Monthly savings share of income" aria-valuenow={Math.round(savingsRate)} aria-valuemin="0" aria-valuemax="100">
                <span className="progress-fill" style={{ width: `${savingsRate}%` }} />
              </div>
              <small>{Math.round(savingsRate)}% of this month&apos;s income saved</small>
            </article>
            <article className="workspace-card progress-card">
              <span className="overview-stat-label">Monthly spending</span>
              <strong>{formatCurrency(currentMonthData.expense, currency)} <small>of {formatCurrency(currentMonthData.income, currency)} income</small></strong>
              <div className="progress-track" role="progressbar" aria-label="Monthly spending share of income" aria-valuenow={Math.round(spendingRate)} aria-valuemin="0" aria-valuemax="100">
                <span className="progress-fill" style={{ width: `${spendingRate}%` }} />
              </div>
              <small>
                {savedThisMonth >= 0
                  ? `${formatCurrency(savedThisMonth, currency)} remaining after expenses`
                  : `Expenses exceed income by ${formatCurrency(-savedThisMonth, currency)}`}
              </small>
            </article>
          </section>

          <section className="overview-content-grid">
            <article className="workspace-card cashflow-card">
              <div className="workspace-card-heading">
                <div>
                  <h2>Cash flow</h2>
                  <p>{currentMonth} · Income and expenses</p>
                </div>
                <div className="range-toggle" aria-label="Chart range">
                  {[6, 12].map((months) => (
                    <button
                      type="button"
                      key={months}
                      disabled={monthlyData.length < months}
                      aria-pressed={rangeMonths === months}
                      onClick={() => setRangeMonths(months)}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
              </div>
              {chartData.length ? (
                <>
                  <div className="cashflow-chart" role="img" aria-label={`Income and expenses over the last ${chartData.length} months`}>
                    {chartData.map((m) => (
                      <div className="cashflow-month" key={m.month}>
                        <div className="cashflow-bars">
                          <span
                            className="cashflow-bar cashflow-income"
                            style={{ height: `${Math.max((m.income / maxAmount) * 100, m.income ? 4 : 0)}%` }}
                            title={`Income: ${formatCurrency(m.income, currency)}`}
                          />
                          <span
                            className="cashflow-bar cashflow-expense"
                            style={{ height: `${Math.max((m.expense / maxAmount) * 100, m.expense ? 4 : 0)}%` }}
                            title={`Expenses: ${formatCurrency(m.expense, currency)}`}
                          />
                        </div>
                        <span className="cashflow-month-label">{m.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cashflow-legend">
                    <span><i className="cashflow-legend-income" /> Income</span>
                    <span><i className="cashflow-legend-expense" /> Expenses</span>
                  </div>
                </>
              ) : (
                <div className="overview-empty">Add transactions to see your cash flow.</div>
              )}
            </article>

            <article className="workspace-card recent-activity-card">
              <div className="workspace-card-heading">
                <h2>Recent activity</h2>
                <Link to="/transactions">View all</Link>
              </div>
              {recentTransactions.length ? (
                <div className="recent-activity-list">
                  {recentTransactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} variant="compact" />
                  ))}
                </div>
              ) : (
                <div className="overview-empty">No activity yet. Add your first transaction.</div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
