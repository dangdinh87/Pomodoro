import { fireEvent, render, screen } from '@testing-library/react';
import { allColorPresets } from '@/config/themes';
import { ColorPresetPicker } from './color-preset-picker';

function setup(value = 'default', onChange = vi.fn()) {
  const view = render(
    <ColorPresetPicker
      presets={allColorPresets}
      value={value}
      onChange={onChange}
      label="Color palette"
      nameOf={(p) => `Name ${p.key}`}
      descriptionOf={(p) => `About ${p.key}`}
    />,
  );
  return { ...view, onChange };
}

describe('ColorPresetPicker', () => {
  it('offers all six colour sets as one radio group', () => {
    setup();
    expect(screen.getByRole('radiogroup', { name: 'Color palette' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(6);
    expect(allColorPresets).toHaveLength(6);
  });

  it('marks only the active set, with a check inside its swatch', () => {
    const { container } = setup('mint');
    expect(screen.getByRole('radio', { name: 'Name mint' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Name default' })).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelector('[data-swatch="mint"] svg')).not.toBeNull();
  });

  it('paints each swatch with its preset colour', () => {
    const { container } = setup();
    for (const preset of allColorPresets) {
      expect((container.querySelector(`[data-swatch="${preset.key}"]`) as HTMLElement).style.backgroundColor).not.toBe('');
    }
  });

  it('reports the chosen key', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('radio', { name: 'Name sky' }));
    expect(onChange).toHaveBeenCalledWith('sky');
  });

  it('describes the active set under the swatches', () => {
    setup('peach');
    expect(screen.getByText('About peach')).toBeInTheDocument();
    expect(screen.queryByText('About mint')).not.toBeInTheDocument();
  });
});
