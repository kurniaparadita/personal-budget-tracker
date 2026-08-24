export type TransactionType = 'income' | 'expense' | 'savings_in' | 'savings_out';

export type TransactionCategory =
  | 'Pemasukan'
  | 'Pengeluaran Wajib'
  | 'Tagihan Online'
  | 'Tabungan'
  | 'Uang Darurat'
  | 'Opsional'
  | 'Admin'
  | 'Tujuan Tabungan'
  | 'Transfer Pribadi';

export interface Transaction {
  id: string;
  created_at: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  status: string;
  platform?: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  remainingBalance: number;
  status: 'AMAN' | 'OVERBUDGET';
}
