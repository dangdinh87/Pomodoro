import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { authClient } from '@/lib/auth-client';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { LoginForm } from './login-form';

vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null, isAuthenticated: false }) }));
vi.mock('@/lib/auth-client', () => ({
  authClient: { emailOtp: { sendVerificationOtp: vi.fn() }, signIn: { emailOtp: vi.fn(), social: vi.fn() } },
}));

const send = vi.mocked(authClient.emailOtp.sendVerificationOtp);

function renderForm(lang: Lang = 'en', address = 'me@example.com') {
  render(
    <I18nProvider initialLang={lang}>
      <LoginForm googleEnabled={false} onSignedIn={vi.fn()} />
    </I18nProvider>,
  );
  const field = screen.getByRole('textbox'); // the label is in the page language
  fireEvent.change(field, { target: { value: address } });
  fireEvent.submit(field.closest('form')!);
}

beforeEach(() => send.mockReset());

describe('LoginForm: requesting a code', () => {
  it('moves to the code step on success', async () => {
    send.mockResolvedValue({ data: { success: true }, error: null } as never);
    renderForm();
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument());
    expect(send).toHaveBeenCalledWith({ email: 'me@example.com', type: 'sign-in' });
  });

  it('says so when too many codes were requested from this network (HTTP 429), and stays on the email step', async () => {
    send.mockResolvedValue({ data: null, error: { status: 429, message: 'x' } } as never);
    renderForm();
    expect(await screen.findByRole('alert')).toHaveTextContent(/requested a lot of codes/i);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('says it is this address that got too many codes (the cause may be somebody else), and stays on the email step', async () => {
    send.mockResolvedValue({ data: null, error: { status: 429, code: 'OTP_EMAIL_RATE_LIMITED', message: 'x' } } as never);
    renderForm();
    expect(await screen.findByRole('alert')).toHaveTextContent(/sent to this email address/i);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('speaks Vietnamese and Japanese about the address limit too', async () => {
    send.mockResolvedValue({ data: null, error: { status: 429, code: 'OTP_EMAIL_RATE_LIMITED', message: 'x' } } as never);
    renderForm('vi');
    expect(await screen.findByRole('alert')).toHaveTextContent('Địa chỉ email này đã nhận quá nhiều mã');
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

  describe('an address that is not an email', () => {
    it.each(['abc@x', 'abc', 'a b@c.d', '@x.com'])('"%s" is refused on the spot, without asking the server', async (address) => {
      renderForm('en', address);
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/doesn't look right/i);
      expect(alert).not.toHaveTextContent(/try again in a minute/i);
      expect(send).not.toHaveBeenCalled();
      const field = screen.getByLabelText(/email/i);
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAttribute('aria-describedby', alert.id);
      expect(field).toHaveFocus();
    });

    it('also maps the server answer (400 INVALID_EMAIL) to that message, not to "try again in a minute"', async () => {
      send.mockResolvedValue({ data: null, error: { status: 400, code: 'INVALID_EMAIL', message: 'Invalid email' } } as never);
      renderForm('en', 'me@example.com');
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/doesn't look right/i);
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('clears the mark as soon as the address is edited', async () => {
      renderForm('en', 'abc@x');
      await screen.findByRole('alert');
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'abc@x.com' } });
      expect(screen.getByLabelText(/email/i)).not.toHaveAttribute('aria-invalid');
    });

    it.each([
      ['vi', 'Địa chỉ email chưa hợp lệ'],
      ['ja', 'メールアドレスの形式が正しくありません'],
    ] as const)('says it in %s', async (lang, text) => {
      renderForm(lang, 'abc@x');
      expect(await screen.findByRole('alert')).toHaveTextContent(text);
    });
  });

  describe('focus after an error', () => {
    it('returns to the email field when sending fails (a disabled field drops focus to the dialog frame)', async () => {
      send.mockResolvedValue({ data: null, error: { status: 500, message: 'x' } } as never);
      renderForm();
      await screen.findByRole('alert');
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
    });

    it('returns to the code field when the code is wrong', async () => {
      send.mockResolvedValue({ data: { success: true }, error: null } as never);
      vi.mocked(authClient.signIn.emailOtp).mockResolvedValue({ data: null, error: { status: 400, message: 'x' } } as never);
      renderForm();
      const code = await screen.findByLabelText(/code/i);
      fireEvent.change(code, { target: { value: '123456' } });
      fireEvent.submit(code.closest('form')!);
      await screen.findByRole('alert');
      await waitFor(() => expect(screen.getByLabelText(/code/i)).toHaveFocus());
    });
  });
});
