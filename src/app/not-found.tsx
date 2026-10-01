/**
 * Not Found Page - server-translated (locale from the app.lang cookie)
 */
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/server-translations';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center text-center space-y-8 px-4">
        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
          404
        </h1>

        {/* Message */}
        <div className="space-y-3 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('notFound.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('notFound.description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/">
            <Button className="gap-2 rounded-xl">
              <Home className="w-5 h-5" />
              {t('notFound.home')}
            </Button>
          </Link>
          <Link href="/timer">
            <Button variant="ghost" className="gap-2 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
              {t('notFound.backToTimer')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
