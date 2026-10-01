import 'server-only';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Local only: the harness and dev sign-in read the code from the server log.
    if (process.env.VERCEL) throw new Error('RESEND_API_KEY is not configured');
    console.info(`[auth] sign-in code for ${email}: ${otp}`);
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'Study Bro <no-reply@pomodoro-focus.site>',
      to: email,
      subject: `${otp} là mã đăng nhập Study Bro`,
      text: [
        `Mã đăng nhập Study Bro của bạn: ${otp}`,
        'Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.',
        '',
        `Your Study Bro sign-in code: ${otp}`,
        'It expires in 10 minutes. If you did not request it, ignore this email.',
      ].join('\n'),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}`);
  }
}
