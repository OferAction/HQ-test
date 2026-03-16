import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HumanReviewTable from '@/components/HumanReviewTable';
import { buildReview, resetId } from './__fixtures__/reviewFixtures';
import { ReviewRequest } from '@/types';

beforeEach(() => resetId());

const onSelect = vi.fn();

function renderTable(reviews: ReviewRequest[], selectedId: string | null = null) {
  return render(
    <HumanReviewTable reviews={reviews} selectedId={selectedId} onSelect={onSelect} />
  );
}

describe('HumanReviewTable', () => {
  describe('empty state', () => {
    it('shows empty message when no reviews match filters', async () => {
      const reviews = [buildReview({ status: 'Approved' })];
      renderTable(reviews);
      // Open status filter — the dropdown option label is "Approved" (inside a button)
      const statusBtn = screen.getByRole('button', { name: /any status/i });
      await userEvent.click(statusBtn);
      // Click the option button whose label is exactly "Approved"
      const approvedOption = screen.getAllByRole('button').find(
        (b) => b.textContent?.trim() === 'Approved'
      );
      await userEvent.click(approvedOption!);
      expect(screen.getByText(/no requests match/i)).toBeInTheDocument();
    });
  });

  describe('grouping', () => {
    it('renders a group header for each workflow+environment combination', () => {
      const reviews = [
        buildReview({ workflowId: 'wf-1', workflowName: 'Workflow A', environment: 'live' }),
        buildReview({ workflowId: 'wf-1', workflowName: 'Workflow A', environment: 'test' }),
        buildReview({ workflowId: 'wf-2', workflowName: 'Workflow B', environment: 'live' }),
      ];
      renderTable(reviews);
      expect(screen.getAllByText('Workflow A')).toHaveLength(2);
      expect(screen.getByText('Workflow B')).toBeInTheDocument();
    });

    it('groups two reviews with the same workflowId+environment under one header', () => {
      const reviews = [
        buildReview({ workflowId: 'wf-1', workflowName: 'Workflow A', environment: 'live' }),
        buildReview({ workflowId: 'wf-1', workflowName: 'Workflow A', environment: 'live' }),
      ];
      renderTable(reviews);
      // Only one group header with name "Workflow A"
      expect(screen.getAllByText('Workflow A')).toHaveLength(1);
    });

    it('shows the item count badge in the group header', () => {
      const reviews = [
        buildReview({ workflowId: 'wf-1', workflowName: 'Alpha', environment: 'live', status: 'Approved' }),
        buildReview({ workflowId: 'wf-1', workflowName: 'Alpha', environment: 'live', status: 'Approved' }),
        buildReview({ workflowId: 'wf-1', workflowName: 'Alpha', environment: 'live', status: 'Approved' }),
      ];
      renderTable(reviews);
      // 0 pending so no amber badge; the group count badge shows 3
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('pending badge', () => {
    it('shows the pending count when there are pending reviews', () => {
      const reviews = [
        buildReview({ status: 'Pending' }),
        buildReview({ status: 'Pending' }),
        buildReview({ status: 'Approved' }),
      ];
      renderTable(reviews);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show the pending badge when there are no pending reviews', () => {
      const reviews = [buildReview({ status: 'Approved' })];
      renderTable(reviews);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('hides test-environment rows when test filter is deselected', async () => {
      const reviews = [
        buildReview({ environment: 'live',  workflowName: 'Live Workflow',  reason: 'Live reason' }),
        buildReview({ environment: 'test',  workflowName: 'Test Workflow',  reason: 'Test reason' }),
      ];
      renderTable(reviews);
      const envBtn = screen.getByRole('button', { name: /live and tests/i });
      await userEvent.click(envBtn);
      await userEvent.click(screen.getByText('Show tests'));
      expect(screen.queryByText('Test Workflow')).not.toBeInTheDocument();
      expect(screen.getByText('Live Workflow')).toBeInTheDocument();
    });

    it('hides approved rows when Approved status is deselected', async () => {
      const reviews = [
        buildReview({ status: 'Pending',  reason: 'Pending reason' }),
        buildReview({ status: 'Approved', reason: 'Approved reason' }),
      ];
      renderTable(reviews);
      const statusBtn = screen.getByRole('button', { name: /any status/i });
      await userEvent.click(statusBtn);
      const approvedOption = screen.getAllByRole('button').find(
        (b) => b.textContent?.trim() === 'Approved'
      );
      await userEvent.click(approvedOption!);
      expect(screen.queryByText('Approved reason')).not.toBeInTheDocument();
      expect(screen.getByText('Pending reason')).toBeInTheDocument();
    });
  });

  describe('row selection', () => {
    it('calls onSelect with the review when a row is clicked', async () => {
      const review = buildReview({ reason: 'Click me' });
      renderTable([review]);
      await userEvent.click(screen.getByText('Click me'));
      expect(onSelect).toHaveBeenCalledWith(review);
    });

    it('marks the selected row with the correct data-row-id', () => {
      const reviews = [
        buildReview({ id: 'r-1', reason: 'First' }),
        buildReview({ id: 'r-2', reason: 'Second' }),
      ];
      renderTable(reviews, 'r-2');
      expect(document.querySelector('[data-row-id="r-2"]')).toBeInTheDocument();
    });
  });

  describe('sorting — three-click cycle', () => {
    it('sorts by reason ascending on first click', async () => {
      const reviews = [
        buildReview({ reason: 'Zebra invoice' }),
        buildReview({ reason: 'Apple invoice' }),
      ];
      renderTable(reviews);
      await userEvent.click(screen.getByText('Reason'));
      const reasons = screen.getAllByText(/invoice/);
      expect(reasons[0]).toHaveTextContent('Apple invoice');
      expect(reasons[1]).toHaveTextContent('Zebra invoice');
    });

    it('sorts by reason descending on second click', async () => {
      const reviews = [
        buildReview({ reason: 'Zebra invoice' }),
        buildReview({ reason: 'Apple invoice' }),
      ];
      renderTable(reviews);
      await userEvent.click(screen.getByText('Reason'));
      await userEvent.click(screen.getByText('Reason'));
      const reasons = screen.getAllByText(/invoice/);
      expect(reasons[0]).toHaveTextContent('Zebra invoice');
      expect(reasons[1]).toHaveTextContent('Apple invoice');
    });

    it('clears sort on third click (returns to original order)', async () => {
      const reviews = [
        buildReview({ reason: 'Zebra invoice' }),
        buildReview({ reason: 'Apple invoice' }),
      ];
      renderTable(reviews);
      await userEvent.click(screen.getByText('Reason')); // asc
      await userEvent.click(screen.getByText('Reason')); // desc
      await userEvent.click(screen.getByText('Reason')); // clear
      const reasons = screen.getAllByText(/invoice/);
      expect(reasons[0]).toHaveTextContent('Zebra invoice'); // original order restored
    });
  });
});
