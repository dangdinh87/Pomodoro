/**
 * Auth Layout Client Component
 * Centers the form card on the page surface
 */
export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-surface-page">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}
