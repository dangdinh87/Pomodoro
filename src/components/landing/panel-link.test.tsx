import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, type Lang } from '@/test-utils/i18n';
import { PanelLink } from './panel-link';

const { pathname, openPanel } = vi.hoisted(() => ({ pathname: { current: '/' }, openPanel: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => pathname.current,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/features/app-shell/panel-store', () => ({ openPanel }));

const renderLink = (lang: Lang, path: string) => {
  pathname.current = path;
  render(
    <I18nProvider initialLang={lang}>
      <PanelLink panel="tasks">Tasks</PanelLink>
    </I18nProvider>,
  );
  return screen.getByRole('link', { name: 'Tasks' });
};

// jsdom cannot navigate; a plain link click would only log "not implemented"
const swallowNavigation = (e: Event) => e.preventDefault();

describe('PanelLink', () => {
  beforeEach(() => {
    openPanel.mockClear();
    document.addEventListener('click', swallowNavigation);
  });
  afterEach(() => document.removeEventListener('click', swallowNavigation));

  it.each([
    ['en', '/?panel=tasks'],
    ['vi', '/vi?panel=tasks'],
    ['ja', '/ja?panel=tasks'],
  ] as const)('keeps the language in the %s link', (lang, href) => {
    expect(renderLink(lang, '/').getAttribute('href')).toBe(href);
  });

  it.each([
    ['en', '/'],
    ['vi', '/vi'],
    ['ja', '/ja'],
  ] as const)('opens the panel in place on the %s app page', async (lang, path) => {
    await userEvent.click(renderLink(lang, path));
    expect(openPanel).toHaveBeenCalledWith('tasks');
  });

  it('navigates normally from a content page', async () => {
    await userEvent.click(renderLink('vi', '/vi/guide'));
    expect(openPanel).not.toHaveBeenCalled();
  });
});
