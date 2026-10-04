import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nProvider, type Lang } from '@/contexts/i18n-context';
import FeedbackPanel from './feedback-panel';

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, hasSession: false, isLoading: false, signOut: vi.fn() }),
}));

function renderPanel(lang: Lang = 'en') {
  return render(
    <I18nProvider initialLang={lang}>
      <FeedbackPanel />
    </I18nProvider>,
  );
}

const THANKS: Record<Lang, string> = { en: 'Thank you!', vi: 'Cảm ơn bạn!', ja: 'ありがとうございます！' };

afterEach(() => vi.unstubAllGlobals());

describe('FeedbackPanel', () => {
  it('shows no Tomo celebration until the feedback is sent', () => {
    const { container } = renderPanel();
    expect(container.querySelector('[data-face="party"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send feedback' })).toBeInTheDocument();
  });

  it('flags an empty message and does not send', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add a short message.');
    expect(screen.getByLabelText('Your message')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['en', 'vi', 'ja'] as Lang[])('thanks the sender with a partying Tomo after a successful send (%s)', async (lang) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, headers: new Headers() }));
    const { container } = renderPanel(lang);
    const textarea = container.querySelector('#feedback-message') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Please add a dark timer sound.' } });
    fireEvent.submit(textarea.closest('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(THANKS[lang]));
    expect(container.querySelector('[data-face="party"]')).not.toBeNull();
  });

  it('keeps the form and shows the error when sending fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, headers: new Headers() }));
    const { container } = renderPanel();
    const textarea = container.querySelector('#feedback-message') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Something broke' } });
    fireEvent.submit(textarea.closest('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByText(/Could not send your feedback/)).toBeInTheDocument());
    expect(container.querySelector('[data-face="party"]')).toBeNull();
  });

  it('lets the sender rate with stars and clear the rating by pressing the same star again', () => {
    renderPanel();
    const fourStars = screen.getByRole('button', { name: '4 out of 5' });
    fireEvent.click(fourStars);
    expect(fourStars).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '5 out of 5' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(fourStars);
    expect(fourStars).toHaveAttribute('aria-pressed', 'false');
  });
});
