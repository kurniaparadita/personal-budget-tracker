import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '@/types/budget';
import { X, Target, Gift, Shield, Laptop, Plane, Home, Car, Palette } from 'lucide-react';
import { formatThousands, parseThousands, handleFormattedInputChange } from '@/utils/format';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<SavingsGoal>) => Promise<void>;
  initialData?: SavingsGoal | null;
}

const COLOR_OPTIONS: { id: SavingsGoal['color']; name: string; class: string; bg: string }[] = [
  { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500 text-white ring-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'blue', name: 'Ocean Blue', class: 'bg-blue-500 text-white ring-blue-500', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'purple', name: 'Violet', class: 'bg-purple-500 text-white ring-purple-500', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'amber', name: 'Amber Gold', class: 'bg-amber-500 text-white ring-amber-500', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'rose', name: 'Rose Red', class: 'bg-rose-500 text-white ring-rose-500', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'teal', name: 'Cyan Teal', class: 'bg-teal-500 text-white ring-teal-500', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
];

const ICON_OPTIONS = [
  { id: 'Gift', label: 'Qurban / Hadiah', icon: Gift },
  { id: 'Shield', label: 'Dana Darurat', icon: Shield },
  { id: 'Laptop', label: 'Gadget / Kerja', icon: Laptop },
  { id: 'Plane', label: 'Liburan / Wisata', icon: Plane },
  { id: 'Home', label: 'Rumah / DP', icon: Home },
  { id: 'Car', label: 'Kendaraan', icon: Car },
  { id: 'Target', label: 'Target Umum', icon: Target },
];

export default function GoalModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [color, setColor] = useState<SavingsGoal['color']>('emerald');
  const [icon, setIcon] = useState('Gift');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(formatThousands(initialData.target_amount));
      setColor(initialData.color || 'emerald');
      setIcon(initialData.icon || 'Target');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setColor('emerald');
      setIcon('Gift');
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseThousands(targetAmount);
    if (!name.trim() || numTarget <= 0) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        target_amount: numTarget,
        color,
        icon,
        notes: notes.trim()
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {initialData ? 'Edit Tujuan Tabungan' : 'Buat Kartu Tujuan Baru'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Contoh: Tabungan Qurban, Beli Laptop, dll.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Nama Tujuan Tabungan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Tabungan Qurban 2026 / Beli Laptop"
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3.5 py-2.5 border"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Target Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={targetAmount}
              onChange={(e) => handleFormattedInputChange(e, setTargetAmount)}
              placeholder="Contoh: 3,500,000"
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3.5 py-2.5 border"
              required
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Pilih Ikon Kartu
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-zinc-400" />
              Warna Kartu
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`h-7 w-7 rounded-full transition-all flex items-center justify-center ${
                    color === c.id ? `ring-2 ring-offset-2 ring-zinc-800 dark:ring-zinc-100 scale-110 shadow-md ${c.class}` : c.class
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Catatan / Motivasi (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Bismillah untuk qurban kambing tahun ini..."
              rows={2}
              className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3.5 py-2 border"
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
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui Tujuan' : 'Simpan Tujuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
