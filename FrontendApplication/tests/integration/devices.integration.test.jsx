import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from '../../src/App';

// Helper to mock fetch at the network boundary.
function mockFetchSequence(sequence) {
  // sequence: array of { when: { urlIncludes, method }, respond: { status, json } }
  global.fetch = jest.fn(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const match = sequence.find((s) => {
      const urlOk = typeof s.when.urlIncludes === 'string'
        ? String(url).includes(s.when.urlIncludes)
        : s.when.urlIncludes.test(String(url));
      const methodOk = !s.when.method || s.when.method.toUpperCase() === method;
      return urlOk && methodOk;
    });
    if (!match) {
      return {
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ message: `No mock for ${method} ${url}` })
      };
    }
    const { status = 200, json } = match.respond;
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => json,
    };
  });
}

describe('Devices flows - integration (UI + API boundary)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('list → create → edit → delete → ping', async () => {
    // Initial list response with two devices (backend envelope shape)
    const deviceA = { id: '1', name: 'Core Router', ip_address: '192.168.0.1', type: 'router', location: 'DC-1', status: 'online' };
    const deviceB = { id: '2', name: 'Edge Switch', ip_address: '10.0.0.2', type: 'switch', location: 'HQ', status: 'offline' };

    const created = { id: '3', name: 'Web Server', ip_address: '10.0.0.10', type: 'server', location: 'HQ', status: 'online' };
    const updated = { ...created, name: 'Web Server Updated' };
    const pinged = { ...updated, status: 'offline' };

    mockFetchSequence([
      // Initial list
      { when: { urlIncludes: '/devices', method: 'GET' }, respond: { status: 200, json: { items: [deviceA, deviceB], total: 2, page: 1, limit: 10 } } },
      // Create
      { when: { urlIncludes: '/devices', method: 'POST' }, respond: { status: 201, json: created } },
      // List refresh after create
      { when: { urlIncludes: '/devices', method: 'GET' }, respond: { status: 200, json: { items: [deviceA, deviceB, created], total: 3, page: 1, limit: 10 } } },
      // Get detail for edit
      { when: { urlIncludes: '/devices/3', method: 'GET' }, respond: { status: 200, json: created } },
      // Update
      { when: { urlIncludes: '/devices/3', method: 'PUT' }, respond: { status: 200, json: updated } },
      // List refresh after update
      { when: { urlIncludes: '/devices', method: 'GET' }, respond: { status: 200, json: { items: [deviceA, deviceB, updated], total: 3, page: 1, limit: 10 } } },
      // Ping
      { when: { urlIncludes: '/devices/3/ping', method: 'POST' }, respond: { status: 200, json: pinged } },
      // Delete
      { when: { urlIncludes: '/devices/3', method: 'DELETE' }, respond: { status: 204, json: {} } },
      // List refresh after delete
      { when: { urlIncludes: '/devices', method: 'GET' }, respond: { status: 200, json: { items: [deviceA, deviceB], total: 2, page: 1, limit: 10 } } },
    ]);

    render(
      <MemoryRouter initialEntries={['/devices']}>
        <App />
      </MemoryRouter>
    );

    // Expect list table present
    // We look for a generic label "Devices" common in the list header, or fall back to table role.
    // Using role-based to be resilient to text changes.
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click "Create" link/button
    const createButtons = screen.getAllByRole('button');
    const createBtn = createButtons.find(b => /create|new/i.test(b.textContent || '')) || screen.getByText(/new/i);
    fireEvent.click(createBtn);

    // Fill the form
    const nameInput = await screen.findByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Web Server' } });

    const ipInput = screen.getByLabelText(/ip/i);
    fireEvent.change(ipInput, { target: { value: '10.0.0.10' } });

    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'server' } });

    const locationInput = screen.getByLabelText(/location/i);
    fireEvent.change(locationInput, { target: { value: 'HQ' } });

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'online' } });

    const submitBtn = screen.getByRole('button', { name: /create|save/i });
    fireEvent.click(submitBtn);

    // Back to list with new row
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Web Server')).toBeInTheDocument();
    });

    // Navigate to edit (find row then click Edit action)
    const table = screen.getByRole('table');
    const row = within(table).getByText('Web Server').closest('tr');
    const editBtn = within(row).getAllByRole('button').find(b => /edit/i.test(b.textContent || '')) || within(row).getByText(/edit/i);
    fireEvent.click(editBtn);

    const editName = await screen.findByLabelText(/name/i);
    fireEvent.change(editName, { target: { value: 'Web Server Updated' } });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    // List should show updated name
    await waitFor(() => {
      const tbl = screen.getByRole('table');
      expect(within(tbl).getByText('Web Server Updated')).toBeInTheDocument();
    });

    // Open detail and ping
    const updatedRow = within(screen.getByRole('table')).getByText('Web Server Updated').closest('tr');
    const detailsBtn = within(updatedRow).getAllByRole('link').find(l => /view|detail/i.test(l.textContent || '')) || within(updatedRow).getByText(/view/i);
    fireEvent.click(detailsBtn);

    const pingButton = await screen.findByRole('button', { name: /refresh|ping/i });
    fireEvent.click(pingButton);

    // After ping, status text present (either online/offline based on mock)
    await waitFor(() => {
      expect(screen.getByText(/status/i)).toBeInTheDocument();
    });

    // Delete from list
    // Navigate back to list (assume there is a back link)
    const backLink = screen.getAllByRole('link').find(l => /back|devices/i.test(l.textContent || '')) || screen.getByText(/devices/i);
    fireEvent.click(backLink);

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    const rowDel = within(screen.getByRole('table')).getByText('Web Server Updated').closest('tr');
    const deleteBtn = within(rowDel).getAllByRole('button').find(b => /delete|remove/i.test(b.textContent || '')) || within(rowDel).getByText(/delete/i);
    fireEvent.click(deleteBtn);

    // Row should be gone
    await waitFor(() => {
      const tbl2 = screen.getByRole('table');
      expect(within(tbl2).queryByText('Web Server Updated')).not.toBeInTheDocument();
    });
  });

  test('shows API error bubble when create returns duplicate ip (409)', async () => {
    const deviceA = { id: '1', name: 'Core Router', ip_address: '192.168.0.1', type: 'router', location: 'DC-1', status: 'online' };

    mockFetchSequence([
      { when: { urlIncludes: '/devices', method: 'GET' }, respond: { status: 200, json: { items: [deviceA], total: 1, page: 1, limit: 10 } } },
      { when: { urlIncludes: '/devices', method: 'POST' }, respond: { status: 409, json: { error: { field: 'ip_address', message: 'already exists' } } } },
    ]);

    render(
      <MemoryRouter initialEntries={['/devices/new']}>
        <App />
      </MemoryRouter>
    );

    const nameInput = await screen.findByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Dup IP' } });

    const ipInput = screen.getByLabelText(/ip/i);
    fireEvent.change(ipInput, { target: { value: '192.168.0.1' } });

    const typeSelect = screen.getByLabelText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'server' } });

    const locationInput = screen.getByLabelText(/location/i);
    fireEvent.change(locationInput, { target: { value: 'HQ' } });

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.change(statusSelect, { target: { value: 'online' } });

    const submitBtn = screen.getByRole('button', { name: /create|save/i });
    fireEvent.click(submitBtn);

    // Expect some error feedback rendered (toast or inline)
    await waitFor(() => {
      const err = screen.queryByText(/already exists|conflict|duplicate/i);
      expect(err).toBeInTheDocument();
    });
  });
});
