'use client';

import { useBudget } from '@/context/BudgetContext';
import { SummaryData } from '@/types/budget';
import SummaryCards from '@/components/dashboard/SummaryCards';
import AllocationChart from '@/components/dashboard/AllocationChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function Home() {
  const { transactions, isLoading } = useBudget();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- Derived Data Calculations ---
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSavingsIn = transactions
    .filter(t => t.type === 'savings_in')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavingsOut = transactions
    .filter(t => t.type === 'savings_out')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavings = totalSavingsIn - totalSavingsOut;

  const remainingBalance = totalIncome - totalExpense - totalSavingsIn;
  
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
      value: transactions.filter(t => t.category === 'Pengeluaran Wajib').reduce((s, t) => s + Number(t.amount), 0),
      color: '#f43f5e' // rose-500
    },
    { 
      name: 'Tagihan Online', 
      value: transactions.filter(t => t.category === 'Tagihan Online').reduce((s, t) => s + Number(t.amount), 0),
      color: '#f97316' // orange-500
    },
    { 
      name: 'Transfer Pribadi', 
      value: transactions.filter(t => t.category === 'Transfer Pribadi').reduce((s, t) => s + Number(t.amount), 0),
      color: '#eab308' // yellow-500
    },
    { 
      name: 'Opsional & Admin', 
      value: transactions.filter(t => t.category === 'Opsional' || t.category === 'Admin').reduce((s, t) => s + Number(t.amount), 0),
      color: '#a855f7' // purple-500
    },
    { 
      name: 'Tabungan & Tujuan', 
      value: totalSavingsIn + transactions.filter(t => t.category === 'Tujuan Tabungan').reduce((s, t) => s + Number(t.amount), 0),
      color: '#3b82f6' // blue-500
    },
    { 
      name: 'Sisa Saldo', 
      value: remainingBalance > 0 ? remainingBalance : 0,
      color: '#10b981' // emerald-500
    },
  ];

  return (
    <div className="space-y-8">
      <SummaryCards data={summaryData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[420px]">
          <AllocationChart data={chartData} />
        </div>
        <div className="lg:col-span-2 h-[420px]">
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
