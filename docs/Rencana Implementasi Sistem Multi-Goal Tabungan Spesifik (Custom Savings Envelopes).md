# Rencana Implementasi: Sistem Multi-Goal Tabungan Spesifik (Custom Savings Envelopes)

Pengguna menginginkan pemisahan konsep yang jelas antara:
1. **Tabungan Umum**: Pos simpanan umum reguler dengan buku mutasi saldo masuk & keluar (CRUD biasa).
2. **Tabungan Spesifik / Tujuan (Dynamic Multi-Goal Envelopes)**: Fitur pembuatan kartu tujuan tabungan dinamis. Pengguna bisa membuat kartu baru kapan saja (contoh: *Tabungan Qurban*, *Beli Laptop*, *Liburan*, dll.), mengatur target nominal, melakukan alokasi setor/tarik khusus ke kartu tersebut, serta mengelola riwayat transaksi (CRUD) di dalam masing-masing kartu tujuan.

---

## 🎯 Konsep Desain & Arsitektur

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Halaman: Tabungan & Tujuan                           │
├────────────────────────────────────────────────────────────────────────┤
│  [Tab: Tabungan Spesifik / Tujuan]      [Tab: Tabungan Umum / Cadangan]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [+ Buat Tujuan Baru]  (Buka Modal Buat Target: Nama, Target Rp, Warna)│
│                                                                        │
│  ┌──────────────────────────┐      ┌──────────────────────────┐        │
│  │ 🐑 Tabungan Qurban       │      │ 💻 Beli Laptop Baru      │   ...  │
│  │ Target: Rp 3.500.000     │      │ Target: Rp 15.000.000    │        │
│  │ Terkumpul: Rp 1.500.000  │      │ Terkumpul: Rp 8.000.000  │        │
│  │ Progress: 43%            │      │ Progress: 53%            │        │
│  │ [Progress Bar Visual]    │      │ [Progress Bar Visual]    │        │
│  │ [+ Setor]  [- Tarik]     │      │ [+ Setor]  [- Tarik]     │        │
│  │ [Lihat Riwayat & CRUD ▼] │      │ [Lihat Riwayat & CRUD ▼] │        │
│  └──────────────────────────┘      └──────────────────────────┘        │
│                                                                        │
│  * Di dalam masing-masing card, terdapat daftar mutasi khusus tujuan   │
│    tersebut dengan fitur Tambah, Edit, dan Hapus (CRUD lengkap).       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Perubahan yang Diusulkan

### 1. Model Data (`src/types/budget.ts`)
#### [MODIFY] [budget.ts](file:///d:/Work/WorkShop/personal-budget-tracker/src/types/budget.ts)
* Tambahkan interface `SavingsGoal`:
  ```ts
  export interface SavingsGoal {
    id: string;
    created_at: string;
    name: string; // contoh: "Tabungan Qurban", "Beli Laptop"
    target_amount: number; // contoh: 3500000
    category: 'Tujuan Tabungan' | 'Uang Darurat' | 'Tabungan';
    color?: string; // tema warna visual card (emerald, blue, purple, amber, rose)
    icon?: string; // pilihan icon
  }
  ```
* Tambahkan field `goal_id?: string` pada `Transaction` (atau menggunakan kolom `platform` yang sudah ada di Supabase untuk menampung ID / Nama Goal agar 100% kompatibel tanpa perlu migrasi DB paksa).

---

### 2. State & Data Context (`src/context/BudgetContext.tsx`)
#### [MODIFY] [BudgetContext.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/context/BudgetContext.tsx)
* Tambahkan state `savingsGoals: SavingsGoal[]`.
* Persistensi: Sinkronisasi daftar goal ke `localStorage` (dengan fallback awal: *Tabungan Qurban*, *Uang Darurat*, *Target Impian*) dan opsi simpan ke Supabase jika tabel tersedia.
* Fungsi CRUD untuk Goal:
  - `handleAddGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>)`
  - `handleUpdateGoal(goal: SavingsGoal)`
  - `handleDeleteGoal(goalId: string)` (dengan konfirmasi dan opsi penanganan transaksi terkait).
