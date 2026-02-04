'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MascotMessage } from './messages/types';

interface SpeechBubbleProps {
  message: MascotMessage | null;
  onDismiss: () => void;
  className?: string;
}

const bubbleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

const bubbleColors: Record<MascotMessage['type'], string> = {
  tip: 'bg-primary/95 text-primary-foreground',
  reminder: 'bg-amber-500/95 text-white',
  celebration: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  greeting: 'bg-secondary/95 text-secondary-foreground',
};

export function SpeechBubble({ message, onDismiss, className }: SpeechBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message.id}
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-3',
            'min-w-[180px] max-w-[280px]',
            className
          )}
        >
          {/* Speech bubble */}
          <div
            className={cn(
              'relative rounded-2xl px-4 py-3 shadow-lg',
              'backdrop-blur-sm',
              bubbleColors[message.type]
            )}
          >
            {/* Message text */}
            <p className="text-sm font-medium leading-relaxed pr-6">
              {message.text}
            </p>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className={cn(
                'absolute top-2 right-2',
                'p-1 rounded-full',
                'hover:bg-white/20 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-white/50'
              )}
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Bubble tail */}
            <div
              className={cn(
                'absolute -bottom-2 left-1/2 -translate-x-1/2',
                'w-4 h-4 rotate-45',
                message.type === 'celebration'
                  ? 'bg-purple-500'
                  : message.type === 'tip'
                    ? 'bg-primary/95'
                    : message.type === 'reminder'
                      ? 'bg-amber-500/95'
                      : 'bg-secondary/95'
              )}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
