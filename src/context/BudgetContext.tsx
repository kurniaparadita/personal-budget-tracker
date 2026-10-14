'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionCategory, TransactionType, MonthlyHistory, SavingsGoal } from '@/types/budget';
import TransactionModal from '@/components/dashboard/TransactionModal';
import GoalModal from '@/components/dashboard/GoalModal';
import GoalTransactionModal from '@/components/dashboard/GoalTransactionModal';
import { Trash2 } from 'lucide-react';
import { formatRupiah } from '@/utils/format';

interface BudgetContextType {
  transactions: Transaction[];
  historyData: MonthlyHistory[];
  isLoading: boolean;
  dbStatus: { isPaused: boolean; message: string } | null;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  formatCurrency: (amount: number) => string;
  handleDeleteTransaction: (id: string) => Promise<void>;
  openModal: (category?: TransactionCategory, type?: TransactionType) => void;
  openEditModal: (transaction: Transaction) => void;
  refreshTransactions: () => Promise<void>;
  handleUpdateTransaction: (transaction: Transaction) => Promise<void>;
  handleBulkDeleteTransactions: (ids: string[]) => Promise<void>;
  handleBulkUpdateTransactions: (ids: string[], data: Partial<Transaction>) => Promise<void>;
  fetchHistory: () => Promise<void>;
  saveMonthlyHistory: (month: number, year: number) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  restoreHistory: (id: string) => Promise<void>;
  // Dynamic Savings Goal Support
  savingsGoals: SavingsGoal[];
  openGoalModal: (goal?: SavingsGoal) => void;
  closeGoalModal: () => void;
  handleSaveGoal: (goalData: Partial<SavingsGoal>) => Promise<void>;
  handleDeleteGoal: (goalId: string) => Promise<void>;
  openGoalTxModal: (goal: SavingsGoal, defaultType?: 'savings_in' | 'savings_out', tx?: Transaction) => void;
  closeGoalTxModal: () => void;
  handleSaveGoalTransaction: (data: { type: 'savings_in' | 'savings_out'; amount: number; description: string; date: string; source_of_fund?: string }) => Promise<void>;
}

