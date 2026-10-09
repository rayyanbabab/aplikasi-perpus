'use client';

import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

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
    a.download = `laporan-sirkulasi-${from}-sd-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPrint() {
    const printContent = `
      <html>
        <head>
          <title>Laporan Sirkulasi Pustaka: ${from} s/d ${to}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; }
            h1 { font-size: 18px; margin-bottom: 2px; color: #0f172a; }
            h2 { font-size: 13px; color: #64748b; font-weight: normal; margin-top: 0; margin-bottom: 16px; }
            p { color: #475569; margin-bottom: 16px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f1f5f9; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
            .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h1>Perpustakaan Politeknik Astra (ASTRAtech)</h1>
            <h2>Laporan Rekapitulasi Sirkulasi Peminjaman Buku</h2>
            <p>Periode Data: ${formatDate(from)} s/d ${formatDate(to)} | Total Transaksi: ${loans.length} rekaman</p>
          </div>
          <table>
            <tr><th>No</th><th>Anggota Peminjam</th><th>Judul Buku</th><th>Tgl Pinjam</th><th>Jatuh Tempo</th><th>Tgl Kembali</th><th>Status</th></tr>
            ${loans.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${l.memberName ?? '-'}</td>
                <td>${l.bookTitle ?? '-'}</td>
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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={exportCSV}
        className="h-10 text-xs font-semibold gap-2 border-border/80 hover:bg-secondary"
      >
        <Download className="w-3.5 h-3.5 text-primary" />
        <span>Ekspor CSV</span>
      </Button>
      <Button
        variant="outline"
        onClick={exportPrint}
        className="h-10 text-xs font-semibold gap-2 border-border/80 hover:bg-secondary"
      >
        <Printer className="w-3.5 h-3.5 text-primary" />
        <span>Cetak / PDF</span>
      </Button>
    </div>
  );
}
