export type InvoiceStatus = 'Success' | 'Rerouted' | 'Failed';
export type ReviewStatus = 'Pending' | 'Approved' | 'Declined' | 'Timed out' | 'Handoff';
export type ReviewType = 'Wait for approval' | 'Handoff to human';
export type WorkflowEnvironment = 'live' | 'test';

export interface Reviewer {
  id: string;
  name: string;
  level: 1 | 2;
}

export interface RecentInvoice {
  id: string;
  timestamp: string;
  status: InvoiceStatus;
}

export interface RunDataPoint {
  date: string;
  total: number;
  duplicated: number;
  frauds: number;
  mismatched: number;
  success: number;
}

export interface ReviewRequest {
  id: string;
  status: ReviewStatus;
  reason: string;
  type: ReviewType;
  triggerTime: string;
  sentToReview: string;
  workflowId: string;
  workflowName: string;
  environment: WorkflowEnvironment;
  assignedTo: Reviewer;
  invoice?: InvoiceDetail;
}

export interface InvoiceDetail {
  price: number;
  description: string;
  vendor: string;
  items: number;
  billingDate: string;
  poNumber: string;
  attachment: string;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}
