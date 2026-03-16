import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastUndo from '@/components/ToastUndo';

describe('ToastUndo', () => {
  it('renders the message', () => {
    render(<ToastUndo message="Item has been approved" onUndo={vi.fn()} onExpire={vi.fn()} />);
    expect(screen.getByText('Item has been approved')).toBeInTheDocument();
  });

  it('renders the Undo button', () => {
    render(<ToastUndo message="Done" onUndo={vi.fn()} onExpire={vi.fn()} />);
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument();
  });

  it('calls onUndo when Undo is clicked', async () => {
    const onUndo = vi.fn();
    render(<ToastUndo message="Done" onUndo={onUndo} onExpire={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it('does not call onExpire immediately', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    render(<ToastUndo message="Done" onUndo={vi.fn()} onExpire={onExpire} />);
    expect(onExpire).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calls onExpire after duration elapses', async () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    render(<ToastUndo message="Done" duration={5000} onUndo={vi.fn()} onExpire={onExpire} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5100);
    });
    expect(onExpire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('does not call onExpire before duration elapses', async () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    render(<ToastUndo message="Done" duration={5000} onUndo={vi.fn()} onExpire={onExpire} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onExpire).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders the SVG countdown ring', () => {
    render(<ToastUndo message="Done" onUndo={vi.fn()} onExpire={vi.fn()} />);
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2); // track + progress
  });
});
