import { RunDataPoint, RecentInvoice, ReviewRequest, Reviewer } from '@/types';

// ─── Users ────────────────────────────────────────────────────────────────────
export const REVIEWER_1: Reviewer = { id: 'u-1', name: 'Ofer Ben Shushan', level: 1 };
export const REVIEWER_2: Reviewer = { id: 'u-2', name: 'Tal Solomon',      level: 2 };

// The logged-in user
export const CURRENT_USER: Reviewer = REVIEWER_1;

// ─── Charts ───────────────────────────────────────────────────────────────────
export const runData: RunDataPoint[] = [
  { date: 'Oct 1',  total: 800,  duplicated: 5,  frauds: 3, mismatched: 8,  success: 784  },
  { date: 'Oct 2',  total: 950,  duplicated: 4,  frauds: 2, mismatched: 6,  success: 938  },
  { date: 'Oct 3',  total: 700,  duplicated: 6,  frauds: 4, mismatched: 10, success: 680  },
  { date: 'Oct 4',  total: 1100, duplicated: 3,  frauds: 1, mismatched: 5,  success: 1091 },
  { date: 'Oct 5',  total: 900,  duplicated: 7,  frauds: 3, mismatched: 9,  success: 881  },
  { date: 'Oct 6',  total: 1300, duplicated: 8,  frauds: 5, mismatched: 12, success: 1275 },
  { date: 'Oct 7',  total: 1450, duplicated: 10, frauds: 6, mismatched: 14, success: 1420 },
  { date: 'Oct 8',  total: 1200, duplicated: 5,  frauds: 2, mismatched: 8,  success: 1185 },
  { date: 'Oct 9',  total: 980,  duplicated: 4,  frauds: 3, mismatched: 7,  success: 966  },
  { date: 'Oct 10', total: 1600, duplicated: 12, frauds: 7, mismatched: 18, success: 1563 },
  { date: 'Oct 11', total: 2100, duplicated: 15, frauds: 9, mismatched: 22, success: 2054 },
  { date: 'Oct 12', total: 1800, duplicated: 11, frauds: 6, mismatched: 16, success: 1767 },
  { date: 'Oct 13', total: 1400, duplicated: 8,  frauds: 4, mismatched: 11, success: 1377 },
  { date: 'Oct 14', total: 1550, duplicated: 9,  frauds: 5, mismatched: 13, success: 1523 },
];

export const recentInvoices: RecentInvoice[] = [
  { id: 'inv-001', timestamp: 'October 26, 2023 13:55:09 PM', status: 'Success'  },
  { id: 'inv-002', timestamp: 'October 26, 2023 13:42:17 PM', status: 'Success'  },
  { id: 'inv-003', timestamp: 'October 26, 2023 13:46:32 PM', status: 'Rerouted' },
  { id: 'inv-004', timestamp: 'October 26, 2023 13:52:41 PM', status: 'Success'  },
  { id: 'inv-005', timestamp: 'October 26, 2023 13:58:39 PM', status: 'Success'  },
  { id: 'inv-006', timestamp: 'October 26, 2023 14:04:22 PM', status: 'Success'  },
  { id: 'inv-007', timestamp: 'October 26, 2023 14:11:05 PM', status: 'Success'  },
  { id: 'inv-008', timestamp: 'October 26, 2023 14:18:44 PM', status: 'Rerouted' },
];

// ─── Review requests ──────────────────────────────────────────────────────────
// Scenario represented in the data:
//   rev-001  Pending   → assigned to Ofer (R1) — needs action
//   rev-002  Pending   → assigned to Ofer (R1) — needs action
//   rev-007  Pending   → assigned to Ofer (R1) — needs action
//   rev-008  Pending   → assigned to Ofer (R1) — needs action (test env)
//   rev-011  Pending   → assigned to Tal  (R2) — Ofer escalated it, Tal now owns it
//   rev-003  Declined  → resolved by Ofer
//   rev-004  Approved  → resolved by Ofer
//   rev-005  Approved  → resolved by Tal  (was escalated to Tal)
//   rev-006  Declined  → resolved by Tal
//   rev-009  Timed out → was assigned to Ofer, no response
//   rev-010  Handoff   → was assigned to Ofer, escalated to Tal

