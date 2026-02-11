/**
 * Structured Data for SEO (JSON-LD)
 * Helps search engines understand the application structure and features
 */
export const JsonLd = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Improcode',
    alternateName: 'Improcode Pomodoro Timer',
    description:
      'Free online Pomodoro timer with AI coach, task management, mini games, leaderboard, and focus analytics.',
    url: 'https://improcode.com',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    inLanguage: ['en', 'vi', 'ja'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Pomodoro Timer with Task Linking',
      'Improcode AI Coach',
      'Mini Games for Breaks',
      'Focus Mode Analytics',
      'Daily Streaks & Leaderboard',
      'Custom Themes & Ambient Sounds',
    ],
    screenshot: 'https://improcode.com/card.jpg',
    softwareVersion: '1.0.0',
    author: {
        '@type': 'Organization',
        name: 'Improcode Team',
        url: 'https://improcode.com'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
