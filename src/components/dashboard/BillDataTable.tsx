'use client';

import { Transaction } from '@/types/budget';
import { formatRupiah, formatDate } from '@/utils/format';
import { Pencil, Trash2, Plus, Search, CheckCircle2, Clock, CalendarDays, CheckSquare, Square, Trash } from 'lucide-react';
import { useState } from 'react';

interface BillDataTableProps {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (transaction: Transaction) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkToggleStatus: (ids: string[], isLunas: boolean) => void;
}

export default function BillDataTable({
  transactions,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
  onBulkDelete,
  onBulkToggleStatus
}: BillDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Belum Lunas' | 'Lunas'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredBills = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tx.platform || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBills.length && filteredBills.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBills.map(tx => tx.id));
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
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkMarkLunas = () => {
    onBulkToggleStatus(selectedIds, true);
    setSelectedIds([]);
  };

  const handleBulkMarkBelumLunas = () => {
    onBulkToggleStatus(selectedIds, false);
    setSelectedIds([]);
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
                placeholder="Cari tagihan atau platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 py-2 pl-9 pr-3 text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
              />
            </div>
            
            {/* Segmented Control for Status Filter */}
            <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
              {(['all', 'Belum Lunas', 'Lunas'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filterStatus === status 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-600/50' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                  }`}
                >
                  {status === 'all' ? 'Semua' : status}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={onAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Catat Tagihan
          </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar (Conditional) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedIds.length} tagihan dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkLunas}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 rounded-md transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Tandai Lunas
            </button>
            <button
              onClick={handleBulkMarkBelumLunas}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/30 rounded-md transition-colors"
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Tandai Belum
            </button>
            <div className="w-px h-4 bg-blue-200 dark:bg-blue-800 mx-1"></div>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 rounded-md transition-colors"
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
          <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <tr>
              <th scope="col" className="px-6 py-4 w-12">
                <button onClick={toggleSelectAll} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                  {selectedIds.length === filteredBills.length && filteredBills.length > 0 ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-4 py-4">Status & Tenggat</th>
              <th scope="col" className="px-6 py-4">Nama Tagihan</th>
              <th scope="col" className="px-6 py-4 text-right">Nominal</th>
              <th scope="col" className="px-6 py-4 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 bg-white/30 dark:bg-zinc-900/30">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Semua Tagihan Beres!</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Tidak ada tagihan yang sesuai dengan filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBills.map((tx) => {
                const isPaid = tx.status === 'Lunas';
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <tr key={tx.id} className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all group ${isPaid ? 'opacity-70 grayscale-[30%]' : ''} ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelect(tx.id)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onToggleStatus(tx)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isPaid 
                              ? 'border-emerald-500 bg-emerald-500 text-white' 
                              : 'border-zinc-300 dark:border-zinc-600 bg-transparent text-transparent hover:border-emerald-500 hover:text-emerald-500/50'
                          }`}
                          title={isPaid ? "Tandai Belum Lunas" : "Tandai Lunas"}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                            {isPaid ? 'Lunas' : 'Belum Lunas'}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            {isPaid ? <CalendarDays className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {formatDate(tx.date)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-medium ${isPaid ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {tx.description}
                        </span>
                        {tx.platform && (
                          <div>
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
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isPaid ? 'text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                      {formatRupiah(tx.amount)}
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
