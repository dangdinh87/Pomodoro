/**
 * Minimal chainable Supabase client mock for route handler tests.
 *
 * Every query-builder method (select/eq/gte/insert/single/...) is recorded and
 * returns the same builder; awaiting the builder resolves to the configured
 * result. Results can be queued per table to model successive queries.
 */

export interface MockQueryResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

export interface RecordedCall {
  method: string;
  args: unknown[];
}

export interface MockQueryBuilder {
  calls: RecordedCall[];
  [method: string]: any;
}

export function createQueryBuilder(result: MockQueryResult): MockQueryBuilder {
  const calls: RecordedCall[] = [];
  const settled = { data: null, error: null, count: null, ...result };

  const builder: MockQueryBuilder = new Proxy({ calls } as MockQueryBuilder, {
    get(target, prop) {
      if (prop === 'calls') return target.calls;
      if (prop === 'then') {
        return (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve(settled).then(resolve, reject);
      }
      return (...args: unknown[]) => {
        calls.push({ method: String(prop), args });
        return builder;
      };
    },
  });

  return builder;
}

export interface SupabaseMockOptions {
  user?: { id: string } | null;
  /** One result per table, or a queue consumed in order (last one repeats). */
  tables?: Record<string, MockQueryResult | MockQueryResult[]>;
  rpcResult?: MockQueryResult;
}

export function createSupabaseMock({ user = null, tables = {}, rpcResult = {} }: SupabaseMockOptions = {}) {
  const builders: Record<string, MockQueryBuilder[]> = {};
  const queues: Record<string, MockQueryResult[]> = {};

  Object.entries(tables).forEach(([table, results]) => {
    queues[table] = Array.isArray(results) ? [...results] : [results];
  });

  const from = jest.fn((table: string) => {
    const queue = queues[table] ?? [{}];
    const result = queue.length > 1 ? queue.shift()! : queue[0];
    const builder = createQueryBuilder(result);
    (builders[table] ??= []).push(builder);
    return builder;
  });

  const client = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('No session'),
      }),
    },
    from,
    rpc: jest.fn().mockResolvedValue({ data: null, error: null, ...rpcResult }),
  };

  /** All calls recorded on the builders created for `table`, flattened. */
  const callsFor = (table: string) => (builders[table] ?? []).flatMap((b) => b.calls);

  return { client, builders, callsFor };
}

export function jsonRequest(url: string, body: unknown, init: RequestInit = {}) {
  const { headers, ...rest } = init;
  return new Request(url, {
    method: 'POST',
    ...rest,
    // Merge (not replace) so callers can add headers and keep the JSON content type
    headers: { 'Content-Type': 'application/json', ...((headers as Record<string, string>) ?? {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
