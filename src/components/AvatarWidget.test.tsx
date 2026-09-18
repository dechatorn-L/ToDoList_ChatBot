import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarWidget } from './AvatarWidget';

describe('AvatarWidget', () => {
  it('renders correct tooltip and elements for idle_sleep', () => {
    render(<AvatarWidget mood="idle_sleep" />);
    expect(screen.getByText('Zzz... Resting')).toBeDefined();
    expect(screen.getByText('Zzz')).toBeDefined();
  });

  it('renders celebrating mood with sparkle indicator', () => {
    render(<AvatarWidget mood="celebrating" />);
    expect(screen.getByText('Awesome job! 🎉')).toBeDefined();
    expect(screen.getByText('✨')).toBeDefined();
  });

  it('triggers onWakeUp and onClick when avatar button clicked', () => {
    const handleWakeUp = vi.fn();
    const handleClick = vi.fn();
    render(<AvatarWidget mood="neutral" onWakeUp={handleWakeUp} onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /ai mascot companion/i });
    fireEvent.click(button);

    expect(handleWakeUp).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
