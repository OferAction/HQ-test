import { render, screen, act, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewRequest } from '@/types';

// Static fixture — defined inline so vi.mock hoisting can reference it
const MOCK_INVOICE = {
  price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp',
  items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001',
  attachment: 'invoice.pdf',
  auditTrail: [
    { id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025 12:00 PM' },
  ],
};

const MOCK_REVIEWS: ReviewRequest[] = [
  { id: 'r-1', status: 'Pending',  reason: 'Invoice A', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: MOCK_INVOICE },
  { id: 'r-2', status: 'Pending',  reason: 'Invoice B', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: MOCK_INVOICE },
  { id: 'r-3', status: 'Pending',  reason: 'Invoice C', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: MOCK_INVOICE },
  { id: 'r-4', status: 'Approved', reason: 'Invoice D', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: MOCK_INVOICE },
  { id: 'r-5', status: 'Declined', reason: 'Invoice E', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: MOCK_INVOICE },
];

vi.mock('@/data/mockData', () => ({
  reviewRequests: [
    { id: 'r-1', status: 'Pending',  reason: 'Invoice A', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: { price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp', items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001', attachment: 'invoice.pdf', auditTrail: [{ id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025' }] } },
    { id: 'r-2', status: 'Pending',  reason: 'Invoice B', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: { price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp', items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001', attachment: 'invoice.pdf', auditTrail: [{ id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025' }] } },
    { id: 'r-3', status: 'Pending',  reason: 'Invoice C', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: { price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp', items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001', attachment: 'invoice.pdf', auditTrail: [{ id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025' }] } },
    { id: 'r-4', status: 'Approved', reason: 'Invoice D', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: { price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp', items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001', attachment: 'invoice.pdf', auditTrail: [{ id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025' }] } },
    { id: 'r-5', status: 'Declined', reason: 'Invoice E', type: 'Wait for approval', triggerTime: 'March 12, 2025', sentToReview: '2d ago', workflowId: 'wf-1', workflowName: 'Workflow 1', environment: 'live', invoice: { price: 52000, description: 'Software licenses Q1', vendor: 'Acme Corp', items: 3, billingDate: '03/12/2025', poNumber: 'PO 2025-0001', attachment: 'invoice.pdf', auditTrail: [{ id: 'a1', actor: 'System', action: 'Human-review triggered', timestamp: 'March 12, 2025' }] } },
  ],
}));

import ReviewsPage from '@/app/reviews/page';

// Find the KPI card container (rounded-xl) containing the label
function kpiCard(label: string) {
  return screen.getByText(label).closest('[class*="rounded-xl"]')!;
}

describe('ReviewsPage — KPI cards', () => {
  it('shows correct awaiting count (3 Pending)', () => {
    render(<ReviewsPage />);
    expect(within(kpiCard('Awaiting decision')).getByText('3')).toBeInTheDocument();
  });

  it('shows correct reviewed count (2 non-Pending)', () => {
    render(<ReviewsPage />);
    expect(within(kpiCard('Reviewed')).getByText('2')).toBeInTheDocument();
  });

  it('shows correct approval rate (1/2 = 50%)', () => {
    render(<ReviewsPage />);
    expect(within(kpiCard('Approval rate')).getByText('50%')).toBeInTheDocument();
  });
});

// Invoice A is selected by default — panel already shows it. Just click Approve directly.
describe('ReviewsPage — approve flow', () => {
  it('shows toast after approving', async () => {
    render(<ReviewsPage />);
    await userEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(screen.getByText('Item has been approved')).toBeInTheDocument();
  });

  it('undo removes the toast', async () => {
    render(<ReviewsPage />);
    await userEvent.click(screen.getByRole('button', { name: /approve/i }));
    await userEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(screen.queryByText('Item has been approved')).not.toBeInTheDocument();
  });

  it('toast disappears after 10 seconds', async () => {
    vi.useFakeTimers();
    render(<ReviewsPage />);
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /approve/i }));
    });
    expect(screen.getByText('Item has been approved')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(10100); });
    expect(screen.queryByText('Item has been approved')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('ReviewsPage — decline flow', () => {
  it('shows toast after declining', async () => {
    render(<ReviewsPage />);
    await userEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.getByText('Item has been declined')).toBeInTheDocument();
  });
});

describe('ReviewsPage — escalate flow', () => {
  it('shows toast after escalating', async () => {
    render(<ReviewsPage />);
    await userEvent.click(screen.getByRole('button', { name: /escalate/i }));
    expect(screen.getByText('Item has been escalated')).toBeInTheDocument();
  });
});

describe('ReviewsPage — keyboard navigation', () => {
  it('selects the next row on ArrowDown', () => {
    render(<ReviewsPage />);
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(screen.getByRole('heading', { name: 'Invoice B' })).toBeInTheDocument();
  });

  it('stays on first row when pressing ArrowUp at the top', () => {
    render(<ReviewsPage />);
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(screen.getByRole('heading', { name: 'Invoice A' })).toBeInTheDocument();
  });
});
