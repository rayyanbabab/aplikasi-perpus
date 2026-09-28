import { db } from '@/lib/db';
import { categories, books } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KategoriActions } from '@/components/admin/kategori-actions';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';


export const metadata: Metadata = { title: 'Manajemen Kategori' };

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
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manajemen Kategori</h1>
        <p className="text-zinc-500 text-sm mt-1">{allCategories.length} kategori terdaftar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form tambah */}
        <Card>
          <CardHeader><CardTitle>Tambah Kategori Baru</CardTitle></CardHeader>
          <CardContent>
            <KategoriActions mode="create" />
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader><CardTitle>Daftar Kategori</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {allCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-900/30">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{cat.name}</p>
                    <p className="text-xs text-zinc-500">{cat.bookCount} buku</p>
                  </div>
                  <KategoriActions mode="delete" id={cat.id} name={cat.name} />
                </div>
              ))}
              {allCategories.length === 0 && (
                <div className="px-5 py-8 text-center text-zinc-600 text-sm">Belum ada kategori</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
