import { act, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { I18nProvider, type Lang } from '@/contexts/i18n-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from './alert-dialog';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';
import { Toaster } from './toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const CLOSE_LABEL: Record<Lang, string> = { en: 'Close', vi: 'Đóng', ja: '閉じる' };

function withLang(lang: Lang, ui: React.ReactNode) {
  return render(<I18nProvider initialLang={lang}>{ui}</I18nProvider>);
}

describe.each(Object.entries(CLOSE_LABEL) as [Lang, string][])('overlay close button in %s', (lang, label) => {
  it('names the Dialog close button in the UI language', () => {
    withLang(
      lang,
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });

  it('names the Sheet close button in the UI language', () => {
    withLang(
      lang,
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Body</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});

describe('overlay structure', () => {
  it('keeps the Dialog close button a direct child of the content (callers hide it with [&>button]:hidden)', () => {
    withLang(
      'en',
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.parentElement).toBe(screen.getByRole('dialog'));
  });

  it('lets callers restyle the Dialog card (full-viewport panels override the sticker look)', () => {
    withLang(
      'en',
      <Dialog open>
        <DialogContent className="border-0 shadow-none">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    const card = screen.getByRole('dialog');
    expect(card).toHaveClass('sticker-lg', 'border-0', 'shadow-none');
  });

  it('shows no close button on an AlertDialog and keeps both actions reachable', () => {
    withLang(
      'en',
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Reset?</AlertDialogTitle>
          <AlertDialogDescription>This clears the timer.</AlertDialogDescription>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction>Reset</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByRole('alertdialog')).toHaveClass('sticker-lg');
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('SheetHeader renders an icon tile only when an icon is given', () => {
    withLang(
      'en',
      <Sheet open>
        <SheetContent>
          <SheetHeader icon={<svg data-testid="glyph" />} iconTileClassName="bg-candy-sky">
            <SheetTitle>Sounds</SheetTitle>
            <SheetDescription>Mix ambient noise</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const tile = document.querySelector('[data-slot="sheet-icon-tile"]');
    expect(tile).toHaveClass('bg-candy-sky');
    expect(tile).toContainElement(screen.getByTestId('glyph'));
    expect(screen.getByRole('heading', { name: 'Sounds' })).toBeInTheDocument();
  });

  it('SheetHeader without an icon keeps the plain stacked layout', () => {
    withLang(
      'en',
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tasks</SheetTitle>
            <SheetDescription>Your list</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-icon-tile"]')).toBeNull();
  });
});

describe('select', () => {
  it('renders the trigger as a combobox showing the chosen value', () => {
    render(
      <Select value="rain">
        <SelectTrigger aria-label="Sound">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rain">Rain</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'Sound' })).toHaveTextContent('Rain');
  });
});

describe('command', () => {
  beforeAll(() => {
    // jsdom has no scrollIntoView; cmdk calls it when the active row changes.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders an outlined search field with grouped, selectable rows', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command" />
        <CommandList>
          <CommandGroup heading="Timer">
            <CommandItem>Start</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByPlaceholderText('Type a command')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Start' })).toBeInTheDocument();
  });
});

describe('toaster', () => {
  it('shows each tone in its own icon tile', async () => {
    render(<Toaster />);
    await act(async () => {
      toast.success('Saved');
      toast.error('Nope');
    });
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    const successTile = document.querySelector('[data-type="success"] [data-icon] > span');
    const errorTile = document.querySelector('[data-type="error"] [data-icon] > span');
    expect(successTile).toHaveClass('bg-success');
    expect(errorTile).toHaveClass('bg-danger');
  });
});

describe('tooltip', () => {
  it('is an ink bubble with surface text, 10px radius and no tilt (spec §5)', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Start timer</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const bubble = document.querySelector('[data-side]');
    expect(bubble).toHaveClass('bg-ink', 'text-surface', 'rounded-[10px]');
    expect(bubble?.className).not.toMatch(/tilt|rotate/);
  });
});
