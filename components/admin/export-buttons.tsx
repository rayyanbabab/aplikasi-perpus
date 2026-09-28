'use client';

import { formatDate } from '@/lib/utils';

interface Loan {
  id: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
  bookTitle?: string | null;
  memberName?: string | null;
}

interface Props {
  loans: Loan[];
  from: string;
  to: string;
}

export function ExportButtons({ loans, from, to }: Props) {
  function exportCSV() {
    const header = ['No', 'Anggota', 'Buku', 'Tanggal Pinjam', 'Jatuh Tempo', 'Dikembalikan', 'Status'];
    const rows = loans.map((l, i) => [
      i + 1,
      l.memberName ?? '',
      l.bookTitle ?? '',
      l.loanDate,
      l.dueDate,
      l.returnDate ?? '-',
      l.status,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-peminjaman-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPrint() {
    const printContent = `
      <html>
        <head>
          <title>Laporan Peminjaman ${from} - ${to}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; }
            h1 { font-size: 16px; margin-bottom: 4px; }
            p { color: #666; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; font-size: 11px; text-transform: uppercase; }
            tr:nth-child(even) { background: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Laporan Peminjaman Perpustakaan ASTRAtech</h1>
          <p>Periode: ${formatDate(from)} – ${formatDate(to)} | Total: ${loans.length} transaksi</p>
          <table>
            <tr><th>#</th><th>Anggota</th><th>Buku</th><th>Pinjam</th><th>Jatuh Tempo</th><th>Kembali</th><th>Status</th></tr>
            ${loans.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${l.memberName ?? ''}</td>
                <td>${l.bookTitle ?? ''}</td>
                <td>${l.loanDate}</td>
                <td>${l.dueDate}</td>
                <td>${l.returnDate ?? '-'}</td>
                <td>${l.status}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        Export CSV
      </button>
      <button
        onClick={exportPrint}
        className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        Cetak / PDF
      </button>
    </div>
  );
}
