import React from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function DeviceTable({ devices, onDelete, onRowClick }) {
  /** Table of devices with view/edit/delete actions and status indicators. Includes compact mode on small screens. */
  return (
    <div role="region" aria-label="Devices table" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
      <table role="table" className="devices-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>IP</th>
            <th style={th} className="hide-sm">Type</th>
            <th style={th} className="hide-md">Location</th>
            <th style={th}>Status</th>
            <th style={th} aria-label="Actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr
              key={d.id}
              tabIndex={0}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ onRowClick(d.id); }}}
              onClick={()=>onRowClick(d.id)}
              style={{ cursor: 'pointer' }}
            >
              <td style={td}>
                <span title={d.name} className="truncate">{d.name}</span>
                <div className="muted show-sm" style={{ fontSize: 12, marginTop: 4 }}>
                  {d.ip} • {cap(d.type)} • {d.location}
                </div>
              </td>
              <td style={td}>
                <span title={d.ip} className="truncate">{d.ip}</span>
              </td>
              <td style={td} className="hide-sm">{cap(d.type)}</td>
              <td style={td} className="hide-md">
                <span title={d.location} className="truncate">{d.location}</span>
              </td>
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
      <style>
        {`
          .devices-table tbody tr:nth-child(odd){ background: var(--table-row-odd); }
          .devices-table tbody tr:hover{ background: var(--table-row-hover); }
          .devices-table tbody tr:focus-within{ outline: 2px solid var(--focus-outline); outline-offset: -2px; }
          .truncate{ display:inline-block; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }
          .muted{ color: var(--text-secondary); }
          .show-sm{ display: none; }
          .hide-sm{ }
          .hide-md{ }
          @media (max-width: 640px){
            .hide-sm{ display: none; }
            .show-sm{ display: block; }
            .truncate{ max-width: 120px; }
          }
          @media (max-width: 860px){
            .hide-md{ display: none; }
          }
        `}
      </style>
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
