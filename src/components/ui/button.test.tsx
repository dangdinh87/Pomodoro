import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it.each([
    ['default', 'btn--primary'],
    ['secondary', 'btn--secondary'],
    ['outline', 'btn--secondary'],
    ['fun', 'btn--fun'],
    ['ghost', 'btn--ghost'],
    ['destructive', 'btn--danger'],
    ['link', 'btn--link'],
  ] as const)('maps the %s variant to .%s', (variant, cls) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('btn', cls);
  });

  it.each([
    ['sm', 'btn--sm'],
    ['default', 'btn--md'],
    ['lg', 'btn--lg'],
    ['icon', 'btn--icon'],
  ] as const)('maps the %s size to .%s', (size, cls) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
  });

  it('is the primary medium button by default', () => {
    expect(buttonVariants()).toBe('btn [&_svg]:size-4 btn--primary btn--md');
  });

  it('keeps asChild so links can look like buttons', () => {
    render(
      <Button asChild variant="fun">
        <a href="https://example.com/x">Link</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Link' })).toHaveClass('btn', 'btn--fun');
  });

  it('fires onClick and ignores clicks when disabled', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
