'use client';

import { useEffect, useRef } from 'react';

interface Props {
  message: string;
  duration?: number;
  onUndo: () => void;
  onExpire: () => void;
}

const CX = 13, CY = 13, R = 11;

function polarToCartesian(angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function piePath(progress: number): string {
  if (progress <= 0) return '';
  if (progress >= 0.9999) {
    return `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.001} ${CY - R} Z`;
  }
  const angle = progress * 360;
  const end = polarToCartesian(angle);
  const start = polarToCartesian(0);
  const largeArc = angle > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function ToastUndo({ message, duration = 10000, onUndo, onExpire }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      if (pathRef.current) {
        pathRef.current.setAttribute('d', piePath(p));
      }
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onExpireRef.current();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl shadow-2xl"
         style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Pie countdown */}
      <svg width="26" height="26" viewBox="0 0 26 26" className="flex-shrink-0">
        {/* Background circle (remaining time) */}
        <circle cx={CX} cy={CY} r={R} fill="rgba(255,255,255,0.22)" />
        {/* Elapsed slice (grows clockwise) */}
        <path ref={pathRef} fill="#0f1320" d="" />
      </svg>

      <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {message}
      </span>

      <button
        onClick={onUndo}
        className="ml-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
        style={{ background: 'rgba(255,255,255,0.95)', color: '#111' }}
      >
        Undo
      </button>
    </div>
  );
}
