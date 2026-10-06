/** @vitest-environment node */
import { readCappedText } from './read-capped-text';

const post = (body: BodyInit | null, headers: HeadersInit = {}) =>
  new Request('http://localhost/x', { method: 'POST', body, headers });

describe('readCappedText', () => {
  it('returns the body when it fits', async () => {
    expect(await readCappedText(post('héllo'), 100)).toBe('héllo');
  });

  it('returns an empty string for a request without a body', async () => {
    expect(await readCappedText(new Request('http://localhost/x', { method: 'POST' }), 100)).toBe('');
  });

  it('returns null when Content-Length already says it is too big', async () => {
    expect(await readCappedText(post('x', { 'content-length': '5000' }), 100)).toBeNull();
  });

  it('stops reading a body that outgrows the cap even without Content-Length', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunk = new TextEncoder().encode('a'.repeat(60));
        controller.enqueue(chunk);
        controller.enqueue(chunk);
        controller.enqueue(chunk);
        controller.close();
      },
    });
    const request = new Request('http://localhost/x', { method: 'POST', body: stream, duplex: 'half' } as RequestInit);
    expect(await readCappedText(request, 100)).toBeNull();
  });

  it('counts bytes, not characters', async () => {
    expect(await readCappedText(post('€'.repeat(40)), 100)).toBeNull(); // 120 bytes
  });
});
