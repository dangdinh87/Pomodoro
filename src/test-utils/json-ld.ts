/** Every `<script type="application/ld+json">` of a rendered page, parsed. Tests use it to check structured data. */
export function jsonLdOf(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => JSON.parse(match[1]));
}

export const typesOf = (html: string) => jsonLdOf(html).map((item) => item['@type']);
