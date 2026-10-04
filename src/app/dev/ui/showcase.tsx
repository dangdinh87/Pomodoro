'use client';

import { useState, type ReactNode } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import {
  BellRinging,
  Check,
  Headphones,
  ListChecks,
  Mountains,
  Plus,
  Timer,
  Trash,
  ChartBar,
  GameController,
  CornersOut,
} from '@phosphor-icons/react/dist/ssr';
import { TomoBubble } from '@/components/brand/tomo-bubble';
import { Tomo, type TomoFace } from '@/components/brand/tomo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { IconTile, type IconTileTone } from '@/components/ui/icon-tile';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import { PageContainer, PageHeader, SectionHeading } from '@/components/ui/page-header';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { SessionTomatoes } from '@/components/ui/session-tomatoes';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { StatStrip } from '@/components/ui/stat-strip';
import { StickerCard } from '@/components/ui/sticker-card';
import { StreakPill } from '@/components/ui/streak-pill';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { I18nProvider, useI18n, LANGS } from '@/contexts/i18n-context';

const TONES: IconTileTone[] = ['tomato', 'mint', 'butter', 'lilac', 'sky', 'peach', 'surface'];
const FACES: TomoFace[] = ['happy', 'focus', 'party', 'sleepy', 'worried'];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <SectionHeading>{title}</SectionHeading>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function Toolbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useI18n();
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {(['light', 'dark'] as const).map((value) => (
        <FilterChip key={value} active={theme === value} onClick={() => setTheme(value)}>
          {value}
        </FilterChip>
      ))}
      <Separator orientation="vertical" className="mx-1 h-6" decorative />
      {LANGS.map(({ code, label }) => (
        <FilterChip key={code} active={lang === code} onClick={() => setLang(code)}>
          {label}
        </FilterChip>
      ))}
    </div>
  );
}

