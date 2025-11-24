'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  CheckSquare,
  Shield,
  BarChart3,
  Music,
  Settings,
  Keyboard,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  X,
  HelpCircle,
  Sparkles,
  Target,
  Zap,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
} from 'lucide-react';

interface UserGuideModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function UserGuideModal({ open, onOpenChange, trigger }: UserGuideModalProps) {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState(0);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  const sections = [
    {
      id: 'gettingStarted',
      icon: BookOpen,
      title: t('userGuide.gettingStarted.title'),
      description: t('userGuide.gettingStarted.description'),
    },
    {
      id: 'timer',
      icon: Clock,
      title: t('userGuide.timer.title'),
      description: t('userGuide.timer.description'),
    },
    {
      id: 'tasks',
      icon: CheckSquare,
      title: t('userGuide.tasks.title'),
      description: t('userGuide.tasks.description'),
    },
    {
      id: 'focus',
      icon: Shield,
      title: t('userGuide.focus.title'),
      description: t('userGuide.focus.description'),
    },
    {
      id: 'progress',
      icon: BarChart3,
      title: t('userGuide.progress.title'),
      description: t('userGuide.progress.description'),
    },
    {
      id: 'audio',
      icon: Music,
      title: t('userGuide.audio.title'),
      description: t('userGuide.audio.description'),
    },
    {
      id: 'settings',
      icon: Settings,
      title: t('userGuide.settings.title'),
      description: t('userGuide.settings.description'),
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      title: t('userGuide.shortcuts.title'),
      description: t('userGuide.shortcuts.description'),
    },
    {
      id: 'tips',
      icon: Lightbulb,
      title: t('userGuide.tips.title'),
      description: t('userGuide.tips.description'),
    },
  ];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('user-guide-seen');
    if (!hasSeenGuide) {
      setIsWelcomeOpen(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setIsWelcomeOpen(false);
    localStorage.setItem('user-guide-seen', 'true');
    if (onOpenChange) {
      onOpenChange(true);
    }
  };

  const handleWelcomeSkip = () => {
    setIsWelcomeOpen(false);
    localStorage.setItem('user-guide-seen', 'true');
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToSection = (index: number) => {
    setCurrentSection(index);
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'gettingStarted':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {[
                "Navigate using the sidebar menu on the left",
                "Start with the Timer section to begin your first Pomodoro session",
                "Create and manage tasks in the Tasks section",
                "Track your progress in the Progress section",
                "Customize your experience in Settings"
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{t('userGuide.timer.workMode')}</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-blue-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">{t('userGuide.timer.shortBreak')}</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <CardTitle className="text-base">{t('userGuide.timer.longBreak')}</CardTitle>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Play className="h-3 w-3" />
                  <span className="text-xs">Space: Start/Pause</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <RotateCcw className="h-3 w-3" />
                  <span className="text-xs">R: Reset</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <SkipForward className="h-3 w-3" />
                  <span className="text-xs">Skip Session</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">4 Clock Types</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {t('userGuide.tasks.createTask')}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {t('userGuide.tasks.editTask')}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {t('userGuide.tasks.completeTask')}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {t('userGuide.tasks.prioritize')}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        );

      case 'focus':
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    {t('userGuide.focus.enableFocus')}
                  </CardTitle>
                  <CardDescription>{t('userGuide.focus.minimalInterface')}</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    {t('userGuide.focus.streakTracking')}
                  </CardTitle>
                  <CardDescription>Build daily focus habits</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    {t('userGuide.focus.motivation')}
                  </CardTitle>
                  <CardDescription>Stay inspired with quotes</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {[
                t('userGuide.progress.dailyStats'),
                t('userGuide.progress.weeklyStats'),
                t('userGuide.progress.sessionHistory'),
                t('userGuide.progress.achievements'),
                t('userGuide.progress.insights'),
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="grid gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-blue-500" />
                    {t('userGuide.audio.natureSounds')}
                  </CardTitle>
                  <CardDescription>Rain, waves, wind, and more</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-green-500" />
                    {t('userGuide.audio.spotifyIntegration')}
                  </CardTitle>
                  <CardDescription>Connect your Spotify account</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-purple-500" />
                    {t('userGuide.audio.soundCategories')}
                  </CardTitle>
                  <CardDescription>Nature, Urban, Transport, Things</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {[
                t('userGuide.settings.timerSettings'),
                t('userGuide.settings.themeSettings'),
                t('userGuide.settings.backgroundSettings'),
                t('userGuide.settings.audioSettings'),
                t('userGuide.settings.language'),
                t('userGuide.settings.keyboardShortcuts'),
              ].map((setting, index) => (
                <Card key={index} className="border-0 bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{setting}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">{t('userGuide.shortcuts.space')}</span>
                <Badge variant="outline" className="font-mono">Space</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">{t('userGuide.shortcuts.r')}</span>
                <Badge variant="outline" className="font-mono">R</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">{t('userGuide.shortcuts.navigation')}</span>
                <Badge variant="outline" className="font-mono">1-5</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">{t('userGuide.shortcuts.theme')}</span>
                <Badge variant="outline" className="font-mono">T</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">{t('userGuide.shortcuts.focus')}</span>
                <Badge variant="outline" className="font-mono">F</Badge>
              </div>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {[
                "Plan your tasks before starting Pomodoro sessions",
                "Turn off notifications and close unnecessary tabs",
                "Always take your breaks - they're essential for sustainability",
                "Review your progress regularly to stay motivated",
                "Consistency is key - use Pomodoro daily for best results",
                "Set achievable goals for each work session",
                "Create a dedicated workspace for better focus"
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={isWelcomeOpen} onOpenChange={setIsWelcomeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {t('userGuide.welcomeModal.title')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t('userGuide.welcomeModal.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-center space-y-4">
            <div className="text-4xl">🎯</div>
            <p className="text-sm text-muted-foreground">
              {t('userGuide.welcomeModal.description')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleWelcomeSkip}
              className="flex-1"
            >
              {t('userGuide.welcomeModal.skipButton')}
            </Button>
            <Button onClick={handleWelcomeComplete} className="flex-1">
              {t('userGuide.welcomeModal.startButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </>
  );
}