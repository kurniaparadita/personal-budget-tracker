'use client';

import { useBudget } from '@/context/BudgetContext';
import BillDataTable from '@/components/dashboard/BillDataTable';
import { FileWarning, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { formatRupiah } from '@/utils/format';
import { Transaction } from '@/types/budget';

export default function TagihanPage() {
  const { 
    transactions, 
    isLoading, 
    openModal, 
    openEditModal, 
    handleDeleteTransaction, 
    handleUpdateTransaction,
    handleBulkDeleteTransactions,
    handleBulkUpdateTransactions
  } = useBudget();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const bills = transactions.filter(t => t.category === 'Tagihan Online');
  
  const totalLunas = bills.filter(t => t.status === 'Lunas').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBelumLunas = bills.filter(t => t.status !== 'Lunas').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSemua = totalLunas + totalBelumLunas;
  
  // Calculate percentage for progress bar
  const percentLunas = totalSemua > 0 ? Math.round((totalLunas / totalSemua) * 100) : 0;

  const toggleStatus = async (tx: Transaction) => {
    const newStatus = tx.status === 'Lunas' ? 'Belum Lunas' : 'Lunas';
    await handleUpdateTransaction({
      ...tx,
      status: newStatus
    });
  };

  const handleBulkToggleStatus = async (ids: string[], isLunas: boolean) => {
    await handleBulkUpdateTransactions(ids, { status: isLunas ? 'Lunas' : 'Belum Lunas' });
  };

  return (
    <div className="space-y-6">
      {/* Bill Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Belum Lunas (Primary Focus) */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/10 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30">
              <FileWarning className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Harus Dibayar</p>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalBelumLunas)}</p>
            </div>
          </div>
          {totalBelumLunas > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1.5 rounded-lg w-fit ring-1 ring-inset ring-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5" /> Segera lunasi sebelum jatuh tempo
            </div>
          )}
        </div>

        {/* Total Lunas */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tagihan Lunas</p>
              <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalLunas)}</p>
            </div>
          </div>
        </div>

        {/* Progress Penyelesaian */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Beban Tagihan</p>
              <p className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalSemua)}</p>
            </div>
          </div>
          <div className="w-full relative z-10">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-emerald-600 dark:text-emerald-400">{percentLunas}% Lunas</span>
              <span className="text-zinc-500 dark:text-zinc-400">100%</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentLunas}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <BillDataTable 
        transactions={bills}
        onAdd={() => openModal('Tagihan Online', 'expense')}
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
        onToggleStatus={toggleStatus}
        onBulkDelete={handleBulkDeleteTransactions}
        onBulkToggleStatus={handleBulkToggleStatus}
      />
    </div>
  );
}
