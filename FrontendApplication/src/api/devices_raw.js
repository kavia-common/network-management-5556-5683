import { http, getUseMocks } from './client';

/**
 * PUBLIC_INTERFACE
 * Fetch a raw array of all devices from the backend (or mocks) without pagination.
 * This is used by the frontend to perform client-side filtering when users apply
 * a search query or non-default filters and the backend is otherwise paginated.
 */
export async function listDevicesRaw() {
  const mock = getUseMocks();
  if (mock) {
    // Importing directly would create a circular dependency; instead, re-hit /devices and normalize.
    // In mock mode, /devices returns all items already via devices.js implementation.
    const { default: devicesModule } = await import('./devices');
    const res = await devicesModule.listDevices();
    // res.items is already normalized
    return Array.isArray(res.items) ? res.items : Array.isArray(res) ? res : [];
  }
  // Backend provides /devices/raw for a plain array of devices without envelope.
  // Fallback: if not available or returns non-array, return empty list.
  const data = await http.request('/devices/raw', { method: 'GET' }).catch(() => []);
  return Array.isArray(data) ? data.map((d) => ({
    ...d,
    id: d.id ?? d._id,
    ip: d.ip ?? d.ip_address ?? d.ipAddress,
  })) : [];
}