function Showcase() {
  const [chip, setChip] = useState('all');
  const [volume, setVolume] = useState([60]);
  const [radio, setRadio] = useState('focus');

  return (
    <PageContainer>
      <Toolbar />
      <PageHeader
        title="UI primitives"
        description="Sticker pop: outline, hard shadow, candy colours. Dev only."
        actions={<Button size="sm">Action</Button>}
      />

      <Block title="Button">
        {(['default', 'secondary', 'outline', 'fun', 'ghost', 'destructive', 'link'] as const).map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button disabled>disabled</Button>
        <Button size="sm">
          <Plus weight="bold" /> Small
        </Button>
        <Button>
          <Timer weight="bold" /> Start focus
        </Button>
        <Button size="lg">Large</Button>
        <Button size="icon" variant="secondary" aria-label="Delete">
          <Trash weight="bold" />
        </Button>
        <Button size="icon" aria-label="Done">
          <Check weight="bold" />
        </Button>
      </Block>

      <Block title="Input, textarea, label">
        <div className="grid w-full max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Task name</Label>
            <Input id="name" placeholder="What are you working on?" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bad">Email (invalid)</Label>
            <Input id="bad" aria-invalid="true" defaultValue="not-an-email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="off">Disabled</Label>
            <Input id="off" disabled defaultValue="Locked" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Anything else?" />
          </div>
        </div>
      </Block>

      <Block title="Checkbox, radio, switch, slider">
        <div className="grid min-w-[220px] gap-3">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Checkbox aria-label="Off" /> Unchecked
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Checkbox aria-label="On" defaultChecked /> Checked
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Checkbox aria-label="Disabled" disabled /> Disabled
          </label>
        </div>
        <RadioGroup value={radio} onValueChange={setRadio} className="min-w-[160px]" aria-label="Mode">
          {['focus', 'short', 'long'].map((value) => (
            <label key={value} className="flex items-center gap-3 text-sm font-semibold">
              <RadioGroupItem value={value} aria-label={value} /> {value}
            </label>
          ))}
        </RadioGroup>
        <div className="grid min-w-[160px] gap-3">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Switch aria-label="Sound" defaultChecked /> On
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Switch aria-label="Muted" /> Off
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <Switch aria-label="Locked" disabled /> Disabled
          </label>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Label>Volume {volume[0]}%</Label>
          <Slider aria-label="Volume" value={volume} onValueChange={setVolume} max={100} />
          <Slider aria-label="Disabled slider" defaultValue={[30]} disabled />
        </div>
      </Block>

      <Block title="Tabs and filter chips">
        <div className="w-full max-w-md">
          <Tabs defaultValue="scenes">
            <TabsList aria-label="Sections">
              <TabsTrigger value="scenes">Scenes</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="mine">My images</TabsTrigger>
            </TabsList>
            <TabsContent value="scenes">Scenes panel</TabsContent>
            <TabsContent value="photos">Photos panel</TabsContent>
            <TabsContent value="mine">Mine panel</TabsContent>
          </Tabs>
        </div>
        <FilterChipGroup label="Filter" className="w-full">
          {[
            ['all', 'All', 12],
            ['open', 'Open', 7],
            ['done', 'Done', 5],
          ].map(([id, label, count]) => (
            <FilterChip key={id as string} active={chip === id} count={count as number} onClick={() => setChip(id as string)}>
              {label}
            </FilterChip>
          ))}
          <FilterChip active={false} disabled>
            Disabled
          </FilterChip>
        </FilterChipGroup>
      </Block>

      <Block title="Badge">
        {(['default', 'secondary', 'outline', 'brand', 'success', 'warning', 'destructive', 'info', 'ai'] as const).map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </Block>

      <Block title="Card and sticker card">
        <Card className="w-full max-w-xs">
          <CardHeader>
            <CardTitle>Weekly focus</CardTitle>
            <CardDescription>Minutes per day</CardDescription>
          </CardHeader>
          <CardContent>12h 40m so far</CardContent>
        </Card>
        <StickerCard size="sm" className="w-40">
          sm
        </StickerCard>
        <StickerCard tilt="left" className="w-40">
          Tilt left
        </StickerCard>
        <StickerCard tilt="right" size="lg" className="w-44">
          Tilt right lg
        </StickerCard>
      </Block>

      <Block title="Icon tile">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-2">
            {TONES.map((tone) => (
              <IconTile key={tone} icon={Timer} tone={tone} size={size} />
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <IconTile icon={ListChecks} tone="butter" size="lg" />
          <IconTile icon={Headphones} tone="sky" size="lg" />
          <IconTile icon={Mountains} tone="lilac" size="lg" />
          <IconTile icon={BellRinging} tone="peach" size="lg" />
          <IconTile icon={ChartBar} tone="tomato" size="lg" />
          <IconTile icon={GameController} tone="peach" size="lg" />
          <IconTile icon={CornersOut} tone="surface" size="lg" />
        </div>
      </Block>

      <Block title="Avatar, streak, session tomatoes, kbd">
        {['Dinh', 'Tomo', 'Ann Lee', 'Sakura', 'Minh', 'Zed'].map((name) => (
          <Avatar key={name}>
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
        <StreakPill count={1} />
        <StreakPill count={42} />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <SessionTomatoes key={n} completed={n} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Kbd>⌘K</Kbd>
          <Kbd>Space</Kbd>
          <Kbd>Esc</Kbd>
        </div>
      </Block>

      <Block title="Stat strip">
        <StatStrip
          className="w-full"
          items={[
            { label: 'Focus today', value: '2h 10m', icon: Timer },
            { label: 'Sessions', value: 5, icon: ListChecks, hint: 'of 8 planned' },
            { label: 'Streak', value: '12 days', icon: ChartBar },
            { label: 'Best day', value: '4h 5m', icon: Check },
          ]}
        />
      </Block>

      <Block title="Table">
        <Card className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Minutes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['Mon', 4, 100],
                ['Tue', 6, 150],
                ['Wed', 3, 75],
              ].map(([day, sessions, minutes], i) => (
                <TableRow key={day as string} data-state={i === 1 ? 'selected' : undefined}>
                  <TableCell className="font-semibold">{day}</TableCell>
                  <TableCell>{sessions}</TableCell>
                  <TableCell>{minutes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Block>

      <Block title="Skeleton and loader">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="size-12 rounded-full" />
        </div>
        <Loader size="sm" title="Loading" subtitle="One moment" />
      </Block>

      <Block title="Tomo bubble and faces">
        <div className="w-full max-w-md">
          <TomoBubble face="happy">Good morning! Ready for one focused round?</TomoBubble>
        </div>
        <div className="w-full max-w-md">
          <TomoBubble face="worried" id="dev-ui-streak">
            Your streak needs one more session today. You can do it!
          </TomoBubble>
        </div>
        <div className="flex items-end gap-3">
          {FACES.map((face) => (
            <Tomo key={face} face={face} size={56} />
          ))}
        </div>
      </Block>

      <Block title="Empty state">
        <EmptyState
          className="w-full"
          title="No tasks yet"
          description="Add the first thing you want to finish today."
          action={
            <Button>
              <Plus weight="bold" /> Add task
            </Button>
          }
        />
      </Block>
    </PageContainer>
  );
}

export function UiShowcase() {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <Showcase />
      </I18nProvider>
    </ThemeProvider>
  );
}
