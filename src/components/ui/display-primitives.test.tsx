import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timer } from '@phosphor-icons/react/dist/ssr';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback, avatarCandyClass } from './avatar';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { EmptyState } from './empty-state';
import { FilterChip, FilterChipGroup } from './filter-chip';
import { Kbd } from './kbd';
import Loader from './loader';
import { PageHeader } from './page-header';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { StatStrip } from './stat-strip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('Tabs (segmented)', () => {
  it('shows the active tab as a floating sticker and switches on click and arrow keys', async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('tablist')).toHaveClass('bg-surface-raised', 'border-sticker', 'rounded-full');
    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    const beta = screen.getByRole('tab', { name: 'Beta' });
    expect(alpha).toHaveAttribute('data-state', 'active');
    expect(alpha).toHaveClass('data-[state=active]:bg-surface', 'data-[state=active]:border-outline');

    await userEvent.click(beta);
    expect(beta).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Panel B')).toBeVisible();

    beta.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(alpha).toHaveFocus();
  });
});

describe('FilterChip', () => {
  it('reports its pressed state and uses accent-solid with on-accent text when active', () => {
    render(
      <FilterChipGroup label="Filter">
        <FilterChip active count={3}>
          All
        </FilterChip>
        <FilterChip active={false}>Done</FilterChip>
      </FilterChipGroup>,
    );
    const on = screen.getByRole('button', { name: /All/ });
    const off = screen.getByRole('button', { name: 'Done' });
    expect(on).toHaveAttribute('aria-pressed', 'true');
    expect(on).toHaveClass('bg-primary', 'text-on-accent', 'shadow-sticker-sm', 'border-outline');
    expect(off).toHaveAttribute('aria-pressed', 'false');
    expect(off).toHaveClass('bg-surface');
    expect(off).not.toHaveClass('bg-primary');
    expect(within(on).getByText('3')).toBeInTheDocument();
  });

  it('keeps the focus-ring padding on the group so the ring is not clipped', () => {
    render(<FilterChipGroup label="Filter">x</FilterChipGroup>);
    expect(screen.getByRole('group', { name: 'Filter' })).toHaveClass('-m-1', 'p-1', 'overflow-x-auto');
  });
});

describe('Badge', () => {
  it.each([
    ['default', 'bg-surface-raised', 'text-ink-secondary'],
    ['brand', 'bg-brand-soft', 'text-brand-ink'],
    ['success', 'bg-success-bg', 'text-success-ink'],
    ['warning', 'bg-warning-bg', 'text-warning-ink'],
    ['destructive', 'bg-danger-bg', 'text-danger-ink'],
    ['info', 'bg-info-bg', 'text-info-ink'],
    ['ai', 'bg-ai-bg', 'text-ai-ink'],
  ] as const)('%s tone pairs its soft fill with the matching -ink text', (variant, bg, text) => {
    render(<Badge variant={variant}>Tag</Badge>);
    expect(screen.getByText('Tag')).toHaveClass('border-2', 'border-outline', 'rounded-full', bg, text);
  });
});

describe('Card', () => {
  it('is a sticker and keeps its parts', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('sticker');
    expect(screen.getByRole('heading', { name: 'Title' })).toHaveClass('font-heading');
  });
});

