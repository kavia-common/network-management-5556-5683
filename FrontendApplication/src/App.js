import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import RoutesRoot from './routes/Routes';
import Header from './components/Layout/Header';
import Container from './components/Layout/Container';
import { ToastProvider } from './hooks/useToast';
import Toast from './components/Common/Toast';
import { getDbName, getDbHealth } from './api/health';
import { getBaseURL } from './api/client';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    // Non-blocking connectivity diagnostics
    (async () => {
      try {
        // eslint-disable-next-line no-console
        console.info('[Startup] Backend base URL:', getBaseURL() || 'same-origin');
        const health = await getDbHealth();
        // eslint-disable-next-line no-console
        console.info('[Startup] /health/db:', health);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Startup] /health/db failed', e?.message || e);
      }
      try {
        const dbn = await getDbName();
        // eslint-disable-next-line no-console
        console.info('[Startup] /health/db-name:', dbn);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Startup] /health/db-name failed', e?.message || e);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="App">
          <Header theme={theme} onToggleTheme={toggleTheme} />
          <Container>
            <RoutesRoot />
          </Container>
          <Toast />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
