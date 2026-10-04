import nextConfig from '../../next.config';

describe('next.config redirects', () => {
  const load = async () => (await nextConfig.redirects?.()) ?? [];

  it.each(['/leaderboard', '/chat'])('%s (a page that was cut) goes to the app with a permanent 308', async (source) => {
    const rule = (await load()).find((r) => r.source === source);
    expect(rule).toEqual({ source, destination: '/', permanent: true });
  });

  it('former pages still open their panel on the one-page app', async () => {
    const rules = await load();
    expect(rules.find((r) => r.source === '/tasks')?.destination).toBe('/?panel=tasks');
    expect(rules.find((r) => r.source === '/timer')?.destination).toBe('/');
  });

  it('never redirects into another redirect (no chains)', async () => {
    const rules = await load();
    const sources = new Set(rules.map((r) => r.source));
    for (const rule of rules) {
      const path = rule.destination.split('?')[0];
      expect(sources.has(path) && path !== rule.source, `${rule.source} -> ${rule.destination}`).toBe(false);
    }
  });
});
