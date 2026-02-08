import { render, screen, fireEvent } from '@testing-library/react';
import { FocusMode } from './focus-mode';
import '@testing-library/jest-dom';

// Mock the UI components to simplify testing
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, ...props }: any) => <input id={id} {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: (props: any) => <input type="checkbox" {...props} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <div>{children}</div>,
}));

describe('FocusMode Component', () => {
  it('renders the "Add blocked site" button with an aria-label', () => {
    render(<FocusMode />);
    const addButton = screen.getByLabelText('Add blocked site');
    expect(addButton).toBeInTheDocument();
  });

  it('associates the label with the input field', () => {
    render(<FocusMode />);
    const label = screen.getByText('Blocked Websites');
    const input = screen.getByLabelText('Blocked Websites');

    expect(label).toHaveAttribute('for', 'blocked-site-input');
    expect(input).toHaveAttribute('id', 'blocked-site-input');
  });

  it('renders remove buttons with dynamic aria-labels when sites are added', () => {
    render(<FocusMode />);

    // Simulate adding a site
    const input = screen.getByLabelText('Blocked Websites');
    const addButton = screen.getByLabelText('Add blocked site');

    fireEvent.change(input, { target: { value: 'example.com' } });
    fireEvent.click(addButton);

    // Check for remove button
    const removeButton = screen.getByLabelText('Remove example.com');
    expect(removeButton).toBeInTheDocument();
  });
});
