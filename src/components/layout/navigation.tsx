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
  HelpCircle,
} from 'lucide-react';
import { useNavigationStore } from '@/stores/navigation-store';
import { useTranslation } from '@/contexts/i18n-context';
import { UserGuideModal } from '@/components/user-guide/user-guide-modal';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation();

  const navigationItems: NavigationItem[] = [
    {
      id: 'timer',
      label: t('nav.timer'),
      icon: <Timer className="h-4 w-4" />,
      href: '/timer',
    },
    {
      id: 'focus',
      label: t('nav.focus'),
      icon: <Shield className="h-4 w-4" />,
      href: '/focus',
    },
    {
      id: 'tasks',
      label: t('nav.tasks'),
      icon: <CheckSquare className="h-4 w-4" />,
      href: '/tasks',
    },
    {
      id: 'progress',
      label: t('nav.progress'),
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/progress',
    },
    {
      id: 'audio',
      label: t('nav.audio'),
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
        className={`hidden md:block fixed left-0 top-0 h-full bg-transparent z-40 transition-all duration-300 ${isNavCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        <div
          className={`p-4 h-full flex flex-col ${isNavCollapsed ? 'items-center' : ''
            }`}
        >
          <div
            className={`flex items-center ${isNavCollapsed ? 'justify-center' : 'justify-between'
              } mb-6 w-full`}
          >
            {!isNavCollapsed && <h1 className="text-xl font-bold">{t('brand.title')}</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNav}
              className="transition-all duration-200"
            >
              <Menu
                className={`h-4 w-4 transition-transform duration-300 ${isNavCollapsed ? 'rotate-180' : ''
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
                className={`w-full flex items-center transition-all duration-200 ${activeItem === item.id ? 'shadow-md' : 'hover:bg-accent/50'
                  } ${isNavCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                title={isNavCollapsed ? item.label : ''}
              >
                {item.icon}
                {!isNavCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>

        </div>
      </div>

      {/* Mobile Navigation - Fixed Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{t('brand.title')}</h1>
            <div className="flex items-center gap-2">
              <UserGuideModal
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    title="User Guide"
                    className="transition-all duration-200"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                }
              />
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
                  className={`w-full justify-start flex items-center gap-3 transition-all duration-200 ${activeItem === item.id ? 'shadow-md' : 'hover:bg-accent/50'
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
