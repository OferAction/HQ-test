import { ReactNode, ElementType } from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtext?: string;
  extra?: ReactNode;
  icon?: ElementType;
}

export default function KPICard({ label, value, subtext, extra, icon: Icon }: KPICardProps) {
  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon size={13} className="text-ink-4 flex-shrink-0" />}
        <span className="text-[11px] text-ink-4 font-semibold uppercase tracking-widest truncate">{label}</span>
      </div>
      <div className="text-[22px] font-bold text-ink leading-none tracking-tight">{value}</div>
      {subtext && (
        <div className="text-xs text-ink-5 mt-1 leading-snug">{subtext}</div>
      )}
      {extra && <div className="mt-2">{extra}</div>}
    </div>
  );
}
