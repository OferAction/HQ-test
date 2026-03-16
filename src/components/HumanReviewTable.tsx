'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ReviewRequest, ReviewStatus, WorkflowEnvironment } from '@/types';
import StatusBadge from './StatusBadge';
import FilterDropdown from './FilterDropdown';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface Props {
  reviews: ReviewRequest[];
  selectedId: string | null;
  onSelect: (review: ReviewRequest) => void;
  showAssignee?: boolean;
}

const MIN_COL_WIDTH = 60;

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const BASE_COLS = [
  { key: 'status',   label: 'Status',         defaultWidth: 105 },
  { key: 'reason',   label: 'Reason',          defaultWidth: 185 },
  { key: 'type',     label: 'Type',            defaultWidth: 135 },
  { key: 'trigger',  label: 'Trigger time',    defaultWidth: 175 },
  { key: 'sent',     label: 'Sent to review',  defaultWidth: 120 },
];
const ASSIGNEE_COL = { key: 'assignee', label: 'Assigned to', defaultWidth: 140 };

const COL_SORT_KEY: Record<string, (r: ReviewRequest) => string> = {
  status:   (r) => r.status,
  reason:   (r) => r.reason,
  type:     (r) => r.type,
  trigger:  (r) => r.triggerTime,
  sent:     (r) => r.sentToReview,
  assignee: (r) => r.assignedTo.name,
};

const ENV_OPTIONS = [
  { value: 'live', label: 'Show Live' },
  { value: 'test', label: 'Show tests' },
];

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'Pending',    label: 'Pending' },
  { value: 'Approved',   label: 'Approved' },
  { value: 'Declined',   label: 'Declined' },
  { value: 'Timed out',  label: 'Timed out' },
  { value: 'Handoff',    label: 'Handoff' },
];

function groupByWorkflowAndEnv(reviews: ReviewRequest[]) {
  const map = new Map<string, { name: string; env: WorkflowEnvironment; items: ReviewRequest[] }>();
  for (const r of reviews) {
    const key = `${r.workflowId}-${r.environment}`;
    if (!map.has(key)) map.set(key, { name: r.workflowName, env: r.environment, items: [] });
    map.get(key)!.items.push(r);
  }
  return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }));
}

function EnvBadge({ env }: { env: WorkflowEnvironment }) {
  return env === 'live' ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-emerald-400" style={{ background: 'var(--elevated)' }}>
      Live
      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-ink-4" style={{ background: 'var(--elevated)' }}>
      Test
      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
    </span>
  );
}

