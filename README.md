# Improcode

A comprehensive Pomodoro Timer web application that combines time management, focus enhancement, and productivity analytics to help users achieve their 10,000-hour mastery goals.

## Features

### Core Features
- **Pomodoro Timer System**: Customizable work, short break, and long break durations with visual countdown indicators
- **Focus Mode**: Distraction-blocking environment with website whitelist/blacklist management
- **Progress Tracking & Analytics**: Comprehensive hour tracking toward 10,000-hour goals with interactive charts
- **Task Management**: Project and task creation with Pomodoro session assignment
- **User Experience**: Responsive dark/light theme toggle with mobile-first design
- **Audio & Ambient Features**: Ambient sound library with customizable notification sounds
- **Data Management**: Secure authentication with cloud-based synchronization

### Technical Features
- **Progressive Web App (PWA)**: Offline capabilities with service workers
- **Responsive Design**: Optimized for mobile and desktop using Tailwind CSS
- **Modern Stack**: Next.js 14, TypeScript, shadcn/ui components
- **State Management**: Zustand for complex state management
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Updates**: WebSockets for live synchronization

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd improcode
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
improcode/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   └── pomodoro-timer.tsx
│   └── lib/                 # Utility functions
│       └── utils.ts
├── public/                  # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Key Components

### PomodoroTimer
The core timer component with:
- Customizable session durations
- Visual progress indicators
- Session tracking
- Audio notifications

### UI Components
Built with shadcn/ui for consistent design:
- Button, Card, Progress, Switch, Label, Separator
- Fully accessible with keyboard navigation
- Dark/light theme support

## Development Notes

### Current Status
- ✅ Basic project structure with Next.js 14 and TypeScript
- ✅ Tailwind CSS configuration with custom design system
- ✅ Core Pomodoro timer functionality with multiple clock modes
- ✅ shadcn/ui components integration
- ✅ Task management with Supabase backend
- ✅ Audio system (ambient sounds, YouTube, Spotify)
- ✅ Supabase authentication
- ✅ Session history tracking
- 🔄 Focus mode implementation (in progress)
- 🔄 Progress analytics dashboard (in progress)

### Known Issues
- Some TypeScript errors in animate-ui components (React ref compatibility)
- Spotify integration requires valid OAuth credentials
- PWA service worker needs verification

### Architecture
See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
