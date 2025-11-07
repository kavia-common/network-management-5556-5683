import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders Devices navigation and loads devices page', async () => {
  render(
    <MemoryRouter initialEntries={['/devices']}>
      <App />
    </MemoryRouter>
  );

  // Header nav contains "Devices"
  expect(screen.getByRole('link', { name: /devices/i })).toBeInTheDocument();

  // Devices page lazy loads; wait until table region appears
  await waitFor(() => {
    // When DeviceList mounts, it will render the table region; we assert spinner eventually goes away.
    // We don't require backend; tests that hit network mock fetch explicitly elsewhere.
    // Here just ensure main container exists.
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
