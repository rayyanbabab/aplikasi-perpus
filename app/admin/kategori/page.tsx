import { db } from '@/lib/db';
import { categories, books } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KategoriActions } from '@/components/admin/kategori-actions';
import { Tag, BookOpen, Layers } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Manajemen Kategori Koleksi' };

export default async function KategoriPage() {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      bookCount: sql<number>`count(${books.id})`,
    })
    .from(categories)
    .leftJoin(books, eq(categories.id, books.categoryId))
    .groupBy(categories.id)
    .orderBy(categories.name);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Taksonomi Koleksi</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Kategori Koleksi Buku
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola klasifikasi bidang ilmu untuk mempermudah pencarian dan penataan buku di perpustakaan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Tambah Kategori */}
        <div className="lg:col-span-5">
          <Card className="border-border/80 sticky top-20 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-lg font-bold">Tambah Kategori Baru</CardTitle>
              <CardDescription>
                Masukkan nama kategori baru sesuai bidang keilmuan atau topik literatur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KategoriActions mode="create" />
            </CardContent>
          </Card>
        </div>

        {/* Daftar Kategori */}
        <div className="lg:col-span-7">
          <Card className="border-border/80 shadow-md">
            <CardHeader className="flex-row items-center justify-between pb-4 border-b border-border/60">
              <div>
                <CardTitle className="font-serif text-lg font-bold">Katalog Kategori Terdaftar</CardTitle>
                <CardDescription>
                  {allCategories.length} kelompok klasifikasi aktif
                </CardDescription>
              </div>
              <Badge variant="secondary" className="px-2.5 py-1">
                {allCategories.length} Kategori
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {allCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 pr-4">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {cat.name}
                          </p>
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60 font-medium">
                            {cat.bookCount} buku
                          </span>
                        </div>
                        {cat.description ? (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">
                            Belum ada deskripsi tambahan
                          </p>
                        )}
                      </div>
                    </div>
                    <KategoriActions mode="delete" id={cat.id} name={cat.name} />
                  </div>
                ))}
                {allCategories.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-serif text-base italic">Belum ada kategori yang ditambahkan.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tambahkan kategori pertama melalui formulir di sebelah kiri.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
