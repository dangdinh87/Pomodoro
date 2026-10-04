import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { authClient } from '@/lib/auth-client';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { LoginForm } from './login-form';

vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null, isAuthenticated: false }) }));
vi.mock('@/lib/auth-client', () => ({
  authClient: { emailOtp: { sendVerificationOtp: vi.fn() }, signIn: { emailOtp: vi.fn(), social: vi.fn() } },
}));

const send = vi.mocked(authClient.emailOtp.sendVerificationOtp);

function renderForm(lang: Lang = 'en') {
  render(
    <I18nProvider initialLang={lang}>
      <LoginForm googleEnabled={false} onSignedIn={vi.fn()} />
    </I18nProvider>,
  );
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'me@example.com' } });
  fireEvent.submit(screen.getByLabelText(/email/i).closest('form')!);
}

beforeEach(() => send.mockReset());

describe('LoginForm: requesting a code', () => {
  it('moves to the code step on success', async () => {
    send.mockResolvedValue({ data: { success: true }, error: null } as never);
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument());
    expect(send).toHaveBeenCalledWith({ email: 'me@example.com', type: 'sign-in' });
  });

  it('says so when too many codes were requested (HTTP 429), and stays on the email step', async () => {
    send.mockResolvedValue({ data: null, error: { status: 429, code: 'OTP_EMAIL_RATE_LIMITED', message: 'x' } } as never);
    renderForm();
    expect(await screen.findByRole('alert')).toHaveTextContent(/requested a lot of codes/i);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('speaks Vietnamese and Japanese too', async () => {
    send.mockResolvedValue({ data: null, error: { status: 429, message: 'x' } } as never);
    renderForm('vi');
    expect(await screen.findByRole('alert')).toHaveTextContent('xin mã quá nhiều lần');
  });

  it('keeps the generic message for other failures', async () => {
    send.mockResolvedValue({ data: null, error: { status: 500, message: 'x' } } as never);
    renderForm();
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't send the code/i);
  });
});
