import React from 'react';

// PUBLIC_INTERFACE
export default function Spinner({ label = 'Loading...' }) {
  /** Accessible spinner with screen reader label. */
  return (
    <div role="status" aria-live="polite" style={{ padding: 16 }}>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          border: '3px solid #e0e0e0',
          borderTopColor: '#007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
    </div>
  );
}
