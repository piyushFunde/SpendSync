import { useEffect } from 'react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatCompactCurrency, CHART_COLORS, getCategoryByLabel } from '../utils/constants';
import { generateFinancialStatementPdf } from '../utils/pdfExport';
import RequestError from '../components/RequestError';
import { TrendingUp, TrendingDown, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#091024]/95 border border-indigo-500/30 backdrop-blur-xl shadow-2xl text-xs space-y-2">
        <div className="font-mono text-slate-400 border-b border-white/10 pb-1 flex items-center justify-between gap-4">
          <span className="font-semibold text-white">{label}</span>
          <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Analytics</span>
        </div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
              <span className="text-slate-300 font-sans">{entry.name}:</span>
            </div>
            <span className={`font-bold ${entry.name === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(entry.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const { dashboard, fetchDashboard, transactions, isLoadingDashboard, dashboardError } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const expenseData = Object.entries(dashboard?.expenseByCategory || {})
    .map(([name, value]) => ({ name, value: parseFloat(value) }))
    .sort((a, b) => b.value - a.value);

  const incomeData = Object.entries(dashboard?.incomeByCategory || {})
    .map(([name, value]) => ({ name, value: parseFloat(value) }))
    .sort((a, b) => b.value - a.value);

  const monthlyData = dashboard?.monthlyData || [];
  const totalExpense = dashboard?.totalExpense || 0;
  const totalIncome = dashboard?.totalIncome || 0;
  const savingsRate = totalIncome > 0
    ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
    : 0;

  const avgMonthlyExpense = monthlyData.length > 0
    ? monthlyData.reduce((s, m) => s + parseFloat(m.expense || 0), 0) / monthlyData.length
    : 0;

  const bestMonthObj = monthlyData.reduce((best, m) => {
    const net = parseFloat(m.income || 0) - parseFloat(m.expense || 0);
    return net > (best.net ?? -Infinity) ? { month: m.month, net } : best;
  }, {});

  const handleExportPdf = () => {
    try {
      generateFinancialStatementPdf({
        user,
        transactions,
      });
      toast.success('PDF statement downloaded');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">Review income, expenses, and category totals from your transactions.</p>
        </div>

        <button
          onClick={handleExportPdf}
          className="btn-secondary btn-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileText size={14} />
          <span>Export statement</span>
        </button>
      </div>

      {dashboardError ? (
        <RequestError message={dashboardError} onRetry={fetchDashboard} isLoading={isLoadingDashboard} />
      ) : !dashboard && isLoadingDashboard ? (
        <div className="cyber-card loading-panel" role="status">Loading your analytics…</div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card balance">
          <div className="flex items-center justify-between">
            <span className="stat-label">Net savings rate</span>
          </div>
          <div className="mt-3">
            <div className="stat-value">{savingsRate}%</div>
            <div className="stat-caption">Net income as a share of recorded income</div>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="flex items-center justify-between">
            <span className="stat-label">Average monthly expenses</span>
          </div>
          <div className="mt-3">
            <div className="stat-value">{formatCurrency(avgMonthlyExpense, currency)}</div>
            <div className="stat-caption">
              {monthlyData.length
                ? `Average across ${monthlyData.length} ${monthlyData.length === 1 ? 'month' : 'months'} shown`
                : 'No monthly activity available'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total income</span>
          </div>
          <div className="mt-3">
            <div className="stat-value">{formatCurrency(totalIncome, currency)}</div>
            <div className="stat-caption">Across recorded income</div>
          </div>
        </div>

        <div className="stat-card income">
          <div className="flex items-center justify-between">
            <span className="stat-label">Highest net month</span>
          </div>
          <div className="mt-3">
            <div className="stat-value">{bestMonthObj.month || '—'}</div>
            <div className="stat-caption">From the monthly activity shown</div>
          </div>
        </div>
      </div>

      <div className="cyber-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-white text-base">Income and expenses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly activity for the last six months</p>
          </div>
        </div>

        <div className="w-full h-72" aria-busy={isLoadingDashboard}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="analyticsIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="analyticsExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatCompactCurrency(v, currency)} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsIncome)" dot={{ r: 4, fill: '#10b981' }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsExpense)" dot={{ r: 4, fill: '#f43f5e' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side by side horizontal category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outflow Breakdown */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown size={15} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Outflow by Category</h3>
              <p className="text-xs text-slate-400">Recorded expense totals by category</p>
            </div>
          </div>

          {expenseData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                    {expenseData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">No expense records available</div>
          )}
        </div>

        {/* Inflow Breakdown */}
        <div className="cyber-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Income by category</h3>
              <p className="text-xs text-slate-400">Recorded income totals by category</p>
            </div>
          </div>

          {incomeData.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Bar dataKey="value" name="Amount" fill="#10b981" radius={[0, 6, 6, 0]}>
                    {incomeData.map((_, i) => (
                      <Cell key={i} fill={['#10b981', '#34d399', '#6ee7b7', '#06b6d4', '#818cf8'][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">No income records available</div>
          )}
        </div>
      </div>

      {/* Spending Breakdown Leaderboard */}
      {expenseData.length > 0 && (
        <div className="cyber-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Expense breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Share of recorded expense totals</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {formatCurrency(totalExpense, currency)}</span>
          </div>

          <div className="space-y-4">
            {expenseData.slice(0, 8).map((item, i) => {
              const cat = getCategoryByLabel(item.name);
              const pct = totalExpense > 0 ? (item.value / parseFloat(totalExpense)) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1.5 p-2 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-slate-200 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-xs bg-white/5 px-2 py-0.5 rounded-full">{pct.toFixed(1)}%</span>
                      <span className="text-white font-bold">{formatCurrency(item.value, currency)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: CHART_COLORS[i % CHART_COLORS.length],
                        boxShadow: `0 0 10px ${CHART_COLORS[i % CHART_COLORS.length]}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
