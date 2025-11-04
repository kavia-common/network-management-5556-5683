import React from 'react';
import { getBaseURL } from '../../api/client';

// PUBLIC_INTERFACE
export default function BaseUrlNotice() {
  /**
   * Development-only subtle badge that shows the resolved API Base URL.
   * In production it renders nothing. Keeps UI minimal and non-intrusive.
   */
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return null;
  }
  const base = getBaseURL() || 'same-origin';
  const style = {
    position: 'fixed',
    left: 12,
    bottom: 12,
    background: '#eef2ff',
    color: '#111827',
    border: '1px solid #93c5fd',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 12,
    zIndex: 999,
    opacity: 0.9,
  };
  return (
    <div role="note" aria-label="API Base URL notice" style={style}>
      API Base: <code>{base}</code>
    </div>
  );
}
