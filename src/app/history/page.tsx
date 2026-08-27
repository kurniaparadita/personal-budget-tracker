'use client';

import { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { formatRupiah } from '@/utils/format';
import { Archive, Calendar, Trash2, TrendingUp, TrendingDown, RefreshCw, RefreshCcw, X, Receipt, Search } from 'lucide-react';
import { MonthlyHistory, Transaction } from '@/types/budget';

export default function HistoryPage() {
  const { transactions, historyData, saveMonthlyHistory, deleteHistory, restoreHistory, isLoading } = useBudget();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  
  // Details Modal State
  const [selectedHistory, setSelectedHistory] = useState<MonthlyHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'Transaksi' | 'Tagihan Online' | 'Tabungan'>('Semua');

  // Use the snapshot data from the history record
  const selectedMonthTransactionsRaw = selectedHistory?.transactions_snapshot || [];

  const selectedMonthTransactions = selectedMonthTransactionsRaw.filter(t => {
    // Search filter
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'Transaksi') {
      matchesTab = ['Pemasukan', 'Pengeluaran Wajib', 'Opsional', 'Admin', 'Transfer Pribadi'].includes(t.category);
    } else if (activeTab === 'Tagihan Online') {
      matchesTab = t.category === 'Tagihan Online';
    } else if (activeTab === 'Tabungan') {
      matchesTab = ['Tabungan', 'Uang Darurat', 'Tujuan Tabungan'].includes(t.category);
    }

    return matchesSearch && matchesTab;
  });

  const handleTutupBuku = () => {
    setConfirmMessage(`Anda yakin ingin melakukan Tutup Buku untuk ${months[selectedMonth - 1]} ${selectedYear}?\n\nIni akan menghitung ulang dan menyimpan total transaksi di bulan tersebut ke riwayat.`);
    setConfirmAction(() => async () => {
      await saveMonthlyHistory(selectedMonth, selectedYear);
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmMessage('Yakin ingin menghapus riwayat bulan ini? Data transaksi aslinya tidak akan terpengaruh.');
    setConfirmAction(() => async () => {
      await deleteHistory(id);
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  const handleRestore = (id: string, month: number, year: number) => {
    setConfirmMessage(`Yakin ingin memulihkan semua data transaksi bulan ${months[month - 1]} ${year} ke daftar transaksi aktif?\n\nData yang dikembalikan tidak akan menimpa data yang sudah ada.`);
    setConfirmAction(() => async () => {
      await restoreHistory(id);
      setIsConfirmOpen(false);
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Archive className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            Riwayat Bulanan
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Simpan dan pantau rekapitulasi keuangan Anda dari bulan ke bulan.
          </p>
        </div>

        {/* Action Card: Tutup Buku */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium py-2 px-3"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium py-2 px-3"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
            <option value={2028}>2028</option>
          </select>
          <button 
            onClick={handleTutupBuku}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Tutup Buku
          </button>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Periode</th>
                <th className="px-6 py-4 font-semibold text-right">Pemasukan</th>
                <th className="px-6 py-4 font-semibold text-right">Pengeluaran</th>
                <th className="px-6 py-4 font-semibold text-right">Tabungan Bersih</th>
                <th className="px-6 py-4 font-semibold text-right">Net Cash Flow</th>
                <th className="px-6 py-4 font-semibold text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <Archive className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada riwayat tutup buku.</p>
                    <p className="text-xs mt-1">Klik tombol "Tutup Buku" di atas untuk merekap bulan ini.</p>
                  </td>
                </tr>
              ) : (
                historyData.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => {
                      setSelectedHistory(item);
                      setSearchQuery('');
                      setActiveTab('Semua');
                    }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                          {months[item.month - 1].substring(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {months[item.month - 1]} {item.year}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Direkap: {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(item.total_income)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-rose-600 dark:text-rose-400">
                      {formatRupiah(item.total_expense)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-blue-600 dark:text-blue-400">
                      {formatRupiah(item.total_savings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        item.net_cash_flow >= 0 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {item.net_cash_flow >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {item.net_cash_flow >= 0 ? '+' : '-'}{formatRupiah(Math.abs(item.net_cash_flow))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(item.id, item.month, item.year);
                          }}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Pulihkan Data ke Transaksi Aktif"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening details modal
                            handleDelete(item.id);
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Hapus Riwayat"
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

      {/* Custom Confirm Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                <Archive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Konfirmasi</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 whitespace-pre-wrap">
                  {confirmMessage}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/50 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Detail Transaksi {months[selectedHistory.month - 1]} {selectedHistory.year}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {selectedMonthTransactions.length} transaksi tercatat
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedHistory(null);
                  setSearchQuery('');
                  setActiveTab('Semua');
                }}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filters: Tabs & Search */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['Semua', 'Transaksi', 'Tagihan Online', 'Tabungan'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950">
              {selectedMonthTransactions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  Tidak ada transaksi yang ditemukan untuk bulan ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMonthTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            tx.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            tx.type === 'expense' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {tx.category}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-500">
                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        tx.type === 'income' || tx.type === 'savings_in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' || tx.type === 'savings_in' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
