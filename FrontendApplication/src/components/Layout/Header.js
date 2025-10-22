import React from 'react';
import { Link, NavLink } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme }) {
  /** App header with navigation and theme toggle. */
  return (
    <header
      className="navbar"
      role="banner"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <Link to="/devices" className="title" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 700 }}>
        Network Manager
      </Link>
      <nav aria-label="Primary" role="navigation" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <NavLink
          to="/devices"
          style={({ isActive }) => ({
            color: isActive ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: 'none',
            fontWeight: isActive ? 700 : 500
          })}
        >
          Devices
        </NavLink>
        <NavLink
          to="/devices/new"
          style={({ isActive }) => ({
            color: isActive ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: 'none',
            fontWeight: isActive ? 700 : 500
          })}
        >
          Add Device
        </NavLink>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    </header>
  );
}
