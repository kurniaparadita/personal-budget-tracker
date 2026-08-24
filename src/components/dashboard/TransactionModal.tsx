'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionCategory, TransactionType } from '@/types/budget';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Transaction>) => void;
  initialData?: Transaction | null;
  defaultCategory?: TransactionCategory;
  defaultType?: TransactionType;
}

const CATEGORIES: TransactionCategory[] = [
  'Pemasukan',
  'Pengeluaran Wajib',
  'Tagihan Online',
  'Tabungan',
  'Uang Darurat',
  'Opsional',
  'Admin',
  'Transfer Pribadi',
  'Tujuan Tabungan'
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultCategory,
  defaultType
}: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(defaultCategory || 'Pengeluaran Wajib');
  const [type, setType] = useState<TransactionType>(defaultType || 'expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pilih');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setType(initialData.type);
      setDate(initialData.date);
      setStatus(initialData.status || 'Pilih');
      setPlatform(initialData.platform || '');
    } else {
      // Reset form
      setDescription('');
      setAmount('');
      setCategory(defaultCategory || 'Pengeluaran Wajib');
      setType(defaultType || 'expense');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('Pilih');
      setPlatform('');
    }
  }, [initialData, defaultCategory, defaultType, isOpen]);

  // Adjust available types based on category for better UX
  const isSavings = category === 'Tabungan' || category === 'Uang Darurat';
  const isIncome = category === 'Pemasukan';

  useEffect(() => {
    if (!initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isIncome) setType('income');
      else if (isSavings && type !== 'savings_in' && type !== 'savings_out') setType('savings_in');
      else if (!isIncome && !isSavings) setType('expense');
    }
  }, [category, initialData, isIncome, isSavings, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      description,
      amount: Number(amount),
      category,
      type,
      date,
      status,
      platform: category === 'Tagihan Online' ? platform : undefined // only save platform for Tagihan Online
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {isSavings && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Jenis Mutasi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                required
              >
                <option value="savings_in">Masuk (Menabung)</option>
                <option value="savings_out">Keluar (Ditarik)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cth: Gaji Bulanan / Beli Kopi"
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>

          {category === 'Tagihan Online' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Sumber Tagihan (Platform)
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                required
              >
                <option value="">Pilih Platform...</option>
                <option value="ShopeePay Later">ShopeePay Later</option>
                <option value="GoPay Later">GoPay Later</option>
                <option value="Tiktok PayLater">Tiktok PayLater</option>
                <option value="Kredivo">Kredivo</option>
                <option value="Akulaku">Akulaku</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              required
            />
          </div>
          
          {(category === 'Tagihan Online' || category === 'Pengeluaran Wajib') && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="Pilih">Pilih Status...</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          )}
          
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
