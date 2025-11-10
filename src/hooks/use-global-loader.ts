import { useCallback } from 'react';
import { useSystemStore } from '@/stores/system-store';

export function useGlobalLoader() {
  const { setLoading } = useSystemStore();

  const showLoader = useCallback((message?: string, subtitle?: string) => {
    setLoading(true, message, subtitle);
  }, [setLoading]);

  const hideLoader = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return {
    showLoader,
    hideLoader,
  };
}