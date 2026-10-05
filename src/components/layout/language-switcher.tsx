'use client';

import { useI18n, LANGS, Lang } from '@/contexts/i18n-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from '@phosphor-icons/react/dist/ssr';

import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <Select value={lang} onValueChange={(value) => setLang(value as Lang)}>
      {/* min-w, not w: "Tiếng Việt" and "日本語" must never be cut to "Tiếng…" */}
      <SelectTrigger aria-label={t('common.language')} className={cn("w-auto min-w-44", className)}>
        <Globe size={16} className="mr-2 shrink-0" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
