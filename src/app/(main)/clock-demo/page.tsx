'use client';

import { useState } from 'react';
import {
  AnalogClock,
  AnimatedCountdown,
  DigitalClock,
  FlipClock,
  ProgressBarClock,
} from '@/app/(main)/timer/components/clocks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimerMode } from '@/stores/timer-store';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';

export default function ClockDemoPage() {
  const { t } = useI18n();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const totalTime = 25 * 60; // 25 minutes
  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsRunning(false);
    } else {
      // Start
      setIsRunning(true);
      const id = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            if (intervalId) clearInterval(intervalId);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
  };

  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const clockSize = 'large' as const;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('clockDemo.title')}</h1>
        <p className="text-muted-foreground">
          {t('clockDemo.subtitle')}
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('clockDemo.controls.title')}</CardTitle>
          <CardDescription>{t('clockDemo.controls.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Button onClick={toggleTimer} variant={isRunning ? 'outline' : 'default'}>
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    {t('clockDemo.controls.pause')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {t('clockDemo.controls.start')}
                  </>
                )}
              </Button>
              <Button onClick={resetTimer} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('clockDemo.controls.reset')}
              </Button>
              <div className="text-sm text-muted-foreground">
                {t('clockDemo.controls.timeProgress', { time: formattedTime, progress: Math.round(progressPercent) })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setMode('work')}
                variant={mode === 'work' ? 'default' : 'outline'}
                size="sm"
              >
                {t('clockDemo.modes.work')}
              </Button>
              <Button
                onClick={() => setMode('shortBreak')}
                variant={mode === 'shortBreak' ? 'default' : 'outline'}
                size="sm"
              >
                {t('clockDemo.modes.shortBreak')}
              </Button>
              <Button
                onClick={() => setMode('longBreak')}
                variant={mode === 'longBreak' ? 'default' : 'outline'}
                size="sm"
              >
                {t('clockDemo.modes.longBreak')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clock Tabs */}
      <Tabs defaultValue="animated" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="animated">{t('clockDemo.tabs.animated')}</TabsTrigger>
          <TabsTrigger value="digital">{t('clockDemo.tabs.digital')}</TabsTrigger>
          <TabsTrigger value="analog">{t('clockDemo.tabs.analog')}</TabsTrigger>
          <TabsTrigger value="progress">{t('clockDemo.tabs.progress')}</TabsTrigger>
          <TabsTrigger value="flip">{t('clockDemo.tabs.flip')}</TabsTrigger>
        </TabsList>



        {/* Animated Countdown */}
        <TabsContent value="animated">
          <Card>
            <CardHeader>
              <CardTitle>{t('clockDemo.clockTypes.animated.title')}</CardTitle>
              <CardDescription>
                {t('clockDemo.clockTypes.animated.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[500px] flex items-center justify-center">
              <AnimatedCountdown
                formattedTime={formattedTime}
                mode={mode}
                clockSize={clockSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Clock */}
        <TabsContent value="digital">
          <Card>
            <CardHeader>
              <CardTitle>{t('clockDemo.clockTypes.digital.title')}</CardTitle>
              <CardDescription>
                {t('clockDemo.clockTypes.digital.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[500px] flex items-center justify-center">
              <DigitalClock
                timeRef={null}
                formattedTime={formattedTime}
                isRunning={isRunning}
                progressPercent={progressPercent}
                lowWarnEnabled={true}
                timeLeft={timeLeft}
                clockSize={clockSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analog Clock */}
        <TabsContent value="analog">
          <Card>
            <CardHeader>
              <CardTitle>{t('clockDemo.clockTypes.analog.title')}</CardTitle>
              <CardDescription>{t('clockDemo.clockTypes.analog.description')}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[500px] flex items-center justify-center">
              <AnalogClock
                formattedTime={formattedTime}
                totalTimeForMode={totalTime}
                timeLeft={timeLeft}
                clockSize={clockSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Bar Clock */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>{t('clockDemo.clockTypes.progress.title')}</CardTitle>
              <CardDescription>{t('clockDemo.clockTypes.progress.description')}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[500px] flex items-center justify-center">
              <ProgressBarClock
                formattedTime={formattedTime}
                progressPercent={progressPercent}
                clockSize={clockSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flip Clock */}
        <TabsContent value="flip">
          <Card>
            <CardHeader>
              <CardTitle>{t('clockDemo.clockTypes.flip.title')}</CardTitle>
              <CardDescription>{t('clockDemo.clockTypes.flip.description')}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[500px] flex items-center justify-center">
              <FlipClock
                formattedTime={formattedTime}
                timeLeft={timeLeft}
                clockSize={clockSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Animation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Animated Countdown</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Vertical slide animation</li>
                <li>Smooth NumberFlow transitions</li>
                <li>Minimalist design</li>
                <li>Responsive text sizing</li>
                <li>Mode indicator</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Digital Clock</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Circular progress ring</li>
                <li>Low-time warning (glow)</li>
                <li>Clean digital display</li>
                <li>Multiple size options</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Analog Clock</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Sweeping second hand</li>
                <li>Classic clock face</li>
                <li>Time remaining arc</li>
                <li>Traditional aesthetic</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Progress Bar</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Linear progress indicator</li>
                <li>Simple and clear</li>
                <li>Minimal distraction</li>
                <li>Easy to read</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Flip Clock</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Retro flip animation</li>
                <li>Segmented display</li>
                <li>Nostalgic design</li>
                <li>Smooth transitions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
