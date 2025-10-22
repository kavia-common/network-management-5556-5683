import React from 'react';

// PUBLIC_INTERFACE
export default function Container({ children }) {
  /** Page content container with responsive padding and max width. */
  return (
    <main
      role="main"
      className="container"
      style={{
        margin: '0 auto',
        padding: '16px',
        maxWidth: 1100,
        minHeight: 'calc(100vh - 56px)'
      }}
    >
      {children}
    </main>
  );
}
