'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { COMMAND_ROW } from '@/components/ui/overlay-parts';

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn('flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface text-ink', className)}
    {...props}
  />
));
Command.displayName = 'Command';

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  // pr-14 keeps the field clear of the dialog's round close button when the palette sits in a dialog.
  <div className="p-3 pr-14">
    <div className="flex h-[42px] items-center gap-2 rounded-md border-[length:var(--outline-w)] border-outline bg-surface px-3 shadow-sticker-sm transition-shadow duration-100 focus-within:shadow-[2px_2px_0_var(--accent-solid)] focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ring">
      <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-ink-secondary" aria-hidden="true" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-full w-full bg-transparent text-sm font-semibold text-ink outline-hidden placeholder:font-medium placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  </div>
));
CommandInput.displayName = 'CommandInput';

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[min(60dvh,420px)] overflow-y-auto overflow-x-hidden border-t-2 border-border p-2', className)}
    {...props}
  />
));
CommandList.displayName = 'CommandList';

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-8 text-center text-sm font-semibold text-ink-muted" {...props} />
));
CommandEmpty.displayName = 'CommandEmpty';

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      // Group headings are Baloo 2, like every other heading
      'overflow-hidden p-1 text-ink [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-heading [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-ink-secondary',
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = 'CommandGroup';

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={cn(COMMAND_ROW, className)} {...props} />
));
CommandItem.displayName = 'CommandItem';
