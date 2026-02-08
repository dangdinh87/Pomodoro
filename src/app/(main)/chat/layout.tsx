import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Coach • Improcode',
  description: 'Chat with Improcode AI Coach for productivity tips, motivation, and support.',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
