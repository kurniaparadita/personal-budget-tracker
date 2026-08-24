import { ArrowDownCircle, ArrowUpCircle, Wallet, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SummaryData } from '@/types/budget';
import { formatRupiah } from '@/utils/format';

interface SummaryCardsProps {
  data: SummaryData;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Pemasukan */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-white/10 backdrop-blur-sm transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-white/20">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <ArrowDownCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Pemasukan</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(data.totalIncome)}</p>
          </div>
        </div>
      </div>

      {/* Total Pengeluaran */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-white/10 backdrop-blur-sm transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-white/20">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-rose-500/10 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30">
            <ArrowUpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Pengeluaran</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(data.totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Sisa Saldo */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-white/10 backdrop-blur-sm transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-white/20">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sisa Saldo</p>
            <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatRupiah(data.remainingBalance)}</p>
          </div>
        </div>
      </div>

      {/* Status Limit */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-white/10 backdrop-blur-sm transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-white/20 flex items-center justify-between">
        <div className="relative z-10 w-full">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status Finansial</p>
          <div className="mt-2 flex items-center gap-2">
            {data.status === 'AMAN' ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20 w-full justify-center">
                <ShieldCheck className="h-4 w-4" /> AMAN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20 w-full justify-center animate-pulse">
                <AlertTriangle className="h-4 w-4" /> OVERBUDGET
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
