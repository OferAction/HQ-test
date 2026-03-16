'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown, Bell, Settings, Sun, Moon, User, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
const WORKFLOW_OPTIONS = [
  { value: 'all',               label: 'All workflows' },
  { value: 'audit',             label: 'Audit' },
  { value: 'invoice-processing', label: 'Invoice Processing' },
  { value: 'vendor-onboarding', label: 'Vendor Onboarding' },
  { value: 'payment-approval',  label: 'Payment Approval' },
  { value: 'contract-review',   label: 'Contract Review' },
];

function WorkflowDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('all');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const label = WORKFLOW_OPTIONS.find((o) => o.value === selected)?.label ?? 'All workflows';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg bg-elevated border text-sm font-medium transition-colors max-w-[180px] ${
          open
            ? 'border-[var(--border-hover)] text-ink-2'
            : 'border-strong text-ink-2 hover:border-[var(--border-hover)]'
        }`}
        title={label}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={13} className={`text-ink-4 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-strong overflow-hidden shadow-lg"
          style={{ background: 'var(--elevated)' }}
        >
          {WORKFLOW_OPTIONS.map((opt) => {
            const active = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setSelected(opt.value); setOpen(false); }}
                title={opt.label}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm text-ink-2 hover:bg-hover transition-colors"
              >
                <span className={`truncate ${active ? 'text-ink font-medium' : ''}`}>{opt.label}</span>
                {active && <Check size={13} className="text-blue-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const DATE_OPTIONS = [
  { value: 'today',    label: 'Today' },
  { value: '7d',       label: 'Last 7 days' },
  { value: '30d',      label: 'Last 30 days' },
  { value: '3m',       label: 'Last 3 months' },
  { value: '12m',      label: 'Last 12 months' },
  { value: 'all',      label: 'All time' },
];

function DateDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('30d');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const label = DATE_OPTIONS.find((o) => o.value === selected)?.label ?? 'Last 30 days';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg bg-elevated border text-sm font-medium transition-colors ${
          open
            ? 'border-[var(--border-hover)] text-ink-2'
            : 'border-strong text-ink-2 hover:border-[var(--border-hover)]'
        }`}
      >
        {label}
        <ChevronDown size={13} className={`text-ink-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] rounded-xl border border-strong overflow-hidden shadow-lg"
          style={{ background: 'var(--elevated)' }}
        >
          {DATE_OPTIONS.map((opt) => {
            const active = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setSelected(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm text-ink-2 hover:bg-hover transition-colors"
              >
                <span className={active ? 'text-ink font-medium' : ''}>{opt.label}</span>
                {active && <Check size={13} className="text-blue-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex items-center justify-end gap-3 px-6 h-16 border-b border-line bg-canvas">
      <WorkflowDropdown />

      <DateDropdown />

      <div className="w-px h-5 bg-[var(--border)]" />

      <button
        onClick={toggle}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink hover:bg-elevated transition-colors"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink hover:bg-elevated transition-colors">
        <Bell size={16} />
      </button>
      <button className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink hover:bg-elevated transition-colors">
        <Settings size={16} />
      </button>
      <button className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
        <User size={15} />
      </button>
    </div>
  );
}
