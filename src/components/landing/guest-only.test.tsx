import { renderToString } from 'react-dom/server';
import { act, render, screen } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth-store';
import { GuestOnly } from './guest-only';

const tree = (
  <GuestOnly>
    <p>FAQ for everyone</p>
  </GuestOnly>
);

describe('GuestOnly', () => {
  afterEach(() => useAuthStore.setState({ user: null }));

  it('is in the server HTML even when the browser holds a member session', () => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.c', isAnonymous: false } });
    expect(renderToString(tree)).toContain('FAQ for everyone');
  });

  it('shows to visitors without a session and to guest sessions', () => {
    const { unmount } = render(tree);
    expect(screen.getByText('FAQ for everyone')).toBeInTheDocument();
    unmount();

    useAuthStore.setState({ user: { id: 'g1', isAnonymous: true } });
    render(tree);
    expect(screen.getByText('FAQ for everyone')).toBeInTheDocument();
  });

  it('disappears for a signed-in member, and comes back after sign-out', () => {
    useAuthStore.setState({ user: { id: 'u1', email: 'a@b.c', isAnonymous: false } });
    render(tree);
    expect(screen.queryByText('FAQ for everyone')).not.toBeInTheDocument();

    act(() => useAuthStore.setState({ user: null }));
    expect(screen.getByText('FAQ for everyone')).toBeInTheDocument();
  });
});
