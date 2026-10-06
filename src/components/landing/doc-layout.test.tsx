import { render, screen, within } from '@testing-library/react';
import { DocLayout, P, type DocSection } from './doc-layout';

const sections: DocSection[] = [
  { id: 'one', title: 'First part', body: <P>Hello **bold** world.</P> },
  { id: 'two', title: 'Second part', body: <P>More text.</P> },
];

describe('DocLayout', () => {
  it('has one h1, a chip per section that links to its anchor, and the sections on one sticker card', () => {
    render(<DocLayout title="Title" lead="Lead" tocLabel="On this page" sections={sections} />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const toc = screen.getByRole('navigation', { name: 'On this page' });
    const links = within(toc).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#one', '#two']);
    expect(links[0]).toHaveTextContent('1First part');

    const article = screen.getByRole('article');
    expect(article).toHaveClass('sticker-lg');
    expect(within(article).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['1First part', '2Second part']);
    expect(article.querySelector('strong')).toHaveTextContent('bold');
  });

  it('renders the last-updated pill as a machine-readable <time> when a date is given', () => {
    const { rerender } = render(<DocLayout title="T" lead="L" meta="Last updated: October 5, 2026" metaDateTime="2026-10-05" tocLabel="Toc" sections={sections} />);
    expect(screen.getByText('Last updated: October 5, 2026').tagName).toBe('TIME');
    expect(screen.getByText('Last updated: October 5, 2026')).toHaveAttribute('datetime', '2026-10-05');

    rerender(<DocLayout title="T" lead="L" meta="Updated" tocLabel="Toc" sections={sections} />);
    expect(screen.getByText('Updated').tagName).toBe('SPAN');
  });

  it('puts content passed as `after` inside the reading card', () => {
    render(<DocLayout title="T" lead="L" tocLabel="Toc" sections={sections} after={<p>after-slot</p>} />);

    expect(within(screen.getByRole('article')).getByText('after-slot')).toBeInTheDocument();
  });
});
