import { useState } from 'react';
import { Transaction } from '@/types/budget';
import { formatDate } from '@/utils/format';
import { Pencil, Trash2, Plus, ArrowDownToLine, ArrowUpFromLine, PiggyBank, Search } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';

interface SavingsLogProps {
  title: string;
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function SavingsLog({
  title,
  transactions,
  onAdd,
  onEdit,
  onDelete,
}: SavingsLogProps) {
  const { formatCurrency, isPrivacyMode } = useBudget();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort transactions by date ascending to calculate running balance correctly
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const tableRows = sortedTransactions.reduce((acc, tx) => {
    const isKeluar = tx.type === 'savings_out';
    const masuk = isKeluar ? 0 : Number(tx.amount);
    const keluar = isKeluar ? Number(tx.amount) : 0;
    const previousSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
    const currentBalance = previousSaldo + masuk - keluar;

    acc.push({
      ...tx,
      masuk,
      keluar,
      saldo: currentBalance,
    });
    return acc;
  }, [] as (Transaction & { masuk: number; keluar: number; saldo: number })[]);

  const displayedRows = tableRows.filter((row) =>
    row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.date.includes(searchTerm)
  );

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Premium Header */}
      <div className="relative overflow-hidden border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none"></div>
        <h3 className="relative z-10 text-base font-bold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ring-1 ring-zinc-200/50 dark:ring-white/10 transition-all"
            />
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all active:scale-95 whitespace-nowrap"
            title={`Tambah ${title}`}
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            Catat Mutasi
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50/30 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 w-16 text-center">No.</th>
              <th scope="col" className="px-6 py-4">Tanggal & Keterangan</th>
              <th scope="col" className="px-6 py-4 text-right">Mutasi Masuk</th>
              <th scope="col" className="px-6 py-4 text-right">Mutasi Keluar</th>
              <th scope="col" className="px-6 py-4 text-right">Total Saldo</th>
              <th scope="col" className="px-6 py-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <PiggyBank className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {tableRows.length === 0 ? 'Belum ada catatan mutasi' : 'Tidak ada transaksi yang cocok'}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {tableRows.length === 0 ? 'Catat aktivitas menabung atau penarikan di sini.' : 'Coba ubah kata kunci pencarian.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all duration-200 group relative">
                  <td className="px-6 py-4 text-center text-zinc-400 dark:text-zinc-500 font-medium">{index + 1}</td>
                  
                  {/* Tanggal & Keterangan */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        row.masuk > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                      }`}>
                        {row.masuk > 0 ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{row.description}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDate(row.date)}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    {row.masuk > 0 ? (
                      <span className={`inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-sm ${isPrivacyMode ? 'font-mono' : ''}`}>
                        +{formatCurrency(row.masuk)}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    {row.keluar > 0 ? (
                      <span className={`inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded text-sm ${isPrivacyMode ? 'font-mono' : ''}`}>
                        -{formatCurrency(row.keluar)}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold tracking-tight text-zinc-900 dark:text-white ${isPrivacyMode ? 'font-mono' : ''}`}>
                      {formatCurrency(row.saldo)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 transition-all duration-200">
                      <button
                        onClick={() => {
                          const { masuk, keluar, saldo, ...originalTx } = row;
                          onEdit(originalTx as Transaction);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-md transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
