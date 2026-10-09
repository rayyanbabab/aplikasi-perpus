'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { month: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs shadow-xl font-sans">
        <p className="text-muted-foreground font-medium mb-0.5">{label}</p>
        <p className="text-foreground font-bold text-sm">
          {payload[0].value} <span className="text-xs font-normal text-muted-foreground">transaksi peminjaman</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-muted-foreground text-sm">
        <p className="font-serif italic text-base">Belum ada rekaman sirkulasi 6 bulan terakhir</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Data grafik akan terisi otomatis saat peminjaman dicatat.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217, 119, 6, 0.08)' }} />
        <Bar
          dataKey="count"
          fill="#d97706"
          radius={[6, 6, 0, 0]}
          maxBarSize={44}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
