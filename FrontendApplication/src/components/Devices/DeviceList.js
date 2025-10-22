import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listDevices, deleteDevice } from '../../api/devices';
import DeviceFilters from './DeviceFilters';
import DeviceTable from './DeviceTable';
import Spinner from '../Common/Spinner';
import { useToastContext } from '../../hooks/useToast';

// PUBLIC_INTERFACE
export default function DeviceList() {
  /** Displays device list with search, filters, sort and delete actions. */
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const { addToast } = useToastContext();
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const data = await listDevices();
      setDevices(data);
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Failed to load devices' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // initial load

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let rows = devices.filter((d) => {
      const termMatch = !term || [d.name, d.ip, d.location, d.type, d.status].some((v) => String(v).toLowerCase().includes(term));
      const typeMatch = type === 'all' || d.type === type;
      const statusMatch = status === 'all' || d.status === status;
      return termMatch && typeMatch && statusMatch;
    });
    rows.sort((a, b) => {
      const av = String(a[sortKey] ?? '').toLowerCase();
      const bv = String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [devices, q, type, status, sortKey, sortDir]);

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      await deleteDevice(id);
      addToast({ type: 'success', message: 'Device deleted' });
      await load();
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Delete failed' });
    }
  };

  if (loading) return <Spinner label="Loading devices..." />;

  return (
    <section aria-labelledby="devices-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 id="devices-heading" className="title" style={{ margin: 0 }}>Devices</h1>
        <Link to="/devices/new" className="btn" aria-label="Add new device" style={btnStyle}>+ Add Device</Link>
      </div>

      <DeviceFilters
        q={q} setQ={setQ}
        type={type} setType={setType}
        status={status} setStatus={setStatus}
        sortKey={sortKey} setSortKey={setSortKey}
        sortDir={sortDir} setSortDir={setSortDir}
      />

      <DeviceTable
        devices={filtered}
        onDelete={onDelete}
        onRowClick={(id) => navigate(`/devices/${id}`)}
      />

      {filtered.length === 0 && (
        <p role="status" aria-live="polite" style={{ marginTop: 16 }}>No devices match your criteria.</p>
      )}
    </section>
  );
}

const btnStyle = {
  background: 'var(--button-bg)',
  color: 'var(--button-text)',
  padding: '8px 12px',
  borderRadius: 8,
  textDecoration: 'none',
  display: 'inline-block'
};
