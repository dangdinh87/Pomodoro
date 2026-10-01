'use client';

import { motion, AnimatePresence } from 'motion/react';
import { CaretDown } from '@phosphor-icons/react/dist/ssr';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-ink pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <CaretDown size={18} className="text-ink-muted" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-ink-secondary leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export function FAQAccordion({ items }: { items: FAQItemProps[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface overflow-hidden">
      {items.map((item, index) => (
        <FAQItem key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}
