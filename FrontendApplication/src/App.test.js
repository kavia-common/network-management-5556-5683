import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders Devices navigation and loads devices page', async () => {
  // App already includes a BrowserRouter; render directly to avoid nested routers.
  render(<App />);

  // Header nav contains "Devices"
  expect(screen.getByRole('link', { name: /devices/i })).toBeInTheDocument();

  // Devices page lazy loads; wait until main container appears
  await waitFor(() => {
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
