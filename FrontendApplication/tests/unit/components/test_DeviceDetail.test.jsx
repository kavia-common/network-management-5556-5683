import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('../../src/hooks/useToast', () => ({
  useToastContext: () => ({ addToast: jest.fn() }),
}));

jest.mock('../../src/api/devices', () => ({
  getDevice: jest.fn(),
  pingDevice: jest.fn(),
}));

import DeviceDetail from '../../src/components/Devices/DeviceDetail';
import { getDevice, pingDevice } from '../../src/api/devices';

function renderDetail(id = '5') {
  return render(
    <MemoryRouter initialEntries={[`/devices/${id}`]}>
      <Routes>
        <Route path="/devices/:id" element={<DeviceDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeviceDetail', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays device details', async () => {
    getDevice.mockResolvedValue({
      id: '5', name: 'File Server', ip: '10.0.0.5', type: 'server', location: 'HQ', status: 'online',
      last_checked: new Date().toISOString()
    });

    renderDetail('5');

    expect(screen.getByText(/Loading device/i)).toBeInTheDocument();
    await screen.findByRole('heading', { name: 'File Server' });

    expect(screen.getByText(/IP/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Location/i)).toBeInTheDocument();
  });

  test('refresh status triggers ping and updates UI', async () => {
    getDevice.mockResolvedValue({ id: '5', name: 'Node5', ip: '10.0.0.5', type: 'server', location: 'HQ', status: 'offline' });
    pingDevice.mockResolvedValue({ id: '5', name: 'Node5', ip: '10.0.0.5', type: 'server', location: 'HQ', status: 'online' });

    renderDetail('5');

    await screen.findByRole('heading', { name: 'Node5' });
    const btn = screen.getByRole('button', { name: /Refresh Status/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(pingDevice).toHaveBeenCalledWith('5');
      // After update, "Status Online" badge should exist
      expect(screen.getByLabelText(/Status online/i)).toBeInTheDocument();
    });
  });
});
