import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Look lives in globals.css (.field): outline, hard shadow, accent shadow on focus, danger tone on aria-invalid.
// `pointer-coarse:text-base`: iOS Safari zooms the page when a field under 16px gets focus. The base-layer rule in
// globals.css cannot win against a text-size utility, so the primitive carries the 16px on touch screens itself.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "field flex h-[42px] px-3.5 text-[0.9375rem] pointer-coarse:text-base file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-ink",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
