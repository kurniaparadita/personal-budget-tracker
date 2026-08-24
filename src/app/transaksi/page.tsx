'use client';

import { useBudget } from '@/context/BudgetContext';
import TransactionDataTable from '@/components/dashboard/TransactionDataTable';
import { ArrowDownCircle, ArrowUpCircle, Activity } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

export default function TransaksiPage() {
  const { 
    transactions, 
    isLoading, 
    openModal, 
    openEditModal, 
    handleDeleteTransaction,
    handleBulkDeleteTransactions
  } = useBudget();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter out Tagihan Online and Tabungan to only show regular cash flow transactions here if desired.
  // Actually, let's show all regular income and expenses. Tagihan Online is expense, so we include it here but we can also view it in Tagihan specifically.
  // For now, show everything except 'mutasi' tabungan.
  const cashFlowTx = transactions.filter(t => t.type === 'income' || t.type === 'expense');

  const totalIncome = cashFlowTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = cashFlowTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* SaaS-grade Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total In */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <ArrowDownCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Arus Masuk</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalIncome)}</p>
          </div>
        </div>

        {/* Total Out */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <ArrowUpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Arus Keluar</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        {/* Net Flow */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${netFlow >= 0 ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Net Cash Flow</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{netFlow >= 0 ? '+' : '-'}{formatRupiah(Math.abs(netFlow))}</p>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <TransactionDataTable 
        transactions={cashFlowTx}
        onAdd={() => openModal()} // Removed default category so the dropdown shows
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
        onBulkDelete={handleBulkDeleteTransactions}
      />
    </div>
  );
}
