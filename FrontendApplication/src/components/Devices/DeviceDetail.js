import React, { useEffect, useState } from 'react';
import { getDevice, pingDevice } from '../../api/devices';
import { Link, useParams } from 'react-router-dom';
import Spinner from '../Common/Spinner';
import { useToastContext } from '../../hooks/useToast';

// PUBLIC_INTERFACE
export default function DeviceDetail() {
  /** Shows device info with status badge and "Refresh Status" ping action. */
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToastContext();

  const load = async () => {
    try {
      setLoading(true);
      const data = await getDevice(id);
      setDevice(data);
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Failed to load device' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const updated = await pingDevice(id);
      setDevice(updated);
      addToast({ type: 'success', message: 'Status refreshed' });
    } catch (e) {
      addToast({ type: 'error', message: e.message || 'Status refresh failed' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <Spinner label="Loading device..." />;
  if (!device) return <p role="status">Device not found.</p>;

  return (
    <article aria-labelledby="device-title" style={{ display: 'grid', gap: 12 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 id="device-title" className="title" style={{ margin: 0 }}>{device.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/devices/${device.id}/edit`} className="btn" style={btnSecondary}>Edit</Link>
          <Link to="/devices" className="btn" style={btnLink}>Back to list</Link>
        </div>
      </header>

      <div role="group" aria-label="Device details" style={card}>
        <Row label="IP" value={device.ip} />
        <Row label="Type" value={cap(device.type)} />
        <Row
          label="Status"
          value={
            <span aria-label={`Status ${device.status}`} style={{ ...badge, background: device.status === 'online' ? '#e6ffed' : '#ffe5e5', borderColor: device.status === 'online' ? '#2e7d32' : '#d93025', color: '#1a1a1a' }}>
              {cap(device.status)}
            </span>
          }
        />
        <Row label="Location" value={device.location} />
      </div>

      <div>
        <button
          onClick={onRefresh}
          className="btn"
          style={btnPrimary}
          disabled={refreshing}
          aria-busy={refreshing}
          aria-live="polite"
        >
          {refreshing ? 'Refreshing…' : 'Refresh Status'}
        </button>
      </div>
    </article>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}

const cap = (s='') => s.charAt(0).toUpperCase() + s.slice(1);

const card = { border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, background: 'var(--bg-primary)' };
const badge = { display: 'inline-block', border: '1px solid', borderRadius: 16, padding: '2px 8px', fontSize: 12, fontWeight: 600 };
const btnPrimary = { background: 'var(--button-bg)', color: 'var(--button-text)', padding: '8px 12px', borderRadius: 8, border: 'none' };
const btnSecondary = { ...btnPrimary, background: '#6c757d' };
const btnLink = { ...btnPrimary, background: '#6c757d' };
