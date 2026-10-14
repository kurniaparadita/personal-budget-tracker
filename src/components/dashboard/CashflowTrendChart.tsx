'use client';

import { useState, useMemo } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, AreaChart as AreaChartIcon, Calendar, CalendarDays } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

type ViewPeriod = 'monthly' | 'current_month';
type ChartType = 'bar' | 'area';

interface DataPoint {
  label: string;
  fullDate: string;
  income: number;
  expense: number;
  netFlow: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, isPrivacy }: { active?: boolean; payload?: any[]; label?: string; isPrivacy?: boolean }) => {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === 'income')?.value || 0;
    const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
    const netFlow = income - expense;

    return (
      <div className="rounded-xl bg-white/95 dark:bg-zinc-900/95 p-4 shadow-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800 backdrop-blur-md min-w-[200px]">
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          {label}
        </p>
        
        <div className="space-y-1.5 text-xs">
          {/* Income */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Pemasukan
            </span>
            <span className={`font-bold text-emerald-600 dark:text-emerald-400 ${isPrivacy ? 'font-mono' : ''}`}>
              +{formatRupiah(income, isPrivacy)}
            </span>
          </div>

          {/* Expense */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              Pengeluaran
            </span>
            <span className={`font-bold text-rose-600 dark:text-rose-400 ${isPrivacy ? 'font-mono' : ''}`}>
              -{formatRupiah(expense, isPrivacy)}
            </span>
          </div>

          {/* Net Flow */}
          <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">Net Flow</span>
            <span className={`${netFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} ${isPrivacy ? 'font-mono' : ''}`}>
              {netFlow >= 0 ? '+' : '-'}{formatRupiah(Math.abs(netFlow), isPrivacy)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Compact Y-axis formatter (e.g. 1jt, 500rb, 0)
const formatYAxis = (num: number, isPrivacy: boolean): string => {
  if (isPrivacy) return '•••';
  if (num === 0) return '0';
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(0)}rb`;
  }
  return String(num);
};

export default function CashflowTrendChart() {
  const { transactions, isPrivacyMode, formatCurrency } = useBudget();
  const [period, setPeriod] = useState<ViewPeriod>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Generate chart data based on active period
  const chartData: DataPoint[] = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    if (period === 'monthly') {
      // Group by YYYY-MM
      const monthlyMap = new Map<string, { income: number; expense: number }>();

      transactions.forEach((tx) => {
        if (!tx.date) return;
        const monthKey = tx.date.substring(0, 7); // 'YYYY-MM'
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { income: 0, expense: 0 });
        }
        const current = monthlyMap.get(monthKey)!;
        if (tx.type === 'income') {
          current.income += Number(tx.amount);
        } else if (tx.type === 'expense') {
          current.expense += Number(tx.amount);
        }
      });

      // Sort chronological ascending
      const sortedKeys = Array.from(monthlyMap.keys()).sort();
      // Take up to the last 6-12 recorded months
      const recentKeys = sortedKeys.slice(-6);

      return recentKeys.map((key) => {
        const [yearStr, monthStr] = key.split('-');
        const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(dateObj);
        const data = monthlyMap.get(key)!;
        return {
          label,
          fullDate: key,
          income: data.income,
          expense: data.expense,
          netFlow: data.income - data.expense
        };
      });
    } else {
      // Current Month: group by days in the current or latest recorded month
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // If no transactions in this month, fallback to latest available month
      const monthsAvailable = Array.from(new Set(transactions.map(t => t.date?.substring(0, 7)).filter(Boolean))).sort();
      const targetMonthKey = monthsAvailable.includes(currentMonthKey)
        ? currentMonthKey
        : monthsAvailable[monthsAvailable.length - 1] || currentMonthKey;

      const dailyMap = new Map<string, { income: number; expense: number }>();
      
      // Filter transactions for this month
      transactions
        .filter(t => t.date && t.date.startsWith(targetMonthKey))
        .forEach(tx => {
          const dateKey = tx.date; // 'YYYY-MM-DD'
          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { income: 0, expense: 0 });
          }
          const current = dailyMap.get(dateKey)!;
          if (tx.type === 'income') {
            current.income += Number(tx.amount);
          } else if (tx.type === 'expense') {
            current.expense += Number(tx.amount);
          }
        });

      const sortedDates = Array.from(dailyMap.keys()).sort();

      return sortedDates.map((dateStr) => {
        const dateObj = new Date(dateStr);
        const label = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(dateObj);
        const data = dailyMap.get(dateStr)!;
        return {
          label,
          fullDate: dateStr,
          income: data.income,
          expense: data.expense,
          netFlow: data.income - data.expense
        };
      });
    }
  }, [transactions, period]);

  // Aggregate totals for the active view period
  const totalViewIncome = useMemo(() => chartData.reduce((acc, curr) => acc + curr.income, 0), [chartData]);
  const totalViewExpense = useMemo(() => chartData.reduce((acc, curr) => acc + curr.expense, 0), [chartData]);
  const netViewFlow = totalViewIncome - totalViewExpense;

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex flex-col space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Tren Arus Kas (Cash Flow)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Komparasi pergerakan pemasukan vs pengeluaran dari waktu ke waktu
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period Toggle */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
            <button
              onClick={() => setPeriod('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'monthly'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Bulanan
            </button>
            <button
              onClick={() => setPeriod('current_month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === 'current_month'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Bulan Ini
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Grafik Batang"
              aria-label="Bar Chart View"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Tampilan Grafik Area (Kurva)"
              aria-label="Area Chart View"
            >
              <AreaChartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Mini-Bar for the Selected Range */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 ring-1 ring-inset ring-emerald-500/20 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Total Pemasukan</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className={`text-lg font-bold tracking-tight text-emerald-700 dark:text-emerald-300 ${isPrivacyMode ? 'font-mono' : ''}`}>
            {formatCurrency(totalViewIncome)}
          </p>
        </div>

        <div className="rounded-xl bg-rose-500/5 dark:bg-rose-500/10 p-3.5 ring-1 ring-inset ring-rose-500/20 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Total Pengeluaran</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <p className={`text-lg font-bold tracking-tight text-rose-700 dark:text-rose-300 ${isPrivacyMode ? 'font-mono' : ''}`}>
            {formatCurrency(totalViewExpense)}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500/5 dark:bg-blue-500/10 p-3.5 ring-1 ring-inset ring-blue-500/20 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Net Arus Kas</span>
            {netViewFlow >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <p className={`text-lg font-bold tracking-tight ${netViewFlow >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-rose-700 dark:text-rose-300'} ${isPrivacyMode ? 'font-mono' : ''}`}>
            {netViewFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netViewFlow))}
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[320px] w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Belum ada data transaksi yang dapat divisualisasikan pada periode ini.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Catat transaksi baru untuk melihat tren komparatif pemasukan dan pengeluaran.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#71717a', fontSize: 11 }} 
                  tickFormatter={(v) => formatYAxis(v, isPrivacyMode)}
                />
                <Tooltip content={<CustomTooltip isPrivacy={isPrivacyMode} />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 ml-1 mr-3">
                      {value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  )}
                />
                <Bar 
                  dataKey="income" 
                  name="income" 
                  fill="#10b981" 
                  radius={[5, 5, 0, 0]} 
                  maxBarSize={32}
                />
                <Bar 
                  dataKey="expense" 
                  name="expense" 
                  fill="#f43f5e" 
                  radius={[5, 5, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800/80" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e4e4e7' }} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#71717a', fontSize: 11 }} 
                  tickFormatter={(v) => formatYAxis(v, isPrivacyMode)}
                />
                <Tooltip content={<CustomTooltip isPrivacy={isPrivacyMode} />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                  formatter={(value) => (
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 ml-1 mr-3">
                      {value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="income" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#incomeGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#expenseGrad)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
