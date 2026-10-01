import { useCallback, useEffect, useRef, useState } from 'react'

/** Briefly true after `flash()`; used for the inline "Saved" confirmation. */
export function useSavedFlash(ms = 1800) {
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const flash = useCallback(() => {
    setSaved(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setSaved(false), ms)
  }, [ms])
  return [saved, flash] as const
}
