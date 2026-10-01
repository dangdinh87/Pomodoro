// Tokens are hex values; color-mix keeps Tailwind opacity modifiers (bg-primary/10) working.
const token = (name) => `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;
const WHITE = 'rgb(255 255 255 / <alpha-value>)';
const tone = (hue) => ({
  DEFAULT: token(`--${hue}-solid`),
  bg: token(`--${hue}-bg`),
  ink: token(`--${hue}-ink`),
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        'space-grotesk': ['var(--font-heading)'],
      },
      colors: {
        // shadcn/ui names, bridged to the design tokens in globals.css
        border: { DEFAULT: token('--border'), strong: token('--border-strong') },
        input: token('--border'),
        ring: token('--accent'),
        background: token('--surface-page'),
        foreground: token('--ink'),
        primary: { DEFAULT: token('--accent-solid'), foreground: WHITE },
        secondary: { DEFAULT: token('--surface-raised'), foreground: token('--ink') },
        destructive: { DEFAULT: token('--rose-solid'), foreground: WHITE },
        muted: { DEFAULT: token('--surface-raised'), foreground: token('--ink-muted') },
        accent: { DEFAULT: token('--surface-hover'), foreground: token('--ink') },
        popover: { DEFAULT: token('--surface'), foreground: token('--ink') },
        card: { DEFAULT: token('--surface'), foreground: token('--ink') },

        // Design-system tokens
        ink: {
          DEFAULT: token('--ink'),
          secondary: token('--ink-secondary'),
          muted: token('--ink-muted'),
          faint: token('--ink-faint'),
        },
        surface: {
          DEFAULT: token('--surface'),
          page: token('--surface-page'),
          raised: token('--surface-raised'),
          hover: token('--surface-hover'),
        },
        brand: {
          DEFAULT: token('--accent'),
          hover: token('--accent-hover'),
          soft: token('--accent-soft'),
          ink: token('--accent-ink'),
          solid: token('--accent-solid'),
          edge: token('--accent-edge'),
        },
        // Semantic tones — pick by meaning, never for decoration (docs/design-system.md §4.2)
        success: tone('green'),
        warning: tone('amber'),
        danger: tone('rose'),
        info: tone('blue'),
        ai: tone('purple'),
        gold: token('--gold'),
        timer: token('--timer-foreground'),
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: '4px',
        md: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'slide-in-from-top': {
          '0%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        'slide-in-from-bottom': {
          '0%': {
            transform: 'translateY(100%)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: 1,
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: 0.5,
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: 1,
          },
        },
        'clock-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'clock-dot-pulse': {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'clock-pulse': 'clock-pulse 1s ease-in-out infinite',
        'clock-dot-pulse': 'clock-dot-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
