# Rencana Implementasi: Grafik Tren Cashflow Komparatif 📊

Fitur **Grafik Tren Cashflow Komparatif** menambahkan visualisasi analitik interaktif di Dashboard utama yang membandingkan tren **Pemasukan (Income)** vs **Pengeluaran (Expense)** serta **Arus Kas Bersih (Net Flow)** dari waktu ke waktu.

---

## User Review Required

> [!IMPORTANT]
> - **Pilihan Granularitas Waktu:** Pengguna dapat memilih mode tampilan:
>   1. **Bulanan (Monthly View):** Menampilkan perbandingan performa keuangan dari bulan ke bulan (misal: 6 bulan terakhir / sepanjang tahun).
>   2. **Harian/Mingguan (Current Month View):** Sangat berguna jika pengguna baru mencatat di bulan berjalan, menampilkan pergerakan cashflow per tanggal/minggu dalam bulan ini.
> - **Tipe Grafik Dinamis:** Pengguna dapat mengganti tampilan antara:
>   - **Bar Chart (Batang Berdampingan):** Membandingkan nominal pemasukan vs pengeluaran secara tegas.
>   - **Area Chart (Kurva Gradien Halus):** Menampilkan tren dan aliran dana yang berkesinambungan ala dashboard SaaS modern.
> - **Integrasi Privacy Mode:** Tooltip dan nominal pada grafik otomatis tersensor (`Rp ••••••••`) saat Privacy Mode di Header sedang aktif.

---

## Proposed Changes

### Komponen Baru

#### [NEW] [CashflowTrendChart.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/CashflowTrendChart.tsx)
Komponen analitik modern berbasis `recharts` dengan fitur:
- **Kalkulasi Data Otomatis:** Menghitung total `income`, `expense`, dan `netFlow` dari data `transactions` di `BudgetContext`.
- **Switcher Granularitas:** Toggle antara `Bulanan` vs `Bulan Ini (Harian/Mingguan)`.
- **Switcher Tipe Visual:** Toggle antara `Bar Chart` dan `Area Chart`.
- **Ringkasan Cepat di Header:** Menampilkan total pemasukan, total pengeluaran, dan badge surplus/defisit periode yang dipilih.
- **Custom Tooltip:** Tooltip elegan bergaya SaaS dengan dukungan dark mode dan sensor saldo saat Privacy Mode aktif.
- **Responsive Layout:** Menggunakan `ResponsiveContainer` agar tampil proporsional di HP, tablet, maupun layar desktop.

---

### Dashboard Page

#### [MODIFY] [page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/page.tsx)
- Import dan pasang komponen `<CashflowTrendChart />` di Dashboard utama.
- Menata susunan grid:
  - Baris 1: `SummaryCards` (Ringkasan KPI)
  - Baris 2: `CashflowTrendChart` (Grafik Komparatif Tren Finansial)
  - Baris 3: `AllocationChart` (Donut Persentase) & `RecentTransactions` (Transaksi Terkini)

---

### Dokumentasi Roadmap

#### [MODIFY] [SARAN_FITUR_ROADMAP.md](file:///d:/Work/WorkShop/personal-budget-tracker/docs/SARAN_FITUR_ROADMAP.md)
- Tandai checklist `[x]` pada fitur **Grafik Tren Cashflow Komparatif**.

---

## Verification Plan

### Automated Verification
- Jalankan pemeriksaan build Next.js:
  ```powershell
  npm run build
  ```
- Pastikan tidak ada error tipe data TypeScript maupun build warning.

### Manual Verification
1. Buka aplikasi di `http://localhost:3000`.
2. Periksa tampilan komponen grafik baru di Dashboard:
   - Pastikan grafik memuat data pemasukan dan pengeluaran dengan warna kontras yang estetik (Hijau/Emerald untuk Masuk, Merah/Rose untuk Keluar).
   - Tes ganti mode: **Bulanan** $\leftrightarrow$ **Bulan Ini**.
   - Tes ganti jenis grafik: **Bar** $\leftrightarrow$ **Area**.
   - Hover pada grafik untuk memeriksa tooltip dan nominal.
3. Uji interaksi dengan **Privacy Mode**:
   - Aktifkan tombol sensor saldo 👁️ di header, pastikan angka nominal di tooltip grafik berubah menjadi `Rp ••••••••`.
