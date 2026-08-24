'use client';

import { useBudget } from '@/context/BudgetContext';
import SavingsLog from '@/components/dashboard/SavingsLog';
import { Target, ShieldAlert, TrendingUp } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

export default function TabunganPage() {
  const { transactions, isLoading, openModal, openEditModal, handleDeleteTransaction } = useBudget();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Pisahkan transaksi berdasarkan kategori
  const tujuanTxs = transactions.filter(t => t.category === 'Tujuan Tabungan');
  const daruratTxs = transactions.filter(t => t.category === 'Uang Darurat');
  const mutasiTxs = transactions.filter(t => t.category === 'Tabungan');

  // Hitung total tabungan yang terkumpul
  const totalTujuan = tujuanTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDarurat = daruratTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Asumsikan target hardcoded sementara (idealnya ada di database, tapi kita buat UI mockup SaaS)
  const targetTujuan = 15000000; // Rp 15 Juta
  const targetDarurat = 10000000; // Rp 10 Juta

  const progressTujuan = Math.min(100, Math.round((totalTujuan / targetTujuan) * 100));
  const progressDarurat = Math.min(100, Math.round((totalDarurat / targetDarurat) * 100));

  return (
    <div className="space-y-8">
      {/* SaaS Goal Tracking Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Goal Card 1: Tujuan Tabungan */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tujuan Tabungan</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Gadget, Liburan, dll.</p>
              </div>
            </div>
            <button 
              onClick={() => openModal('Tujuan Tabungan', 'expense')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Alokasi
            </button>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Terkumpul</p>
                <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalTujuan)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Target: {formatRupiah(targetTujuan)}</p>
                <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded text-sm">
                  <TrendingUp className="h-3.5 w-3.5" /> {progressTujuan}%
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressTujuan}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Card 2: Uang Darurat */}
        <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Uang Darurat</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Keamanan finansial.</p>
              </div>
            </div>
            <button 
              onClick={() => openModal('Uang Darurat', 'expense')}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              + Alokasi
            </button>
          </div>

          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Terkumpul</p>
                <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(totalDarurat)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Target: {formatRupiah(targetDarurat)}</p>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-sm">
                  <TrendingUp className="h-3.5 w-3.5" /> {progressDarurat}%
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressDarurat}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mutasi Tabungan Table */}
      <SavingsLog
        title="Riwayat Mutasi Tabungan"
        transactions={mutasiTxs}
        onAdd={() => openModal('Tabungan', 'savings_in')}
        onEdit={openEditModal}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}