* Fungsi CRUD Transaksi Khusus Goal:
  - Catat setor (`savings_in`) atau tarik (`savings_out`) yang otomatis terikat ke `goal_id` / nama goal.

---

### 3. Komponen Kartu Goal Dinamis & Riwayatnya
#### [NEW] [SavingsGoalCard.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/SavingsGoalCard.tsx)
* Komponen kartu individual untuk setiap tujuan tabungan (contoh: *Tabungan Qurban*):
  - Header: Nama goal, icon, target nominal, dan menu opsi (Edit Goal / Hapus Goal).
  - Metrik: Terkumpul, Sisa kekurangan, persentase (%) capaian.
  - Progress bar dinamis bergradien.
  - Tombol aksi cepat:
    - `+ Setor` (membuka modal alokasi masuk langsung terisi nama goal).
    - `- Tarik` (membuka modal penarikan dana langsung terisi nama goal).
  - Panel Riwayat / Ledger Akordeon yang bisa dibuka-tutup (*collapsible*):
    - Berisi tabel mutasi khusus goal tersebut (Tanggal, Keterangan, Masuk, Keluar, Saldo).
    - Tombol Edit & Hapus transaksi per baris.

#### [NEW] [GoalModal.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/components/dashboard/GoalModal.tsx)
* Modal untuk membuat atau mengedit kartu tujuan tabungan baru:
  - Input: Nama Tujuan (contoh: "Tabungan Qurban 2026").
  - Input: Target Nominal (Rp).
  - Pilihan Warna Aksen (Emerald, Ocean Blue, Violet, Amber, Rose).
  - Pilihan Icon (Hewan/Qurban 🐑, Gadget 💻, Liburan ✈️, Rumah 🏠, Darurat 🛡️, Umum 🎯).

---

### 4. Halaman Tabungan (`src/app/tabungan/page.tsx`)
#### [MODIFY] [page.tsx](file:///d:/Work/WorkShop/personal-budget-tracker/src/app/tabungan/page.tsx)
* Dua Mode / Tab Utama:
  1. **Tabungan Spesifik / Tujuan**:
     - Tombol `+ Buat Tujuan Baru` di bagian atas.
     - Grid kartu dinamis (semua card yang dibuat pengguna, termasuk contoh *Tabungan Qurban*).
     - Di dalam masing-masing kartu, ada CRUD mutasi transaksi setor/tarik.
  2. **Tabungan Umum**:
     - Buku rekening tabungan reguler (Ledger umum mutasi masuk, keluar, dan sisa saldo).
* Dashboard Ringkasan Finansial:
  - Total seluruh tabungan tujuan yang berhasil terkumpul.
  - Rata-rata progress capaian impian.

---

## 🔍 Rencana Verifikasi

### Otomatis
- `npx tsc --noEmit`: Memastikan semua types aman tanpa error compile.
- `npm run build`: Memastikan Next.js build sukses untuk seluruh rute.

### Manual
1. **Buat Card Baru**: Buat kartu baru bernama *"Tabungan Qurban"* dengan target Rp 3.500.000. Pastikan kartu baru langsung muncul di grid.
2. **Uji Transaksi Masuk (+)**: Klik "+ Setor" di kartu Tabungan Qurban sebesar Rp 1.000.000. Pastikan saldo terkumpul menjadi Rp 1.000.000 dan progress menjadi ~29%.
3. **Uji Transaksi Keluar (-)**: Klik "- Tarik" di kartu Tabungan Qurban sebesar Rp 200.000. Pastikan saldo berkurang menjadi Rp 800.000.
4. **Uji CRUD di dalam Card**: Buka riwayat mutasi di dalam kartu, lakukan edit keterangan, lalu hapus salah satu transaksi.
5. **Uji Edit & Hapus Card**: Ubah target nominal Tabungan Qurban, lalu uji hapus kartu.
