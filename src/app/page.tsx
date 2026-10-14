'use client';

import { useState, useMemo } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { SummaryData } from '@/types/budget';
import SummaryCards from '@/components/dashboard/SummaryCards';
import AllocationChart from '@/components/dashboard/AllocationChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CashflowTrendChart from '@/components/dashboard/CashflowTrendChart';
import FinancialHealthAdvisor from '@/components/dashboard/FinancialHealthAdvisor';
import { Calendar } from 'lucide-react';

export default function Home() {
  const { transactions, isLoading } = useBudget();

  // Extract available periods (months) from existing transactions
  const availablePeriods = useMemo(() => {
    const periodSet = new Set<string>();
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    periodSet.add(currentMonthKey);

    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        periodSet.add(t.date.slice(0, 7));
      }
    });

    const sorted = Array.from(periodSet).sort().reverse();
    return sorted.map(periodKey => {
      const [year, month] = periodKey.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return {
        value: periodKey,
        label: periodKey === currentMonthKey ? `Bulan Ini (${label})` : label
      };
    });
  }, [transactions]);

  // Default to the first available period (latest month or current month)
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    return currentMonthKey;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter transactions based on selected period
  const filteredTransactions = selectedPeriod === 'all'
    ? transactions
    : transactions.filter(t => t.date.startsWith(selectedPeriod));

  // --- Derived Data Calculations ---
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Tabungan yang dipotong dari kas/gaji periode ini:
  const savingsDeductedFromSalary = filteredTransactions
    .filter(t => {
      if (t.type === 'savings_in') {
        // Jangan potong jika sumber dana adalah Saldo Simpanan Yang Sudah Ada atau Pemasukan Ekstra
        const isExternal = t.status === 'Saldo Simpanan Yang Sudah Ada' || t.status === 'Pemasukan Ekstra / Bonus' || t.status === 'saldo_luar';
        return !isExternal;
      }
      return false;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Tabungan yang ditarik kembali ke kas operasional (menambah kembali sisa saldo):
  const savingsReturnedToSalary = filteredTransactions
    .filter(t => {
      if (t.type === 'savings_out') {
        // Hanya tambah ke kas jika tujuannya dikembalikan ke kas operasional
        return t.status !== 'Dibelanjakan untuk Tujuan Ini';
      }
      return false;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total alokasi tabungan pada periode ini (untuk tampilan kartu & chart):
  const totalSavingsIn = filteredTransactions
    .filter(t => t.type === 'savings_in' || ((t.category === 'Tabungan' || t.category === 'Tujuan Tabungan' || t.category === 'Uang Darurat') && t.type !== 'savings_out'))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavingsOut = filteredTransactions
    .filter(t => t.type === 'savings_out')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavings = Math.max(0, totalSavingsIn - totalSavingsOut);

  // Sisa Saldo Kas Operasional:
  const remainingBalance = totalIncome - totalExpense - savingsDeductedFromSalary + savingsReturnedToSalary;
  
  const status = remainingBalance >= 0 ? 'AMAN' : 'OVERBUDGET';

  const summaryData: SummaryData = {
    totalIncome,
    totalExpense,
    totalSavings,
    remainingBalance,
    status
  };

  // --- Chart Data ---
  const chartData = [
    { 
      name: 'Pengeluaran Wajib', 
      value: filteredTransactions.filter(t => t.category === 'Pengeluaran Wajib').reduce((s, t) => s + Number(t.amount), 0),
      color: '#f43f5e' // rose-500
    },
    { 
      name: 'Tagihan Online', 
      value: filteredTransactions.filter(t => t.category === 'Tagihan Online').reduce((s, t) => s + Number(t.amount), 0),
      color: '#f97316' // orange-500
    },
    { 
      name: 'Transfer Pribadi', 
      value: filteredTransactions.filter(t => t.category === 'Transfer Pribadi').reduce((s, t) => s + Number(t.amount), 0),
      color: '#eab308' // yellow-500
    },
    { 
      name: 'Opsional & Admin', 
      value: filteredTransactions.filter(t => t.category === 'Opsional' || t.category === 'Admin').reduce((s, t) => s + Number(t.amount), 0),
      color: '#a855f7' // purple-500
    },
    { 
      name: 'Tabungan & Tujuan', 
      value: totalSavings,
      color: '#3b82f6' // blue-500
    },
    { 
      name: 'Sisa Saldo', 
      value: remainingBalance > 0 ? remainingBalance : 0,
      color: '#10b981' // emerald-500
    },
  ];

  return (
    <div className="space-y-6">
      {/* Month Period Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Periode Anggaran
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Lihat arus kas & sisa saldo berdasarkan bulan aktif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold px-3 py-2 border shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {availablePeriods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
            <option value="all">Semua Waktu (Akumulatif)</option>
          </select>
        </div>
      </div>

      <SummaryCards data={summaryData} />
      
      {/* AI Financial Health Advisor */}
      <FinancialHealthAdvisor />

      {/* Comparative Cashflow Trend Chart */}
      <CashflowTrendChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[420px]">
          <AllocationChart data={chartData} />
        </div>
        <div className="lg:col-span-2 h-[420px]">
          <RecentTransactions transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  );
}

