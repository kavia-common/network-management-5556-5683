/**
 * Resolve API base URL from environment.
 * - Strict: must be REACT_APP_API_BASE_URL (absolute URL). No same-origin fallback.
 * - For local convenience, if not set and running on localhost:3000, use http://localhost:3001
 *   but emit a strong warning. In all other cases, throw on missing base URL.
 */
const rawEnvBase = (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim())
  ? process.env.REACT_APP_API_BASE_URL.trim()
  : '';

function normalizeBaseUrl(u) {
  if (!u) return '';
  const noTrailing = u.replace(/\/*$/, '');
  return /^https?:\/\//i.test(noTrailing) ? noTrailing : '';
}

const envBase = normalizeBaseUrl(rawEnvBase);
const isLocalDev3000 = typeof window !== 'undefined'
  && window.location
  && typeof window.location.origin === 'string'
  && window.location.origin.includes('localhost:3000');

// Strict absolute base resolution
let resolvedBaseURL = envBase;
if (!resolvedBaseURL) {
  if (isLocalDev3000) {
    resolvedBaseURL = 'http://localhost:3001';
    // eslint-disable-next-line no-console
    console.warn('[API Client] REACT_APP_API_BASE_URL not set. Falling back to http://localhost:3001 for local development only.');
  } else {
    // eslint-disable-next-line no-console
    console.error('[API Client] REACT_APP_API_BASE_URL is required and must be an absolute URL. Set it in your environment.');
    // Keep empty to cause explicit failure on first request, avoiding silent same-origin usage.
    resolvedBaseURL = '';
  }
}

// Log once on module load to help diagnose connectivity
// eslint-disable-next-line no-console
console.info(`API Base URL resolved to: ${resolvedBaseURL || '(unset - requests will fail)'}`);
try {
  const mocks = String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
  // eslint-disable-next-line no-console
  console.info(`API Mock mode: ${mocks ? 'ENABLED' : 'disabled'}`);
} catch {
  // ignore
}

/**
 * Minimal client wrapper around fetch with JSON handling and base URL.
 * - Always uses absolute base URL (no same-origin).
 * - Accepts JSON when Content-Type includes application/json (case-insensitive, with optional charset).
 * - Tolerates non-JSON or empty bodies (e.g., 204/OPTIONS).
 * - Surfaces non-2xx errors; does not throw for 2xx with JSON.
 * - Adds concise diagnostics to console: status, content type, first 200 chars of body.
 */
async function request(path, options = {}) {
  if (!resolvedBaseURL) {
    const err = new Error('API base URL is not configured. Set REACT_APP_API_BASE_URL.');
    // eslint-disable-next-line no-console
    console.error('[API Config Error]', err.message);
    throw err;
  }

  // Ensure path formatting and safe URL concatenation
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolvedBaseURL.replace(/\/*$/, ''); // strip trailing slash when present
  const url = `${base}${normalizedPath}`;

  // Default to omit credentials to avoid unexpected CORS failures if backend does not allow cookies
  const { credentials = 'omit' } = options;

  // Only set JSON Content-Type if we actually send a body; GET/DELETE should not force it
  const baseHeaders = options.headers || {};
  const hasBody = typeof options.body !== 'undefined' && options.body !== null;
  const headers = hasBody
    ? { 'Content-Type': 'application/json', ...baseHeaders }
    : { ...baseHeaders };

  let res;
  try {
    res = await fetch(url, { ...options, headers, credentials });
  } catch (networkErr) {
    // eslint-disable-next-line no-console
    console.error('[Network Error] Failed to reach backend.', {
      url,
      base: resolvedBaseURL,
      hint: 'Check REACT_APP_API_BASE_URL, backend availability, and CORS configuration.',
      originalError: networkErr?.message || networkErr
    });
    const err = new Error('Network error contacting API. See console for details.');
    err.cause = networkErr;
    throw err;
  }

  const status = res.status;
  const contentTypeRaw = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  const contentType = String(contentTypeRaw).toLowerCase();
  let data = null;
  let bodyText = '';

  // Read body safely: handle empty (content-length 0 or 204/no-content) and non-JSON
  try {
    const isJson = /application\/json/i.test(contentTypeRaw);
    if (status === 204 || status === 205 || options.method === 'OPTIONS') {
      data = null;
      bodyText = '';
    } else if (isJson) {
      data = await res.json();
      bodyText = JSON.stringify(data).slice(0, 200);
    } else {
      // Try text; it's fine if empty
      const txt = await res.text();
      bodyText = (txt || '').slice(0, 200);
      data = txt;
      // If content-type absent but body looks like JSON, attempt a safe parse
      if (!contentType && bodyText.trim().startsWith('{')) {
        try {
          data = JSON.parse(txt);
        } catch {
          // keep as text
        }
      }
    }
  } catch (parseErr) {
    // eslint-disable-next-line no-console
    console.warn('[API Parse Warning] Could not parse response body', { url, status, contentType: contentTypeRaw });
  }

  // Concise diagnostics for every response
  // eslint-disable-next-line no-console
  console.debug('[API Response]', { url, status, contentType: contentTypeRaw || '(none)', bodyPreview: bodyText });

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      res.statusText ||
      'Request failed';
    const err = new Error(String(message));
    err.status = status;
    err.data = data;
    // eslint-disable-next-line no-console
    console.error('[API Error]', {
      url,
      status,
      statusText: res.statusText,
      contentType: contentTypeRaw,
      message: String(message),
      bodySnippet: bodyText
    });
    throw err;
  }

  // For 2xx, return parsed data (could be null for 204)
  return data;
}

// PUBLIC_INTERFACE
export function getBaseURL() {
  /** Returns the configured API base URL (from env). */
  return resolvedBaseURL;
}

// PUBLIC_INTERFACE
export function getUseMocks() {
  /** Returns whether mock mode is enabled (from env). Defaults to false. */
  return String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
}

// PUBLIC_INTERFACE
export const http = { request };
