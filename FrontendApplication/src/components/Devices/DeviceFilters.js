import React, { memo } from 'react';

// PUBLIC_INTERFACE
function DeviceFilters({
  q, setQ,
  type, setType,
  status, setStatus,
  sortKey, setSortKey,
  sortDir, setSortDir
}) {
  /** Search input, type/status filters, and sort controls (accessible). */
  return (
    <fieldset style={wrapper} aria-labelledby="filters-legend">
      <legend id="filters-legend" className="subtitle" style={{ padding: '0 8px' }}>Filters</legend>
      <div style={grid}>
        <div style={field}>
          <label htmlFor="q">Search</label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, IP, location…"
            aria-label="Search devices"
            style={input}
          />
        </div>
        <div style={field}>
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)} style={input}>
            <option value="all">All</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="server">Server</option>
          </select>
        </div>
        <div style={field}>
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div style={field}>
          <label htmlFor="sortKey">Sort By</label>
          <select id="sortKey" value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={input}>
            <option value="name">Name</option>
            <option value="ip">IP</option>
            <option value="type">Type</option>
            <option value="location">Location</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div style={field}>
          <label htmlFor="sortDir">Direction</label>
          <select id="sortDir" value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={input}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}

// PUBLIC_INTERFACE
export default memo(DeviceFilters);

const wrapper = { border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, marginBottom: 12 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' };
const field = { display: 'flex', flexDirection: 'column', gap: 6 };
const input = { padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' };
