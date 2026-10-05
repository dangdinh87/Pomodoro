import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Slider } from './slider';
import { Switch } from './switch';
import { Textarea } from './textarea';

describe('Input and Textarea', () => {
  it('use the shared .field look and take a label', async () => {
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
        <Textarea aria-label="Notes" />
      </>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toHaveClass('field', 'h-[42px]');
    expect(screen.getByLabelText('Notes')).toHaveClass('field');
    await userEvent.type(input, 'Tomo');
    expect(input).toHaveValue('Tomo');
  });

  it('are 16px on touch screens (iOS Safari zooms the page on focus of a smaller field)', () => {
    render(
      <>
        <Input aria-label="One line" />
        <Textarea aria-label="Many lines" />
      </>,
    );
    // jsdom has no media queries: the contract is the touch variant that overrides the 15px desktop size
    expect(screen.getByLabelText('One line')).toHaveClass('text-[0.9375rem]', 'pointer-coarse:text-base');
    expect(screen.getByLabelText('Many lines')).toHaveClass('text-[0.9375rem]', 'pointer-coarse:text-base');
  });

  it('exposes the invalid state to the .field danger styling', () => {
    render(<Input aria-label="Email" aria-invalid="true" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('can be disabled', () => {
    render(<Input aria-label="Locked" disabled />);
    expect(screen.getByLabelText('Locked')).toBeDisabled();
  });
});

describe('Checkbox', () => {
  it('toggles on click and on Space, and shows the tick only when checked', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Done" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Done' });
    expect(box).toHaveAttribute('data-state', 'unchecked');
    expect(box.querySelector('svg')).toBeNull();

    await userEvent.click(box);
    expect(box).toHaveAttribute('data-state', 'checked');
    expect(box.querySelector('svg')).not.toBeNull();

    box.focus();
    await userEvent.keyboard(' ');
    expect(box).toHaveAttribute('data-state', 'unchecked');
    expect(onCheckedChange).toHaveBeenNthCalledWith(1, true);
    expect(onCheckedChange).toHaveBeenNthCalledWith(2, false);
  });

  it('is a 22px outlined box with a visible focus ring and a motion-safe tick bounce', async () => {
    render(<Checkbox aria-label="Done" defaultChecked />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveClass('size-[22px]', 'border-control-edge', 'focus-ring', 'data-[state=checked]:bg-primary');
    expect(box.querySelector('[data-state="checked"]')).toHaveClass('motion-safe:animate-tick-pop');
  });
});

describe('RadioGroup', () => {
  it('selects with click and roves focus with arrow keys', async () => {
    function Demo() {
      const [value, setValue] = useState('a');
      return (
        <RadioGroup value={value} onValueChange={setValue} aria-label="Pick">
          <RadioGroupItem value="a" aria-label="A" />
          <RadioGroupItem value="b" aria-label="B" />
        </RadioGroup>
      );
    }
    render(<Demo />);
    const a = screen.getByRole('radio', { name: 'A' });
    const b = screen.getByRole('radio', { name: 'B' });
    expect(a).toHaveAttribute('aria-checked', 'true');
    expect(a).toHaveClass('size-[22px]', 'rounded-full', 'border-control-edge');

    await userEvent.click(b);
    expect(b).toHaveAttribute('aria-checked', 'true');

    b.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(a).toHaveFocus();
  });
});

describe('Switch', () => {
  it('toggles, turns candy mint when on, and works with the keyboard', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Sound" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole('switch', { name: 'Sound' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveClass('data-[state=checked]:bg-candy-mint', 'border-control-edge', 'focus-ring');

    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');

    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });
});

describe('Slider', () => {
  it('moves with the arrow keys and exposes its label and value', async () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={[40]} max={100} step={1} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(thumb).toHaveClass('focus-ring', 'border-outline');

    thumb.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '42');
    expect(onValueChange).toHaveBeenLastCalledWith([42]);
  });
});