describe('Avatar', () => {
  it('picks the same candy colour for the same name, every time', () => {
    expect(avatarCandyClass('Dinh')).toBe(avatarCandyClass('Dinh'));
    expect(avatarCandyClass('Dinh')).toMatch(/^bg-candy-(tomato|mint|butter|lilac|sky|peach)$/);
  });

  it('is stable across releases (pinned values)', () => {
    expect(['Dinh', 'Tomo', 'Study Bro', ''].map(avatarCandyClass)).toMatchInlineSnapshot(`
      [
        "bg-candy-sky",
        "bg-candy-butter",
        "bg-candy-peach",
        "bg-candy-peach",
      ]
    `);
  });

  it('spreads different names over several candies', () => {
    const names = ['An', 'Binh', 'Chi', 'Dung', 'Em', 'Phuc', 'Giang', 'Hoa', 'Khoa', 'Linh', 'Minh', 'Nam'];
    expect(new Set(names.map(avatarCandyClass)).size).toBeGreaterThanOrEqual(4);
  });

  it('colours the fallback by its initials, or by an explicit name', () => {
    render(
      <>
        <Avatar data-testid="a">
          <AvatarFallback>ND</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback name="Dinh">X</AvatarFallback>
        </Avatar>
      </>,
    );
    expect(screen.getByText('ND')).toHaveClass(avatarCandyClass('ND'), 'text-on-accent');
    expect(screen.getByText('X')).toHaveClass(avatarCandyClass('Dinh'));
    expect(screen.getByTestId('a')).toHaveClass('rounded-full', 'border-outline');
  });
});

describe('Skeleton, Kbd, Separator', () => {
  it('skeleton uses the shimmer class (disabled by CSS under reduced motion)', () => {
    render(<Skeleton data-testid="s" className="h-4 w-20" />);
    expect(screen.getByTestId('s')).toHaveClass('skeleton', 'h-4', 'w-20');
    expect(screen.getByTestId('s')).not.toHaveClass('animate-pulse');
  });

  it('kbd is an outlined key cap', () => {
    render(<Kbd>⌘K</Kbd>);
    expect(screen.getByText('⌘K').tagName).toBe('KBD');
    expect(screen.getByText('⌘K')).toHaveClass('border-outline');
  });

  it('separator is decorative by default and can be vertical', () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute('role', 'none');
    const vertical = render(<Separator orientation="vertical" decorative={false} />);
    expect(vertical.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
});

describe('StatStrip', () => {
  it('renders each stat as a sticker tile with a big figure and an icon tile', () => {
    render(
      <StatStrip
        items={[
          { label: 'Focus', value: '2h 10m', icon: Timer },
          { label: 'Sessions', value: 5, hint: 'today' },
          { label: 'Streak', value: 3, icon: Timer, tone: 'mint' },
        ]}
      />,
    );
    expect(screen.getByText('2h 10m')).toHaveClass('font-heading', 'font-extrabold');
    expect(screen.getByText('Focus').closest('div')).toHaveClass('sticker-sm');
    expect(document.querySelectorAll('[data-tone]')).toHaveLength(2);
    expect(document.querySelector('[data-tone="mint"]')).not.toBeNull();
    expect(screen.getByText('today')).toBeInTheDocument();
  });
});

describe('PageHeader, Table, Loader', () => {
  it('page header shows title, description and actions', () => {
    render(<PageHeader title="History" description="Your sessions" actions={<button>Export</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'History' })).toHaveClass('font-extrabold');
    expect(screen.getByText('Your sessions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('table header carries the outline rule and heading font', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Mon</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('columnheader', { name: 'Day' })).toHaveClass('font-heading');
    expect(screen.getByRole('row', { name: 'Mon' })).toHaveClass('data-[state=selected]:bg-brand-soft');
  });

  it('loader announces itself as a status and shows Tomo', () => {
    const { container } = render(<Loader title="Loading" subtitle="One moment" size="sm" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(container.querySelector('svg[data-face]')).not.toBeNull();
  });
});

describe('EmptyState', () => {
  it('shows Tomo (happy by default), title, description and one action on a sticker card', () => {
    const { container } = render(
      <EmptyState title="No tasks yet" description="Add your first one." action={<button>Add task</button>} />,
    );
    expect(container.firstChild).toHaveClass('sticker');
    expect(container.querySelector('svg')).toHaveAttribute('data-face', 'happy');
    expect(screen.getByRole('heading', { name: 'No tasks yet' })).toBeInTheDocument();
    expect(screen.getByText('Add your first one.')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('takes another face', () => {
    const { container } = render(<EmptyState title="Oops" face="worried" />);
    expect(container.querySelector('svg')).toHaveAttribute('data-face', 'worried');
  });
});
