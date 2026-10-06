const BOUNDARIES = ['route-error', 'global-error'] as const;

export type ClientErrorBoundary = (typeof BOUNDARIES)[number];

export interface ClientErrorPayload {
  boundary: ClientErrorBoundary;
  message: string;
  name?: string;
  digest?: string;
  stack?: string;
  path?: string;
}

type ValidationResult = { success: true; data: ClientErrorPayload } | { success: false; error: string };

// Per field caps; the sanitizer trims further before anything is logged.
const MAX = { message: 2000, name: 100, digest: 100, stack: 6000, path: 300 } as const;

function optionalString(body: Record<string, unknown>, field: keyof typeof MAX): string | undefined | false {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || value.length > MAX[field]) return false;
  return value;
}

export function validateClientError(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { success: false, error: 'Request body must be an object' };
  }
  const input = body as Record<string, unknown>;

  const boundary = BOUNDARIES.find((b) => b === input.boundary);
  if (!boundary) return { success: false, error: 'Invalid boundary' };

  const message = optionalString(input, 'message');
  if (!message) return { success: false, error: 'Message is required and must be a short string' };

  const fields = { name: optionalString(input, 'name'), digest: optionalString(input, 'digest'), stack: optionalString(input, 'stack'), path: optionalString(input, 'path') };
  for (const [field, value] of Object.entries(fields)) {
    if (value === false) return { success: false, error: `${field} must be a short string` };
  }

  return { success: true, data: { boundary, message, ...(fields as Omit<ClientErrorPayload, 'boundary' | 'message'>) } };
}
