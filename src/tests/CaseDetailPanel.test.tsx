import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CaseDetailPanel from '@/components/CaseDetailPanel';
import { buildReview, buildInvoice, buildAuditEntry, resetId } from './__fixtures__/reviewFixtures';

beforeEach(() => resetId());

const noop = vi.fn();

describe('CaseDetailPanel', () => {
  describe('returns null when invoice is missing', () => {
    it('renders nothing without an invoice', () => {
      const { container } = render(
        <CaseDetailPanel
          review={buildReview({ invoice: undefined })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('header', () => {
    it('shows the review reason as the title', () => {
      render(
        <CaseDetailPanel
          review={buildReview({ reason: 'High-value invoice' })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText('High-value invoice')).toBeInTheDocument();
    });

    it('shows the workflow name', () => {
      render(
        <CaseDetailPanel
          review={buildReview({ workflowName: 'Finance Workflow' })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText('Finance Workflow')).toBeInTheDocument();
    });
  });

  describe('invoice fields', () => {
    it('formats the price with $ and toLocaleString', () => {
      render(
        <CaseDetailPanel
          review={buildReview({ invoice: buildInvoice({ price: 52000 }) })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText('$52,000')).toBeInTheDocument();
    });

    it('shows vendor, description, PO number', () => {
      render(
        <CaseDetailPanel
          review={buildReview({ invoice: buildInvoice({
            vendor: 'Acme Corp',
            description: 'Software licenses Q1',
            poNumber: 'PO 2025-0001',
          }) })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Software licenses Q1')).toBeInTheDocument();
      expect(screen.getByText('PO 2025-0001')).toBeInTheDocument();
    });
  });

  describe('action buttons — Pending state', () => {
    it('shows Approve, Decline, and Escalate buttons', () => {
      render(
        <CaseDetailPanel
          review={buildReview({ status: 'Pending' })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /escalate/i })).toBeInTheDocument();
    });

    it('calls onApprove with the review id', async () => {
      const onApprove = vi.fn();
      render(
        <CaseDetailPanel
          review={buildReview({ id: 'rev-42', status: 'Pending' })}
          onApprove={onApprove} onDecline={noop} onEscalate={noop} />
      );
      await userEvent.click(screen.getByRole('button', { name: /approve/i }));
      expect(onApprove).toHaveBeenCalledWith('rev-42');
    });

    it('calls onDecline with the review id', async () => {
      const onDecline = vi.fn();
      render(
        <CaseDetailPanel
          review={buildReview({ id: 'rev-42', status: 'Pending' })}
          onApprove={noop} onDecline={onDecline} onEscalate={noop} />
      );
      await userEvent.click(screen.getByRole('button', { name: /decline/i }));
      expect(onDecline).toHaveBeenCalledWith('rev-42');
    });

    it('calls onEscalate with the review id', async () => {
      const onEscalate = vi.fn();
      render(
        <CaseDetailPanel
          review={buildReview({ id: 'rev-42', status: 'Pending' })}
          onApprove={noop} onDecline={noop} onEscalate={onEscalate} />
      );
      await userEvent.click(screen.getByRole('button', { name: /escalate/i }));
      expect(onEscalate).toHaveBeenCalledWith('rev-42');
    });
  });

  describe('action buttons — non-Pending states', () => {
    it.each(['Approved', 'Declined', 'Handoff', 'Timed out'] as const)(
      'hides action buttons and shows settled state for status %s',
      (status) => {
        render(
          <CaseDetailPanel
            review={buildReview({ status })}
            onApprove={noop} onDecline={noop} onEscalate={noop} />
        );
        expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
        // The settled-state div has bg-elevated class
        const settled = document.querySelector('.bg-elevated');
        expect(settled).toBeInTheDocument();
        expect(settled).toHaveTextContent(status);
      }
    );
  });

  describe('audit trail', () => {
    it('renders all audit entries', () => {
      const invoice = buildInvoice({
        auditTrail: [
          buildAuditEntry({ id: 'a1', action: 'Human-review triggered', timestamp: 'March 12, 2025 12:00 PM' }),
          buildAuditEntry({ id: 'a2', actor: 'Tal Solomon', action: 'Approved', timestamp: 'March 20, 2025 12:00 PM' }),
        ],
      });
      render(
        <CaseDetailPanel
          review={buildReview({ invoice })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText('Human-review triggered')).toBeInTheDocument();
      expect(screen.getByText('Tal Solomon')).toBeInTheDocument();
    });

    it('bolds names matching "Firstname Lastname" pattern in action text', () => {
      const invoice = buildInvoice({
        auditTrail: [
          buildAuditEntry({ id: 'a1', actor: 'System', action: 'Notification sent to Ofer Ben Shushan' }),
        ],
      });
      render(
        <CaseDetailPanel
          review={buildReview({ invoice })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      // "Ofer Ben" would match the two-word regex — the name appears bolded
      const boldEl = screen.getByText('Ofer Ben');
      expect(boldEl.tagName).toBe('SPAN');
      expect(boldEl).toHaveClass('font-bold');
    });

    it('does not render a bold actor prefix for System entries', () => {
      const invoice = buildInvoice({
        auditTrail: [
          buildAuditEntry({ id: 'a1', actor: 'System', action: 'Human-review triggered' }),
        ],
      });
      render(
        <CaseDetailPanel
          review={buildReview({ invoice })}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      // "System" should not appear as a bold span
      const systemEls = screen.queryAllByText('System');
      systemEls.forEach((el) => {
        expect(el).not.toHaveClass('font-bold');
      });
    });

    it('shows the audit trail section heading', () => {
      render(
        <CaseDetailPanel
          review={buildReview()}
          onApprove={noop} onDecline={noop} onEscalate={noop} />
      );
      expect(screen.getByText(/audit trail/i)).toBeInTheDocument();
    });
  });
});
