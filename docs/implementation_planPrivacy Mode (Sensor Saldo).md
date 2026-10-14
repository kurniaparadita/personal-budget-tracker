# Rencana Implementasi: Privacy Mode (Sensor Saldo 👁️)

Fitur **Privacy Mode** memungkinkan pengguna menyembunyikan/menyensor nominal saldo dan transaksi (menjadi `Rp ••••••••`) hanya dengan satu kali klik pada tombol di Header. Fitur ini sangat bermanfaat saat membuka aplikasi di tempat umum (kafe, kantor, transportasi umum) agar data finansial tetap privat dan aman dari pandangan orang sekitar.

---

## User Review Required

> [!NOTE]
> - **Format Sensor:** Nominal akan ditampilkan sebagai `Rp ••••••••` dengan gaya font monospace/tracking yang rapi seperti standar aplikasi perbankan modern (BCA Mobile, Livin' Mandiri, Bibit).
> - **Penyimpanan Status:** Preferensi Privacy Mode akan disimpan di `localStorage` (`budget_privacy_mode`) sehingga tetap tersimpan meskipun halaman di-refresh.
> - **Penempatan Tombol:** Diletakkan di samping tombol ganti tema (`ThemeToggle`) di Header atas agar mudah diakses di desktop maupun mobile.

---

## Proposed Changes

### Core Context & State

#### [MODIFY] [BudgetContext.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/context/BudgetContext.tsx)
- Tambahkan state `isPrivacyMode: boolean` (default `false`).
- Sinkronisasi dengan `localStorage` (`budget_privacy_mode`) setelah komponen mount (mencegah hydration mismatch).
- Tambahkan fungsi `togglePrivacyMode: () => void`.
- Tambahkan helper function `formatCurrency: (amount: number) => string` ke context value untuk mempermudah pemanggilan di semua komponen.

---

### Format Utility

#### [MODIFY] [format.ts](file:///d:/Work/WorkShop/personal-budget-tracker/src/utils/format.ts)
- Update fungsi `formatRupiah(amount: number, isPrivacy: boolean = false): string`.
- Jika `isPrivacy === true`, return string seragam `'Rp ••••••••'`.

---

### UI Components

#### [NEW] [PrivacyToggle.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/PrivacyToggle.tsx)
- Buat tombol toggle interaktif dengan icon `Eye` dan `EyeOff` dari `lucide-react`.
- Tampilan responsif dengan efek hover, focus ring, tooltip, dan transisi halus.
- Indikator aktif yang jelas ketika Privacy Mode sedang menyala.

#### [MODIFY] [Header.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/Header.tsx)
- Import dan pasang `<PrivacyToggle />` tepat di samping `<ThemeToggle />`.

---

### Dashboard & Page Components

Integrasikan `isPrivacyMode` / `formatCurrency` ke komponen tampilan angka:
#### [MODIFY] [SummaryCards.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/SummaryCards.tsx)
- Gunakan `formatCurrency` / `formatRupiah(..., isPrivacyMode)` untuk Total Pemasukan, Total Pengeluaran, dan Sisa Saldo.

#### [MODIFY] [TransactionSection.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/TransactionSection.tsx)
- Masking nominal transaksi per baris dan total ringkasan per kategori.

#### [MODIFY] [TransactionDataTable.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/TransactionDataTable.tsx)
- Masking nominal transaksi pada tabel detail.

#### [MODIFY] [BillDataTable.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/BillDataTable.tsx)
- Masking nominal tagihan online pada tabel.

#### [MODIFY] [RecentTransactions.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/RecentTransactions.tsx)
- Masking nominal transaksi terkini.

#### [MODIFY] [SavingsLog.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/SavingsLog.tsx)
- Masking riwayat nominal masuk, keluar, dan saldo tabungan.

#### [MODIFY] [AllocationChart.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/AllocationChart.tsx)
- Masking nominal pada Tooltip diagram alokasi.

#### [MODIFY] Pages:
- [src/app/transaksi/page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/transaksi/page.tsx)
- [src/app/tagihan/page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/tagihan/page.tsx)
- [src/app/tabungan/page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/tabungan/page.tsx)
- [src/app/history/page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/history/page.tsx)

---

### Dokumentasi

#### [MODIFY] [SARAN_FITUR_ROADMAP.md](file:///d:/Work/WorkShop/personal-budget-tracker/docs/SARAN_FITUR_ROADMAP.md)
- Tandai checklist `[x]` pada fitur Privacy Mode setelah selesai diimplementasikan.

---

## Verification Plan

### Automated Verification
- Jalankan pemeriksaan lint dan typecheck:
  ```powershell
  npm run build
  ```
- Pastikan tidak ada error TypeScript atau build failure.

### Manual Verification
1. Buka aplikasi di browser (`localhost:3000`).
2. Klik tombol Privacy Mode (`Eye` 👁️) di Header:
   - Ikon berubah menjadi `EyeOff` 🙈 dengan highlight aktif.
   - Semua nominal di Dashboard (Summary Cards, Kategori, Recent Transactions, Savings Log, Chart Tooltip) tersensor menjadi `Rp ••••••••`.
3. Navigasi ke halaman lain (`/transaksi`, `/tagihan`, `/tabungan`, `/history`):
   - Pastikan nominal di halaman-halaman tersebut juga tersensor rapi.
4. Refresh halaman (F5):
   - Pastikan status Privacy Mode tetap tersimpan dan tidak reset.
5. Klik lagi tombol Privacy Mode:
   - Ikon kembali ke `Eye`, nominal kembali terlihat normal.