const DEFAULT_FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    id: 'fb-1',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: 'Pemasukan',
    description: 'Gaji Bulanan',
    amount: 15000000,
    status: 'Lunas',
  },
  {
    id: 'fb-2',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'Pengeluaran Wajib',
    description: 'Sewa Tempat Tinggal / Kost',
    amount: 2500000,
    status: 'Lunas',
  },
  {
    id: 'fb-3',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'Tagihan Online',
    description: 'Langganan Internet & WiFi',
    amount: 350000,
    status: 'Belum Lunas',
    platform: 'BCA / QRIS'
  },
  {
    id: 'fb-4',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'Opsional',
    description: 'Makan & Belanja Mingguan',
    amount: 1200000,
    status: 'Lunas',
  },
  {
    id: 'fb-5',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'savings_in',
    category: 'Tabungan',
    description: 'Alokasi Reksa Dana Pasar Uang',
    amount: 2000000,
    status: 'Lunas',
  },
  {
    id: 'fb-6',
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type: 'savings_in',
    category: 'Uang Darurat',
    description: 'Alokasi Deposito Darurat',
    amount: 1000000,
    status: 'Lunas',
  }
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-qurban',
    created_at: new Date().toISOString(),
    name: 'Tabungan Qurban',
    target_amount: 3500000,
    color: 'emerald',
    icon: 'Gift',
    notes: 'Target ibadah qurban tahun ini'
  },
  {
    id: 'goal-darurat',
    created_at: new Date().toISOString(),
    name: 'Uang Darurat',
    target_amount: 10000000,
    color: 'amber',
    icon: 'Shield',
    notes: 'Dana pengaman kebutuhan mendesak'
  },
  {
    id: 'goal-laptop',
    created_at: new Date().toISOString(),
    name: 'Beli Laptop Baru',
    target_amount: 15000000,
    color: 'blue',
    icon: 'Laptop',
    notes: 'Upgrade laptop kerja'
  }
];

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyData, setHistoryData] = useState<MonthlyHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ isPaused: boolean; message: string } | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<TransactionCategory | undefined>();
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType | undefined>();

  // Savings Goal State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Goal Transaction Modal State
  const [isGoalTxModalOpen, setIsGoalTxModalOpen] = useState(false);
  const [activeGoalForTx, setActiveGoalForTx] = useState<SavingsGoal | null>(null);
  const [defaultGoalTxType, setDefaultGoalTxType] = useState<'savings_in' | 'savings_out'>('savings_in');
  const [editingGoalTx, setEditingGoalTx] = useState<Transaction | null>(null);

  // Global Confirm Modal state
  const [isGlobalConfirmOpen, setIsGlobalConfirmOpen] = useState(false);
  const [globalConfirmMessage, setGlobalConfirmMessage] = useState('');
  const [globalConfirmAction, setGlobalConfirmAction] = useState<(() => void) | null>(null);

  // Privacy Mode state (persisted in localStorage)
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('budget_privacy_mode');
      if (saved === 'true') {
        setIsPrivacyMode(true);
      }
      
      const savedGoals = localStorage.getItem('budget_savings_goals');
      if (savedGoals) {
        setSavingsGoals(JSON.parse(savedGoals));
      } else {
        setSavingsGoals(DEFAULT_SAVINGS_GOALS);
        localStorage.setItem('budget_savings_goals', JSON.stringify(DEFAULT_SAVINGS_GOALS));
      }
    } catch {
      setSavingsGoals(DEFAULT_SAVINGS_GOALS);
    }
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('budget_privacy_mode', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const formatCurrency = (amount: number) => formatRupiah(amount, isPrivacyMode);

  // Helper with 5-second timeout to prevent infinite hanging
  const fetchWithTimeout = async <T,>(promise: PromiseLike<T>, ms = 5000): Promise<T> => {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error('Koneksi timeout. Supabase kemungkinan sedang di-pause atau jaringan lambat.'));
      }, ms);
    });

    try {
      const result = await Promise.race([promise, timeout]);
      clearTimeout(timer!);
      return result;
    } catch (err) {
      clearTimeout(timer!);
      throw err;
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetchWithTimeout(
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false }),
        5000
      );

      const { data, error } = res;
      if (error) throw error;
      
      if (data) {
        setTransactions(data as Transaction[]);
        setDbStatus(null);
        try {
          localStorage.setItem('budget_cached_transactions', JSON.stringify(data));
        } catch {}
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      const errMsg = (error?.message || error?.details || JSON.stringify(error) || '').toLowerCase();
      const isPaused = errMsg.includes('paused') || errMsg.includes('503') || errMsg.includes('timeout') || errMsg.includes('aborted');

      setDbStatus({
        isPaused: true,
        message: isPaused
          ? 'Proyek Supabase Anda sedang di-pause (tidak aktif). Buka dashboard Supabase dan klik "Restore Project" untuk memulihkannya.'
          : 'Gagal terhubung ke database Supabase. Periksa koneksi internet Anda.'
      });

      // Load dari cache localStorage atau default fallback agar halaman tetap bisa dibuka
      try {
        const cached = localStorage.getItem('budget_cached_transactions');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
            return;
          }
        }
      } catch {}

      // Jika cache kosong, gunakan fallback dataset
      setTransactions((prev) => (prev.length > 0 ? prev : DEFAULT_FALLBACK_TRANSACTIONS));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetchWithTimeout(
        supabase
          .from('monthly_history')
          .select('*')
          .order('year', { ascending: false })
          .order('month', { ascending: false }),
        5000
      );

      const { data, error } = res;
      if (error) {
        console.error('Error fetching history:', error);
        return;
      }
      if (data) setHistoryData(data as MonthlyHistory[]);
    } catch (error) {
      console.error('Error in fetchHistory:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchHistory();
  }, []);

  // Helper to ensure only valid database columns are sent to Supabase
  const cleanPayload = <T extends Record<string, any>>(data: T, includeId = false): Record<string, any> => {
    const allowedColumns = [
      'date',
      'type',
      'category',
      'description',
      'amount',
      'status',
      'platform'
    ];
    if (includeId && data.id) {
      allowedColumns.push('id');
    }
    const clean: Record<string, any> = {};
    for (const key of allowedColumns) {
      if (key in data && data[key] !== undefined) {
        clean[key] = data[key];
      }
    }
    return clean;
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      const payload = cleanPayload(transaction);
      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transaction.id);
        
      if (error) throw error;
      
      await fetchTransactions();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      const errMsg = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      alert(`Gagal mengupdate transaksi: ${errMsg}`);
    }
  };

  const handleBulkUpdateTransactions = async (ids: string[], data: Partial<Transaction>) => {
    try {
      const payload = cleanPayload(data);
      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .in('id', ids);
        
      if (error) throw error;
      
      await fetchTransactions();
    } catch (error: any) {
      console.error('Error bulk updating transactions:', error);
      const errMsg = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      alert(`Gagal mengupdate transaksi: ${errMsg}`);
    }
  };

  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    try {
      if (editingTransaction) {
        // Update
        const payload = cleanPayload(data);
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingTransaction.id);
          
        if (error) throw error;
      } else {
        // Insert
        const payload = cleanPayload(data, true);
        const { error } = await supabase
          .from('transactions')
          .insert([payload]);
          
        if (error) throw error;
      }
      
      await fetchTransactions();
      closeModal();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      const errMsg = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      alert(`Gagal menyimpan transaksi: ${errMsg}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setGlobalConfirmMessage('Yakin ingin menghapus transaksi ini?');
    setGlobalConfirmAction(() => async () => {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        await fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi');
      }
      setIsGlobalConfirmOpen(false);
    });
    setIsGlobalConfirmOpen(true);
  };

  const handleBulkDeleteTransactions = async (ids: string[]) => {
    setGlobalConfirmMessage(`Yakin ingin menghapus ${ids.length} transaksi ini?`);
    setGlobalConfirmAction(() => async () => {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .in('id', ids);
          
        if (error) throw error;
        
        await fetchTransactions();
      } catch (error) {
        console.error('Error bulk deleting transactions:', error);
        alert('Gagal menghapus transaksi');
      }
      setIsGlobalConfirmOpen(false);
    });
    setIsGlobalConfirmOpen(true);
  };

  const saveMonthlyHistory = async (month: number, year: number) => {
    try {
      setIsLoading(true);
      // Hitung dari transaksi saat ini
      const monthStr = month.toString().padStart(2, '0');
      const yearStr = year.toString();
      
      const currentMonthTx = transactions.filter(t => t.date.startsWith(`${yearStr}-${monthStr}`));
      
      const totalIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalSavings = currentMonthTx.filter(t => t.type === 'savings_in').reduce((sum, t) => sum + Number(t.amount), 0) 
                         - currentMonthTx.filter(t => t.type === 'savings_out').reduce((sum, t) => sum + Number(t.amount), 0);
      const netCashFlow = totalIncome - totalExpense;

      const historyRecord = {
        month,
        year,
        total_income: totalIncome,
        total_expense: totalExpense,
        total_savings: totalSavings,
        net_cash_flow: netCashFlow,
        notes: `Tutup Buku: ${monthStr}/${yearStr}`,
        transactions_snapshot: currentMonthTx
      };

      // Check if exists using upsert logic
      const { data: existing } = await supabase
        .from('monthly_history')
        .select('id')
        .eq('month', month)
        .eq('year', year)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('monthly_history')
          .update(historyRecord)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monthly_history')
          .insert([historyRecord]);
        if (error) throw error;
      }
      
      await fetchHistory();
    } catch (error: any) {
      console.error('Error saving history:', error);
      alert(`Gagal menyimpan histori: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistory = async (id: string) => {
    try {
      const { error } = await supabase.from('monthly_history').delete().eq('id', id);
      if (error) throw error;
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Gagal menghapus riwayat');
    }
  };

  const restoreHistory = async (id: string) => {
    try {
      setIsLoading(true);
      const historyRecord = historyData.find(h => h.id === id);
      if (!historyRecord || !historyRecord.transactions_snapshot || historyRecord.transactions_snapshot.length === 0) {
        alert('Tidak ada data transaksi yang bisa dipulihkan dari riwayat ini.');
        return;
      }
      
      const { error } = await supabase
        .from('transactions')
        .upsert(historyRecord.transactions_snapshot);
        
      if (error) throw error;
      
      await fetchTransactions();
    } catch (error: any) {
      console.error('Error restoring history:', error);
      alert(`Gagal memulihkan riwayat: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (category?: TransactionCategory, type?: TransactionType) => {
    setEditingTransaction(null);
    setModalDefaultCategory(category);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalDefaultCategory(transaction.category);
    setModalDefaultType(transaction.type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setModalDefaultCategory(undefined);
    setModalDefaultType(undefined);
  };

  // --- Dynamic Goal Handlers ---
  const persistGoals = (goals: SavingsGoal[]) => {
    setSavingsGoals(goals);
    try {
      localStorage.setItem('budget_savings_goals', JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving goals to localStorage', e);
    }
  };

  const handleSaveGoal = async (goalData: Partial<SavingsGoal>) => {
    if (editingGoal) {
      const updated = savingsGoals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } as SavingsGoal : g);
      persistGoals(updated);
    } else {
      const newGoal: SavingsGoal = {
        id: `goal-${Date.now()}`,
        created_at: new Date().toISOString(),
        name: goalData.name || 'Tujuan Baru',
        target_amount: Number(goalData.target_amount) || 0,
        color: goalData.color || 'emerald',
        icon: goalData.icon || 'Target',
        notes: goalData.notes || ''
      };
      persistGoals([...savingsGoals, newGoal]);
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const targetGoal = savingsGoals.find(g => g.id === goalId);
    setGlobalConfirmMessage(`Yakin ingin menghapus tujuan "${targetGoal?.name || 'ini'}"?\nCatatan transaksi terkait akan tetap tersimpan.`);
    setGlobalConfirmAction(() => async () => {
      const updated = savingsGoals.filter(g => g.id !== goalId);
      persistGoals(updated);
      setIsGlobalConfirmOpen(false);
    });
    setIsGlobalConfirmOpen(true);
  };

  const openGoalModal = (goal?: SavingsGoal) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  };

  const closeGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const openGoalTxModal = (goal: SavingsGoal, defaultType: 'savings_in' | 'savings_out' = 'savings_in', tx?: Transaction) => {
    setActiveGoalForTx(goal);
    setDefaultGoalTxType(defaultType);
    setEditingGoalTx(tx || null);
    setIsGoalTxModalOpen(true);
  };

  const closeGoalTxModal = () => {
    setIsGoalTxModalOpen(false);
    setActiveGoalForTx(null);
    setEditingGoalTx(null);
  };

  const handleSaveGoalTransaction = async (data: {
    type: 'savings_in' | 'savings_out';
    amount: number;
    description: string;
    date: string;
    source_of_fund?: string;
  }) => {
    if (!activeGoalForTx) return;

    const defaultStatus = data.type === 'savings_out' ? 'Kembalikan ke Kas Operasional' : 'Potong Kas / Gaji Bulan Ini';
    const statusValue = data.source_of_fund || defaultStatus;

    if (editingGoalTx) {
      await handleUpdateTransaction({
        ...editingGoalTx,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        platform: activeGoalForTx.id,
        category: 'Tujuan Tabungan',
        status: statusValue
      });
    } else {
      await handleSaveTransaction({
        date: data.date,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: 'Tujuan Tabungan',
        platform: activeGoalForTx.id,
        status: statusValue
      });
    }
    closeGoalTxModal();
  };

  return (
    <BudgetContext.Provider 
      value={{
        transactions,
        historyData,
        isLoading,
        dbStatus,
        isPrivacyMode,
        togglePrivacyMode,
        formatCurrency,
        handleDeleteTransaction,
        handleUpdateTransaction,
        handleBulkDeleteTransactions,
        handleBulkUpdateTransactions,
        openModal,
        openEditModal,
        refreshTransactions: fetchTransactions,
        fetchHistory,
        saveMonthlyHistory,
        deleteHistory,
        restoreHistory,
        savingsGoals,
        openGoalModal,
        closeGoalModal,
        handleSaveGoal,
        handleDeleteGoal,
        openGoalTxModal,
        closeGoalTxModal,
        handleSaveGoalTransaction
      }}
    >
      {children}
      
      {/* Global Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onCloseAction={closeModal}
        onSaveAction={handleSaveTransaction}
        initialData={editingTransaction}
        defaultCategory={modalDefaultCategory}
        defaultType={modalDefaultType}
      />

      {/* Dynamic Goal Modal (Create / Edit Goal) */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={closeGoalModal}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      {/* Goal Specific Transaction Modal (Setor / Tarik per Goal) */}
      <GoalTransactionModal
        isOpen={isGoalTxModalOpen}
        onClose={closeGoalTxModal}
        goal={activeGoalForTx}
        defaultType={defaultGoalTxType}
        initialTransaction={editingGoalTx}
        onSave={handleSaveGoalTransaction}
      />

      {/* Global Confirm Modal for Deletion */}
      {isGlobalConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
                <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Konfirmasi Hapus</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 whitespace-pre-wrap">
                  {globalConfirmMessage}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setIsGlobalConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (globalConfirmAction) globalConfirmAction();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 rounded-lg shadow-sm transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
