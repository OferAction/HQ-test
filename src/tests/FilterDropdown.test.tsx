import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterDropdown from '@/components/FilterDropdown';

const OPTIONS = [
  { value: 'live', label: 'Show Live' },
  { value: 'test', label: 'Show tests' },
];

describe('FilterDropdown', () => {
  describe('button label', () => {
    it('shows allLabel when all options are selected', () => {
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['live', 'test']} onChange={() => {}} />
      );
      expect(screen.getByRole('button', { name: /live and tests/i })).toBeInTheDocument();
    });

    it('shows the option label when exactly one is selected', () => {
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['live']} onChange={() => {}} />
      );
      expect(screen.getByRole('button', { name: /show live/i })).toBeInTheDocument();
    });

    it('shows count label when multiple (but not all) are selected', () => {
      const threeOptions = [
        ...OPTIONS,
        { value: 'staging', label: 'Show staging' },
      ];
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={threeOptions} selected={['live', 'test']} onChange={() => {}} />
      );
      expect(screen.getByRole('button', { name: /2 environments/i })).toBeInTheDocument();
    });

    it('shows "No environments" when nothing is selected', () => {
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={[]} onChange={() => {}} />
      );
      expect(screen.getByRole('button', { name: /no environments/i })).toBeInTheDocument();
    });
  });

  describe('open / close', () => {
    it('opens the dropdown on click', async () => {
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['live', 'test']} onChange={() => {}} />
      );
      await userEvent.click(screen.getByRole('button', { name: /live and tests/i }));
      expect(screen.getByText('Show Live')).toBeVisible();
      expect(screen.getByText('Show tests')).toBeVisible();
    });

    it('closes when clicking outside', async () => {
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['live', 'test']} onChange={() => {}} />
      );
      await userEvent.click(screen.getByRole('button', { name: /live and tests/i }));
      await userEvent.click(document.body);
      expect(screen.queryByText('Show Live')).not.toBeInTheDocument();
    });
  });

  describe('selection changes', () => {
    it('calls onChange with value removed when unchecking a selected option', async () => {
      const onChange = vi.fn();
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['live', 'test']} onChange={onChange} />
      );
      await userEvent.click(screen.getByRole('button', { name: /live and tests/i }));
      await userEvent.click(screen.getByText('Show Live'));
      expect(onChange).toHaveBeenCalledWith(['test']);
    });

    it('calls onChange with value added when checking an unselected option', async () => {
      const onChange = vi.fn();
      render(
        <FilterDropdown label="environments" allLabel="Live and tests"
          options={OPTIONS} selected={['test']} onChange={onChange} />
      );
      await userEvent.click(screen.getByRole('button', { name: /show tests/i }));
      await userEvent.click(screen.getByText('Show Live'));
      expect(onChange).toHaveBeenCalledWith(['test', 'live']);
    });
  });
});
