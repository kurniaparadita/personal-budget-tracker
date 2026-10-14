import React, { useState } from 'react';
import { SavingsGoal, Transaction } from '@/types/budget';
import { formatDate } from '@/utils/format';
import { useBudget } from '@/context/BudgetContext';
import { 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Trash2, 
  Target, 
  Gift, 
  Shield, 
  Laptop, 
  Plane, 
  Home, 
  Car, 
  CheckCircle2, 
  PiggyBank,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  transactions: Transaction[];
  onDeposit: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onEditTransaction: (goal: SavingsGoal, tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Gift,
  Shield,
  Laptop,
  Plane,
  Home,
  Car,
  Target
};

const COLOR_MAP: Record<string, {
  bgLight: string;
  text: string;
  badgeBg: string;
  barColor: string;
  borderHover: string;
  ring: string;
}> = {
  emerald: {
    bgLight: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    text: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
    borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    ring: 'ring-emerald-500/20'
  },
  blue: {
    bgLight: 'from-blue-500/10 via-blue-500/5 to-transparent',
    text: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    barColor: 'bg-blue-500',
    borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
    ring: 'ring-blue-500/20'
  },
  purple: {
    bgLight: 'from-purple-500/10 via-purple-500/5 to-transparent',
    text: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    barColor: 'bg-purple-500',
    borderHover: 'hover:border-purple-300 dark:hover:border-purple-700',
    ring: 'ring-purple-500/20'
  },
  amber: {
    bgLight: 'from-amber-500/10 via-amber-500/5 to-transparent',
    text: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    barColor: 'bg-amber-500',
    borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    ring: 'ring-amber-500/20'
  },
  rose: {
    bgLight: 'from-rose-500/10 via-rose-500/5 to-transparent',
    text: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    barColor: 'bg-rose-500',
    borderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
    ring: 'ring-rose-500/20'
  },
  teal: {
    bgLight: 'from-teal-500/10 via-teal-500/5 to-transparent',
    text: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
    barColor: 'bg-teal-500',
    borderHover: 'hover:border-teal-300 dark:hover:border-teal-700',
    ring: 'ring-teal-500/20'
  }
};

export default function SavingsGoalCard({
  goal,
  transactions,
  onDeposit,
  onWithdraw,
  onEditGoal,
  onDeleteGoal,
  onEditTransaction,
  onDeleteTransaction
}: SavingsGoalCardProps) {
  const { formatCurrency, isPrivacyMode } = useBudget();
  const [isExpanded, setIsExpanded] = useState(false);

  // Hitung running balance & nominal terkumpul
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const ledgerRows = sortedTx.reduce((acc, tx) => {
    const isKeluar = tx.type === 'savings_out';
    const masuk = isKeluar ? 0 : Number(tx.amount);
    const keluar = isKeluar ? Number(tx.amount) : 0;
    const previousSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
    const currentBalance = previousSaldo + masuk - keluar;

    acc.push({
      ...tx,
      masuk,
      keluar,
      saldo: currentBalance
    });
    return acc;
  }, [] as (Transaction & { masuk: number; keluar: number; saldo: number })[]);

  const totalSaved = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].saldo : 0;
  const target = Number(goal.target_amount) || 1;
  const progress = Math.min(100, Math.round((Math.max(0, totalSaved) / target) * 100));
  const remaining = Math.max(0, target - totalSaved);
  const isCompleted = totalSaved >= target && target > 0;

  const colorTheme = COLOR_MAP[goal.color || 'emerald'] || COLOR_MAP.emerald;
  const IconComp = ICON_MAP[goal.icon || 'Target'] || Target;

  return (
    <div className={`rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-200 overflow-hidden flex flex-col ${colorTheme.borderHover} hover:shadow-md`}>
      
      {/* Top Header & Visual Progress */}
      <div className={`p-6 relative bg-gradient-to-br ${colorTheme.bgLight}`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm ring-1 ${colorTheme.ring} ${colorTheme.text}`}>
              <IconComp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                  {goal.name}
                </h3>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Tercapai
                  </span>
                )}
              </div>
              {goal.notes && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  {goal.notes}
                </p>
              )}
            </div>
          </div>

          {/* Quick Menu: Edit / Hapus Goal */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-800/60 p-1 rounded-xl backdrop-blur-sm ring-1 ring-zinc-200/50 dark:ring-white/10">
            <button
              onClick={() => onEditGoal(goal)}
              className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Edit Target Ini"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDeleteGoal(goal.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Hapus Target Ini"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Metrics Display */}
        <div className="space-y-3 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                Terkumpul
              </p>
              <p className={`text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white ${isPrivacyMode ? 'font-mono' : ''}`}>
                {formatCurrency(totalSaved)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5 ${isPrivacyMode ? 'font-mono' : ''}`}>
                Target: {formatCurrency(target)}
              </p>
              <span className={`inline-flex items-center gap-1 font-bold text-sm px-2.5 py-0.5 rounded-lg ${colorTheme.badgeBg}`}>
                {progress}%
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-zinc-200/60 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${colorTheme.barColor}`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/25 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          {/* Subtext: Kekurangan atau Selesai */}
          <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
            <span>
              {isCompleted
                ? 'Target dana telah terpenuhi! 🎉'
                : `Kurang ${formatCurrency(remaining)} lagi`}
            </span>
            <span>{transactions.length} catatan mutasi</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Setor & Tarik */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => onDeposit(goal)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Setor (Nabung)
          </button>
          <button
            onClick={() => onWithdraw(goal)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95"
          >
            <Minus className="h-3.5 w-3.5" />
            Tarik Dana
          </button>
        </div>

        {/* Toggle Ledger Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          title={isExpanded ? 'Tutup Riwayat' : 'Lihat Riwayat Transaksi'}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>Riwayat</span>
        </button>
      </div>

      {/* Collapsible Ledger (CRUD di dalam kartu) */}
      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Buku Mutasi: {goal.name}
              </span>
              <button
                onClick={() => onDeposit(goal)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Tambah Catatan
              </button>
            </div>

            {ledgerRows.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
                <PiggyBank className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Belum ada mutasi untuk tujuan ini
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Klik tombol &quot;Setor (Nabung)&quot; di atas untuk mulai menyisihkan dana.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl ring-1 ring-zinc-200/80 dark:ring-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="px-3 py-2.5">Tanggal & Keterangan</th>
                      <th className="px-3 py-2.5 text-right">Mutasi</th>
                      <th className="px-3 py-2.5 text-right">Saldo</th>
                      <th className="px-3 py-2.5 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {ledgerRows.map((row) => (
                      <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded-full shrink-0 ${
                              row.masuk > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {row.masuk > 0 ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {row.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                <span>{formatDate(row.date)}</span>
                                {row.status && row.status !== 'Pilih' && row.status !== 'Lunas' && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium border border-zinc-200/50 dark:border-zinc-700/50">
                                    {row.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {row.masuk > 0 ? (
                            <span className={`font-semibold text-emerald-600 dark:text-emerald-400 ${isPrivacyMode ? 'font-mono' : ''}`}>
                              +{formatCurrency(row.masuk)}
                            </span>
                          ) : (
                            <span className={`font-semibold text-rose-600 dark:text-rose-400 ${isPrivacyMode ? 'font-mono' : ''}`}>
                              -{formatCurrency(row.keluar)}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                          <span className={isPrivacyMode ? 'font-mono' : ''}>
                            {formatCurrency(row.saldo)}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => {
                                const { masuk, keluar, saldo, ...originalTx } = row;
                                onEditTransaction(goal, originalTx as Transaction);
                              }}
                              className="p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
                              title="Edit Catatan"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(row.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
