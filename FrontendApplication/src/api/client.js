/**
 * Resolve API base URL from environment.
 * - Primary: REACT_APP_API_BASE_URL (Create React App)
 * - Fallback: if running at localhost:3000, use http://localhost:3001
 * - Otherwise, use same-origin (empty string -> relative paths)
 */
const rawEnvBase = (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim())
  ? process.env.REACT_APP_API_BASE_URL.trim()
  : '';

/**
 * Avoid double-protocol or trailing-slash mistakes. Normalize:
 * - Strip trailing slashes
 * - Ensure it's a fully qualified http(s) URL when provided
 */
function normalizeBaseUrl(u) {
  if (!u) return '';
  const noTrailing = u.replace(/\/*$/, '');
  // If already absolute http(s) URL, keep as-is after slash strip
  if (/^https?:\/\//i.test(noTrailing)) return noTrailing;
  // If someone mistakenly set it to a relative path, return empty to use same-origin
  return '';
}

const envBase = normalizeBaseUrl(rawEnvBase);

const isLocalDev3000 = typeof window !== 'undefined'
  && window.location
  && typeof window.location.origin === 'string'
  && window.location.origin.includes('localhost:3000');

const resolvedBaseURL = envBase || (isLocalDev3000 ? 'http://localhost:3001' : '');

// If no REACT_APP_API_BASE_URL is provided and not on localhost:3000, warn about same-origin usage.
// eslint-disable-next-line no-console
if (!envBase && !isLocalDev3000) {
  console.warn('[API Client] REACT_APP_API_BASE_URL not set and not on localhost:3000. Using same-origin relative paths. Ensure your frontend is reverse-proxying to the backend or set REACT_APP_API_BASE_URL.');
}

// Log once on module load to help diagnose connectivity
// eslint-disable-next-line no-console
console.info(`API Base URL resolved to: ${resolvedBaseURL || 'same-origin'}`);
try {
  const mocks = String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
  // eslint-disable-next-line no-console
  console.info(`API Mock mode: ${mocks ? 'ENABLED' : 'disabled'}`);
} catch (e) {
  // ignore
}

/**
 * Minimal client wrapper around fetch with JSON handling and base URL.
 * If resolvedBaseURL is empty, uses same-origin relative paths.
 * Preserves backend pagination shape compatibility and error propagation.
 */
async function request(path, options = {}) {
  // Ensure path formatting and safe URL concatenation
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolvedBaseURL ? resolvedBaseURL.replace(/\/*$/, '') : ''; // strip trailing slash when present
  const url = base ? `${base}${normalizedPath}` : normalizedPath;

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
    // Helpful guidance to surface CORS/DNS/base URL problems
    // eslint-disable-next-line no-console
    console.error(
      '[Network Error] Failed to reach backend.',
      {
        url,
        base: resolvedBaseURL || 'same-origin',
        hint: 'Check REACT_APP_API_BASE_URL, backend availability, and CORS configuration. If running locally, ensure backend listens on http://localhost:3001.',
        originalError: networkErr?.message || networkErr
      }
    );
    const err = new Error('Network error contacting API. See console for details.');
    err.cause = networkErr;
    throw err;
  }

  const contentType = (res.headers && res.headers.get && res.headers.get('content-type')) || '';
  let data = null;

  // Read a small snippet for error diagnostics if needed
  let textSnippet = '';
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const txt = await res.text();
      textSnippet = (txt || '').slice(0, 300);
      data = txt;
    }
  } catch (parseErr) {
    // eslint-disable-next-line no-console
    console.warn('[API Parse Warning] Could not parse response body', { url, status: res.status, contentType });
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      res.statusText ||
      'Request failed';
    const err = new Error(String(message));
    err.status = res.status;
    err.data = data;
    // eslint-disable-next-line no-console
    console.error('[API Error]', {
      url,
      status: res.status,
      statusText: res.statusText,
      contentType,
      message: String(message),
      bodySnippet: textSnippet || (typeof data === 'string' ? data.slice(0, 300) : undefined),
    });
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export function getBaseURL() {
  /** Returns the configured API base URL (from env or fallback). */
  return resolvedBaseURL;
}

// PUBLIC_INTERFACE
export function getUseMocks() {
  /** Returns whether mock mode is enabled (from env). Defaults to false. */
  return String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
}

// PUBLIC_INTERFACE
export const http = { request };
