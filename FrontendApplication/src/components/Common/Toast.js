import React, { memo } from 'react';
import { useToastContext } from '../../hooks/useToast';

// PUBLIC_INTERFACE
function Toast() {
  /** Renders global toasts in an aria-live region. */
  const { toasts, removeToast } = useToastContext();
  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      role="region"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{
            background: t.type === 'error' ? '#ffe5e5' : '#e6ffed',
            color: '#1a1a1a',
            borderLeft: `4px solid ${t.type === 'error' ? '#d93025' : '#2e7d32'}`,
            padding: '12px 16px',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: 12
          }}
        >
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>
              {t.type === 'error' ? 'Error' : 'Success'}
            </strong>
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
export default memo(Toast);