export default function HumanReviewTable({ reviews, selectedId, onSelect, showAssignee = false }: Props) {
  const COLS = useMemo(() => showAssignee ? [...BASE_COLS, ASSIGNEE_COL] : BASE_COLS, [showAssignee]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [widths, setWidths] = useState(COLS.map((c) => c.defaultWidth));

  useEffect(() => {
    setWidths(COLS.map((c) => c.defaultWidth));
  }, [COLS]);
  const [envFilter, setEnvFilter] = useState<string[]>(['live', 'test']);
  const [statusFilter, setStatusFilter] = useState<string[]>(STATUS_OPTIONS.map((o) => o.value));
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortCol === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortCol(null); // third click clears sort
      }
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    const base = reviews.filter(
      (r) => envFilter.includes(r.environment) && statusFilter.includes(r.status),
    );
    if (!sortCol || !COL_SORT_KEY[sortCol]) return base;
    const getter = COL_SORT_KEY[sortCol];
    return [...base].sort((a, b) => {
      const cmp = getter(a).localeCompare(getter(b));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [reviews, envFilter, statusFilter, sortCol, sortDir]);

  const pending = filtered.filter((r) => r.status === 'Pending').length;
  const groups = groupByWorkflowAndEnv(filtered);

  // fr units fill the container — proportional to the stored weights
  const gridTemplate = useMemo(() => widths.map((w) => `${w}fr`).join(' '), [widths]);

  // Scroll selected row into view
  useEffect(() => {
    if (!selectedId || !scrollRef.current) return;
    const row = scrollRef.current.querySelector(`[data-row-id="${selectedId}"]`);
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  const startResize = useCallback((colIdx: number, startX: number) => {
    const startFr = widths[colIdx];
    const totalFr = widths.reduce((a, b) => a + b, 0);
    const containerPx = scrollRef.current?.clientWidth ?? 800;
    const pxPerFr = containerPx / totalFr;
    const minFr = MIN_COL_WIDTH / pxPerFr;

    const onMove = (e: MouseEvent) => {
      const deltaFr = (e.clientX - startX) / pxPerFr;
      const newFr = Math.max(minFr, startFr + deltaFr);
      setWidths((prev) => prev.map((w, i) => (i === colIdx ? newFr : w)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [widths]);

  return (
    <div className="flex-1 min-w-[320px] bg-surface border border-b-0 border-line rounded-t-xl flex flex-col overflow-hidden">
      {/* Fixed title bar */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold text-ink">Human Review Requests</h3>
          {pending > 0 && (
            <span className="bg-amber-500/15 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/25">
              {pending}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="environments"
            allLabel="Live and tests"
            options={ENV_OPTIONS}
            selected={envFilter}
            onChange={setEnvFilter}
          />
          <FilterDropdown
            label="statuses"
            allLabel="Any status"
            options={STATUS_OPTIONS}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Single scrollable area: header + rows scroll together */}
      <div ref={scrollRef} className="flex-1 overflow-auto">

        {/* Sticky column headers — scroll with content horizontally, stick vertically */}
        <div
          className="sticky top-0 z-10 bg-surface border-b border-line px-5 py-3"
          style={{ display: 'grid', gridTemplateColumns: gridTemplate, width: '100%' }}
        >
          {COLS.map((col, i) => {
            const isActive = sortCol === col.key;
            const Icon = isActive ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
            return (
            <div
              key={col.key}
              onClick={() => handleSort(col.key)}
              className="relative flex items-center gap-1 overflow-visible cursor-pointer select-none group/col"
            >
              <span className="text-xs text-ink-3 font-semibold uppercase tracking-widest whitespace-nowrap"
                    style={{
                      paddingLeft:  i > 0 ? 12 : 0,
                      paddingRight: i < COLS.length - 1 ? 12 : 0,
                    }}>
                {col.label}
              </span>
              <Icon
                size={11}
                className={`flex-shrink-0 transition-opacity ${
                  isActive ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover/col:opacity-60 text-ink-3'
                }`}
              />

              {/* Resize handle — sits on the right boundary, between this col and the next */}
              {i < COLS.length - 1 && (
                <div
                  onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); startResize(i, e.clientX); }}
                  className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize group/resize"
                  style={{ transform: 'translateX(50%)' }}
                >
                  <div className="w-px h-5 rounded-full bg-[var(--border-strong)] group-hover/resize:w-0.5 group-hover/resize:h-full group-hover/resize:bg-blue-300 transition-all duration-150" />
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Rows */}
        {groups.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-ink-4">
            No requests match the current filters
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id}>
              {/* Workflow label */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-canvas border-b border-subtle">
                <span className="text-xs text-ink-3 font-semibold tracking-widest uppercase whitespace-nowrap">
                  {group.name}
                </span>
                <EnvBadge env={group.env} />
                <span
                  className="text-xs font-semibold px-1.5 py-px rounded-full border"
                  style={{ background: 'var(--elevated)', color: 'var(--t3)', borderColor: 'var(--border)' }}
                >
                  {group.items.length}
                </span>
              </div>

              {group.items.map((rev) => (
                <div
                  key={rev.id}
                  data-row-id={rev.id}
                  onClick={() => onSelect(rev)}
                  className={`cursor-pointer transition-colors border-b border-subtle ${
                    selectedId === rev.id ? 'bg-selected' : 'hover:bg-hover'
                  }`}
                >
                <div
                  className="px-5 py-4"
                  style={{ display: 'grid', gridTemplateColumns: gridTemplate, width: '100%' }}
                >
                  <div className="flex items-center overflow-hidden">
                    <StatusBadge status={rev.status} />
                  </div>
                  <div className="flex items-center pl-3 pr-4 overflow-hidden">
                    <span className="text-sm font-medium text-ink-2 truncate" title={rev.reason}>{rev.reason}</span>
                  </div>
                  <div className="flex items-center pl-3 overflow-hidden">
                    <span className="text-sm text-ink-3 truncate" title={rev.type}>{rev.type}</span>
                  </div>
                  <div className="flex items-center pl-3 overflow-hidden">
                    <span className="text-sm text-ink-3 tabular-nums truncate" title={formatTimestamp(rev.triggerTime)}>{formatTimestamp(rev.triggerTime)}</span>
                  </div>
                  <div className="flex items-center pl-3 overflow-hidden">
                    <span className="text-sm text-ink-3 truncate" title={rev.sentToReview}>{rev.sentToReview}</span>
                  </div>
                  {showAssignee && (
                    <div className="flex items-center pl-3 overflow-hidden">
                      <span className="text-sm text-ink-3 truncate" title={rev.assignedTo.name}>{rev.assignedTo.name}</span>
                    </div>
                  )}
                </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
