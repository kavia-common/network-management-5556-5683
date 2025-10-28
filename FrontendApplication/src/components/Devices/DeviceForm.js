import React, { useEffect, useState } from 'react';
import { createDevice, getDevice, updateDevice } from '../../api/devices';
import { validateDevice, hasErrors } from '../../utils/validation';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../Common/Spinner';
import { useToastContext } from '../../hooks/useToast';

// PUBLIC_INTERFACE
export default function DeviceForm({ mode = 'create' }) {
  /** Accessible device form supporting create and edit modes. */
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const [values, setValues] = useState({
    name: '',
    ip: '',
    type: 'router',
    location: '',
    status: 'online'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const data = await getDevice(id);
        setValues({
          name: data.name || '',
          ip: data.ip || '',
          type: data.type || 'router',
          location: data.location || '',
          status: data.status || 'online'
        });
      } catch (e) {
        addToast({ type: 'error', message: e.message || 'Failed to load device' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, addToast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    setErrors(validateDevice(next));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const vErrors = validateDevice(values);
    setErrors(vErrors);
    if (hasErrors(vErrors)) {
      addToast({ type: 'error', message: 'Please fix validation errors' });
      return;
    }
    try {
      if (isEdit) {
        await updateDevice(id, values);
        addToast({ type: 'success', message: 'Device updated' });
        navigate(`/devices/${id}`);
      } else {
        const created = await createDevice(values);
        addToast({ type: 'success', message: 'Device created' });
        navigate(`/devices/${created.id}`);
      }
    } catch (e) {
      const baseMsg = (e && e.data && e.data.message) || e.message || 'Save failed';
      const guidance = ' Check API base URL, backend availability, and CORS.';
      addToast({ type: 'error', message: baseMsg + guidance });
      // eslint-disable-next-line no-console
      console.error('[Device Save Error]', e);
    }
  };

  if (loading) return <Spinner label="Loading device..." />;

  return (
    <section aria-labelledby="form-heading">
      <h1 id="form-heading" className="title">{isEdit ? 'Edit Device' : 'Create Device'}</h1>
      <form onSubmit={onSubmit} noValidate aria-describedby="form-errors" style={form}>
        <FormField label="Name" name="name" value={values.name} onChange={onChange} error={errors.name} />
        <FormField label="IP Address" name="ip" value={values.ip} onChange={onChange} error={errors.ip} placeholder="e.g., 192.168.0.1" />
        <div style={fieldRow}>
          <div style={fieldCol}>
            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={values.type} onChange={onChange} style={input} aria-invalid={!!errors.type} aria-describedby={errors.type ? 'error-type' : undefined}>
              <option value="router">Router</option>
              <option value="switch">Switch</option>
              <option value="server">Server</option>
            </select>
            {errors.type && <div id="error-type" role="alert" style={err}>{errors.type}</div>}
          </div>
          <div style={fieldCol}>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={values.status} onChange={onChange} style={input} aria-invalid={!!errors.status} aria-describedby={errors.status ? 'error-status' : undefined}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            {errors.status && <div id="error-status" role="alert" style={err}>{errors.status}</div>}
          </div>
        </div>
        <FormField label="Location" name="location" value={values.location} onChange={onChange} error={errors.location} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn" style={btnPrimary}>{isEdit ? 'Save Changes' : 'Create Device'}</button>
          <button type="button" className="btn" style={btnSecondary} onClick={() => navigate(-1)}>Cancel</button>
        </div>
        <div id="form-errors" aria-live="polite" className="sr-only">
          {Object.values(errors).filter(Boolean).join('. ')}
        </div>
      </form>
    </section>
  );
}

function FormField({ label, name, value, onChange, error, placeholder }) {
  const id = name;
  return (
    <div style={field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={input}
        aria-invalid={!!error}
        aria-describedby={error ? `error-${id}` : undefined}
      />
      {error && <div id={`error-${id}`} role="alert" style={err}>{error}</div>}
    </div>
  );
}

const form = { display: 'grid', gap: 12, maxWidth: 560 };
const field = { display: 'flex', flexDirection: 'column', gap: 6 };
const fieldRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const fieldCol = { display: 'flex', flexDirection: 'column', gap: 6 };
const input = { padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' };
const err = { color: '#d93025', fontSize: 13 };
const btnPrimary = { background: 'var(--button-bg)', color: 'var(--button-text)', padding: '8px 12px', borderRadius: 8, border: 'none' };
const btnSecondary = { ...btnPrimary, background: '#6c757d' };
