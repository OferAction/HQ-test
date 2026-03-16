'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { UserCheck, Users, Timer, ThumbsUp } from 'lucide-react';
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
type Toast = { id: string; message: string; nextId: string | null; undo: () => void };

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRequest[]>(reviewRequests);
  const [tab, setTab] = useState<Tab>('mine');
  const [selected, setSelected] = useState<ReviewRequest>(
    reviewRequests.find((r) => r.assignedTo.id === CURRENT_USER.id) ?? reviewRequests[0]
  );
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const panelWidthRef = useRef(PANEL_DEFAULT);
  const [toast, setToast] = useState<Toast | null>(null);

  // Mine = all items assigned to current user (any status)
  const mineReviews = reviews.filter((r) => r.assignedTo.id === CURRENT_USER.id);

  // KPIs — scoped to Mine
  const awaiting     = mineReviews.filter((r) => r.status === 'Pending').length;
  const allResolved  = reviews.filter((r) => r.assignedTo.id === CURRENT_USER.id && r.status !== 'Pending');
  const reviewed     = allResolved.length;
  const approved     = allResolved.filter((r) => r.status === 'Approved').length;
  const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : 0;

  const visibleReviews = tab === 'mine' ? mineReviews : reviews;

  function showToast(id: string, message: string, prevReview: ReviewRequest, nextId: string | null) {
    setToast({
      id,
      message,
      nextId,
      undo: () => {
        setReviews((prev) => prev.map((r) => (r.id === id ? prevReview : r)));
        setSelected((prev) => (prev.id === id ? prevReview : prev));
        setToast(null);
      },
    });
  }

  function makeTimestamp() {
    return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function appendAuditEntry(r: typeof reviews[0], action: string, comment: string) {
    if (!r.invoice) return r;
    const entry = { id: `a-${Date.now()}`, actor: CURRENT_USER.name, action, timestamp: makeTimestamp(), ...(comment ? { comment } : {}) };
    return { ...r, invoice: { ...r.invoice, auditTrail: [...r.invoice.auditTrail, entry] } };
  }

  function handleApprove(id: string, comment: string) {
    const prev = reviews.find((r) => r.id === id)!;
    const idx = visibleReviews.findIndex((r) => r.id === id);
    const nextId = (visibleReviews[idx + 1] ?? visibleReviews[idx - 1])?.id ?? null;
    setReviews((p) => p.map((r) => r.id === id ? appendAuditEntry({ ...r, status: 'Approved' }, 'Approved', comment) : r));
    setSelected((p) => p.id === id ? appendAuditEntry({ ...p, status: 'Approved' }, 'Approved', comment) : p);
    showToast(id, 'Item has been approved', prev, nextId);
  }

  function handleDecline(id: string, comment: string) {
    const prev = reviews.find((r) => r.id === id)!;
    const idx = visibleReviews.findIndex((r) => r.id === id);
    const nextId = (visibleReviews[idx + 1] ?? visibleReviews[idx - 1])?.id ?? null;
    setReviews((p) => p.map((r) => r.id === id ? appendAuditEntry({ ...r, status: 'Declined' }, 'Declined', comment) : r));
    setSelected((p) => p.id === id ? appendAuditEntry({ ...p, status: 'Declined' }, 'Declined', comment) : p);
    showToast(id, 'Item has been declined', prev, nextId);
  }

  function handleEscalate(id: string, comment: string) {
    const prev = reviews.find((r) => r.id === id)!;
    const idx = visibleReviews.findIndex((r) => r.id === id);
    const nextId = (visibleReviews[idx + 1] ?? visibleReviews[idx - 1])?.id ?? null;
    setReviews((p) => p.map((r) => r.id === id ? appendAuditEntry({ ...r, status: 'Handoff' }, 'Escalated to next reviewer', comment) : r));
    setSelected((p) => p.id === id ? appendAuditEntry({ ...p, status: 'Handoff' }, 'Escalated to next reviewer', comment) : p);
    showToast(id, 'Escalated to next reviewer', prev, nextId);
  }

  function handleExpire() {
    const nextId = toast?.nextId ?? null;
    setToast(null);
    if (nextId) {
      const nextReview = reviews.find((r) => r.id === nextId);
      if (nextReview) setSelected(nextReview);
    }
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
        <KPICard label="Awaiting decision"     value={awaiting}           subtext="Assigned to me"       icon={UserCheck} />
        <KPICard label="Reviewed"              value={reviewed}           subtext="Decisions made"       icon={Users} />
        <KPICard label="Average Response Time" value="3.2 days"           subtext="Time to decision"     icon={Timer} />
        <KPICard label="Approval rate"         value={`${approvalRate}%`} subtext="Of my reviewed cases" icon={ThumbsUp} />
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
      <div className="flex flex-1 min-h-0 relative">
        <HumanReviewTable
          reviews={visibleReviews}
          selectedId={syncedSelected?.id ?? null}
          onSelect={setSelected}
          showAssignee={tab === 'all'}
        />
        {/* Resize handle — seamless background, handle appears on hover */}
        <div
          onMouseDown={(e) => { e.preventDefault(); startPanelResize(e.clientX); }}
          className="w-1 flex-shrink-0 cursor-col-resize group relative bg-selected"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px opacity-0 group-hover:opacity-100 group-hover:w-0.5 bg-blue-500 transition-all" />
        </div>
        {syncedSelected ? (
          <CaseDetailPanel
            review={syncedSelected}
            currentUser={CURRENT_USER}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onEscalate={handleEscalate}
            width={panelWidth}
          />
        ) : (
          <div
            className="flex-shrink-0 flex-grow-0 h-full border-t border-r border-b-0 border-line rounded-tr-xl"
            style={{ width: panelWidth, background: 'var(--selected)' }}
          />
        )}
        {toast && (
          <div
            className="absolute bottom-6 z-50"
            style={{ right: panelWidth + 4 + 24 }}
          >
            <ToastUndo
              key={toast.id + toast.message}
              message={toast.message}
              onUndo={toast.undo}
              onExpire={handleExpire}
            />
          </div>
        )}
      </div>
    </div>
  );
}
