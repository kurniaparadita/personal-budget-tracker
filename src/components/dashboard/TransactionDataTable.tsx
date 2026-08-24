'use client';

import { Transaction } from '@/types/budget';
import { formatRupiah, formatDate } from '@/utils/format';
import { Pencil, Trash2, ArrowDownRight, ArrowUpRight, Plus, Search, Filter, CheckSquare, Square, Trash } from 'lucide-react';
import { useState } from 'react';

interface TransactionDataTableProps {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

export default function TransactionDataTable({
  transactions,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
}: TransactionDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredTransactions = transactions.filter(tx => {
    // Basic search by description
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Basic filter by type
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(tx => tx.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/10 overflow-hidden flex flex-col">
      {/* Header Toolbar */}
      <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 py-2 pl-9 pr-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="appearance-none block w-full rounded-lg border-0 py-2 pl-3 pr-10 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 cursor-pointer"
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Filter className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
          
          <button
            onClick={onAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar (Conditional) */}
      {selectedIds.length > 0 && onBulkDelete && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedIds.length} transaksi dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 rounded-md transition-colors"
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <tr>
              {onBulkDelete && (
                <th scope="col" className="px-6 py-4 w-12">
                  <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
              )}
              <th scope="col" className="px-6 py-4">Tanggal</th>
              <th scope="col" className="px-6 py-4">Keterangan</th>
              <th scope="col" className="px-6 py-4">Kategori</th>
              <th scope="col" className="px-6 py-4 text-right">Nominal</th>
              <th scope="col" className="px-6 py-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 bg-white/30 dark:bg-zinc-900/30">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={onBulkDelete ? 6 : 5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  Tidak ada transaksi yang sesuai.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <tr key={tx.id} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    {onBulkDelete && (
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelect(tx.id)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        {isIncome ? (
                          <ArrowDownRight className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className="truncate">{tx.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20 whitespace-nowrap">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>
                      {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
