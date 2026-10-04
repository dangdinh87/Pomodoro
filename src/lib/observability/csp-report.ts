/**
 * Content-Security-Policy violation reports -> the shared error reporter.
 * Browsers send one of two formats:
 *  - report-uri:  `application/csp-report`, one object `{ "csp-report": { "blocked-uri": ... } }`
 *  - report-to:   `application/reports+json`, an array of `{ type: "csp-violation", body: { blockedURL: ... } }`
 * Both are normalized to one shape. URLs lose their query string and fragment before they are kept.
 */
import type { ErrorReport } from './error-reporter';

export interface CspViolation {
  documentUri: string;
  blockedUri: string;
  directive: string;
  disposition: string;
  sourceFile: string;
}

const MAX_PER_REQUEST = 10;
const MAX_FIELD = 200;
// Extensions inject scripts and styles into every page; those reports say nothing about this app.
const EXTENSION_SCHEME = /^(?:chrome|moz|safari|safari-web|ms-browser)-extension:/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const text = (value: unknown) => (typeof value === 'string' ? (value.split(/[?#]/)[0] ?? '').slice(0, MAX_FIELD) : '');

function normalize(fields: Record<string, unknown>, keys: { doc: string; blocked: string; effective: string; violated?: string; disposition: string; source: string }): CspViolation | null {
  const blockedUri = text(fields[keys.blocked]);
  const sourceFile = text(fields[keys.source]);
  if (EXTENSION_SCHEME.test(blockedUri) || EXTENSION_SCHEME.test(sourceFile)) return null;
  const violated = keys.violated ? text(fields[keys.violated]) : '';
  return {
    documentUri: text(fields[keys.doc]),
    blockedUri,
    directive: text(fields[keys.effective]) || violated.split(/\s+/)[0] || '',
    disposition: text(fields[keys.disposition]),
    sourceFile,
  };
}

const LEGACY_KEYS = { doc: 'document-uri', blocked: 'blocked-uri', effective: 'effective-directive', violated: 'violated-directive', disposition: 'disposition', source: 'source-file' };
const REPORTING_API_KEYS = { doc: 'documentURL', blocked: 'blockedURL', effective: 'effectiveDirective', disposition: 'disposition', source: 'sourceFile' };

/** At most 10 violations from a parsed request body; anything that is not a CSP report yields an empty list. */
export function parseCspReports(body: unknown): CspViolation[] {
  const found: (CspViolation | null)[] = [];
  if (Array.isArray(body)) {
    for (const item of body) {
      if (isRecord(item) && item.type === 'csp-violation' && isRecord(item.body)) {
        found.push(normalize(item.body, REPORTING_API_KEYS));
      }
    }
  } else if (isRecord(body) && isRecord(body['csp-report'])) {
    found.push(normalize(body['csp-report'], LEGACY_KEYS));
  }
  return found.filter((v): v is CspViolation => v !== null).slice(0, MAX_PER_REQUEST);
}

/** Page path of a document URL (`https://host/vi/guide` -> `/vi/guide`); anything else is kept as given. */
function pagePath(documentUri: string): string {
  if (!/^https?:\/\//i.test(documentUri)) return documentUri;
  try {
    return new URL(documentUri).pathname;
  } catch {
    return documentUri;
  }
}

export function cspViolationToReport(violation: CspViolation): Partial<Record<keyof ErrorReport, unknown>> {
  const tags: Record<string, string> = {};
  if (violation.disposition) tags.disposition = violation.disposition;
  if (violation.sourceFile) tags.sourceFile = violation.sourceFile;
  return {
    source: 'csp',
    level: 'warning',
    name: 'CSPViolation',
    message: `${violation.directive || 'unknown-directive'} blocked ${violation.blockedUri || 'unknown'}`,
    route: pagePath(violation.documentUri),
    tags,
  };
}
