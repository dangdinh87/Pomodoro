const FAQ_COUNT = 8;

/** Single source for the visible FAQ and the FAQPage JSON-LD, so they cannot drift apart. */
export function getFaqItems(t: (key: string) => string) {
  return Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`site.faq.q${i + 1}.q`),
    answer: t(`site.faq.q${i + 1}.a`),
  }));
}
