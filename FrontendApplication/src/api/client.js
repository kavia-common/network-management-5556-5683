const baseURL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Minimal client wrapper around fetch with JSON handling and base URL.
 */
async function request(path, options = {}) {
  const url = `${baseURL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export function getBaseURL() {
  /** Returns the configured API base URL (from env). */
  return baseURL;
}

// PUBLIC_INTERFACE
export function getUseMocks() {
  /** Returns whether mock mode is enabled (from env). */
  return String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
}

// PUBLIC_INTERFACE
export const http = { request };
