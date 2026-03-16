'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  message: string;
  duration?: number; // ms
  onUndo: () => void;
  onExpire: () => void;
}

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ToastUndo({ message, duration = 10000, onUndo, onExpire }: Props) {
  const [progress, setProgress] = useState(0); // 0 → 1
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = performance.now();

    function tick(now: number) {
      const elapsed = now - (startRef.current ?? now);
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onExpire();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [duration, onExpire]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-strong)] shadow-2xl"
         style={{ background: 'var(--elevated)' }}>
      {/* Countdown ring */}
      <svg width="26" height="26" viewBox="0 0 26 26" className="flex-shrink-0 -rotate-90">
        {/* Track */}
        <circle cx="13" cy="13" r={RADIUS} fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
        {/* Progress */}
        <circle
          cx="13" cy="13" r={RADIUS}
          fill="none"
          stroke="var(--t3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>

      <span className="text-sm font-medium text-ink whitespace-nowrap">{message}</span>

      <button
        onClick={onUndo}
        className="ml-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-sm font-medium text-ink hover:border-[var(--border-hover)] transition-colors"
      >
        Undo
      </button>
    </div>
  );
}
