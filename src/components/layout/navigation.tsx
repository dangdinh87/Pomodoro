'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Timer,
  BarChart3,
  CheckSquare,
  Shield,
  Music,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useNavigationStore } from '@/stores/navigation-store';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isNavCollapsed, toggleNav } = useNavigationStore();

  const navigationItems: NavigationItem[] = [
    {
      id: 'timer',
      label: 'Timer',
      icon: <Timer className="h-4 w-4" />,
      href: '/timer',
    },
    {
      id: 'focus',
      label: 'Focus Mode',
      icon: <Shield className="h-4 w-4" />,
      href: '/focus',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="h-4 w-4" />,
      href: '/tasks',
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/progress',
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: <Music className="h-4 w-4" />,
      href: '/audio',
    },
  ];

  const getActiveItem = () => {
    const path = pathname.replace('/', '');
    return path || 'timer';
  };

  const activeItem = getActiveItem();

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex">
      {/* Desktop Sidebar Navigation */}
      <div
        className={`hidden md:block fixed left-0 top-0 h-full bg-transparent z-40 transition-all duration-300 ${
          isNavCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div
          className={`p-4 h-full flex flex-col ${
            isNavCollapsed ? 'items-center' : ''
          }`}
        >
          <div
            className={`flex items-center ${
              isNavCollapsed ? 'justify-center' : 'justify-between'
            } mb-6 w-full`}
          >
            {!isNavCollapsed && <h1 className="text-xl font-bold">Focus</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNav}
              className="transition-all duration-200"
            >
              <Menu
                className={`h-4 w-4 transition-transform duration-300 ${
                  isNavCollapsed ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
          <div className="space-y-2 flex-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeItem === item.id ? 'default' : 'ghost'}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center transition-all duration-200 ${
                  activeItem === item.id ? 'shadow-md' : 'hover:bg-accent/50'
                } ${isNavCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                title={isNavCollapsed ? item.label : ''}
              >
                {item.icon}
                {!isNavCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
          <div
            className={`mt-auto pt-4 ${
              isNavCollapsed ? 'flex justify-center' : ''
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              title="Toggle theme"
              className="transition-all duration-200"
              asChild
            >
              <AnimatedThemeToggler className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Fixed Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Focus</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                title="Toggle theme"
                className="transition-all duration-200"
                asChild
              >
                <AnimatedThemeToggler className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-transparent border-b border-white/10 animate-in slide-in-from-top duration-200">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? 'default' : 'ghost'}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full justify-start flex items-center gap-3 transition-all duration-200 ${
                    activeItem === item.id ? 'shadow-md' : 'hover:bg-accent/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
