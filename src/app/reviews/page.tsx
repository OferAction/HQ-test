'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { reviewRequests, CURRENT_USER } from '@/data/mockData';
import { ReviewRequest } from '@/types';
import KPICard from '@/components/KPICard';
import HumanReviewTable from '@/components/HumanReviewTable';
import CaseDetailPanel from '@/components/CaseDetailPanel';
import ToastUndo from '@/components/ToastUndo';

const PANEL_MIN = 380;
const PANEL_MAX = 680;
const PANEL_DEFAULT = 440;

type Tab = 'mine' | 'all';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRequest[]>(reviewRequests);
  const [tab, setTab] = useState<Tab>('mine');
  const [selected, setSelected] = useState<ReviewRequest>(
    reviewRequests.find((r) => r.assignedTo.id === CURRENT_USER.id) ?? reviewRequests[0]
  );
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const panelWidthRef = useRef(PANEL_DEFAULT);

  type Toast = { id: string; message: string; undo: () => void };
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mine = items assigned to current user that are still pending
  const mineReviews = reviews.filter(
    (r) => r.assignedTo.id === CURRENT_USER.id && r.status === 'Pending'
  );

  // KPIs — scoped to Mine
  const awaiting     = mineReviews.length;
  const allResolved  = reviews.filter((r) => r.assignedTo.id === CURRENT_USER.id && r.status !== 'Pending');
  const reviewed     = allResolved.length;
  const approved     = allResolved.filter((r) => r.status === 'Approved').length;
  const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : 0;

  const visibleReviews = tab === 'mine' ? mineReviews : reviews;

  function showToast(id: string, message: string, prevReview: ReviewRequest) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({
      id,
      message,
      undo: () => {
        setReviews((prev) => prev.map((r) => (r.id === id ? prevReview : r)));
        setSelected((prev) => (prev.id === id ? prevReview : prev));
        setToast(null);
      },
    });
  }

  function handleApprove(id: string) {
    const prev = reviews.find((r) => r.id === id)!;
    setReviews((p) => p.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
    setSelected((p) => (p.id === id ? { ...p, status: 'Approved' } : p));
    showToast(id, 'Item has been approved', prev);
  }

  function handleDecline(id: string) {
    const prev = reviews.find((r) => r.id === id)!;
    setReviews((p) => p.map((r) => (r.id === id ? { ...r, status: 'Declined' } : r)));
    setSelected((p) => (p.id === id ? { ...p, status: 'Declined' } : p));
    showToast(id, 'Item has been declined', prev);
  }

  function handleEscalate(id: string) {
    const prev = reviews.find((r) => r.id === id)!;
    // Reassign to R2, status stays Pending
    setReviews((p) => p.map((r) =>
      r.id === id ? { ...r, assignedTo: { id: 'u-2', name: 'Tal Solomon', level: 2 } } : r
    ));
    setSelected((p) => (p.id === id ? { ...p, assignedTo: { id: 'u-2', name: 'Tal Solomon', level: 2 } } : p));
    showToast(id, 'Escalated to Tal Solomon', prev);
  }

  const startPanelResize = useCallback((startX: number) => {
    const startWidth = panelWidthRef.current;
    const onMove = (e: MouseEvent) => {
      const next = Math.max(PANEL_MIN, Math.min(PANEL_MAX, startWidth + (startX - e.clientX)));
      panelWidthRef.current = next;
      setPanelWidth(next);
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
  }, []);

  const syncedSelected = reviews.find((r) => r.id === selected.id) ?? visibleReviews[0];

  const navigate = useCallback((dir: 1 | -1) => {
    const idx = visibleReviews.findIndex((r) => r.id === selected.id);
    const next = visibleReviews[Math.max(0, Math.min(visibleReviews.length - 1, idx + dir))];
    if (next) setSelected(next);
  }, [visibleReviews, selected]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); navigate(1);  }
      if (e.key === 'ArrowUp')   { e.preventDefault(); navigate(-1); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  // When switching tabs, select the first visible item
  useEffect(() => {
    const first = visibleReviews[0];
    if (first) setSelected(first);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="px-6 pt-6 flex flex-col gap-5 h-full">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Awaiting decision"  value={awaiting}           subtext="Assigned to me" />
        <KPICard label="Reviewed"           value={reviewed}           subtext="Decisions made" />
        <KPICard label="Avg Response Time"  value="3.2 days"           subtext="Time to decision" />
        <KPICard label="Approval rate"      value={`${approvalRate}%`} subtext="Of my reviewed cases" />
      </div>

      {/* Mine / All tabs */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setTab('mine')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-selected text-ink'
              : 'text-ink-4 hover:text-ink hover:bg-hover'
          }`}
        >
          Mine
          {awaiting > 0 && (
            <span className="bg-amber-500/15 text-amber-400 text-xs font-semibold px-1.5 py-px rounded-full border border-amber-500/25">
              {awaiting}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'all'
              ? 'bg-selected text-ink'
              : 'text-ink-4 hover:text-ink hover:bg-hover'
          }`}
        >
          All
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <HumanReviewTable
          reviews={visibleReviews}
          selectedId={syncedSelected?.id ?? null}
          onSelect={setSelected}
          showAssignee={tab === 'all'}
        />
        {/* Resize handle */}
        <div
          onMouseDown={(e) => { e.preventDefault(); startPanelResize(e.clientX); }}
          className="w-1 flex-shrink-0 cursor-col-resize group relative"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px group-hover:w-0.5 bg-line group-hover:bg-blue-500 transition-all" />
        </div>
        {syncedSelected && (
          <CaseDetailPanel
            review={syncedSelected}
            currentUser={CURRENT_USER}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onEscalate={handleEscalate}
            width={panelWidth}
          />
        )}
      </div>

      {toast && (
        <ToastUndo
          key={toast.id + toast.message}
          message={toast.message}
          onUndo={toast.undo}
          onExpire={() => setToast(null)}
        />
      )}
    </div>
  );
}
