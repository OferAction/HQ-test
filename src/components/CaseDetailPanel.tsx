'use client';

import { ReviewRequest, Reviewer } from '@/types';
import { Paperclip, Check, CheckCheck, CornerUpRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Props {
  review: ReviewRequest;
  currentUser: Reviewer;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onEscalate: (id: string) => void;
  width?: number;
}

function getAuditType(action: string): 'approve' | 'escalate' | 'notify' | 'trigger' {
  if (action.toLowerCase().includes('approv'))  return 'approve';
  if (action.toLowerCase().includes('escalat')) return 'escalate';
  if (action.toLowerCase().includes('notif'))   return 'notify';
  return 'trigger';
}

// Bolds any "Firstname Lastname" patterns (two capitalized words) in a string
function BoldNames({ text }: { text: string }) {
  const parts = text.split(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <span key={i} className="font-bold text-ink">{part}</span>
          : part
      )}
    </>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-sm text-ink-5 flex-shrink-0 w-24">{label}</span>
      <span className="text-sm text-ink-2 text-right">{value}</span>
    </div>
  );
}

export default function CaseDetailPanel({ review, currentUser, onApprove, onDecline, onEscalate, width = 320 }: Props) {
  const inv = review.invoice;
  if (!inv) return null;

  const isAssignedToMe = review.assignedTo.id === currentUser.id;
  const isPending      = review.status === 'Pending';
  const canAct         = isAssignedToMe && isPending;
  const canEscalate    = canAct && currentUser.level === 1;

  return (
    <div
      className="flex-shrink-0 flex-grow-0 flex flex-col h-full overflow-hidden"
      style={{ width, background: 'var(--bg)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-base font-semibold text-ink leading-snug">{review.reason}</h3>
          <div className="flex-shrink-0 mt-0.5">
            <StatusBadge status={review.status} />
          </div>
        </div>
        <p className="text-sm text-ink-4">{review.workflowName}</p>
        {!isAssignedToMe && isPending && (
          <p className="text-xs text-ink-5 mt-1.5">
            Assigned to <span className="text-ink-3 font-medium">{review.assignedTo.name}</span>
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {/* Invoice fields */}
        <div>
          <FieldRow label="Invoice price" value={`$${inv.price.toLocaleString()}`} />
          <FieldRow label="Description"   value={inv.description} />
          <FieldRow label="Vendor"        value={inv.vendor} />
          <FieldRow label="Items"         value={String(inv.items)} />
          <FieldRow label="Billing date"  value={inv.billingDate} />
          <FieldRow label="PO number"     value={inv.poNumber} />
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-sm text-ink-5 flex-shrink-0 w-24">Attachments</span>
            <button className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <Paperclip size={13} />
              {inv.attachment}
            </button>
          </div>
        </div>

        {/* Audit trail */}
        <div>
          <p className="text-xs font-semibold text-ink-4 uppercase tracking-widest mb-4">Audit Trail</p>
          <div className="flex flex-col">
            {inv.auditTrail.map((entry, i) => {
              const type   = getAuditType(entry.action);
              const isLast = i === inv.auditTrail.length - 1;
              return (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    {type === 'approve' ? (
                      <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-ink-5 flex-shrink-0 mt-1" />
                    )}
                    {!isLast && <div className="w-px flex-1 mt-1.5 mb-1 bg-[var(--border)]" />}
                  </div>
                  <div className="pb-5">
                    {type === 'approve' ? (
                      <p className="text-sm leading-snug">
                        <span className="font-bold text-ink">{entry.actor}</span>
                        <span className="text-ink-3"> Approved</span>
                      </p>
                    ) : (
                      <p className="text-sm leading-snug text-ink-3">
                        {entry.actor !== 'System' && (
                          <><span className="font-bold text-ink">{entry.actor}</span>{' '}</>
                        )}
                        <BoldNames text={entry.action} />
                      </p>
                    )}
                    <p className="text-sm text-ink-4 mt-1">{entry.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-4 border-t border-line flex items-center gap-2">
        {canAct ? (
          <>
            {/* Escalate — only for R1 */}
            {canEscalate && (
              <div className="relative group">
                <button
                  onClick={() => onEscalate(review.id)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-line text-sm font-medium text-ink-4 hover:border-[var(--border-hover)] hover:text-ink-2 transition-colors"
                >
                  <CornerUpRight size={14} />
                  Escalate
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-strong shadow-lg"
                     style={{ background: 'var(--elevated)' }}>
                  Forward to next reviewer
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                       style={{ borderTopColor: 'var(--border-strong)' }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => onDecline(review.id)}
                className="px-4 py-2.5 rounded-lg border border-line text-sm font-medium text-ink-3 hover:border-red-500/40 hover:text-red-400 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => onApprove(review.id)}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <Check size={14} />
                Approve
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-elevated text-sm text-ink-4">
            <CheckCheck size={15} />
            {isPending ? `Assigned to ${review.assignedTo.name}` : review.status}
          </div>
        )}
      </div>
    </div>
  );
}
