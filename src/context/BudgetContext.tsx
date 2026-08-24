'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionCategory, TransactionType } from '@/types/budget';
import TransactionModal from '@/components/dashboard/TransactionModal';

interface BudgetContextType {
  transactions: Transaction[];
  isLoading: boolean;
  handleDeleteTransaction: (id: string) => Promise<void>;
  openModal: (category?: TransactionCategory, type?: TransactionType) => void;
  openEditModal: (transaction: Transaction) => void;
  refreshTransactions: () => Promise<void>;
  handleUpdateTransaction: (transaction: Transaction) => Promise<void>;
  handleBulkDeleteTransactions: (ids: string[]) => Promise<void>;
  handleBulkUpdateTransactions: (ids: string[], data: Partial<Transaction>) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<TransactionCategory | undefined>();
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType | undefined>();

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

  useEffect(() => {
    fetchTransactions();
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
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;
    
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
  };

  const handleBulkDeleteTransactions = async (ids: string[]) => {
    if (!window.confirm(`Yakin ingin menghapus ${ids.length} transaksi ini?`)) return;
    
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
        isLoading,
        handleDeleteTransaction,
        handleUpdateTransaction,
        handleBulkDeleteTransactions,
        handleBulkUpdateTransactions,
        openModal,
        openEditModal,
        refreshTransactions: fetchTransactions
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
