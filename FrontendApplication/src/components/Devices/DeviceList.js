import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listDevices, deleteDevice } from '../../api/devices';
import DeviceFilters from './DeviceFilters';
import DeviceTable from './DeviceTable';
import Spinner from '../Common/Spinner';
import { useToastContext } from '../../hooks/useToast';
import Pagination from '../Common/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

// PUBLIC_INTERFACE
export default function DeviceList() {
  /** Displays device list with search, filters, sort, delete and pagination with server/client fallback. */
  const defaultPageSize = Number(process.env.REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT || 10);

  const [allDevices, setAllDevices] = useState([]); // for client fallback
  const [loading, setLoading] = useState(true);

  // filters and sort (persist across pages)
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 250);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [serverPaginated, setServerPaginated] = useState(false);

  const { addToast } = useToastContext();
  const navigate = useNavigate();

  // prevent overlapping loads
  const loadingRef = useRef(false);

  const load = useCallback(async (targetPage = page, targetLimit = pageSize) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      const res = await listDevices({ page: targetPage, limit: targetLimit });
      setServerPaginated(!!res.serverPaginated);
      setTotal(Number(res.total || 0));

      if (res.serverPaginated) {
        // server returns current page items
        setAllDevices(res.items || []);
      } else {
        // server returned full list; store all for client-side slicing
        setAllDevices(res.items || res || []);
      }
    } catch (e) {
      const guidance = ' Check API base URL, backend availability, and CORS.';
      addToast({ type: 'error', message: (e && e.message ? e.message : 'Failed to load devices') + guidance });
      // Also log to console with context
      // eslint-disable-next-line no-console
      console.error('[Devices Load Error]', e);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [addToast, page, pageSize]);

  useEffect(() => { load(1, pageSize); /* initial load with page=1 */ }, [load, pageSize]);

  // Re-load when pagination changes if server handles pagination.
  useEffect(() => {
    if (serverPaginated) {
      load(page, pageSize);
    }
  }, [page, pageSize, serverPaginated, load]);

  // Reset page to 1 when filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, type, status, sortKey, sortDir]);

  // Filter + sort + client-side paginate (when server doesn't paginate)
  const { currentPageItems, filteredCount } = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    // If server paginated, assume allDevices are already filtered/paged server-side
    if (serverPaginated) {
      return { currentPageItems: allDevices, filteredCount: total };
    }

    let rows = allDevices.filter((d) => {
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

    const totalFiltered = rows.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = rows.slice(start, end);

    return { currentPageItems: sliced, filteredCount: totalFiltered };
  }, [allDevices, serverPaginated, total, debouncedQ, type, status, sortKey, sortDir, page, pageSize]);

  // Keep total in sync for client-side
  useEffect(() => {
    if (!serverPaginated) {
      setTotal(filteredCount);
    }
  }, [filteredCount, serverPaginated]);

  const onDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      await deleteDevice(id);
      addToast({ type: 'success', message: 'Device deleted' });
      // reload current page; if client-side, just refetch baseline
      await load(serverPaginated ? page : 1, pageSize);
    } catch (e) {
      const guidance = ' Check API base URL, backend availability, and CORS.';
      addToast({ type: 'error', message: (e && e.message ? e.message : 'Delete failed') + guidance });
      // eslint-disable-next-line no-console
      console.error('[Device Delete Error]', e);
    }
  }, [addToast, load, page, pageSize, serverPaginated]);

  const onRowClick = useCallback((id) => navigate(`/devices/${id}`), [navigate]);

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
        devices={currentPageItems}
        onDelete={onDelete}
        onRowClick={onRowClick}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      />

      {total === 0 && (
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
