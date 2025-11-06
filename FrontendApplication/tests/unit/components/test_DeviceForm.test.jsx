import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('../../src/hooks/useToast', () => ({
  useToastContext: () => ({ addToast: jest.fn() }),
}));

jest.mock('../../src/api/devices', () => ({
  createDevice: jest.fn(),
  getDevice: jest.fn(),
  updateDevice: jest.fn(),
}));

import DeviceForm from '../../src/components/Devices/DeviceForm';
import { createDevice, getDevice, updateDevice } from '../../src/api/devices';

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/devices/new']}>
      <Routes>
        <Route path="/devices/new" element={<DeviceForm mode="create" />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit(id = '42') {
  return render(
    <MemoryRouter initialEntries={[`/devices/${id}/edit`]}>
      <Routes>
        <Route path="/devices/:id/edit" element={<DeviceForm mode="edit" />} />
        <Route path="/devices/:id" element={<div>detail page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeviceForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('create mode validates required fields and submits', async () => {
    createDevice.mockResolvedValue({ id: '100', name: 'New', ip: '10.0.0.1', type: 'router', location: 'HQ', status: 'online' });

    renderCreate();

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New' } });
    fireEvent.change(screen.getByLabelText('IP Address'), { target: { value: '10.0.0.1' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'HQ' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Create Device/i }));

    await waitFor(() => {
      expect(createDevice).toHaveBeenCalledWith({
        name: 'New',
        ip: '10.0.0.1',
        type: 'router',
        location: 'HQ',
        status: 'online',
      });
    });
  });

  test('edit mode preloads values and updates', async () => {
    getDevice.mockResolvedValue({ id: '42', name: 'Existing', ip: '10.0.0.2', type: 'switch', location: 'DC', status: 'offline' });
    updateDevice.mockResolvedValue({ id: '42' });

    renderEdit('42');

    // Spinner should appear
    expect(screen.getByText(/Loading device/i)).toBeInTheDocument();

    // Await load and pre-filled fields
    await screen.findByDisplayValue('Existing');
    expect(screen.getByDisplayValue('10.0.0.2')).toBeInTheDocument();

    // Change name and submit
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateDevice).toHaveBeenCalledWith('42', expect.objectContaining({ name: 'Updated' }));
    });
  });

  test('shows validation errors for invalid IP', async () => {
    renderCreate();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Invalid IP Dev' } });
    fireEvent.change(screen.getByLabelText('IP Address'), { target: { value: 'not-an-ip' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'HQ' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Device/i }));

    // Error region gets populated; relying on validation util already covered in existing tests
    await waitFor(() => {
      const errRegion = screen.getByRole('alert', { name: /error-ip/i });
      expect(errRegion).toBeInTheDocument();
    });
  });
});