export const reviewRequests: ReviewRequest[] = [
  // ── Ofer's pending items (Mine) ────────────────────────────────────────────
  {
    id: 'rev-001',
    status: 'Pending',
    reason: 'Over 50k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 12, 2025 10:00:00 AM',
    sentToReview: '2 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'live',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 76000,
      description: 'Invoice over $50K needs manager approval',
      vendor: 'Venito',
      items: 3,
      billingDate: '03/12/2025',
      poNumber: 'PO 2025-4433',
      attachment: 'invoice.pdf',
      auditTrail: [
        { id: 'a2', actor: 'System', action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 12, 2025 10:01:00 AM' },
        { id: 'a1', actor: 'System', action: 'Human-review triggered',                timestamp: 'March 12, 2025 10:00:00 AM' },
      ],
    },
  },
  {
    id: 'rev-002',
    status: 'Pending',
    reason: 'Over 150k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 11, 2025 09:00:00 AM',
    sentToReview: '3 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'live',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 162000,
      description: 'Invoice over $150K requires executive sign-off',
      vendor: 'Techsource Ltd.',
      items: 5,
      billingDate: '03/11/2025',
      poNumber: 'PO 2025-0089',
      attachment: 'invoice_162k.pdf',
      auditTrail: [
        { id: 'b2', actor: 'System', action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 11, 2025 09:01:00 AM' },
        { id: 'b1', actor: 'System', action: 'Human-review triggered',                timestamp: 'March 11, 2025 09:00:00 AM' },
      ],
    },
  },
  {
    id: 'rev-007',
    status: 'Pending',
    reason: 'Over 250k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 10, 2025 05:45:00 PM',
    sentToReview: '4 days ago',
    workflowId: 'wf-2',
    workflowName: 'Workflow 2',
    environment: 'live',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 312000,
      description: 'Critical infrastructure purchase needs executive approval',
      vendor: 'InfraCore Systems',
      items: 8,
      billingDate: '03/10/2025',
      poNumber: 'PO 2025-0003',
      attachment: 'invoice_312k.pdf',
      auditTrail: [
        { id: 'g2', actor: 'System', action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 10, 2025 17:46:00 PM' },
        { id: 'g1', actor: 'System', action: 'Human-review triggered',                timestamp: 'March 10, 2025 17:45:40 PM' },
      ],
    },
  },
  {
    id: 'rev-008',
    status: 'Pending',
    reason: 'Over 150k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 13, 2025 10:00:00 AM',
    sentToReview: 'Today',
    workflowId: 'wf-2',
    workflowName: 'Workflow 2',
    environment: 'test',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 178000,
      description: 'Multi-vendor consolidation invoice',
      vendor: 'SupplyChain Partners',
      items: 15,
      billingDate: '03/13/2025',
      poNumber: 'PO 2025-0097',
      attachment: 'invoice_178k.pdf',
      auditTrail: [
        { id: 'h2', actor: 'System', action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 13, 2025 10:01:00 AM' },
        { id: 'h1', actor: 'System', action: 'Human-review triggered',                timestamp: 'March 13, 2025 10:00:00 AM' },
      ],
    },
  },

  // ── Escalated to Tal (R2) — Ofer sees read-only in All ────────────────────
  {
    id: 'rev-011',
    status: 'Pending',
    reason: 'Over 250k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 09, 2025 07:00:00 AM',
    sentToReview: '5 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'test',
    assignedTo: REVIEWER_2,
    invoice: {
      price: 265000,
      description: 'Large invoice pending executive approval',
      vendor: 'DemoVendor Inc.',
      items: 9,
      billingDate: '03/09/2025',
      poNumber: 'PO 2025-TEST-003',
      attachment: 'invoice_265k.pdf',
      auditTrail: [
        { id: 'k3', actor: 'System',           action: 'Notification sent to Tal Solomon',   timestamp: 'March 11, 2025 08:05:00 AM' },
        { id: 'k2', actor: 'Ofer Ben Shushan', action: 'escalated to Tal Solomon',           timestamp: 'March 11, 2025 08:00:00 AM' },
        { id: 'k1', actor: 'System',           action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 09, 2025 07:01:00 AM' },
        { id: 'k0', actor: 'System',           action: 'Human-review triggered',             timestamp: 'March 09, 2025 07:00:00 AM' },
      ],
    },
  },

  // ── Resolved ──────────────────────────────────────────────────────────────
  {
    id: 'rev-003',
    status: 'Declined',
    reason: 'Over 50k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 05, 2025 08:10:00 AM',
    sentToReview: '9 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'live',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 58000,
      description: 'Invoice requires manual verification',
      vendor: 'BuildCo Inc.',
      items: 2,
      billingDate: '03/05/2025',
      poNumber: 'PO 2025-0044',
      attachment: 'invoice_58k.pdf',
      auditTrail: [
        { id: 'c2', actor: 'Ofer Ben Shushan', action: 'Declined',                           timestamp: 'March 06, 2025 09:00:00 AM' },
        { id: 'c1', actor: 'System',           action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 05, 2025 08:11:00 AM' },
        { id: 'c0', actor: 'System',           action: 'Human-review triggered',             timestamp: 'March 05, 2025 08:10:00 AM' },
      ],
    },
  },
  {
    id: 'rev-004',
    status: 'Approved',
    reason: 'AI couldn\'t handle file',
    type: 'Wait for approval',
    triggerTime: 'March 04, 2025 12:10:00 PM',
    sentToReview: '10 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'live',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 23400,
      description: 'File format unsupported by AI parser',
      vendor: 'LogiParts',
      items: 7,
      billingDate: '03/04/2025',
      poNumber: 'PO 2025-0031',
      attachment: 'invoice_scan.tiff',
      auditTrail: [
        { id: 'd2', actor: 'Ofer Ben Shushan', action: 'Approved',                           timestamp: 'March 04, 2025 14:30:00 PM' },
        { id: 'd1', actor: 'System',           action: 'Notification sent to Ofer Ben Shushan', timestamp: 'March 04, 2025 12:11:00 PM' },
        { id: 'd0', actor: 'System',           action: 'Human-review triggered',             timestamp: 'March 04, 2025 12:10:00 PM' },
      ],
    },
  },
  {
    id: 'rev-005',
    status: 'Approved',
    reason: 'Over 50k invoices review',
    type: 'Wait for approval',
    triggerTime: 'March 01, 2025 04:00:00 PM',
    sentToReview: '13 days ago',
    workflowId: 'wf-2',
    workflowName: 'Workflow 2',
    environment: 'live',
    assignedTo: REVIEWER_2,
    invoice: {
      price: 91500,
      description: 'Invoice over $50K needs manager approval',
      vendor: 'Apex Supply Co.',
      items: 4,
      billingDate: '03/01/2025',
      poNumber: 'PO 2025-0112',
      attachment: 'invoice_91k.pdf',
      auditTrail: [
        { id: 'e3', actor: 'Tal Solomon',      action: 'Approved',                           timestamp: 'March 03, 2025 16:45:00 PM' },
        { id: 'e2', actor: 'System',           action: 'Notification sent to Tal Solomon',   timestamp: 'March 02, 2025 09:01:00 AM' },
        { id: 'e1', actor: 'Ofer Ben Shushan', action: 'escalated to Tal Solomon',           timestamp: 'March 02, 2025 09:00:00 AM' },
        { id: 'e0', actor: 'System',           action: 'Human-review triggered',             timestamp: 'March 01, 2025 16:00:00 PM' },
      ],
    },
  },
  {
    id: 'rev-006',
    status: 'Declined',
    reason: 'Over 250k invoices review',
    type: 'Wait for approval',
    triggerTime: 'February 28, 2025 02:25:00 PM',
    sentToReview: '14 days ago',
    workflowId: 'wf-2',
    workflowName: 'Workflow 2',
    environment: 'live',
    assignedTo: REVIEWER_2,
    invoice: {
      price: 287000,
      description: 'Large purchase order requires board approval',
      vendor: 'Global Hardware Ltd.',
      items: 12,
      billingDate: '02/28/2025',
      poNumber: 'PO 2025-0008',
      attachment: 'invoice_287k.pdf',
      auditTrail: [
        { id: 'f3', actor: 'Tal Solomon',      action: 'Declined',                           timestamp: 'March 01, 2025 11:00:00 AM' },
        { id: 'f2', actor: 'System',           action: 'Notification sent to Tal Solomon',   timestamp: 'March 01, 2025 08:01:00 AM' },
        { id: 'f1', actor: 'Ofer Ben Shushan', action: 'escalated to Tal Solomon',           timestamp: 'March 01, 2025 08:00:00 AM' },
        { id: 'f0', actor: 'System',           action: 'Human-review triggered',             timestamp: 'February 28, 2025 14:25:00 PM' },
      ],
    },
  },
  {
    id: 'rev-009',
    status: 'Timed out',
    reason: 'Over 50k invoices review',
    type: 'Wait for approval',
    triggerTime: 'February 25, 2025 09:15:00 AM',
    sentToReview: '17 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'test',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 63000,
      description: 'Test invoice — awaiting approval timed out',
      vendor: 'TestVendor Co.',
      items: 3,
      billingDate: '02/25/2025',
      poNumber: 'PO 2025-TEST-001',
      attachment: 'invoice_test_63k.pdf',
      auditTrail: [
        { id: 'i2', actor: 'System', action: 'Review timed out — no response received',    timestamp: 'February 28, 2025 09:15:00 AM' },
        { id: 'i1', actor: 'System', action: 'Notification sent to Ofer Ben Shushan',      timestamp: 'February 25, 2025 09:16:00 AM' },
        { id: 'i0', actor: 'System', action: 'Human-review triggered',                     timestamp: 'February 25, 2025 09:15:00 AM' },
      ],
    },
  },
  {
    id: 'rev-010',
    status: 'Handoff',
    reason: 'AI couldn\'t handle file',
    type: 'Handoff to human',
    triggerTime: 'February 22, 2025 03:22:00 PM',
    sentToReview: '20 days ago',
    workflowId: 'wf-1',
    workflowName: 'Workflow 1',
    environment: 'test',
    assignedTo: REVIEWER_1,
    invoice: {
      price: 14500,
      description: 'Test — AI parsing failed on scanned document',
      vendor: 'MockSupply Ltd.',
      items: 2,
      billingDate: '02/22/2025',
      poNumber: 'PO 2025-TEST-002',
      attachment: 'invoice_scan_test.tiff',
      auditTrail: [
        { id: 'j1', actor: 'System', action: 'Handed off to human reviewer',               timestamp: 'February 22, 2025 15:22:00 PM' },
        { id: 'j0', actor: 'System', action: 'Human-review triggered',                     timestamp: 'February 22, 2025 15:20:00 PM' },
      ],
    },
  },
];

export const dataSources = [
  { name: 'Treasury',   color: '#6366f1' },
  { name: 'FP&A',       color: '#22c55e' },
  { name: 'Bookkeeping',color: '#f59e0b' },
  { name: 'Risk/Fraud', color: '#ef4444' },
  { name: 'Audit',      color: '#8b5cf6' },
];
