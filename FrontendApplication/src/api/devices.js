import { http, getUseMocks } from './client';

// In-memory mock store
let mockDevices = [
  { id: '1', name: 'Core Router', ip: '192.168.0.1', type: 'router', location: 'DC-1', status: 'online' },
  { id: '2', name: 'Edge Switch', ip: '192.168.0.10', type: 'switch', location: 'DC-2', status: 'offline' },
  { id: '3', name: 'Web Server', ip: '10.0.0.5', type: 'server', location: 'HQ', status: 'online' }
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Helpers
const mapToServer = (d) => ({ ...d });
const mapFromServer = (d) => ({ ...d, id: d.id ?? d._id });

// PUBLIC_INTERFACE
export async function listDevices() {
  /** Fetch devices list from backend or mock store. */
  const mock = getUseMocks();
  if (mock) {
    await delay(200);
    return [...mockDevices];
  }
  const data = await http.request('/devices', { method: 'GET' });
  return Array.isArray(data) ? data.map(mapFromServer) : [];
}

// PUBLIC_INTERFACE
export async function getDevice(id) {
  /** Fetch a single device by id from backend or mock store. */
  const mock = getUseMocks();
  if (mock) {
    await delay(150);
    const found = mockDevices.find((d) => d.id === id);
    if (!found) {
      const err = new Error('Device not found');
      err.status = 404;
      throw err;
    }
    return { ...found };
  }
  const data = await http.request(`/devices/${encodeURIComponent(id)}`, { method: 'GET' });
  return mapFromServer(data);
}

// PUBLIC_INTERFACE
export async function createDevice(payload) {
  /** Create a new device. On mock, simulates uniqueness by name or IP. */
  const mock = getUseMocks();
  if (mock) {
    await delay(200);
    if (mockDevices.some(d => d.name.toLowerCase() === payload.name.toLowerCase() || d.ip === payload.ip)) {
      const err = new Error('Device with same name or IP already exists.');
      err.status = 400;
      err.data = { field: 'name', message: 'Device name or IP must be unique.' };
      throw err;
    }
    const newDev = { ...payload, id: String(Date.now()) };
    mockDevices.push(newDev);
    return newDev;
  }
  const data = await http.request('/devices', {
    method: 'POST',
    body: JSON.stringify(mapToServer(payload))
  });
  return mapFromServer(data);
}

// PUBLIC_INTERFACE
export async function updateDevice(id, payload) {
  /** Update device by id. */
  const mock = getUseMocks();
  if (mock) {
    await delay(200);
    const idx = mockDevices.findIndex((d) => d.id === id);
    if (idx === -1) {
      const err = new Error('Device not found');
      err.status = 404;
      throw err;
    }
    // uniqueness check
    const conflict = mockDevices.find(d => (d.name.toLowerCase() === payload.name.toLowerCase() || d.ip === payload.ip) && d.id !== id);
    if (conflict) {
      const err = new Error('Device with same name or IP already exists.');
      err.status = 400;
      err.data = { field: 'name', message: 'Device name or IP must be unique.' };
      throw err;
    }
    mockDevices[idx] = { ...mockDevices[idx], ...payload };
    return { ...mockDevices[idx] };
  }
  const data = await http.request(`/devices/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(mapToServer(payload))
  });
  return mapFromServer(data);
}

// PUBLIC_INTERFACE
export async function deleteDevice(id) {
  /** Delete device by id. */
  const mock = getUseMocks();
  if (mock) {
    await delay(150);
    mockDevices = mockDevices.filter((d) => d.id !== id);
    return { success: true };
  }
  return http.request(`/devices/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// PUBLIC_INTERFACE
export async function pingDevice(id) {
  /** Trigger status refresh for a device (ping). Returns updated device. */
  const mock = getUseMocks();
  if (mock) {
    await delay(300);
    const idx = mockDevices.findIndex((d) => d.id === id);
    if (idx === -1) {
      const err = new Error('Device not found');
      err.status = 404;
      throw err;
    }
    // flip status for demo
    const current = mockDevices[idx];
    const updated = { ...current, status: current.status === 'online' ? 'offline' : 'online' };
    mockDevices[idx] = updated;
    return { ...updated };
  }
  const data = await http.request(`/devices/${encodeURIComponent(id)}/ping`, { method: 'POST' });
  return mapFromServer(data);
}
