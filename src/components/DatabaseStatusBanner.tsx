'use client';

import { useBudget } from '@/context/BudgetContext';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function DatabaseStatusBanner() {
  const { dbStatus, refreshTransactions } = useBudget();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!dbStatus) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    await refreshTransactions();
    setIsRetrying(false);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 sm:px-6 backdrop-blur-md animate-in slide-in-from-top duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Database Supabase Sedang Dijeda (Project Paused)
              </p>
              <span className="inline-flex items-center rounded-full bg-amber-200/60 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Mode Offline
              </span>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-1">
              Proyek Supabase gratis otomatis dinonaktifkan sementara jika tidak diakses selama 7 hari. Seluruh data Anda aman. Silakan klik tombol <strong>Restore Proyek</strong> untuk mengaktifkan kembali (~1 menit).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href="https://supabase.com/dashboard/project/cbzkypgjxqermvkabost"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            Restore di Supabase
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
