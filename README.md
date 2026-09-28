# 📚 Aplikasi Perpustakaan Digital
**Tugas Akhir — Politeknik Astra (ASTRAtech)**

Sistem Informasi Perpustakaan berbasis web yang dibangun dengan **Next.js 15**, **Neon (PostgreSQL)**, **Drizzle ORM**, dan **Auth.js**.

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp .env.local.example .env.local
```
Isi nilai berikut di `.env.local`:
- `DATABASE_URL` — connection string dari [neon.tech](https://neon.tech)
- `AUTH_SECRET` — generate dengan: `openssl rand -base64 32`
- `CRON_SECRET` — string random untuk keamanan cron job

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
# Push schema ke Neon
npm run db:push

# Isi data dummy (opsional tapi recommended untuk demo)
npm run db:seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | admin@perpustakaan.ac.id | admin123 |
| **Anggota** | budi@student.ac.id | member123 |

---

## 🗂️ Fitur Lengkap

### Admin
- ✅ Dashboard dengan statistik & grafik peminjaman
- ✅ CRUD Buku (dengan cover URL, kategori, stok)
- ✅ CRUD Kategori
- ✅ Manajemen Anggota (tambah, edit, nonaktifkan)
- ✅ Peminjaman baru (dengan validasi stok & denda)
- ✅ Pengembalian buku (hitung denda otomatis)
- ✅ Manajemen Denda (konfirmasi pelunasan)
- ✅ Laporan per periode (export CSV & cetak PDF)

### Anggota
- ✅ Katalog buku dengan search & filter
- ✅ Detail buku & status ketersediaan real-time
- ✅ Reservasi buku (antrian FIFO)
- ✅ Riwayat peminjaman & status denda
- ✅ Notifikasi in-app

---

## 🛠️ Tech Stack
| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Neon (PostgreSQL Serverless) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (Credentials) |
| Styling | Tailwind CSS + Custom Components |
| Chart | Recharts |
| Validasi | Zod |
| Deployment | Vercel |

---

## 📁 Struktur Proyek
```
app/
├── (auth)/         → login, register
├── admin/          → dashboard, buku, anggota, peminjaman, denda, laporan
├── member/         → katalog, riwayat, reservasi, notifikasi
└── api/cron/       → daily job (update overdue + expire reservations)

lib/
├── db/             → schema Drizzle + koneksi Neon + seed
├── actions/        → Server Actions per modul
├── validations/    → Zod schemas
└── auth.ts         → konfigurasi Auth.js

components/
├── ui/             → Badge, Button, Card, Input, dll
├── admin/          → komponen khusus admin
└── member/         → komponen khusus anggota
```

---

## 🚢 Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables di Settings > Environment Variables
4. Tambahkan Neon integration di Vercel Marketplace
5. Deploy!

Cron job `vercel.json` sudah dikonfigurasi untuk berjalan setiap hari pukul 00:00 WIB.

---

## 📐 Aturan Bisnis
- Denda: **Rp 1.000/hari** keterlambatan
- Maksimal pinjam: **3 buku** bersamaan
- Durasi pinjam default: **7 hari**
- Window reservasi: **48 jam** setelah buku tersedia
- Anggota dengan denda belum lunas **tidak bisa** meminjam buku baru
