/** Thrown by client helpers when the server answered HTTP 429, so the UI can show a specific message. */
export class TooManyRequestsError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'TooManyRequestsError';
  }
}
