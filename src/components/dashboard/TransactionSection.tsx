import { Transaction } from '@/types/budget';
import { formatRupiah } from '@/utils/format';
import { Pencil, Trash2, Plus, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Target } from 'lucide-react';
import { formatDate } from '@/utils/format'; // Assuming we have this, or I'll just use inline format

interface TransactionSectionProps {
  title: string;
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  totalLabel?: string;
}

export default function TransactionSection({
  title,
  transactions,
  onAdd,
  onEdit,
  onDelete,
  totalLabel = 'Total'
}: TransactionSectionProps) {
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  // Helper to determine icon and colors based on transaction type/category
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

    // Default expense
    return {
      icon: ArrowUpRight,
      bgClass: 'bg-rose-500/10 dark:bg-rose-500/20',
      textClass: 'text-rose-600 dark:text-rose-400',
      amountClass: 'text-zinc-900 dark:text-white'
    };
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Premium Header */}
      <div className="relative overflow-hidden border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-5 flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent dark:from-blue-500/10 pointer-events-none"></div>
        <h3 className="relative z-10 text-base font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
        <button
          onClick={onAdd}
          className="relative z-10 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95"
          title={`Tambah ${title}`}
        >
          <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
          Tambah
        </button>
      </div>

      {/* List */}
      <div className="flex-1 p-0">
        {transactions.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <Wallet className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Belum ada transaksi</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Klik tombol tambah untuk mencatat.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {transactions.map((tx) => {
              const { icon: Icon, bgClass, textClass, amountClass } = getIconProps(tx);
              const txDate = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              
              return (
                <li key={tx.id} className="group relative flex items-center justify-between px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    {/* Icon Avatar */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgClass} ${textClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Text Details */}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {tx.description}
                        {tx.platform && (
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                            tx.platform.toLowerCase().includes('gopay') 
                              ? 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20'
                              : tx.platform.toLowerCase().includes('shopee')
                                ? 'bg-orange-50 text-orange-700 ring-orange-700/10 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20'
                                : tx.platform.toLowerCase().includes('tiktok')
                                  ? 'bg-zinc-100 text-zinc-900 ring-zinc-900/10 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-100/20'
                                  : 'bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20'
                          }`}>
                            {tx.platform}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{txDate}</span>
                        {tx.status && tx.status !== 'Pilih' && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                            <span className="font-medium text-zinc-600 dark:text-zinc-300">{tx.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold tracking-tight ${amountClass}`}>
                      {tx.type === 'income' ? '+' : ''}{formatRupiah(tx.amount)}
                    </span>
                    
                    {/* Action Buttons Container */}
                    <div className="flex items-center gap-1 absolute right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 bg-zinc-50/80 dark:bg-zinc-800/90 p-1 rounded-lg backdrop-blur-sm">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer / Total */}
      <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{totalLabel}</span>
        <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
