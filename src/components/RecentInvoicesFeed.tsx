import { recentInvoices } from '@/data/mockData';
import StatusBadge from './StatusBadge';
import { FileText } from 'lucide-react';

export default function RecentInvoicesFeed() {
  return (
    <div className="bg-surface border border-line rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex-shrink-0">
        <h3 className="text-sm font-semibold text-ink">Recent Invoices processed</h3>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
        {recentInvoices.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between px-4 py-2 hover:bg-hover transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-elevated flex items-center justify-center flex-shrink-0">
                <FileText size={12} className="text-ink-5" />
              </div>
              <span className="text-xs text-ink-4">{inv.timestamp}</span>
            </div>
            <StatusBadge status={inv.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
