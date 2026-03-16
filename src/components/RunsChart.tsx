'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { runData } from '@/data/mockData';
import { useTheme } from '@/context/ThemeContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs shadow-2xl border"
      style={{
        background: isDark ? '#151929' : '#ffffff',
        borderColor: isDark ? '#273048' : '#dce4f2',
      }}
    >
      <p className="font-semibold mb-2.5" style={{ color: isDark ? '#8490b2' : '#67789e' }}>{label}</p>
      <div className="flex flex-col gap-1.5 min-w-[168px]">
        <div className="flex justify-between gap-6">
          <span style={{ color: isDark ? '#c4cce8' : '#1c2444' }}>{d?.total?.toLocaleString()} Invoices</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-emerald-400">{d?.success?.toLocaleString()} Success</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-amber-400">{((d?.duplicated ?? 0) + (d?.frauds ?? 0))} Duplicates / Fraud</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-red-400">{d?.mismatched ?? 0} Mismatched</span>
        </div>
      </div>
    </div>
  );
}

export default function RunsChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1c2133' : '#e8edf8';
  const tickColor = isDark ? '#5e6888' : '#90a0c2';

  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3 flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-semibold text-ink">Runs</h3>
        <div className="flex items-center gap-4 text-[11px] text-ink-4">
          <LegendDot color="#3b82f6" label="Success" />
          <LegendDot color="#f59e0b" label="Duplicates" />
          <LegendDot color="#f97316" label="Fraud" />
          <LegendDot color="#ef4444" label="Mismatched" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={runData} barSize={20} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
          />
          <Tooltip
            content={<CustomTooltip isDark={isDark} />}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,50,0.04)' }}
          />
          <Bar dataKey="success"    stackId="a" fill="#3b82f6" />
          <Bar dataKey="duplicated" stackId="a" fill="#f59e0b" />
          <Bar dataKey="frauds"     stackId="a" fill="#f97316" />
          <Bar dataKey="mismatched" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
