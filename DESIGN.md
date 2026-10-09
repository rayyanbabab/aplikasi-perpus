# Design Direction: Modern Academic & Editorial

## Identitas & Karakter
- **Nama Produk:** Sistem Informasi Perpustakaan Digital Politeknik Astra (ASTRAtech)
- **Tema & Persona:** Modern Academic & Editorial. Menghadirkan atmosfer perpustakaan institusi yang tenang, berwibawa, dan elegan seperti ruang baca kurasi akademis modern (terinspirasi dari tipografi publikasi terkemuka, arsip universitas berkelas, dan platform literatur modern).
- **Anti-Pattern (AI Slop yang Ditolak):**
  - Tidak ada gradien ungu-biru atau cyan generic AI.
  - Tidak ada background blueprint grid / dot pattern yang asal tempel.
  - Tidak ada deretan kartu statistik identik dengan ikon warna-warni pelangi tanpa hierarki.
  - Tidak ada tombol dengan panah tanpa tujuan atau badge "AI Powered" palsu.
  - Tidak ada teks abu-abu pudar di atas background hitam pekat yang melanggar standar kontras WCAG AA.
  - Tidak ada karakter em dash (—) pada teks antarmuka.

## Palet Warna (Academic Slate & Warm Cognac Amber)
- **Primary / Identity:** Warm Amber & Cognac (`#d97706` / `hsl(38 92% 50%)` dan tone kayu perpustakaan hangat). Memberikan jiwa hangat khas perpustakaan fisik, meja kayu jati, dan lampu baca klasik tanpa terkesan kuno.
- **Surface & Backgrounds (Dark Mode):** Deep Slate Ink (`#0b0f19` / `hsl(222 47% 7%)`), Slate Card (`#111827` / `hsl(222 47% 11%)`), Border (`#1e293b` / `hsl(217 33% 17%)`).
- **Surface & Backgrounds (Light Mode):** Archival Cream & Warm Stone (`#faf9f5`), Card White/Ivory (`#ffffff`), Border (`#e5e2d9`), Text Ink (`#1c1917`).
- **Semantic Accents:**
  - Status Tersedia / Sukses: Forest Scholar Green (`#059669` / `emerald-600`)
  - Status Peringatan / Jatuh Tempo Segera: Warm Ochre (`#d97706` / `amber-600`)
  - Status Terlambat / Denda: Deep Oxblood / Crimson (`#e11d48` / `rose-600`)

## Tipografi
- **Display & Headings:** Serif editorial yang elegan (`Newsreader` / `Playfair Display` / `Georgia` fallback) untuk judul buku, banner pembuka, dan kutipan katalog, memberikan karakter literatur yang berkelas.
- **Body & Interface Data:** Sans-serif presisi tinggi (`Plus Jakarta Sans` / `Inter` fallback) untuk tabel sirkulasi, formulir, status stok, dan navigasi data agar cepat dipindai dan nyaman dibaca.

## Komponen & Tata Letak
- **Dashboard Admin:** Dirancang berbasis kebutuhan operasional nyata:
  - Header berkarakter dengan tanggal hari ini dan status ringkas operasional (buku perlu tindakan segera vs total sirkulasi).
  - Kartu buku dengan efek visual sampul buku berdimensi (subtle book spine & depth), bukan kotak datar kosong.
  - Tabel sirkulasi dengan avatar inisial anggota, tanggal jatuh tempo berbobot visual jelas (highlighting jika mendekati jatuh tempo atau terlambat), dan aksi cepat langsung.
- **Katalog Member:**
  - Bar pencarian & filter tipe perpustakaan profesional: quick filter kategori chip yang intuitif, sakelar ketersediaan instan, dan preview buku yang memikat.
  - Detail buku yang informatif: spesifikasi buku lengkap, status stok eksemplar yang transparan, dan tombol reservasi yang responsif.
- **Navigasi & Sidebar:**
  - Sidebar admin terstruktur secara fungsional: Operasional Sirkulasi, Manajemen Koleksi, Layanan Anggota, dan Laporan.
  - Mobile responsive: Sidebar drawer halus di mobile, navigasi member responsif dengan target sentuh minimal 44px.

## Liveliness Dials
- **ENERGY:** 2 (Fokus, matang, tenang namun responsif)
- **RHYTHM:** 2 (Variasi komposisi yang proporsional sesuai kebutuhan data)
- **MOTION:** 1 (Mikro-interaksi halus saat hover dan fokus, tanpa animasi looping yang mengganggu)
