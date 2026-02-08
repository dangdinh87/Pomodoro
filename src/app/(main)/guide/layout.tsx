import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guide • Improcode',
  description: 'Learn how to use Improcode effectively with our comprehensive guide and tutorials.',
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
