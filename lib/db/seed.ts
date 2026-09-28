/**
 * Seed script — jalankan sekali untuk mengisi data dummy ke database
 * Perintah: npm run db:seed
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

// Load .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log('🌱 Memulai seed data...');

  // ── 1. Hapus data lama (urutan penting karena foreign key) ──────────────────
  await db.delete(schema.notifications);
  await db.delete(schema.reservations);
  await db.delete(schema.fines);
  await db.delete(schema.loans);
  await db.delete(schema.books);
  await db.delete(schema.categories);
  await db.delete(schema.users);

  // ── 2. Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const [admin] = await db
    .insert(schema.users)
    .values({
      name: 'Administrator',
      email: 'admin@perpustakaan.ac.id',
      passwordHash: adminPassword,
      role: 'admin',
      phone: '08123456789',
      status: 'aktif',
    })
    .returning();

  const memberData = [
    { name: 'Budi Santoso', email: 'budi@student.ac.id', phone: '08111111111', memberId: 'M001' },
    { name: 'Siti Rahayu', email: 'siti@student.ac.id', phone: '08222222222', memberId: 'M002' },
    { name: 'Ahmad Fauzi', email: 'ahmad@student.ac.id', phone: '08333333333', memberId: 'M003' },
    { name: 'Dewi Lestari', email: 'dewi@student.ac.id', phone: '08444444444', memberId: 'M004' },
    { name: 'Rizky Pratama', email: 'rizky@student.ac.id', phone: '08555555555', memberId: 'M005' },
  ];

  const members = await db
    .insert(schema.users)
    .values(
      memberData.map((m) => ({
        ...m,
        passwordHash: memberPassword,
        role: 'member' as const,
        status: 'aktif' as const,
      }))
    )
    .returning();

  console.log(`✅ ${members.length + 1} users dibuat`);

  // ── 3. Kategori ───────────────────────────────────────────────────────────────
  const categoryData = [
    { name: 'Teknologi Informasi', description: 'Buku seputar pemrograman, jaringan, dan sistem informasi' },
    { name: 'Matematika', description: 'Buku matematika dasar hingga lanjutan' },
    { name: 'Fisika', description: 'Buku fisika dan ilmu alam' },
    { name: 'Manajemen', description: 'Buku manajemen bisnis dan organisasi' },
    { name: 'Bahasa & Sastra', description: 'Buku bahasa Indonesia, Inggris, dan sastra' },
    { name: 'Ekonomi', description: 'Buku ekonomi mikro dan makro' },
    { name: 'Teknik Mesin', description: 'Buku teknik mesin dan manufaktur' },
  ];

  const cats = await db.insert(schema.categories).values(categoryData).returning();
  const catMap = Object.fromEntries(cats.map((c) => [c.name, c.id]));
  console.log(`✅ ${cats.length} kategori dibuat`);

  // ── 4. Buku ───────────────────────────────────────────────────────────────────
  const bookData = [
    {
      isbn: '978-602-9458-12-1',
      title: 'Pemrograman Web dengan Next.js',
      author: 'Agus Prasetyo',
      publisher: 'Informatika',
      year: 2023,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 5,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
      description: 'Panduan lengkap membangun aplikasi web modern dengan Next.js 14+ dan React Server Components.',
    },
    {
      isbn: '978-602-8519-23-4',
      title: 'Database Management System',
      author: 'Ramez Elmasri',
      publisher: 'Andi Publisher',
      year: 2022,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 4,
      availableCopies: 4,
      coverUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80',
      description: 'Konsep dan teknik manajemen basis data relasional dan non-relasional.',
    },
    {
      isbn: '978-602-7734-11-0',
      title: 'Algoritma dan Struktur Data',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      year: 2021,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 3,
      availableCopies: 0,
      coverUrl: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&q=80',
      description: 'Buku referensi utama algoritma dan struktur data untuk mahasiswa ilmu komputer.',
    },
    {
      isbn: '978-602-1234-56-7',
      title: 'Jaringan Komputer',
      author: 'Andrew S. Tanenbaum',
      publisher: 'Prenhalindo',
      year: 2022,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 3,
      availableCopies: 2,
      coverUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
      description: 'Memahami arsitektur dan protokol jaringan komputer secara menyeluruh.',
    },
    {
      isbn: '978-602-2345-67-8',
      title: 'Kalkulus untuk Teknik',
      author: 'Purcell & Varberg',
      publisher: 'Erlangga',
      year: 2020,
      categoryId: catMap['Matematika'],
      totalCopies: 6,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
      description: 'Kalkulus diferensial dan integral untuk mahasiswa teknik.',
    },
    {
      isbn: '978-602-3456-78-9',
      title: 'Statistika Untuk Penelitian',
      author: 'Sugiyono',
      publisher: 'Alfabeta',
      year: 2023,
      categoryId: catMap['Matematika'],
      totalCopies: 4,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80',
      description: 'Metode statistika untuk penelitian kuantitatif dan kualitatif.',
    },
    {
      isbn: '978-602-4567-89-0',
      title: 'Fisika Dasar',
      author: 'Halliday, Resnick & Walker',
      publisher: 'Erlangga',
      year: 2021,
      categoryId: catMap['Fisika'],
      totalCopies: 5,
      availableCopies: 4,
      coverUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80',
      description: 'Buku fisika dasar komprehensif untuk mahasiswa sains dan teknik.',
    },
    {
      isbn: '978-602-5678-90-1',
      title: 'Manajemen Strategi',
      author: 'Fred R. David',
      publisher: 'Salemba Empat',
      year: 2022,
      categoryId: catMap['Manajemen'],
      totalCopies: 3,
      availableCopies: 1,
      coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
      description: 'Konsep dan teknik manajemen strategis untuk organisasi modern.',
    },
    {
      isbn: '978-602-6789-01-2',
      title: 'Manajemen Sumber Daya Manusia',
      author: 'Gary Dessler',
      publisher: 'Indeks',
      year: 2021,
      categoryId: catMap['Manajemen'],
      totalCopies: 4,
      availableCopies: 4,
      coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
      description: 'Panduan lengkap pengelolaan sumber daya manusia dalam organisasi.',
    },
    {
      isbn: '978-602-7890-12-3',
      title: 'Bahasa Indonesia untuk Perguruan Tinggi',
      author: 'Felicia Utorodewo',
      publisher: 'UI Press',
      year: 2020,
      categoryId: catMap['Bahasa & Sastra'],
      totalCopies: 5,
      availableCopies: 5,
      coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
      description: 'Panduan penulisan ilmiah dan penggunaan bahasa Indonesia yang baik dan benar.',
    },
    {
      isbn: '978-602-8901-23-4',
      title: 'Ekonomi Mikro',
      author: 'N. Gregory Mankiw',
      publisher: 'Salemba Empat',
      year: 2023,
      categoryId: catMap['Ekonomi'],
      totalCopies: 4,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
      description: 'Prinsip-prinsip ekonomi mikro dengan contoh kasus aktual.',
    },
    {
      isbn: '978-602-9012-34-5',
      title: 'Mekanika Teknik',
      author: 'R.C. Hibbeler',
      publisher: 'Erlangga',
      year: 2022,
      categoryId: catMap['Teknik Mesin'],
      totalCopies: 3,
      availableCopies: 2,
      coverUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80',
      description: 'Analisis statika dan dinamika untuk mahasiswa teknik mesin.',
    },
    {
      isbn: '978-602-0123-45-6',
      title: 'Machine Learning dengan Python',
      author: 'Aurélien Géron',
      publisher: 'Oreilly',
      year: 2023,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 2,
      availableCopies: 0,
      coverUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
      description: 'Panduan hands-on machine learning dan deep learning menggunakan Scikit-Learn, Keras, dan TensorFlow.',
    },
    {
      isbn: '978-602-1234-67-8',
      title: 'Keamanan Sistem Informasi',
      author: 'William Stallings',
      publisher: 'Erlangga',
      year: 2021,
      categoryId: catMap['Teknologi Informasi'],
      totalCopies: 3,
      availableCopies: 3,
      coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80',
      description: 'Prinsip dan praktik keamanan sistem informasi dan kriptografi.',
    },
    {
      isbn: '978-602-2345-78-9',
      title: 'Akuntansi Biaya',
      author: 'Mulyadi',
      publisher: 'Salemba Empat',
      year: 2020,
      categoryId: catMap['Ekonomi'],
      totalCopies: 4,
      availableCopies: 4,
      coverUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      description: 'Konsep dan metode akuntansi biaya untuk pengambilan keputusan manajemen.',
    },
  ];

  const booksInserted = await db.insert(schema.books).values(bookData).returning();
  console.log(`✅ ${booksInserted.length} buku dibuat`);

  // ── 5. Loans (peminjaman) ─────────────────────────────────────────────────────
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  // Peminjaman aktif
  const loanData = [
    {
      bookId: booksInserted[0].id, // Next.js
      memberId: members[0].id, // Budi
      loanDate: formatDate(addDays(today, -5)),
      dueDate: formatDate(addDays(today, 2)),
      status: 'dipinjam' as const,
    },
    {
      bookId: booksInserted[2].id, // Algoritma (stok 0)
      memberId: members[1].id, // Siti
      loanDate: formatDate(addDays(today, -10)),
      dueDate: formatDate(addDays(today, -3)),
      status: 'terlambat' as const,
    },
    {
      bookId: booksInserted[2].id, // Algoritma (stok 0)
      memberId: members[2].id, // Ahmad
      loanDate: formatDate(addDays(today, -3)),
      dueDate: formatDate(addDays(today, 4)),
      status: 'dipinjam' as const,
    },
    {
      bookId: booksInserted[7].id, // Manajemen Strategi
      memberId: members[3].id, // Dewi
      loanDate: formatDate(addDays(today, -15)),
      dueDate: formatDate(addDays(today, -8)),
      returnDate: formatDate(addDays(today, -6)),
      status: 'dikembalikan' as const,
    },
    {
      bookId: booksInserted[12].id, // ML Python (stok 0)
      memberId: members[0].id, // Budi
      loanDate: formatDate(addDays(today, -2)),
      dueDate: formatDate(addDays(today, 5)),
      status: 'dipinjam' as const,
    },
    {
      bookId: booksInserted[12].id, // ML Python (stok 0)
      memberId: members[4].id, // Rizky
      loanDate: formatDate(addDays(today, -20)),
      dueDate: formatDate(addDays(today, -13)),
      returnDate: formatDate(addDays(today, -10)),
      status: 'dikembalikan' as const,
    },
  ];

  const loansInserted = await db.insert(schema.loans).values(loanData).returning();
  console.log(`✅ ${loansInserted.length} peminjaman dibuat`);

  // ── 6. Denda ──────────────────────────────────────────────────────────────────
  // Siti terlambat 3 hari → denda 3 * 1000 = 3000
  const overdueLoan = loansInserted[1];
  await db.insert(schema.fines).values({
    loanId: overdueLoan.id,
    amount: 3000,
    paid: false,
  });

  // Dewi terlambat 6 hari (dikembalikan, tapi belum lunas)
  const returnedLateLoan = loansInserted[3];
  await db.insert(schema.fines).values({
    loanId: returnedLateLoan.id,
    amount: 6000,
    paid: true,
    paidAt: new Date(addDays(today, -6)),
  });

  console.log('✅ 2 denda dibuat');

  // ── 7. Reservasi ──────────────────────────────────────────────────────────────
  // Algoritma sudah habis → Dewi dan Rizky reservasi
  await db.insert(schema.reservations).values([
    {
      bookId: booksInserted[2].id, // Algoritma
      memberId: members[3].id, // Dewi
      status: 'menunggu',
      reservedAt: addDays(today, -2),
    },
    {
      bookId: booksInserted[2].id, // Algoritma
      memberId: members[4].id, // Rizky
      status: 'menunggu',
      reservedAt: addDays(today, -1),
    },
    // ML Python habis → Siti reservasi
    {
      bookId: booksInserted[12].id,
      memberId: members[1].id, // Siti
      status: 'menunggu',
      reservedAt: addDays(today, -1),
    },
  ]);

  console.log('✅ 3 reservasi dibuat');

  // ── 8. Notifikasi ─────────────────────────────────────────────────────────────
  await db.insert(schema.notifications).values([
    {
      userId: members[1].id, // Siti
      title: 'Peminjaman Terlambat',
      message: 'Buku "Algoritma dan Struktur Data" sudah melewati batas waktu pengembalian. Denda berjalan Rp 1.000/hari.',
      read: false,
    },
    {
      userId: members[0].id, // Budi
      title: 'Pengingat Jatuh Tempo',
      message: 'Buku "Pemrograman Web dengan Next.js" akan jatuh tempo dalam 2 hari.',
      read: false,
    },
    {
      userId: members[3].id, // Dewi
      title: 'Reservasi Dikonfirmasi',
      message: 'Reservasi Anda untuk buku "Algoritma dan Struktur Data" berhasil ditambahkan ke antrian.',
      read: true,
    },
  ]);

  console.log('✅ 3 notifikasi dibuat');

  console.log('\n🎉 Seed selesai!');
  console.log('─────────────────────────────────────────');
  console.log('Login Admin: admin@perpustakaan.ac.id / admin123');
  console.log('Login Anggota: budi@student.ac.id / member123');
  console.log('─────────────────────────────────────────');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Seed gagal:', e);
  process.exit(1);
});
