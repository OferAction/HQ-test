'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  allLabel: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function FilterDropdown({ label, allLabel, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const allSelected = selected.length === options.length;

  const buttonLabel = allSelected
    ? allLabel
    : selected.length === 0
    ? `No ${label}`
    : selected.length === 1
    ? options.find((o) => o.value === selected[0])?.label ?? label
    : `${selected.length} ${label}`;

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
          open
            ? 'bg-elevated border-[var(--border-hover)] text-ink-2'
            : 'bg-elevated border-strong text-ink-3 hover:border-[var(--border-hover)]'
        }`}
      >
        {buttonLabel}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-[160px] rounded-xl border border-strong overflow-hidden shadow-lg"
          style={{ background: 'var(--elevated)' }}
        >
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm text-ink-2 hover:bg-hover transition-colors"
              >
                <span>{opt.label}</span>
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                    checked
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-strong bg-transparent'
                  }`}
                >
                  {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
