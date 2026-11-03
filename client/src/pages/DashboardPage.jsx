import { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, ArrowLeftRight,
  BarChart2, LineChart as LineIcon, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import TransactionItem from '../components/TransactionItem';
import RequestError from '../components/RequestError';
import { formatCurrency, formatCompactCurrency, CHART_COLORS } from '../utils/constants';

// High-tech Custom Tooltip
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3.5 rounded-2xl bg-[#091024]/95 border border-indigo-500/30 backdrop-blur-xl shadow-2xl text-xs space-y-2">
        <div className="font-mono text-slate-400 border-b border-white/10 pb-1.5 flex items-center justify-between gap-4">
          <span className="font-semibold text-white">{label}</span>
          <span className="text-[10px] text-indigo-400 font-bold uppercase">Statement</span>
        </div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-5 font-mono">
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

// Donut Center Tooltip
const PieTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 rounded-xl bg-[#091024]/95 border border-indigo-500/30 backdrop-blur-xl shadow-xl text-xs">
        <p className="font-bold text-white mb-0.5">{data.name}</p>
        <p className="text-indigo-300 font-mono font-semibold">{formatCurrency(data.value, currency)}</p>
        <p className="text-[11px] text-slate-400 mt-1">{data.payload?.percent?.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'
  const [currentDate] = useState(() => new Date());
  const { dashboard, fetchDashboard, isLoadingDashboard, dashboardError } = useTransactionStore();
  const user = useAuthStore((s) => s.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const greeting = () => {
    const h = currentDate.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalIncome = dashboard?.totalIncome || 0;
  const totalExpense = dashboard?.totalExpense || 0;
  const balance = dashboard?.balance || 0;
  const transactionCount = dashboard?.transactionCount || 0;

  const pieData = dashboard
    ? Object.entries(dashboard.expenseByCategory || {})
        .map(([name, value]) => ({ name, value: parseFloat(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    : [];

  const totalPie = pieData.reduce((s, d) => s + d.value, 0);
  const pieWithPercent = pieData.map((d) => ({
    ...d,
    percent: totalPie > 0 ? (d.value / totalPie) * 100 : 0,
  }));

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">{currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="page-description">Here’s a summary of your recorded finances.</p>
        </div>
      </div>

      {dashboardError ? (
        <RequestError message={dashboardError} onRetry={fetchDashboard} isLoading={isLoadingDashboard} />
      ) : !dashboard && isLoadingDashboard ? (
        <div className="cyber-card loading-panel" role="status">Loading your overview…</div>
      ) : (
        <>
      <div className="stats-grid">
        <div className="stat-card balance group">
          <div className="flex items-center justify-between">
            <span className="stat-label">Current balance</span>
            <div className="stat-icon stat-icon-balance">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="stat-value">
              {formatCurrency(balance, currency)}
            </div>
            <div className="stat-caption">Income minus expenses across your records</div>
          </div>
        </div>

        <div className="stat-card income group">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total income</span>
            <div className="stat-icon stat-icon-income">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="stat-value text-emerald-300">{formatCurrency(totalIncome, currency)}</div>
            <div className="stat-caption">Across all recorded income</div>
          </div>
        </div>

        <div className="stat-card expense group">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total expenses</span>
            <div className="stat-icon stat-icon-expense">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="stat-value text-rose-300">{formatCurrency(totalExpense, currency)}</div>
            <div className="stat-caption">Across all recorded expenses</div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <span className="stat-label">Transactions</span>
            <div className="stat-icon stat-icon-balance">
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="stat-value">{transactionCount}</div>
            <div className="stat-caption">Entries in your transaction history</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Chart 1: Cash Flow Trends */}
        <div className="cyber-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Income and expenses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly activity for the last six months</p>
            </div>
            {/* Toggle Bar vs Smooth Flow */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg text-xs transition-all ${chartType === 'bar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Bar Chart View"
              >
                <BarChart2 size={14} />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-lg text-xs transition-all ${chartType === 'area' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Smooth Flow Area View"
              >
                <LineIcon size={14} />
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={dashboard?.monthlyData || []} barCategoryGap="28%">
                  <defs>
                    <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatCompactCurrency(v, currency)} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="income" fill="url(#incomeBar)" name="Income" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="url(#expenseBar)" name="Expense" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={dashboard?.monthlyData || []}>
                  <defs>
                    <linearGradient id="flowIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="flowExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => formatCompactCurrency(v, currency)} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#flowIncome)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#flowExpense)" name="Expense" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Donut Breakdown */}
        <div className="cyber-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-base">Expenses by category</h3>
              <p className="text-xs text-slate-400 mt-0.5">Share of recorded expenses</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white/5 text-slate-300">
              {pieData.length} {pieData.length === 1 ? 'category' : 'categories'}
            </span>
          </div>

          {pieWithPercent.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
              <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieWithPercent}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      dataKey="value"
                      strokeWidth={3}
                      stroke="#091024"
                    >
                      {pieWithPercent.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip currency={currency} />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center hole info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Total</span>
                  <span className="text-xs font-bold text-white font-mono">{formatCurrency(totalExpense, currency)}</span>
                </div>
              </div>

              {/* Category rows */}
              <div className="flex-1 space-y-2.5 w-full min-w-0">
                {pieWithPercent.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-300 truncate font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                      <span className="text-slate-400 text-[11px]">{formatCurrency(entry.value, currency)}</span>
                      <span className="font-bold text-white">{entry.percent.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <BarChart2 size={32} className="mb-2 text-slate-600" />
              <p className="text-sm font-medium">No expenses logged</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Ledger Feed */}
      <div className="cyber-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Recent transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your latest recorded activity</p>
          </div>
          <Link to="/transactions" className="btn-secondary btn-sm flex items-center gap-1">
            <span>View All ({transactionCount})</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {dashboard?.recentTransactions?.length > 0 ? (
            dashboard.recentTransactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              <ArrowLeftRight size={32} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}

    </div>
  );
};

export default DashboardPage;
