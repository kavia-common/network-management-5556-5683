import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function DeviceTable({ devices, onDelete, onRowClick }) {
  /** Table of devices with view/edit/delete actions and status indicators. */
  return (
    <div role="region" aria-label="Devices table" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
      <table role="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>IP</th>
            <th style={th}>Type</th>
            <th style={th}>Location</th>
            <th style={th}>Status</th>
            <th style={th} aria-label="Actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'){ onRowClick(d.id); }}} onClick={()=>onRowClick(d.id)} style={{ cursor: 'pointer' }}>
              <td style={td}>{d.name}</td>
              <td style={td}>{d.ip}</td>
              <td style={td}>{cap(d.type)}</td>
              <td style={td}>{d.location}</td>
              <td style={td}>
                <span aria-label={`Status ${d.status}`} style={{ ...badge, background: d.status === 'online' ? '#e6ffed' : '#ffe5e5', borderColor: d.status === 'online' ? '#2e7d32' : '#d93025', color: '#1a1a1a' }}>
                  {cap(d.status)}
                </span>
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap' }} onClick={(e)=> e.stopPropagation()}>
                <Link to={`/devices/${d.id}`} className="btn" style={btn}>View</Link>
                <Link to={`/devices/${d.id}/edit`} className="btn" style={btnSecondary}>Edit</Link>
                <button onClick={() => onDelete(d.id)} className="btn" style={btnDanger} aria-label={`Delete ${d.name}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cap = (s='') => s.charAt(0).toUpperCase() + s.slice(1);

const th = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' };
const td = { padding: '10px 12px', borderBottom: '1px solid var(--border-color)' };
const badge = { display: 'inline-block', border: '1px solid', borderRadius: 16, padding: '2px 8px', fontSize: 12, fontWeight: 600 };
const btn = { marginRight: 8, background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', padding: '6px 10px', borderRadius: 6, textDecoration: 'none' };
const btnSecondary = { ...btn, background: '#6c757d' };
const btnDanger = { ...btn, background: '#d93025' };
