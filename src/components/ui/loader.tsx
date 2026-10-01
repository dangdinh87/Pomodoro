"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CONFIG = {
  sm: { ring: "size-10 border-2", titleClass: "text-sm font-medium", subtitleClass: "text-xs", maxWidth: "max-w-48" },
  md: { ring: "size-14 border-[3px]", titleClass: "text-base font-medium", subtitleClass: "text-sm", maxWidth: "max-w-56" },
  lg: { ring: "size-16 border-4", titleClass: "text-lg font-semibold", subtitleClass: "text-base", maxWidth: "max-w-64" },
};

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
      className={cn("flex flex-col items-center justify-center gap-6 p-8", className)}
      {...props}
    >
      <motion.div
        aria-hidden
        className={cn("rounded-full border-border border-t-brand", config.ring)}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <div className={cn("space-y-1 text-center", config.maxWidth)}>
        <h1 className={cn("font-heading text-ink", config.titleClass)}>{title}</h1>
        {subtitle && <p className={cn("text-ink-muted", config.subtitleClass)}>{subtitle}</p>}
      </div>
    </div>
  );
}
