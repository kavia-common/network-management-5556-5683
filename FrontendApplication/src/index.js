import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Allow disabling StrictMode in dev via env to avoid double effect invokes that
 * can exaggerate perceived slowness. Default remains enabled.
 * Set REACT_APP_DISABLE_STRICT_MODE=true to render without StrictMode.
 */
const disableStrict = String(process.env.REACT_APP_DISABLE_STRICT_MODE || '').toLowerCase() === 'true';

const root = ReactDOM.createRoot(document.getElementById('root'));
if (disableStrict) {
  root.render(<App />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
