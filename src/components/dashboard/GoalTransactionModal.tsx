import React, { useState, useEffect } from 'react';
import { SavingsGoal, Transaction } from '@/types/budget';
import { X, ArrowDownToLine, ArrowUpFromLine, Target } from 'lucide-react';
import { formatThousands, parseThousands, handleFormattedInputChange } from '@/utils/format';

interface GoalTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  defaultType?: 'savings_in' | 'savings_out';
  initialTransaction?: Transaction | null;
  onSave: (data: {
    type: 'savings_in' | 'savings_out';
    amount: number;
    description: string;
    date: string;
    source_of_fund?: string;
  }) => Promise<void>;
}

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2000000];

export default function GoalTransactionModal({
  isOpen,
  onClose,
  goal,
  defaultType = 'savings_in',
  initialTransaction,
  onSave
}: GoalTransactionModalProps) {
  const [type, setType] = useState<'savings_in' | 'savings_out'>(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceOfFund, setSourceOfFund] = useState('Potong Kas / Gaji Bulan Ini');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type === 'savings_out' ? 'savings_out' : 'savings_in');
      setAmount(formatThousands(initialTransaction.amount));
      setDescription(initialTransaction.description);
      setDate(initialTransaction.date);
      if (initialTransaction.status && initialTransaction.status !== 'Lunas' && initialTransaction.status !== 'Pilih') {
        setSourceOfFund(initialTransaction.status);
      } else {
        setSourceOfFund(initialTransaction.type === 'savings_out' ? 'Kembalikan ke Kas Operasional' : 'Potong Kas / Gaji Bulan Ini');
      }
    } else {
      setType(defaultType);
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setSourceOfFund(defaultType === 'savings_out' ? 'Kembalikan ke Kas Operasional' : 'Potong Kas / Gaji Bulan Ini');
    }
  }, [defaultType, initialTransaction, isOpen]);

  if (!isOpen || !goal) return null;

  const handleTypeChange = (newType: 'savings_in' | 'savings_out') => {
    setType(newType);
    if (newType === 'savings_out' && (sourceOfFund.includes('Gaji') || sourceOfFund.includes('Simpanan') || sourceOfFund.includes('Ekstra'))) {
      setSourceOfFund('Kembalikan ke Kas Operasional');
    } else if (newType === 'savings_in' && (sourceOfFund.includes('Kembalikan') || sourceOfFund.includes('Dibelanjakan'))) {
      setSourceOfFund('Potong Kas / Gaji Bulan Ini');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseThousands(amount);
    if (numAmount <= 0 || !description.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        amount: numAmount,
        description: description.trim(),
        date,
        source_of_fund: sourceOfFund
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPreset = (val: number) => {
    const curr = parseThousands(amount);
    setAmount(formatThousands(curr + val));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Goal Context */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Mutasi Tujuan
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                {goal.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Segmented Type Picker: Setor vs Tarik */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Jenis Aktivitas
            </label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl ring-1 ring-zinc-200/50 dark:ring-white/5">
              <button
                type="button"
                onClick={() => handleTypeChange('savings_in')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'savings_in'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Masuk (Menabung)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('savings_out')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  type === 'savings_out'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Keluar (Ditarik)
              </button>
            </div>
          </div>

          {/* Sumber Dana / Aliran Dana */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              {type === 'savings_in' ? 'Sumber Dana' : 'Tujuan Aliran Penarikan'} <span className="text-rose-500">*</span>
            </label>
            {type === 'savings_in' ? (
              <select
                value={sourceOfFund}
                onChange={(e) => setSourceOfFund(e.target.value)}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3.5 py-2.5 border"
              >
                <option value="Potong Kas / Gaji Bulan Ini">
                  💳 Potong Kas / Gaji Bulan Berjalan (Memotong sisa saldo)
                </option>
                <option value="Saldo Simpanan Yang Sudah Ada">
                  🏦 Saldo Simpanan Yang Sudah Ada (Tidak memotong kas bulan ini)
                </option>
                <option value="Pemasukan Ekstra / Bonus">
                  🎁 Pemasukan Ekstra / Bonus (Di luar gaji bulanan)
                </option>
              </select>
            ) : (
              <select
                value={sourceOfFund}
                onChange={(e) => setSourceOfFund(e.target.value)}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3.5 py-2.5 border"
              >
                <option value="Kembalikan ke Kas Operasional">
                  💵 Kembalikan ke Kas Operasional (Menambah sisa saldo kas)
                </option>
                <option value="Dibelanjakan untuk Tujuan Ini">
                  🛍️ Sudah Dibelanjakan / Dipakai untuk Kebutuhan Ini
                </option>
              </select>
            )}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
              {type === 'savings_in' && sourceOfFund === 'Potong Kas / Gaji Bulan Ini' && '• Uang disisihkan dari gaji bulan ini (mengurangi sisa saldo kas operasional).'}
              {type === 'savings_in' && sourceOfFund === 'Saldo Simpanan Yang Sudah Ada' && '• Uang sudah dimiliki sebelumnya (hanya menambah saldo tujuan, kas bulan ini TIDAK minus).'}
              {type === 'savings_in' && sourceOfFund === 'Pemasukan Ekstra / Bonus' && '• Uang dari rezeki tambahan/bonus (langsung dialokasikan ke tujuan).'}
              {type === 'savings_out' && sourceOfFund === 'Kembalikan ke Kas Operasional' && '• Uang ditarik dan kembali ke dompet/rekening harian.'}
              {type === 'savings_out' && sourceOfFund === 'Dibelanjakan untuk Tujuan Ini' && '• Uang ditarik dan langsung dibayarkan untuk tujuannya (misal beli hewan qurban).'}
            </p>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => handleFormattedInputChange(e, setAmount)}
              placeholder="0"
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-lg font-bold shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3.5 py-2.5 border"
              required
            />
            
            {/* Quick Add Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddPreset(val)}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  +{formatThousands(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3.5 py-2.5 border"
              required
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'savings_in' ? 'Cth: Tabungan gaji bulan ini / Bonus' : 'Cth: Beli kambing qurban / Pakai dana'}
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3.5 py-2.5 border"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                type === 'savings_in'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : initialTransaction
                ? 'Simpan Perubahan'
                : type === 'savings_in'
                ? 'Simpan Tabungan (+)'
                : 'Catat Penarikan (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
