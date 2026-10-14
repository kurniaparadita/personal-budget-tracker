'use client';

import { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import SavingsLog from '@/components/dashboard/SavingsLog';
import SavingsGoalCard from '@/components/dashboard/SavingsGoalCard';
import { SavingsGoal } from '@/types/budget';
import { Plus, Target, PiggyBank, Sparkles, TrendingUp } from 'lucide-react';

export default function TabunganPage() {
  const { 
    transactions, 
    savingsGoals,
    isLoading, 
    isPrivacyMode,
    formatCurrency,
    openModal, 
    openEditModal, 
    handleDeleteTransaction,
    openGoalModal,
    handleDeleteGoal,
    openGoalTxModal
  } = useBudget();

  const [activeTab, setActiveTab] = useState<'goals' | 'general'>('goals');

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter transaksi khusus untuk masing-masing tujuan
  const getGoalTransactions = (goal: SavingsGoal) => {
    return transactions.filter(t => {
      // Direct link by goal_id or platform (which stores goal.id)
      if (t.goal_id === goal.id || t.platform === goal.id) return true;
      // Backward compatibility matching:
      if (goal.id === 'goal-darurat' && t.category === 'Uang Darurat' && !t.platform) return true;
      if (goal.id === 'goal-qurban' && t.description?.toLowerCase().includes('qurban') && !t.platform) return true;
      if (goal.id === 'goal-laptop' && t.category === 'Tujuan Tabungan' && !t.platform) return true;
      return false;
    });
  };

  // Hitung akumulasi metrik seluruh tujuan
  const goalMetrics = savingsGoals.map(goal => {
    const txs = getGoalTransactions(goal);
    const saved = txs.reduce((sum, t) => sum + (t.type === 'savings_out' ? -Number(t.amount) : Number(t.amount)), 0);
    return {
      target: Number(goal.target_amount) || 0,
      saved: Math.max(0, saved)
    };
  });

  const totalAllGoalsSaved = goalMetrics.reduce((sum, m) => sum + m.saved, 0);
  const totalAllGoalsTarget = goalMetrics.reduce((sum, m) => sum + m.target, 0);
  const avgProgress = totalAllGoalsTarget > 0 ? Math.min(100, Math.round((totalAllGoalsSaved / totalAllGoalsTarget) * 100)) : 0;

  // Transaksi tabungan umum (unallocated / general savings)
  const generalSavingsTxs = transactions.filter(t => t.category === 'Tabungan');

  return (
    <div className="space-y-8">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Tabungan & Pos Anggaran
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kelola tujuan spesifik impian Anda atau pantau buku mutasi simpanan umum.
          </p>
        </div>

        {/* Segmented Mode Control */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl shadow-sm ring-1 ring-zinc-200/50 dark:ring-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'goals'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Tabungan Spesifik / Tujuan</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold">
              {savingsGoals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'general'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <PiggyBank className="h-4 w-4" />
            <span>Tabungan Umum</span>
          </button>
        </div>
      </div>

      {/* MODE 1: TABUNGAN SPESIFIK / TUJUAN (MULTI-GOAL) */}
      {activeTab === 'goals' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Goals Overview Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Sistem Pos Tabungan Mandiri</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Terkumpul {isPrivacyMode ? 'Rp ••••••••' : formatCurrency(totalAllGoalsSaved)}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                  Dari total target akumulasi {formatCurrency(totalAllGoalsTarget)} untuk {savingsGoals.length} tujuan impian Anda.
                </p>

                {/* Micro Progress Bar */}
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-blue-100">
                    <span>Progress Akumulasi</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {avgProgress}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action: Buat Tujuan Baru */}
              <button
                onClick={() => openGoalModal()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap self-start md:self-center"
              >
                <Plus className="h-4 w-4" />
                Buat Tujuan Baru
              </button>
            </div>
          </div>

          {/* Dynamic Grid of SavingsGoalCard */}
          {savingsGoals.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Belum ada kartu tujuan tabungan
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-6">
                Buat pos tujuan tabungan Anda, misalnya Tabungan Qurban, Beli Laptop, atau Liburan Impian.
              </p>
              <button
                onClick={() => openGoalModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Buat Tujuan Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {savingsGoals.map((goal) => {
                const goalTxs = getGoalTransactions(goal);
                return (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    transactions={goalTxs}
                    onDeposit={(g) => openGoalTxModal(g, 'savings_in')}
                    onWithdraw={(g) => openGoalTxModal(g, 'savings_out')}
                    onEditGoal={(g) => openGoalModal(g)}
                    onDeleteGoal={(goalId) => handleDeleteGoal(goalId)}
                    onEditTransaction={(g, tx) => openGoalTxModal(g, tx.type === 'savings_out' ? 'savings_out' : 'savings_in', tx)}
                    onDeleteTransaction={(txId) => handleDeleteTransaction(txId)}
                  />
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* MODE 2: TABUNGAN UMUM (REGULER LEDGER) */}
      {activeTab === 'general' && (
        <div className="animate-in fade-in duration-300">
          <SavingsLog
            title="Buku Mutasi Tabungan Umum"
            transactions={generalSavingsTxs}
            onAdd={() => openModal('Tabungan', 'savings_in')}
            onEdit={openEditModal}
            onDelete={handleDeleteTransaction}
          />
        </div>
      )}

    </div>
  );
}
