import React, { useEffect, useState } from 'react';
import { getBaseURL } from '../../api/client';
import { healthCheck } from '../../api/health';

// PUBLIC_INTERFACE
export default function ConnectivityBanner() {
  /** Lightweight connectivity diagnostics banner for development. */
  const [status, setStatus] = useState({ ok: null, message: '', base: getBaseURL() || 'same-origin' });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const result = await healthCheck();
      if (cancelled) return;
      if (result.ok) {
        setStatus((s) => ({ ...s, ok: true, message: `Connected (${result.endpoint})` }));
      } else {
        const parts = [];
        if (result.error?.status) parts.push(`status ${result.error.status}`);
        if (result.error?.message) parts.push(result.error.message);
        const msg = parts.join(' - ') || 'Network error';
        setStatus((s) => ({ ...s, ok: false, message: msg }));
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  if (status.ok === null) return null;

  const baseStyle = {
    position: 'relative',
    margin: '8px 0',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.4
  };
  const okStyle = { background: '#e6ffed', border: '1px solid #2e7d32', color: '#1a1a1a' };
  const errStyle = { background: '#fff4e5', border: '1px solid #f59e0b', color: '#1a1a1a' };

  return (
    <div role="status" aria-live="polite" style={{ ...baseStyle, ...(status.ok ? okStyle : errStyle) }}>
      <strong style={{ marginRight: 8 }}>{status.ok ? 'API reachable' : 'API not reachable'}</strong>
      <span>Base: <code>{status.base}</code>. {status.ok ? '' : `Error: ${status.message}.`}</span>
      {!status.ok && (
        <div style={{ marginTop: 4 }}>
          Hints: Ensure REACT_APP_API_BASE_URL points to your backend origin
          (HTTP: http://localhost:3001 or HTTPS preview: https://vscode-internal-28439-beta.beta01.cloud.kavia.ai:3001),
          backend is running, and CORS allows your exact frontend origin (e.g., https://vscode-internal-28439-beta.beta01.cloud.kavia.ai:3000).
        </div>
      )}
    </div>
  );
}
