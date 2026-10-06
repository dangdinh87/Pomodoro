"use client";
import { motion, useReducedMotion } from "motion/react";
import { Tomo } from "@/components/brand/tomo";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { tomo: 44, titleClass: "text-sm font-bold", subtitleClass: "text-xs", maxWidth: "max-w-48" },
  md: { tomo: 64, titleClass: "text-base font-bold", subtitleClass: "text-sm", maxWidth: "max-w-56" },
  lg: { tomo: 88, titleClass: "text-lg font-extrabold", subtitleClass: "text-base", maxWidth: "max-w-64" },
};

/** Loading state: Tomo hops on the spot (static under reduced motion). */
export default function Loader({
  title = "Preparing your focus workspace...",
  subtitle = "Setting up your Pomodoro timer for maximum productivity",
  size = "md",
  className,
  ...props
}: LoaderProps) {
  const config = SIZE_CONFIG[size];
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-5 p-8", className)}
      {...props}
    >
      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Tomo face="focus" size={config.tomo} />
      </motion.div>
      <div className={cn("space-y-1 text-center", config.maxWidth)}>
        <h1 className={cn("font-heading text-ink", config.titleClass)}>{title}</h1>
        {subtitle && <p className={cn("text-ink-muted", config.subtitleClass)}>{subtitle}</p>}
      </div>
    </div>
  );
}
