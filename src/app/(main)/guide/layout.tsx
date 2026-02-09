import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guide • Study Bro App',
  description: 'Learn how to use Study Bro App effectively with our comprehensive guide and tutorials.',
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
