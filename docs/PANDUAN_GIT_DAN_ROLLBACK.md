# 📘 Panduan Git: Deploy & Rollback (Personal Budget Tracker)

Panduan praktis langkah-demi-langkah untuk menyimpan perubahan ke GitHub/Git repository, men-deploy otomatis ke Vercel, serta cara mengembalikan (rollback/revert) aplikasi ke versi sebelumnya jika diperlukan.

---

## 📦 Rincian Fitur Baru yang Ditambahkan

Berikut daftar fitur dan file yang baru ditambahkan untuk memudahkan penulisan pesan commit:

### 1. 👁️ Fitur Privacy Mode (Sensor Saldo)
- **Komponen:** `src/components/PrivacyToggle.tsx` terpasang di `Header.tsx`.
- **Fungsi:** Menyensor seluruh angka nominal menjadi `Rp ••••••••` saat tombol mata diklik.
- **Cakupan:** Summary Cards, Kategori Transaksi, Recent Transactions, Savings Log, Tooltip Grafik, serta seluruh halaman (`/transaksi`, `/tagihan`, `/tabungan`, `/history`).
- **Penyimpanan:** Tersimpan otomatis di `localStorage` (`budget_privacy_mode`) sehingga tidak reset saat refresh.

### 2. 📊 Fitur Grafik Tren Cashflow Komparatif
- **Komponen:** `src/components/dashboard/CashflowTrendChart.tsx` terpasang di Dashboard utama (`page.tsx`).
- **Fungsi:** Visualisasi perbandingan tren **Pemasukan (Hijau)** vs **Pengeluaran (Merah)** vs **Net Arus Kas**.
- **Fitur Switcher:**
  - Periode: **Bulanan** (hingga 6 bulan terakhir) $\leftrightarrow$ **Bulan Ini** (pergerakan harian).
  - Tipe Visual: **Bar Chart** (batang berdampingan) $\leftrightarrow$ **Area Chart** (kurva gradien halus).
- **Mini KPI:** Total Masuk, Total Keluar, dan badge indikator Surplus/Defisit per periode.
- **Integrasi:** Tooltip interaktif otomatis tersensor jika Privacy Mode aktif.

### 3. 🤖 Fitur AI Financial Health Advisor
- **Komponen:** `src/components/dashboard/FinancialHealthAdvisor.tsx` terpasang di Dashboard utama (`page.tsx`).
- **Fungsi:** Diagnosis otomatis kesehatan finansial pengguna:
  - **Health Score (0 - 100):** Skor terhitung dinamis dari 4 pilar finansial.
  - **Pilar Aturan 50/30/20:** Progress bar komparasi Kebutuhan Pokok (Maks 50%), Fleksibel/Jajan (Maks 30%), dan Tabungan (Min 20%).
  - **Smart Insights:** 3 poin analisis dan rekomendasi aksi personal berbahasa Indonesia.
- **Integrasi:** Nominal uang otomatis tersensor jika Privacy Mode aktif.

### 4. 📁 Dokumentasi & Roadmap Proyek
- `docs/SARAN_FITUR_ROADMAP.md` (roadmap fitur lengkap dengan checklist progres).
- `docs/PANDUAN_GIT_DAN_ROLLBACK.md` (panduan git push dan rollback).

### 5. 🛠️ Perbaikan Next.js 16 Client Boundary (Props Serialization)
- **Komponen:** `TransactionDataTable.tsx`, `BillDataTable.tsx`, `TransactionModal.tsx`.
- **Perbaikan:** Menghapus direktif `'use client'` yang redundan pada child components dan menyelaraskan penamaan props callback ganda (`on...` / `on...Action`) agar 100% bebas dari warning Next.js 16.

### 6. 🛡️ Ketahanan Database (Timeout Guard & Offline Fallback)
- **Komponen:** `BudgetContext.tsx`, `DatabaseStatusBanner.tsx`, `layout.tsx`.
- **Fungsi:** Menambahkan batas waktu (timeout 5 detik) pada pemanggilan database agar aplikasi tidak pernah tertahan loading tanpa henti, caching otomatis ke `localStorage`, serta banner peringatan informatif jika proyek Supabase sedang dijeda (paused).

---

### 📝 Rekomendasi Pesan Commit (Siap Copy-Paste)

**Opsi 1: Singkat & Padat**
```bash
git commit -m "feat: enhance dashboard, add financial advisor, fix nextjs 16 client boundary and db resilience"
```

**Opsi 2: Deskriptif Lengkap (Conventional Commits)**
```bash
git commit -m "feat: dashboard enhancements, financial advisor, and resilience improvements

- Add global privacy toggle in Header to mask balances with localStorage persistence
- Add CashflowTrendChart component with monthly/daily views and Bar/Area chart switchers
- Add FinancialHealthAdvisor widget with 50/30/20 rule breakdown, health score, and smart insights
- Resolve Next.js 16 client boundary props serialization warnings on data tables and modals
- Add 5-second timeout guard, offline local caching, and DatabaseStatusBanner for Supabase connectivity
- Add project documentation in docs/ for roadmap and git rollback guidelines"
```

