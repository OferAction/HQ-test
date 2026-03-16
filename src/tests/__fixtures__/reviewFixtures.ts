import { ReviewRequest, InvoiceDetail, AuditEntry, Reviewer } from '@/types';

export const TEST_REVIEWER: Reviewer = { id: 'u-test-1', name: 'Ofer Ben Shushan', level: 1 };

export function buildAuditEntry(overrides?: Partial<AuditEntry>): AuditEntry {
  return {
    id: 'a1',
    actor: 'System',
    action: 'Human-review triggered',
    timestamp: 'March 12, 2025 12:16:09 PM',
    ...overrides,
  };
}

export function buildInvoice(overrides?: Partial<InvoiceDetail>): InvoiceDetail {
  return {
    price: 52000,
    description: 'Software licenses Q1',
    vendor: 'Acme Corp',
    items: 3,
    billingDate: '03/12/2025',
    poNumber: 'PO 2025-0001',
    attachment: 'invoice.pdf',
    auditTrail: [
      buildAuditEntry({ id: 'a1', action: 'Human-review triggered', timestamp: 'March 12, 2025 12:16:09 PM' }),
      buildAuditEntry({ id: 'a2', actor: 'Ofer Ben Shushan', action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 13, 2025 12:16:09 PM' }),
      buildAuditEntry({ id: 'a3', actor: 'Ofer Ben Shushan', action: 'escalated to Tal Solomon', timestamp: 'March 19, 2025 12:16:09 PM' }),
      buildAuditEntry({ id: 'a4', actor: 'Tal Solomon', action: 'Approved', timestamp: 'March 20, 2025 12:16:09 PM' }),
    ],
    ...overrides,
  };
}

let _id = 0;
export function buildReview(overrides?: Partial<ReviewRequest>): ReviewRequest {
  _id++;
  return {
    id: `rev-test-${_id}`,
    status: 'Pending',
    reason: 'Invoice over threshold',
    type: 'Wait for approval',
    triggerTime: 'March 12, 2025 10:00:00 AM',
    sentToReview: '2 days ago',
    workflowId: 'wf-test-1',
    workflowName: 'Workflow 1',
    environment: 'live',
    assignedTo: TEST_REVIEWER,
    invoice: buildInvoice(),
    ...overrides,
  };
}

/** Reset the auto-incrementing id counter between test files */
export function resetId() { _id = 0; }
