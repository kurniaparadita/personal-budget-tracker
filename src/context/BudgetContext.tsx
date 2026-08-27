'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionCategory, TransactionType, MonthlyHistory } from '@/types/budget';
import TransactionModal from '@/components/dashboard/TransactionModal';
import { Trash2 } from 'lucide-react';

interface BudgetContextType {
  transactions: Transaction[];
  historyData: MonthlyHistory[];
  isLoading: boolean;
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
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyData, setHistoryData] = useState<MonthlyHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<TransactionCategory | undefined>();
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType | undefined>();

  // Global Confirm Modal state
  const [isGlobalConfirmOpen, setIsGlobalConfirmOpen] = useState(false);
  const [globalConfirmMessage, setGlobalConfirmMessage] = useState('');
  const [globalConfirmAction, setGlobalConfirmAction] = useState<(() => void) | null>(null);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      if (data) setTransactions(data as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Gagal mengambil data dari database. Pastikan konfigurasi Supabase benar.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_history')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
        
      if (error) {
        console.error('Error fetching history:', error);
        return; // Silent fail if table doesn't exist yet
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

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', transaction.id);
        
      if (error) throw error;
      
      await fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Gagal mengupdate transaksi');
    }
  };

  const handleBulkUpdateTransactions = async (ids: string[], data: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .in('id', ids);
        
      if (error) throw error;
      
      await fetchTransactions();
    } catch (error) {
      console.error('Error bulk updating transactions:', error);
      alert('Gagal mengupdate transaksi');
    }
  };

  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    try {
      if (editingTransaction) {
        // Update
        const { error } = await supabase
          .from('transactions')
          .update(data)
          .eq('id', editingTransaction.id);
          
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('transactions')
          .insert([data]);
          
        if (error) throw error;
      }
      
      await fetchTransactions();
      closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Gagal menyimpan transaksi');
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

  return (
    <BudgetContext.Provider 
      value={{
        transactions,
        historyData,
        isLoading,
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
        restoreHistory
      }}
    >
      {children}
      
      {/* Global Transaction Modal */}
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        defaultCategory={modalDefaultCategory}
        defaultType={modalDefaultType}
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
