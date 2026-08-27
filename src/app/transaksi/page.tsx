'use client';

import { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import TransactionDataTable from '@/components/dashboard/TransactionDataTable';
import { ArrowDownCircle, ArrowUpCircle, Activity } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

export default function TransaksiPage() {
  const [activeTab, setActiveTab] = useState<string>('Semua');
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

  // Base transactions for the master ledger (excluding raw savings logs which are handled in Tabungan page)
  const baseTransactions = transactions.filter(t => t.type === 'income' || t.type === 'expense');

  // Filter based on active tab
  const displayedTx = activeTab === 'Semua'
    ? baseTransactions
    : baseTransactions.filter(t => t.category === activeTab);

  const totalIncome = displayedTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = displayedTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* SaaS-grade Metrics Header */}
      <div className={`grid grid-cols-1 gap-4 ${activeTab === 'Semua' ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
        {/* Total In - Hanya tampil di Semua atau Pemasukan */}
        {(activeTab === 'Semua' || activeTab === 'Pemasukan') && (
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ArrowDownCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Arus Masuk</p>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalIncome)}</p>
            </div>
          </div>
        )}

        {/* Total Out - Tampil di Semua atau tab Pengeluaran lainnya */}
        {(activeTab === 'Semua' || activeTab !== 'Pemasukan') && (
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <ArrowUpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {activeTab === 'Semua' ? 'Total Arus Keluar' : `Total ${activeTab}`}
              </p>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalExpense)}</p>
            </div>
          </div>
        )}

        {/* Net Flow - Hanya tampil di tab Semua */}
        {activeTab === 'Semua' && (
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${netFlow >= 0 ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Net Cash Flow</p>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{netFlow >= 0 ? '+' : '-'}{formatRupiah(Math.abs(netFlow))}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Filter Kategori */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Daftar Transaksi</h2>
        
        <div className="flex flex-wrap gap-2 sm:gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/5 w-full sm:w-auto">
          {['Semua', 'Pemasukan', 'Pengeluaran Wajib', 'Opsional', 'Transfer Pribadi', 'Admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TransactionDataTable 
          transactions={displayedTx}
          onAdd={() => openModal()} // Removed default category so the dropdown shows
          onEdit={openEditModal}
          onDelete={handleDeleteTransaction}
          onBulkDelete={handleBulkDeleteTransactions}
        />
      </div>
    </div>
  );
}
