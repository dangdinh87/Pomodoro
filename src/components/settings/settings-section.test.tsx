import { render, screen } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsRow } from './settings-section';

const languageSelect = (triggerProps: Record<string, string> = {}) => (
  <Select value="vi">
    <SelectTrigger {...triggerProps}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="vi">Tiếng Việt</SelectItem>
      <SelectItem value="en">English</SelectItem>
    </SelectContent>
  </Select>
);

describe('SettingsRow', () => {
  it('names the select beside it by the row label, not only by its current value', () => {
    render(
      <SettingsRow label="Ngôn ngữ" description="Ngôn ngữ của ứng dụng">
        {languageSelect()}
      </SettingsRow>,
    );
    const select = screen.getByRole('combobox', { name: 'Ngôn ngữ' });
    expect(select).toHaveTextContent('Tiếng Việt'); // the value is still what it shows
  });

  it('does not override a name the caller gave the select', () => {
    render(<SettingsRow label="Ngôn ngữ">{languageSelect({ 'aria-label': 'Chọn ngôn ngữ' })}</SettingsRow>);
    expect(screen.getByRole('combobox', { name: 'Chọn ngôn ngữ' })).toBeInTheDocument();
  });

  it('gives every row its own label id (two rows on one page)', () => {
    render(
      <>
        <SettingsRow label="Ngôn ngữ">{languageSelect()}</SettingsRow>
        <SettingsRow label="Phông chữ">{languageSelect()}</SettingsRow>
      </>,
    );
    expect(screen.getByRole('combobox', { name: 'Ngôn ngữ' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Phông chữ' })).toBeInTheDocument();
  });
});
