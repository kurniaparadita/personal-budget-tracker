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

export interface MonthlyHistory {
  id: string;
  created_at: string;
  month: number; // 1-12
  year: number;
  total_income: number;
  total_expense: number;
  total_savings: number;
  net_cash_flow: number;
  notes?: string;
  transactions_snapshot: Transaction[];
}
