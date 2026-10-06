"use client"

import { createContext, useContext } from "react"

/**
 * Id of the visible label of the field a control sits in (a SettingsRow, for now). A control that has no name of
 * its own (SelectTrigger: its text is the current value, "Tiếng Việt", not what it is for) points
 * `aria-labelledby` at it, so a screen reader says "Language" and not only the value.
 */
export const FieldLabelContext = createContext<string | undefined>(undefined)

export function useFieldLabelId(): string | undefined {
  return useContext(FieldLabelContext)
}
