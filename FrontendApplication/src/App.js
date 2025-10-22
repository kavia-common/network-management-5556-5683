import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import RoutesRoot from './routes/Routes';
import Header from './components/Layout/Header';
import Container from './components/Layout/Container';
import { ToastProvider } from './hooks/useToast';
import Toast from './components/Common/Toast';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

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