---

## 🚀 1. Cara Push Update ke Repository

### Opsi A: Langsung ke `main` (Paling Cepat & Praktis)
Gunakan opsi ini jika kamu ingin perubahan langsung tayang (*live*) di domain utama Vercel.

1. **Cek file yang berubah:**
   ```bash
   git status
   ```
2. **Tambahkan semua perubahan ke staging:**
   ```bash
   git add .
   ```
3. **Buat commit dengan pesan yang jelas:**
   ```bash
   git commit -m "feat: add privacy mode and cashflow trend chart"
   ```
4. **Push ke GitHub:**
   ```bash
   git push origin main
   ```
> ⏱️ *Begitu proses push selesai, Vercel akan otomatis mendeteksi commit baru dan memperbarui website dalam ~1 menit.*

---

### Opsi B: Menggunakan Feature Branch (Best Practice / Ada Preview URL)
Gunakan opsi ini jika kamu ingin menguji fiturnya di URL khusus (*Preview Deployment*) sebelum masuk ke domain utama.

1. **Buat dan pindah ke branch baru:**
   ```bash
   git checkout -b feature/dashboard-updates
   ```
2. **Simpan dan push perubahan:**
   ```bash
   git add .
   git commit -m "feat: add privacy mode and cashflow trend chart"
   git push -u origin feature/dashboard-updates
   ```
3. *Vercel akan memberikan link Preview URL di dashboard.*
4. **Setelah yakin aman, gabungkan ke `main`:**
   ```bash
   git checkout main
   git merge feature/privacy-mode
   git push origin main
   ```

---

## ⏪ 2. Cara Rollback / Revert ke Versi Sebelumnya

Jika fitur yang baru di-push ingin dibatalkan dan dikembalikan ke kondisi sebelumnya, gunakan salah satu cara berikut:

### Cara 1: Instant Rollback via Vercel Dashboard (Paling Cepat — 5 Detik)
*Cara ini langsung mengembalikan tampilan website live tanpa perlu membuka terminal atau mengubah kode.*

1. Buka dashboard proyek di [vercel.com](https://vercel.com).
2. Klik tab **Deployments**.
3. Cari riwayat deployment **sebelum** fitur privasi dimasukkan (bisa dilihat dari jam dan judul commit-nya).
4. Klik tombol titik tiga (**`...`**) di sisi kanan deployment tersebut.
5. Pilih **Instant Rollback** (atau **Promote to Production**).
6. **Selesai!** Website utama langsung kembali ke versi lama secara instan.

---

### Cara 2: Menggunakan `git revert` (Sangat Aman & Direkomendasikan di Git)
*Cara ini membatalkan perubahan dari commit terakhir dengan membuat commit baru pembalik, sehingga riwayat Git tetap aman dan tercatat.*

1. **Pastikan berada di branch `main`:**
   ```bash
   git checkout main
   ```
2. **Revert commit paling terakhir:**
   ```bash
   git revert HEAD
   ```
   *(Editor teks Git akan muncul untuk pesan commit, cukup simpan dan tutup, atau tekan Enter jika di terminal standar).*

3. **Push pembatalan ke GitHub:**
   ```bash
   git push origin main
   ```
4. Vercel akan otomatis mendeteksi push ini dan men-deploy versi yang sudah dibatalkan.

---

### Cara 3: Menggunakan `git reset` (Hapus Commit Terakhir)
*Gunakan cara ini hanya jika kamu ingin benar-benar menghapus commit terakhir dari history.*

> ⚠️ **Perhatian:** Cara ini mengubah riwayat git dan memerlukan opsi `--force`. Gunakan dengan hati-hati.

```bash
# 1. Kembalikan 1 commit ke belakang dan buang perubahannya
git reset --hard HEAD~1

# 2. Paksa push ke remote
git push origin main --force
```

---

## 📋 3. Cheatsheet Perintah Singkat

| Kebutuhan | Perintah Terminal |
| :--- | :--- |
| **Cek status file** | `git status` |
| **Lihat riwayat commit** | `git log --oneline -n 5` |
| **Push update biasa** | `git add . && git commit -m "pesan" && git push origin main` |
| **Batalkan commit terakhir (aman)** | `git revert HEAD && git push origin main` |
| **Bikin branch baru** | `git checkout -b nama-branch` |
| **Pindah branch** | `git checkout nama-branch` |

---

## 💡 Tips Tambahan
- **Lihat ID Commit:** Jalankan `git log --oneline` untuk melihat daftar kode hash commit jika ingin me-revert commit tertentu yang lebih lama (`git revert <commit-hash>`).
- **Simpan Pekerjaan Sementara:** Jika ada perubahan lokal yang belum mau di-commit tapi ingin pindah branch, jalankan `git stash`, dan pulihkan kembali nanti dengan `git stash pop`.
