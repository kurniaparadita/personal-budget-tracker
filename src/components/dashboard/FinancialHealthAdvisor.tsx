'use client';

import { useMemo } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Sparkles, ShieldCheck, AlertCircle, AlertTriangle, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';

export default function FinancialHealthAdvisor() {
  const { transactions, isPrivacyMode, formatCurrency } = useBudget();

  // Hitung metrik dan evaluasi kesehatan finansial
  const evaluation = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalNeeds = transactions
      .filter(t => t.category === 'Pengeluaran Wajib' || t.category === 'Tagihan Online')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalWants = transactions
      .filter(t => t.category === 'Opsional' || t.category === 'Admin' || t.category === 'Transfer Pribadi')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSavingsIn = transactions
      .filter(t => t.type === 'savings_in' || t.category === 'Tabungan' || t.category === 'Tujuan Tabungan' || t.category === 'Uang Darurat')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netCashFlow = totalIncome - totalExpense;

    // Jika belum ada income terdata, gunakan total pengeluaran sebagai basis perbandingan
    const baseAmount = totalIncome > 0 ? totalIncome : (totalNeeds + totalWants + totalSavingsIn) || 1;

    const needsRatio = Math.round((totalNeeds / baseAmount) * 100);
    const wantsRatio = Math.round((totalWants / baseAmount) * 100);
    const savingsRatio = Math.round((totalSavingsIn / baseAmount) * 100);

    // Hitung Skor Finansial (0 - 100)
    let score = 50; // base score

    // Pilar 1: Tabungan (ideal >= 20%) -> max 35 poin
    if (savingsRatio >= 25) score += 35;
    else if (savingsRatio >= 20) score += 30;
    else if (savingsRatio >= 10) score += 15;
    else if (savingsRatio > 0) score += 5;
    else score -= 10;

    // Pilar 2: Kebutuhan Pokok & Tagihan (ideal <= 50%) -> max 30 poin
    if (needsRatio <= 50) score += 30;
    else if (needsRatio <= 65) score += 15;
    else score -= 15;

    // Pilar 3: Pengeluaran Opsional / Jajan (ideal <= 30%) -> max 20 poin
    if (wantsRatio <= 30) score += 20;
    else if (wantsRatio <= 40) score += 10;
    else score -= 15;

    // Pilar 4: Net Flow (surplus vs defisit) -> max 15 poin
    if (netCashFlow > 0) score += 15;
    else if (netCashFlow < 0) score -= 20;

    // Normalisasi skor 10 - 100
    score = Math.max(10, Math.min(100, score));

    // Status level
    let statusLabel = 'Sangat Sehat 🌟';
    let statusColor = 'emerald';
    let statusDesc = 'Pengelolaan keuanganmu sangat terencana dan berada di jalur aman.';

    if (score < 50) {
      statusLabel = 'Perlu Perhatian ⚠️';
      statusColor = 'rose';
      statusDesc = 'Pengeluaran melebihi rasio ideal atau arus kas sedang defisit. Perlu penghematan.';
    } else if (score < 80) {
      statusLabel = 'Cukup Sehat 👍';
      statusColor = 'amber';
      statusDesc = 'Kondisi finansial cukup stabil, namun ada beberapa pos yang bisa dioptimalkan.';
    }

    // Generate smart insights
    const insights = [];

    // Insight Tabungan
    if (savingsRatio >= 20) {
      insights.push({
        type: 'positive',
        title: 'Rasio Tabungan Prima',
        desc: `Alokasi tabunganmu mencapai ${savingsRatio}% dari total pemasukan (${formatCurrency(totalSavingsIn)}), melampaui standar ideal 20%.`
      });
    } else if (savingsRatio > 0) {
      insights.push({
        type: 'warning',
        title: 'Tingkatkan Pos Tabungan',
        desc: `Rasio tabungan saat ini ${savingsRatio}%. Sisihkan sedikit lebih banyak untuk mencapai target ideal 20% demi keamanan masa depan.`
      });
    } else {
      insights.push({
        type: 'danger',
        title: 'Belum Ada Alokasi Tabungan',
        desc: 'Kamu belum mencatat dana yang disisihkan ke tabungan bulan ini. Prioritaskan menabung di awal saat menerima pemasukan.'
      });
    }

    // Insight Pengeluaran Opsional
    if (wantsRatio > 35) {
      insights.push({
        type: 'warning',
        title: 'Evaluasi Jajan & Belanja Santai',
        desc: `Pengeluaran opsional mencapai ${wantsRatio}% (di atas batas rekomendasi 30%). Mengurangi jajan kecil bisa menghemat hingga ratusan ribu.`
      });
    } else {
      insights.push({
        type: 'positive',
        title: 'Pengeluaran Fleksibel Terkontrol',
        desc: `Pengeluaran opsional hanya ${wantsRatio}%, sangat disiplin di bawah batas aman 30%.`
      });
    }

    // Insight Tagihan & Arus Kas
    if (netCashFlow >= 0) {
      insights.push({
        type: 'positive',
        title: 'Arus Kas Positif (Surplus)',
        desc: `Surplus sebesar ${formatCurrency(netCashFlow)} dapat dialokasikan sebagai tambahan dana darurat atau modal investasi.`
      });
    } else {
      insights.push({
        type: 'danger',
        title: 'Defisit Arus Kas Terdeteksi',
        desc: `Pengeluaran melebihi pemasukan sebesar ${formatCurrency(Math.abs(netCashFlow))}. Tinjau kembali daftar transaksi untuk memangkas pos biaya yang tidak mendesak.`
      });
    }

    return {
      score,
      statusLabel,
      statusColor,
      statusDesc,
      needsRatio,
      wantsRatio,
      savingsRatio,
      totalIncome,
      totalNeeds,
      totalWants,
      totalSavingsIn,
      netCashFlow,
      insights
    };
  }, [transactions, isPrivacyMode, formatCurrency]);

  if (!evaluation) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 dark:from-zinc-900/90 dark:via-zinc-900/80 dark:to-indigo-950/30 p-6 shadow-sm ring-1 ring-indigo-200/50 dark:ring-indigo-500/20 backdrop-blur-xl">
      {/* Background Decorative Glow */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-indigo-200/80 dark:border-zinc-800/80 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                AI Financial Health Advisor
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/40">
                Live Analysis
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1">
              Diagnosis kesehatan finansial otomatis berdasarkan metode aturan emas 50/30/20
            </p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-xl shadow-sm ring-1 ring-zinc-300 dark:ring-zinc-700 backdrop-blur-md">
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Health Score</p>
            <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{evaluation.statusLabel}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-black text-xl shadow-inner ${
            evaluation.statusColor === 'emerald'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/40'
              : evaluation.statusColor === 'amber'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/40'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/40'
          }`}>
            {evaluation.score}
          </div>
        </div>
      </div>

      {/* Main Grid: 50/30/20 Rule + Smart AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
        
        {/* Left Col: 50/30/20 Breakdown Bars (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-white dark:bg-zinc-900/90 p-5 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Pilar Alokasi 50 / 30 / 20
              </span>
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Aktual vs Target</span>
            </div>

            {/* Bar 1: Kebutuhan Pokok (Needs) */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">1. Kebutuhan & Tagihan</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400">
                  {evaluation.needsRatio}% <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">(Maks 50%)</span>
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${
                    evaluation.needsRatio <= 50 ? 'bg-emerald-500' : evaluation.needsRatio <= 65 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, evaluation.needsRatio)}%` }}
                ></div>
              </div>
            </div>

            {/* Bar 2: Pengeluaran Opsional (Wants) */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">2. Keinginan / Jajan</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">
                  {evaluation.wantsRatio}% <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">(Maks 30%)</span>
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${
                    evaluation.wantsRatio <= 30 ? 'bg-emerald-500' : evaluation.wantsRatio <= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, evaluation.wantsRatio)}%` }}
                ></div>
              </div>
            </div>

            {/* Bar 3: Tabungan & Investasi (Savings) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">3. Tabungan & Masa Depan</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  {evaluation.savingsRatio}% <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">(Min 20%)</span>
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${
                    evaluation.savingsRatio >= 20 ? 'bg-emerald-500' : evaluation.savingsRatio >= 10 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, evaluation.savingsRatio)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Kaidah 50/30/20 adalah standar rasio finansial internasional agar cashflow tetap sehat.</span>
          </div>
        </div>

        {/* Right Col: AI Smart Diagnosis & Actionable Insights (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
          <div className="space-y-3">
            {evaluation.insights.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all hover:ring-indigo-300 dark:hover:ring-indigo-700"
              >
                <div className="mt-0.5 shrink-0">
                  {item.type === 'positive' && (
                    <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                  {item.type === 'warning' && (
                    <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  {item.type === 'danger' && (
                    <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-500/20">
                      <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h4>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Summary Note */}
          <div className="p-3 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
            <span className="leading-snug">{evaluation.statusDesc}</span>
            <span className="font-extrabold shrink-0 ml-3 bg-white/80 dark:bg-zinc-800 px-2 py-1 rounded-md text-indigo-700 dark:text-indigo-300 shadow-xs">
              Tips Cerdas 💡
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
