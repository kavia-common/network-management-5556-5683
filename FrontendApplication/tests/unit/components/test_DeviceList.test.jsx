import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock toast context to avoid rendering actual toasts
jest.mock('../../src/hooks/useToast', () => ({
  useToastContext: () => ({ addToast: jest.fn() }),
}));

// Mock API modules
jest.mock('../../src/api/devices', () => ({
  listDevices: jest.fn(),
  deleteDevice: jest.fn(),
}));
jest.mock('../../src/api/devices_raw', () => ({
  listDevicesRaw: jest.fn(),
}));

import DeviceList from '../../src/components/Devices/DeviceList';
import { listDevices, deleteDevice } from '../../src/api/devices';
import { listDevicesRaw } from '../../src/api/devices_raw';

function renderWithRouter(ui, { route = '/devices' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('DeviceList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleItems = [
    { id: '1', name: 'Router A', ip: '192.168.0.1', type: 'router', location: 'DC', status: 'online', last_checked: null },
    { id: '2', name: 'Switch B', ip: '10.0.0.2', type: 'switch', location: 'HQ', status: 'offline', last_checked: null },
    { id: '3', name: 'Server C', ip: '10.0.0.3', type: 'server', location: 'HQ', status: 'online', last_checked: null },
  ];

  test('renders list, filters, and pagination from server-paginated response', async () => {
    listDevices.mockResolvedValue({
      items: sampleItems.slice(0, 2),
      total: 3,
      page: 1,
      limit: 2,
      serverPaginated: true,
    });

    renderWithRouter(<DeviceList />);

    // Spinner first
    expect(screen.getByText(/Loading devices/i)).toBeInTheDocument();

    // Wait for rows
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Devices table/i })).toBeInTheDocument();
    });

    // Should show 2 rows from page 1
    const region = screen.getByRole('region', { name: /Devices table/i });
    const rows = within(region).getAllByRole('row');
    // rows include header, so at least 3
    expect(rows.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Router A')).toBeInTheDocument();
    expect(screen.getByText('Switch B')).toBeInTheDocument();
  });

  test('client-side filtering triggers raw fetch when serverPaginated initially', async () => {
    // Initial load indicates server pagination
    listDevices.mockResolvedValueOnce({
      items: sampleItems.slice(0, 2),
      total: 3,
      page: 1,
      limit: 2,
      serverPaginated: true,
    });
    // Raw list for filter path
    listDevicesRaw.mockResolvedValue(sampleItems);

    renderWithRouter(<DeviceList />);

    await screen.findByRole('region', { name: /Devices table/i });

    // Type into search to trigger filter
    const search = screen.getByRole('searchbox', { name: /Search devices/i });
    fireEvent.change(search, { target: { value: 'Server' } });

    // After debounce and raw fetch, expect "Server C"
    await waitFor(() => {
      expect(listDevicesRaw).toHaveBeenCalled();
      expect(screen.getByText('Server C')).toBeInTheDocument();
    });
  });

  test('delete action calls API and reloads', async () => {
    // First load: server paginated false (client-side)
    listDevices.mockResolvedValueOnce({
      items: sampleItems,
      total: 3,
      page: 1,
      limit: 3,
      serverPaginated: false,
    });

    deleteDevice.mockResolvedValue({ success: true });

    // Confirm dialog needs to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    renderWithRouter(<DeviceList />);

    await screen.findByText('Router A');

    // Click delete for first row
    const deleteBtn = screen.getByRole('button', { name: /Delete Router A/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteDevice).toHaveBeenCalledWith('1');
    });
  });

  test('shows empty state when no devices', async () => {
    listDevices.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      serverPaginated: true,
    });

    renderWithRouter(<DeviceList />);

    await waitFor(() =>
      expect(screen.getByRole('status', { name: /No devices match/i })).toBeInTheDocument()
    );
  });
});
