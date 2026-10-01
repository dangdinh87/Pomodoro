import { Check } from '@phosphor-icons/react/dist/ssr'
import { useI18n } from '@/contexts/i18n-context'

export function SavedIndicator({ show }: { show: boolean }) {
  const { t } = useI18n()
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1 text-xs font-medium text-success-ink transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {show && (
        <>
          <Check size={12} weight="bold" aria-hidden />
          {t('settings.saved')}
        </>
      )}
    </span>
  )
}
