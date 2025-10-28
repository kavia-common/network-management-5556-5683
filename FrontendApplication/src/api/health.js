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
