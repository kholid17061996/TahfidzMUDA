# TahfidzMUDA — Sistem Informasi Manajemen Ujian Tahfidz & Bacaan Al-Qur'an

> **"Mencetak Generasi Qur'ani, Unggul dan Berakhlak Mulia"**  
> Aplikasi web profesional untuk pengelolaan dan penilaian Ujian Tahfidz dan Baca Al-Qur'an di lingkungan pesantren / sekolah Islam.

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#tentang-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Role / Pengguna](#struktur-role--pengguna)
- [Panduan Setup & Instalasi](#panduan-setup--instalasi)
- [Struktur Database](#struktur-database)
- [Alur Kerja Aplikasi](#alur-kerja-aplikasi)
- [Panduan Penggunaan Per Role](#panduan-penggunaan-per-role)
- [Catatan Pengembang](#catatan-pengembang)

---

## Tentang Aplikasi

**TahfidzMUDA** adalah sistem informasi berbasis web yang dirancang khusus untuk **Kreatif Muhammadiyah Boarding School (KMBS)**. Aplikasi ini mengelola seluruh siklus ujian hafalan (Tahfidz) dan bacaan (Tilawah) Al-Qur'an, mulai dari pendataan santri, distribusi penguji, proses penilaian, hingga manajemen hasil ujian.

Aplikasi ini memiliki **3 portal login terpisah**: Admin, Penguji, dan Orang Tua Santri.

---

## Fitur Utama

### 👤 Portal Admin

#### Manajemen Master Data
- **Data Kelas** — CRUD kelas (Kelas 7, 8, 9), termasuk aktivasi/nonaktivasi.
- **Data Pengajar / Musyrif** — CRUD data pengajar, pengaturan kode unik, status aktif.
- **Data Penguji** — CRUD data penguji dengan pembedaan tipe: `Bacaan` atau `Tahfidz`.
- **Data Periode Ujian** — Pengelolaan periode ujian aktif.

#### Manajemen Data Santri (`/admin/santri`)
- **CRUD Santri Lengkap** — Tambah, edit, dan hapus data santri. Setiap santri terhubung ke Kelas, Pengajar, dan Orang Tua.
- **Import Massal Santri (Excel)** — Unggah file Excel untuk menambahkan banyak santri sekaligus. Tersedia template unduhan.
- **Input Masal Materi Ujian Bacaan** — Unduh template Excel → isi kolom `Materi Ujian Bacaan` → unggah kembali untuk update massal. Materi ini otomatis tampil di form penilaian penguji.
- **Input Masal Materi Ujian Tahfidz** — Serupa dengan Bacaan, namun khusus untuk kolom `Materi Ujian Tahfidz` (misal: Juz 30).
- **Sortir Dinamis** — Data santri dapat diurutkan berdasarkan Nomor, NIS, Nama, Kelas, atau Pengajar.
- **Pencarian Real-time** — Cari santri berdasarkan nama, NIS, atau kode santri.

#### Distribusi & Kontrol Ujian
- **🟡 Distribusi Ujian Tahfidz (Acak Otomatis)**
  - Admin klik satu tombol, sistem otomatis membagi seluruh santri ke 3 penguji aktif secara **acak dan merata**.
  - Penguji **tidak akan mendapat santri dari kelasnya sendiri** (agar ujian objektif).
  - Santri ABK (yang pengajarnya dikecualikan, misal Siti Aisyah) **dibagi rata** ke semua penguji aktif.
  - Ringkasan hasil distribusi (siapa dapat berapa siswa) tampil setelah proses selesai.
  - **Reset Distribusi** — Admin dapat menghapus distribusi dan mengacak ulang kapan saja.
- **🔵 Reset Status Ujian Bacaan** — Jika santri perlu diuji ulang untuk Bacaan, Admin klik ikon putar di tabel data siswa untuk mengaktifkan kembali statusnya.
- **🟡 Reset Status Ujian Tahfidz** — Sama seperti di atas, namun untuk Ujian Tahfidz.

### ✍️ Portal Penguji (`/penguji`)

#### Form Penilaian Ujian Bacaan Al-Qur'an (`/penguji/ujian-bacaan`)
Penguji memilih kelas → pilih/ketik nama santri (autocomplete) → isi penilaian:

| Aspek | Bobot |
|---|---|
| Makharijul Huruf | 20% |
| Tajwid | 25% |
| Kelancaran | 20% |
| Fashahah | 15% |
| Mad & Qashr | 10% |
| Waqaf & Ibtida' | 10% |

- **Nilai Akhir & Predikat dihitung otomatis secara real-time.**
- Penguji mengisi Status Kelulusan (Lulus / Lulus Dengan Catatan / Tidak Lulus) dan Catatan.
- Setelah disimpan, **santri otomatis hilang dari daftar** (tidak bisa diuji ganda).

#### Form Penilaian Ujian Tahfidz Al-Qur'an (`/penguji/ujian-tahfidz`)
Setelah Admin menjalankan distribusi, penguji **hanya melihat santri yang ditugaskan kepadanya**.

| Aspek | Bobot |
|---|---|
| Kelancaran Hafalan | 30% |
| Ketepatan Ayat | 25% |
| Tajwid & Makharijul Huruf | 20% |
| Murojaah / Kekuatan Hafalan | 15% |
| Adab dan Sikap | 10% |

- Kriteria Nilai: A (90-100), B (80-89), C (70-79), D (< 70).
- Logika pengujian ganda dan status aktif sama seperti Ujian Bacaan.

#### Dashboard Riwayat Penilaian
- Penguji melihat seluruh riwayat ujian yang pernah mereka nilai.
- Terdapat label **"Ujian ke-X"** pada setiap baris, menandakan apakah itu ujian pertama, kedua, dst. untuk santri tersebut.
- **Filter & Sorting tersedia:**
  - 🔍 Cari nama santri
  - 📚 Filter berdasarkan Kelas
  - ✅ Filter berdasarkan Status Kelulusan
  - 📊 Urutkan: Terbaru / Terlama / Nilai Tertinggi / Nilai Terendah
- **CRUD History:**
  - ✏️ **Edit** — Ubah Status Kelulusan dan Catatan Penguji via modal.
  - 🗑️ **Hapus** — Hapus data ujian (santri otomatis bisa diuji ulang).

### 👨‍👩‍👧 Portal Orang Tua (`/ortu`)
- Login menggunakan kode unik orang tua.
- Melihat data dan perkembangan hasil ujian putra/putri mereka.

---

## Teknologi

| Kategori | Teknologi |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Bahasa | TypeScript |
| Database & Auth | [Supabase](https://supabase.com/) (PostgreSQL) |
| Styling | Tailwind CSS |
| Ikon | [Lucide React](https://lucide.dev/) |
| Export Excel | [ExcelJS](https://github.com/exceljs/exceljs), [SheetJS (XLSX)](https://sheetjs.com/) |
| Deploy | [Vercel](https://vercel.com/) |

---

## Struktur Role / Pengguna

```
TahfidzMUDA
├── Admin           → Akses penuh: master data, distribusi ujian, monitoring
├── Penguji Bacaan  → Hanya bisa akses form & riwayat Ujian Bacaan
├── Penguji Tahfidz → Hanya bisa akses form & riwayat Ujian Tahfidz
└── Orang Tua       → Hanya bisa melihat data & nilai putra/putri mereka
```

---

## Panduan Setup & Instalasi

### Prasyarat
- Node.js v18+
- Akun [Supabase](https://supabase.com/)
- Akun [Vercel](https://vercel.com/) (untuk deploy)

### 1. Clone & Install
```bash
git clone https://github.com/kholid17061996/TahfidzMUDA.git
cd TahfidzMUDA
npm install
```

### 2. Konfigurasi Environment Variables
Buat file `.env.local` di root proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Database (Supabase SQL Editor)
Jalankan file-file migrasi berikut **secara berurutan** di Supabase SQL Editor:

| No | File | Keterangan |
|---|---|---|
| 1 | `supabase/migrations/01_create_penguji_table.sql` | Tabel Penguji |
| 2 | `supabase/migrations/02_create_ujian_bacaan.sql` | Tabel Ujian Bacaan |
| 3 | `supabase/migrations/03_add_can_ujian_bacaan.sql` | Kolom status ujian bacaan |
| 4 | `supabase/migrations/04_create_ujian_tahfidz.sql` | Tabel Ujian Tahfidz + kolom status |
| 5 | `supabase/migrations/05_add_penguji_ujian_tahfidz.sql` | Kolom distribusi penguji tahfidz |

### 4. Jalankan Lokal
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

### 5. Deploy ke Vercel
```bash
npx vercel --prod
```
Atau hubungkan repository GitHub ke Vercel Dashboard dan isi environment variables yang sama.

---

## Struktur Database

### Tabel Utama

```
santri
├── id, kode_santri, nis, nama
├── kelas_id → (FK: kelas)
├── pengajar_id → (FK: pengajar)
├── status (aktif/nonaktif)
├── materi_ujian           → Materi Ujian Bacaan (diatur Admin)
├── materi_ujian_tahfidz   → Materi Ujian Tahfidz (diatur Admin)
├── can_ujian_bacaan        → Boolean: bisa ikut ujian bacaan?
├── can_ujian_tahfidz       → Boolean: bisa ikut ujian tahfidz?
└── penguji_ujian_tahfidz_id → (FK: penguji) Penguji yang ditugaskan untuk ujian tahfidz

ujian_bacaan
├── id, santri_id, penguji_id, tanggal
├── surat_ayat, catatan_penguji
├── nilai_makharijul (20%), nilai_tajwid (25%), nilai_kelancaran (20%)
├── nilai_fashahah (15%), nilai_mad (10%), nilai_waqaf (10%)
├── nilai_akhir, predikat, status_kelulusan
└── created_at, updated_at

ujian_tahfidz
├── id, santri_id, penguji_id, tanggal
├── materi_tahfidz, catatan_penguji
├── nilai_kelancaran (30%), nilai_ketepatan (25%), nilai_tajwid (20%)
├── nilai_murojaah (15%), nilai_adab (10%)
├── nilai_akhir, predikat, status_kelulusan
└── created_at, updated_at
```

---

## Alur Kerja Aplikasi

```
1. Admin setup data:
   Kelas → Pengajar → Penguji → Santri

2. Admin input materi ujian:
   Download Template Excel → Isi Kolom Materi → Upload kembali

3. Khusus Ujian Tahfidz — Admin jalankan Distribusi:
   Klik "Acak Distribusi Ujian Tahfidz" → Sistem membagi santri secara acak dan merata
   (Penguji tidak menguji siswanya sendiri, santri ABK dibagi rata)

4. Penguji login → Pilih Kelas → Pilih Santri → Isi Nilai → Simpan

5. Santri yang sudah diuji otomatis hilang dari daftar

6. Admin bisa Reset status jika santri perlu diuji ulang

7. Penguji dapat melihat, mengedit, atau menghapus riwayat penilaian di Dashboard
```

---

## Panduan Penggunaan Per Role

### Sebagai Admin
1. Login di halaman utama (`/`) menggunakan akun Admin.
2. Navigasi menu di sidebar kiri: **Dashboard, Santri, Kelas, Pengajar, Penguji, Periode**.
3. Sebelum ujian: pastikan **Materi Ujian** sudah diisi via tombol unggah Excel.
4. Khusus ujian Tahfidz: klik **"Acak Distribusi Ujian Tahfidz"** di halaman Santri.
5. Monitor progress ujian dari tabel data santri (kolom status).

### Sebagai Penguji
1. Login di halaman utama (`/`) menggunakan Kode Penguji.
2. Klik **"Mulai Ujian Baru"** untuk membuka form penilaian.
3. Pilih Kelas → Ketik/Pilih Nama Santri → Isi Nilai → Simpan.
4. Lihat riwayat, gunakan filter & sorting di Dashboard.
5. Edit catatan/status atau hapus data jika diperlukan.

### Sebagai Orang Tua
1. Login di halaman utama (`/`) menggunakan Kode Orang Tua.
2. Lihat data santri dan hasil penilaian.

---

## Catatan Pengembang

### Konvensi Kode
- Semua logika database berjalan melalui **Server Actions** (`src/app/actions/`) menggunakan `service_role_key` untuk melewati RLS.
- Komponen UI yang digunakan bersama disimpan di `src/components/`.
- Styling menggunakan Tailwind CSS dengan tema kustom yang didefinisikan di `tailwind.config.ts`.

### Warna Tema Kustom
| Token | Keterangan |
|---|---|
| `bg-slate` | Warna latar belakang utama (biru gelap) |
| `text-emas` | Warna aksen utama (kuning emas) |
| `bg-emasHover` | Warna tombol utama saat hover |

### File Migrasi SQL
Seluruh perubahan skema database disimpan secara berurutan di `supabase/migrations/`. Jika melakukan setup ulang, jalankan semua file SQL tersebut secara berurutan di Supabase SQL Editor.

### Variabel Lingkungan yang Dibutuhkan
| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci publik Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci rahasia untuk operasi server-side |

---

*Dikembangkan untuk Kreatif Muhammadiyah Boarding School (KMBS). Semua hak cipta dilindungi.*
