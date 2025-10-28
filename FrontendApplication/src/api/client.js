 /**
  * Resolve API base URL from environment.
  * - Primary: REACT_APP_API_BASE_URL (Create React App)
  * - Fallback: http://localhost:3001 when not set to ensure working local CORS setup
  */
const resolvedBaseURL = (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim())
  ? process.env.REACT_APP_API_BASE_URL.trim()
  : 'http://localhost:3001';

/**
 * Minimal client wrapper around fetch with JSON handling and base URL.
 * Preserves backend pagination shape compatibility and error propagation.
 */
async function request(path, options = {}) {
  // Ensure path formatting and safe URL concatenation
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolvedBaseURL.replace(/\/*$/, ''); // strip trailing slash
  const url = `${base}${normalizedPath}`;

  // Default to omit credentials to avoid unexpected CORS failures if backend does not allow cookies
  const { credentials = 'omit' } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers, credentials });
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
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export function getBaseURL() {
  /** Returns the configured API base URL (from env). */
  return resolvedBaseURL;
}

// PUBLIC_INTERFACE
export function getUseMocks() {
  /** Returns whether mock mode is enabled (from env). */
  return String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
}

// PUBLIC_INTERFACE
export const http = { request };
