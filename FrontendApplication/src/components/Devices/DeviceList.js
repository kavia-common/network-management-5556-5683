import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listDevices, deleteDevice } from '../../api/devices';
import { listDevicesRaw } from '../../api/devices_raw';
import DeviceFilters from './DeviceFilters';
import DeviceTable from './DeviceTable';
import Spinner from '../Common/Spinner';
import { useToastContext } from '../../hooks/useToast';
import Pagination from '../Common/Pagination';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import ConnectivityBanner from '../Common/ConnectivityBanner';

// PUBLIC_INTERFACE
export default function DeviceList() {
  /** Displays device list with search, filters, sort, delete and pagination with server/client fallback. */
  const defaultPageSize = Number(process.env.REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT || 10);

  const [allDevices, setAllDevices] = useState([]); // holds either full list (client mode) or current page (server mode)
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

  const hasActiveFilters = (debouncedQ.trim() !== '') || type !== 'all' || status !== 'all';

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
      // eslint-disable-next-line no-console
      console.error('[Devices Load Error]', e);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [addToast, page, pageSize]);

  // Initial load with page=1
  useEffect(() => { load(1, pageSize); }, [load, pageSize]);

  // Re-load when pagination changes if server handles pagination AND no active filters
  useEffect(() => {
    if (serverPaginated && !hasActiveFilters) {
      load(page, pageSize);
    }
  }, [page, pageSize, serverPaginated, hasActiveFilters, load]);

  // When filters/search change:
  // - reset to page 1
  // - if serverPaginated and filters active, get full list once via /devices/raw for client-side filtering
  useEffect(() => {
    setPage(1);
    async function maybeLoadRaw() {
      if (serverPaginated && hasActiveFilters) {
        try {
          setLoading(true);
          const raw = await listDevicesRaw();
          setAllDevices(raw || []);
          setTotal((raw || []).length);
          // Switch effective mode to client-side for filtering/slicing
          setServerPaginated(false);
        } catch (e) {
          const guidance = ' Check API base URL, backend availability, and CORS.';
          addToast({ type: 'error', message: (e && e.message ? e.message : 'Failed to fetch full device list for filtering') + guidance });
          // eslint-disable-next-line no-console
          console.error('[Devices Raw Load Error]', e);
        } finally {
          setLoading(false);
        }
      }
      if (!hasActiveFilters) {
        // When filters cleared, reload baseline to honor server pagination if available
        load(1, pageSize);
      }
    }
    maybeLoadRaw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, type, status]);

  // Filter + sort + client-side paginate (when using full list)
  const { currentPageItems, filteredCount } = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();

    // Build a list of safe comparable fields, normalizing undefined/null
    const normalized = allDevices.map((d) => ({
      ...d,
      id: d.id ?? d._id,
      name: d.name ?? '',
      ip: d.ip ?? d.ip_address ?? '',
      type: d.type ?? '',
      location: d.location ?? '',
      status: d.status ?? '',
    }));

    // If serverPaginated (and no active filters), use items as-is, but still support sort locally for UX consistency
    if (serverPaginated && !hasActiveFilters) {
      const sorted = [...normalized].sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
      return { currentPageItems: sorted, filteredCount: total };
    }

    // Client-side filtering path
    let rows = normalized.filter((d) => {
      const valuesForSearch = [d.name, d.ip, d.location, d.type];
      const termMatch = !term || valuesForSearch.some((v) => v.toLowerCase().includes(term));
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
  }, [allDevices, serverPaginated, total, debouncedQ, type, status, sortKey, sortDir, page, pageSize, hasActiveFilters]);

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
      if (hasActiveFilters) {
        // Re-fetch raw list to keep filtering accurate
        const raw = await listDevicesRaw();
        setAllDevices(raw || []);
        setTotal((raw || []).length);
        setServerPaginated(false);
        setPage(1);
      } else {
        await load(serverPaginated ? page : 1, pageSize);
      }
    } catch (e) {
      const guidance = ' Check API base URL, backend availability, and CORS.';
      addToast({ type: 'error', message: (e && e.message ? e.message : 'Delete failed') + guidance });
      // eslint-disable-next-line no-console
      console.error('[Device Delete Error]', e);
    }
  }, [addToast, load, page, pageSize, serverPaginated, hasActiveFilters]);

  const onRowClick = useCallback((id) => navigate(`/devices/${id}`), [navigate]);

  if (loading) return <Spinner label="Loading devices..." />;

  const showEmpty = total === 0;

  return (
    <section aria-labelledby="devices-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 id="devices-heading" className="title" style={{ margin: 0 }}>Devices</h1>
        <Link to="/devices/new" className="btn" aria-label="Add new device" style={btnStyle}>+ Add Device</Link>
      </div>

      <ConnectivityBanner />
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

      {showEmpty && (
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
