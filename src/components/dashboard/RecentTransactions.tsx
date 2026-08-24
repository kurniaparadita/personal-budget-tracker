'use client';

import { Transaction } from '@/types/budget';
import { formatRupiah, formatDate } from '@/utils/format';
import { ArrowDownRight, ArrowUpRight, Receipt, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  // Ambil 5 transaksi terakhir
  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getIconProps = (tx: Transaction) => {
    if (tx.type === 'income') {
      return {
        icon: ArrowDownRight,
        bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        amountClass: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    
    if (tx.category === 'Tagihan Online') {
      return {
        icon: Receipt,
        bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
        textClass: 'text-orange-600 dark:text-orange-400',
        amountClass: 'text-zinc-900 dark:text-white'
      };
    }

    if (tx.category === 'Tujuan Tabungan') {
      return {
        icon: Target,
        bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
        textClass: 'text-blue-600 dark:text-blue-400',
        amountClass: 'text-zinc-900 dark:text-white'
      };
    }

    return {
      icon: ArrowUpRight,
      bgClass: 'bg-rose-500/10 dark:bg-rose-500/20',
      textClass: 'text-rose-600 dark:text-rose-400',
      amountClass: 'text-zinc-900 dark:text-white'
    };
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 overflow-hidden flex flex-col h-full">
      <div className="px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Transaksi Terbaru</h3>
        <Link href="/transaksi" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex-1 p-0 overflow-y-auto">
        {recentTx.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center h-full">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada transaksi</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {recentTx.map((tx) => {
              const { icon: Icon, bgClass, textClass, amountClass } = getIconProps(tx);
              
              return (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {tx.description}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{formatDate(tx.date)}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold tracking-tight ${amountClass}`}>
                    {tx.type === 'income' ? '+' : ''}{formatRupiah(tx.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
