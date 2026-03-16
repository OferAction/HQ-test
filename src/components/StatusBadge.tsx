import { ReviewStatus, InvoiceStatus } from '@/types';

type Status = ReviewStatus | InvoiceStatus;

const styles: Record<Status, string> = {
  Pending:      'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  Approved:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  Declined:     'bg-red-500/10 text-red-400 border border-red-500/25',
  'Timed out':  'bg-zinc-500/10 text-zinc-400 border border-zinc-500/25',
  Handoff:      'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  Success:      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  Rerouted:     'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  Failed:       'bg-red-500/10 text-red-400 border border-red-500/25',
};

const dots: Record<Status, string> = {
  Pending:      'bg-amber-400',
  Approved:     'bg-emerald-400',
  Declined:     'bg-red-400',
  'Timed out':  'bg-zinc-400',
  Handoff:      'bg-blue-400',
  Success:      'bg-emerald-400',
  Rerouted:     'bg-amber-400',
  Failed:       'bg-red-400',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[status]}`} />
      {status}
    </span>
  );
}
