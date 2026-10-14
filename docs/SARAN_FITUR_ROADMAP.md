# 🗺️ Roadmap & Ide Pengembangan — Personal Budget Tracker

Dokumen ini berisi kumpulan saran fitur, ide inovasi, dan roadmap pengembangan untuk aplikasi **Personal Budget Tracker**. Disusun secara modular dengan checklist `[ ]` agar progres pengembangan dapat dipantau dan tidak hilang saat memulai sesi prompt baru.

---

## 📌 Status & Kategori Prioritas

| Kategori | Kompleksitas | Dampak Pengguna |
| :--- | :---: | :---: |
| [1. Quick Wins & UX Polish](#1-⚡-quick-wins--ux-polish) | Rendah | Tinggi |
| [2. Manajemen Anggaran & Produktivitas](#2-🚀-manajemen-anggaran--produktivitas-core) | Sedang | Sangat Tinggi |
| [3. Fitur Khusus Finansial Indonesia](#3-🇮🇩-fitur-khusus-finansial-indonesia) | Sedang | Sangat Tinggi |
| [4. Smart & AI Features](#4-🤖-smart--ai-features-next-gen) | Sedang - Tinggi | Tinggi |
| [5. Gamifikasi & Habit Building](#5-🎯-gamifikasi--habit-building) | Sedang | Sedang |
| [6. Platform, PWA & Keamanan](#6-📱-platform-pwa--keamanan) | Sedang | Tinggi |

---

## 1. ⚡ Quick Wins & UX Polish
Fitur cepat dibuat dengan efek visual dan kenyamanan penggunaan instan:

- [x] **Privacy Mode (Sensor Saldo 👁️):** *(Selesai diimplementasikan)*
  - Tombol toggle di Header/Navbar untuk menyensor angka nominal menjadi `Rp ••••••••`.
  - Sangat berguna saat membuka aplikasi di tempat umum (kafe, kantor, transportasi umum).
- [ ] **Floating Action Button (FAB Quick Add) di Mobile:**
  - Tombol melayang `(+)` di pojok kanan bawah layar mobile.
  - Membuka modal input transaksi ringkas dalam 1 kali ketuk.
- [ ] **Quick Search & Filter Global:**
  - Pencarian cepat transaksi berdasarkan nama, catatan, atau kategori tanpa reload halaman.
- [ ] **Pilihan Custom Accent Theme:**
  - Pilihan palet warna UI: *Emerald Green*, *Cyberpunk Violet*, *Ocean Blue*, atau *Luxury Gold*.

---

## 2. 🚀 Manajemen Anggaran & Produktivitas (Core)
Fitur inti untuk memperdalam kontrol keuangan pribadi:

- [ ] **Budget Limit & Alert Bar per Kategori:**
  - Menentukan batas maksimal anggaran bulanan per kategori (contoh: *Makan & Minum: Rp 2.000.000*).
  - Indikator progres bar visual di dashboard:
    - 🟢 Hijau: < 70% (Aman)
    - 🟡 Kuning: 70% - 90% (Hati-hati)
    - 🔴 Merah: > 90% / Over budget (Peringatan)
- [ ] **Multi-Account / Manajemen Dompet (Wallets):**
  - Pisahkan saldo berdasarkan sumber dana: *Tunai/Cash*, *BCA*, *Mandiri*, *GoPay*, *OVO*, *ShopeePay*.
  - Riwayat mutasi & fitur **Transfer Antar Dompet** (contoh: Tarik tunai dari BCA ke Dompet Fisik).
- [ ] **Export Laporan (Excel / CSV / PDF):**
  - Download rekap bulanan transaksi, pemasukan, pengeluaran, dan tabungan dalam format spreadsheet atau PDF siap cetak.
- [ ] **Kalender Jatuh Tempo & Pengingat Tagihan:**
  - Visualisasi kalender atau daftar tenggat waktu pembayaran tagihan rutin (WiFi, Listrik, Kos, Cicilan).
  - Status *Lunas* / *Belum Lunas* per bulan berjalan.
- [x] **Grafik Tren Cashflow Komparatif:** *(Selesai diimplementasikan)*
  - Grafik garis/batang yang membandingkan tren pemasukan vs pengeluaran dari bulan ke bulan.

---

## 3. 🇮🇩 Fitur Khusus Finansial Indonesia
Fitur kontekstual yang sangat relevan dengan kebiasaan finansial di Indonesia:

- [ ] **Paylater & Cicilan Tracker:**
  - Pencatatan utang cicilan (Shopee Paylater, Kredivo, Kartu Kredit, KPR, dll.).
  - Menyimpan informasi: Sisa tenor (*misal: Bulan ke-4 dari 12*), total sisa pokok, dan tanggal jatuh tempo.
- [ ] **Kalkulator Zakat & Sedekah Otomatis:**
  - Perhitungan instan 2.5% zakat penghasilan (zakat profesi/mal) dari pemasukan bersih bulanan.
  - Alokasi khusus pos sedekah rutin.
- [ ] **Split Bill (Bagi Tagihan Nongkrong):**
  - Kalkulator pembagian tagihan makan bersama teman (sudah termasuk persentase Pajak & Service Charge).
  - Tombol **Generate Teks WhatsApp** agar rincian tagihan mudah dibagikan ke grup chat.
- [ ] **Dana Darurat (Emergency Fund) Health Meter:**
  - Mengukur kecukupan dana darurat terhadap pengeluaran rutin bulanan (target ideal: 3x - 6x pengeluaran bulanan).

---

## 4. 🤖 Smart & AI Features (Next-Gen)
Pemanfaatan automasi cerdas untuk mempermudah pencatatan:

- [ ] **Smart Natural Language Input (Input Kalimat Santai):**
  - Input transaksi hanya dengan mengetik kalimat bebas:
    > *"kopi kenangan 25rb kemarin"*  
    > *"isi bensin pertalite 50rb bca"*
  - Parser otomatis memecah menjadi: `Nama Transaksi`, `Nominal`, `Kategori`, `Tanggal`, dan `Metode Pembayaran`.
- [ ] **Scan Struk Belanja (OCR Receipt Scanner):**
  - Upload atau foto struk kasir (Indomaret, Alfamart, restoran).
  - OCR otomatis mengekstrak tanggal, total belanja, dan menyarankan kategori.
- [x] **AI Financial Health Advisor:** *(Selesai diimplementasikan)*
  - Analisis cerdas bulanan berbasis data transaksi:
    > *"Diagnosis aturan emas 50/30/20, skor kesehatan finansial 0-100, dan rekomendasi personal otomatis."*

---

## 5. 🎯 Gamifikasi & Habit Building
Membangun kebiasaan mencatat uang agar tidak terasa membosankan:

- [ ] **Wishlist & Target Pembelian Impian:**
  - Pasang target barang impian (*misal: Beli Laptop Rp 15.000.000*).
  - Progress bar pencapaian dan kalkulasi otomatis estimasi bulan tercapai berdasarkan rata-rata tabungan bulanan.
- [ ] **No-Spend Day Challenge (Hari Bebas Jajan):**
  - Kalender visual dengan cap bintang ⭐ atau api 🔥 di hari-hari sukses tanpa pengeluaran jajan/opsional.
- [ ] **Streak & Badges:**
  - Menghitung keaktifan mencatat (contoh: *"🔥 14 Hari Berturut-turut"*).
  - Badge prestasi (*"Hemat Master"*, *"Sultan Terencana"*).

---

## 6. 📱 Platform, PWA & Keamanan
Peningkatan fondasi sistem dan kemudahan akses:

- [ ] **PWA (Progressive Web App) Setup:**
  - Tambahkan `manifest.json` dan service worker sehingga bisa di-install langsung di layar utama (Homescreen) Android & iPhone seperti aplikasi asli.
- [ ] **Supabase Authentication (Multi-User Login):**
  - Login via Google / Magic Link / Email Password.
  - Memisahkan data transaksi secara privat menggunakan Row-Level Security (RLS) Supabase per user.
- [ ] **Automated Backup / Export JSON:**
  - Tombol backup seluruh database ke file JSON lokal dan restore data secara aman.

---

## 📝 Catatan Sesi & Cara Memilih
Jika ingin mengimplementasikan salah satu fitur, cukup sebutkan judul fiturnya di chat, misalnya:
> *"Kerjakan fitur Privacy Mode (Sensor Saldo)"* atau *"Buat fitur Budget Limit & Alert Bar"*.
