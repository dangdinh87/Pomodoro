'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMascotStore, type MascotState } from '@/stores/mascot-store';
import { Mascot } from './Mascot';
import { SpeechBubble } from './SpeechBubble';
import { getRandomTip, getGreeting } from './messages';
import type { MascotMessage } from './messages';

// Page-specific default expressions
const PAGE_EXPRESSIONS: Record<string, MascotState> = {
  '/timer': 'happy',
  '/tasks': 'encouraging',
  '/progress': 'happy',
  '/settings': 'happy',
  '/history': 'happy',
  '/audio': 'happy',
};

// Pages where mascot should be hidden
const HIDDEN_PAGES = ['/chat'];

// Idle detection constants
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const IDLE_COOLDOWN = 30 * 60 * 1000; // 30 minutes between idle tips

interface MascotFloatingProps {
  className?: string;
}

export function MascotFloating({ className }: MascotFloatingProps) {
  const pathname = usePathname();
  const {
    currentState,
    setState,
    reducedMotion,
    currentMessage: storeMessage,
    dismissMessage,
    queueMessage,
  } = useMascotStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [localMessage, setLocalMessage] = useState<MascotMessage | null>(null);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);

  // Idle detection refs
  const lastActivityRef = useRef(Date.now());
  const lastIdleTipRef = useRef(0);
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Combine store message and local message (store takes priority)
  const currentMessage = storeMessage || localMessage;

  // Set page-specific expression (only when not overridden by events)
  useEffect(() => {
    const pageExpression = PAGE_EXPRESSIONS[pathname];
    if (pageExpression) {
      // Only set if not in an animated/temporary state
      const isTemporaryState = ['celebrating', 'excited', 'sad'].includes(currentState);
      if (!isTemporaryState) {
        setState(pageExpression);
      }
    }
  }, [pathname, setState, currentState]);

  // Show greeting on first load
  useEffect(() => {
    if (!hasShownGreeting) {
      const timer = setTimeout(() => {
        setLocalMessage(getGreeting());
        setHasShownGreeting(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasShownGreeting]);

  // Auto-dismiss local messages with duration
  useEffect(() => {
    if (localMessage?.duration) {
      const timer = setTimeout(() => {
        setLocalMessage(null);
      }, localMessage.duration);
      return () => clearTimeout(timer);
    }
  }, [localMessage]);

  // Track user activity for idle detection
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Track various user activities
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  // Idle detection - show encouragement after 5 minutes idle
  useEffect(() => {
    idleCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const timeSinceLastIdleTip = now - lastIdleTipRef.current;

      // Check if idle and cooldown passed
      if (
        timeSinceActivity >= IDLE_TIMEOUT &&
        timeSinceLastIdleTip >= IDLE_COOLDOWN &&
        !isMinimized &&
        !currentMessage
      ) {
        lastIdleTipRef.current = now;

        // Show idle encouragement
        const idleMessages: MascotMessage[] = [
          {
            id: `idle-${now}`,
            type: 'tip',
            text: 'Bạn còn đó không? 👋',
            expression: 'worried',
            duration: 6000,
          },
          {
            id: `idle-${now}`,
            type: 'tip',
            text: 'Nghỉ ngơi đủ rồi, bắt đầu lại nào! 💪',
            expression: 'encouraging',
            duration: 6000,
          },
          {
            id: `idle-${now}`,
            type: 'tip',
            text: 'Mình vẫn chờ bạn ở đây! 🐕',
            expression: 'happy',
            duration: 6000,
          },
        ];

        const randomIdleMessage =
          idleMessages[Math.floor(Math.random() * idleMessages.length)];
        queueMessage(randomIdleMessage);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
    };
  }, [isMinimized, currentMessage, queueMessage]);

  // Handle mascot click
  const handleClick = useCallback(() => {
    // Update activity on click
    lastActivityRef.current = Date.now();

    if (isMinimized) {
      setIsMinimized(false);
      return;
    }

    // Show random tip on click (only if no current message)
    if (!currentMessage) {
      setLocalMessage(getRandomTip());
    }
  }, [isMinimized, currentMessage]);

  // Handle minimize toggle
  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized((prev) => !prev);
  }, []);

  // Dismiss message
  const handleDismiss = useCallback(() => {
    if (storeMessage) {
      dismissMessage();
    } else {
      setLocalMessage(null);
    }
  }, [storeMessage, dismissMessage]);

  // Hide on certain pages
  if (HIDDEN_PAGES.includes(pathname)) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        'fixed z-50',
        'bottom-4 right-4',
        'md:bottom-6 md:right-6',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: 0.5,
      }}
    >
      {/* Speech bubble (only when not minimized) */}
      {!isMinimized && (
        <SpeechBubble message={currentMessage} onDismiss={handleDismiss} />
      )}

      {/* Mascot container */}
      <motion.div
        className={cn(
          'relative cursor-pointer',
          'select-none',
          isMinimized ? 'w-10 h-10 md:w-12 md:h-12' : 'w-20 h-20 md:w-28 md:h-28'
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Studie mascot - click for tips"
        whileHover={{ scale: reducedMotion ? 1 : 1.05 }}
        whileTap={{ scale: reducedMotion ? 1 : 0.95 }}
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Mascot */}
        <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <Mascot size="lg" className="w-full h-full" />
            </motion.div>
          ) : (
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'w-full h-full rounded-full',
                'bg-gradient-to-br from-amber-200 to-amber-400',
                'flex items-center justify-center',
                'shadow-lg'
              )}
            >
              <span className="text-lg">🐕</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimize/Expand button */}
        <button
          onClick={handleMinimize}
          className={cn(
            'absolute -top-1 -right-1',
            'w-6 h-6 rounded-full',
            'bg-background/90 backdrop-blur-sm',
            'border border-border',
            'flex items-center justify-center',
            'shadow-md',
            'hover:bg-accent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          aria-label={isMinimized ? 'Expand mascot' : 'Minimize mascot'}
        >
          {isMinimized ? (
            <Plus className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

// Export for triggering celebrations from other components
export function useMascotCelebration() {
  const { queueMessage, triggerTemporary } = useMascotStore();

  const triggerCelebration = useCallback(
    (message?: string) => {
      triggerTemporary('celebrating', 3000);
      queueMessage({
        id: `celebration-${Date.now()}`,
        type: 'celebration',
        text: message ?? 'Tuyệt vời! 🎉',
        expression: 'celebrating',
        duration: 4000,
      });
    },
    [queueMessage, triggerTemporary]
  );

  return { triggerCelebration };
}
