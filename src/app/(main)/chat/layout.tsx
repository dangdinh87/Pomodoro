import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Coach • Study Bro App',
  description: 'Chat with Study Bro App AI Coach for productivity tips, motivation, and support.',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
