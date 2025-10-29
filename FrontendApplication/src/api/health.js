import { http } from './client';

/**
 * PUBLIC_INTERFACE
 * Check backend database name for verification.
 * Returns: { dbName: string }
 */
export async function getDbName() {
  const res = await http.request('/health/db-name', { method: 'GET' });
  return res;
}

/**
 * PUBLIC_INTERFACE
 * Check backend DB connectivity health.
 * Returns: { status: "ok" | "error", ... }
 */
export async function getDbHealth() {
  const res = await http.request('/health/db', { method: 'GET' });
  return res;
}

/**
 * PUBLIC_INTERFACE
 * Perform a lightweight backend health check.
 * Tries GET /health, falls back to GET /.
 * Returns: { ok: boolean, endpoint: string, raw?: any }
 */
export async function healthCheck() {
  try {
    const res = await http.request('/health', { method: 'GET' });
    return { ok: true, endpoint: '/health', raw: res };
  } catch (_) {
    try {
      const res2 = await http.request('/', { method: 'GET' });
      return { ok: true, endpoint: '/', raw: res2 };
    } catch (err) {
      // Normalize error
      const message = err?.message || 'Network error';
      const status = err?.status;
      return { ok: false, endpoint: '/health or /', error: { message, status, data: err?.data } };
    }
  }
}
