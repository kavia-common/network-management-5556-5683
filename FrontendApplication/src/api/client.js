/**
 * Resolve API base URL from environment.
 * - Primary: REACT_APP_API_BASE_URL (Create React App)
 * - Fallback: if running at localhost:3000, use http://localhost:3001
 * - Otherwise, use same-origin (empty string -> relative paths)
 */
const envBase = (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim())
  ? process.env.REACT_APP_API_BASE_URL.trim()
  : '';

const isLocalDev3000 = typeof window !== 'undefined'
  && window.location
  && typeof window.location.origin === 'string'
  && window.location.origin.includes('localhost:3000');

const resolvedBaseURL = envBase || (isLocalDev3000 ? 'http://localhost:3001' : '');

// If no REACT_APP_API_BASE_URL is provided and not on localhost:3000, warn about same-origin usage.
if (!envBase && !isLocalDev3000) {
  // eslint-disable-next-line no-console
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

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

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

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    // eslint-disable-next-line no-console
    console.error('[API Error]', { url, status: res.status, message, data });
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
