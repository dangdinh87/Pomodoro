import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('404 page', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('shows a sleepy Tomo with an accessible title, one h1 and one way back to the timer', async () => {
    render(await NotFound());

    const tomo = screen.getByTitle('Tomo the tomato mascot, fast asleep').closest('svg');
    expect(tomo).toHaveAttribute('role', 'img');
    expect(tomo).toHaveAttribute('data-face', 'sleepy');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Back to timer' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Read the guide' })).toHaveAttribute('href', '/guide');
  });

  it('follows the saved theme even though it renders outside the app providers', async () => {
    localStorage.setItem('theme', 'dark');
    render(await NotFound());

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('is light when nothing was saved', async () => {
    render(await NotFound());

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
