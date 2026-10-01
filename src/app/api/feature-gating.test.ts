/**
 * @jest-environment node
 */
import { createClient } from '@/lib/supabase-server';
import * as conversations from './conversations/route';
import * as conversationById from './conversations/[id]/route';
import * as messages from './conversations/[id]/messages/route';
import * as leaderboard from './leaderboard/route';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const req = (method = 'GET') => new Request('http://localhost/api/x', { method });
const params = { params: Promise.resolve({ id: 'abc' }) };

describe('feature-gated APIs return 404 when the flag is off', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FEATURE_CHAT;
    delete process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD;
  });

  it.each([
    ['conversations GET', () => conversations.GET()],
    ['conversations POST', () => conversations.POST(req('POST'))],
    ['conversations/[id] GET', () => conversationById.GET(req(), params)],
    ['conversations/[id] PATCH', () => conversationById.PATCH(req('PATCH'), params)],
    ['conversations/[id] DELETE', () => conversationById.DELETE(req('DELETE'), params)],
    ['messages GET', () => messages.GET(req(), params)],
    ['messages POST', () => messages.POST(req('POST'), params)],
    ['leaderboard GET', () => leaderboard.GET(req())],
    ['leaderboard POST', () => leaderboard.POST(req('POST'))],
  ])('%s', async (_name, call) => {
    const res = await call();
    expect(res.status).toBe(404);
    expect(createClient).not.toHaveBeenCalled();
  });
});
