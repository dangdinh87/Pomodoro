import { cn } from "@/lib/utils"

// .skeleton (globals.css): raised surface with a soft light sweep, which stops under reduced motion.
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
