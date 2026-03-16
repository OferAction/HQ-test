'use client';

import { ChevronDown, Bell, Settings, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex items-center justify-end gap-3 px-6 h-16 border-b border-line bg-canvas">
      <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-elevated border border-strong text-sm text-ink-2 hover:border-[var(--border-hover)] transition-colors">
        All workflows
        <ChevronDown size={14} className="text-ink-4" />
      </button>

      <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-elevated border border-strong text-sm text-ink-2 hover:border-[var(--border-hover)] transition-colors">
        Last 30 days
        <ChevronDown size={14} className="text-ink-4" />
      </button>

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
