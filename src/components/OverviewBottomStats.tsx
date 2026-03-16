'use client';

import { dataSources } from '@/data/mockData';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/context/ThemeContext';

const tokenSparkData = [
  { v: 80000 }, { v: 95000 }, { v: 88000 }, { v: 102000 },
  { v: 110000 }, { v: 98000 }, { v: 124699 },
];

const humanReviewData = [
  { month: 'This month', value: 8, max: 35 },
  { month: 'Last month',  value: 30, max: 35 },
  { month: 'Avg (6 mo)',  value: 23, max: 35 },
];

export default function OverviewBottomStats() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const trackBg = isDark ? '#1c2133' : '#e8edf8';

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Data sources */}
      <div className="bg-surface border border-line rounded-xl px-5 py-4">
        <Label>Data sources</Label>
        <div className="flex flex-col gap-2.5 mt-3">
          {dataSources.map((ds) => (
            <div key={ds.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: ds.color }} />
              <span className="text-xs text-ink-3">{ds.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time saved */}
      <div className="bg-surface border border-line rounded-xl px-5 py-4">
        <Label>Time Saved (Last 6 months)</Label>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-[22px] font-bold text-ink leading-none">21,348</span>
          <span className="text-xs text-ink-4">hrs</span>
          <span className="text-ink-5 mx-1">/</span>
          <span className="text-lg font-bold text-ink leading-none">150</span>
          <span className="text-xs text-ink-4">days</span>
        </div>
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tokenSparkData}>
              <defs>
                <linearGradient id="timeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDark ? 0.3 : 0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} fill="url(#timeFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tokens usage */}
      <div className="bg-surface border border-line rounded-xl px-5 py-4">
        <Label>Tokens usage</Label>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-[22px] font-bold text-ink leading-none">124,699</span>
        </div>
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tokenSparkData}>
              <defs>
                <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={isDark ? 0.3 : 0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#tokenFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2.5 w-full rounded-full h-1" style={{ background: trackBg }}>
          <div className="bg-purple-500 h-1 rounded-full" style={{ width: '62%' }} />
        </div>
      </div>

      {/* Human review */}
      <div className="bg-surface border border-line rounded-xl px-5 py-4">
        <Label>Human review</Label>
        <div className="flex items-baseline gap-1 mt-2 mb-4">
          <span className="text-[22px] font-bold text-ink leading-none">23</span>
          <span className="text-xs text-ink-4">times</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {humanReviewData.map((item) => (
            <div key={item.month} className="flex items-center gap-2">
              <span className="text-[11px] text-ink-5 w-20 flex-shrink-0">{item.month}</span>
              <div className="flex-1 rounded-full h-1.5" style={{ background: trackBg }}>
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-ink-4 w-5 text-right tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-ink-4 font-semibold uppercase tracking-wider">{children}</p>
  );
}
