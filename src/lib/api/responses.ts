import { NextResponse } from 'next/server';

export const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export const notFound = (message = 'Not found') =>
  NextResponse.json({ error: message }, { status: 404 });

export const badRequest = (message: string, details?: Record<string, string[]>) =>
  NextResponse.json({ error: message, details }, { status: 400 });

export const serverError = (message: string, error: unknown) => {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
};

/** Parsed JSON body, or `undefined` when the body is not valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
