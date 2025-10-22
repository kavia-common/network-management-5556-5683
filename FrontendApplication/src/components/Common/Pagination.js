import React from 'react';

/**
 * Accessible pagination component with Prev/Next, first/last and numbered pages.
 * Supports disabling, aria-labels, and announces status via aria-live.
 */
// PUBLIC_INTERFACE
export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showFirstLast = true,
  maxPageButtons = 5,
}) {
  /** Reusable pagination UI. */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);

  const canPrev = current > 1;
  const canNext = current < totalPages;

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === current) return;
    onPageChange && onPageChange(p);
  };

  // Compute start/end for numbered buttons
  const half = Math.floor(maxPageButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + maxPageButtons - 1);
  if (end - start + 1 < maxPageButtons) {
    start = Math.max(1, end - maxPageButtons + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <div role="navigation" aria-label="Pagination" style={wrap}>
      <div aria-live="polite" style={srOnly}>
        Page {current} of {totalPages}. Total results {total}.
      </div>

      <div style={controls}>
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={!canPrev}
            aria-label="First page"
            style={{ ...btn, ...(canPrev ? {} : btnDisabled) }}
          >
            « First
          </button>
        )}
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          style={{ ...btn, ...(canPrev ? {} : btnDisabled) }}
        >
          ‹ Prev
        </button>

        <div role="group" aria-label="Pages" style={numbers}>
          {start > 1 && <span style={ellipsis} aria-hidden="true">…</span>}
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-current={p === current ? 'page' : undefined}
              style={{ ...btn, ...(p === current ? btnCurrent : {}) }}
            >
              {p}
            </button>
          ))}
          {end < totalPages && <span style={ellipsis} aria-hidden="true">…</span>}
        </div>

        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={!canNext}
          aria-label="Next page"
          style={{ ...btn, ...(canNext ? {} : btnDisabled) }}
        >
          Next ›
        </button>
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goTo(totalPages)}
            disabled={!canNext}
            aria-label="Last page"
            style={{ ...btn, ...(canNext ? {} : btnDisabled) }}
          >
            Last »
          </button>
        )}
      </div>

      <div style={pageSizer}>
        <label htmlFor="pageSize" style={{ marginRight: 8 }}>Rows per page</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
          style={select}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span style={{ marginLeft: 12, color: 'var(--text-secondary)' }}>
          {total === 0
            ? '0–0 of 0'
            : `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, total)} of ${total}`}
        </span>
      </div>
    </div>
  );
}

const wrap = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 12,
  borderTop: '1px solid var(--border-color)',
  paddingTop: 12,
};
const controls = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' };
const numbers = { display: 'flex', alignItems: 'center', gap: 4 };
const btn = {
  background: 'var(--button-bg)',
  color: 'var(--button-text)',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer',
};
const btnCurrent = { background: '#0d6efd', boxShadow: '0 0 0 3px rgba(13,110,253,.25)' };
const btnDisabled = { opacity: 0.6, cursor: 'not-allowed' };
const ellipsis = { padding: '0 6px' };
const pageSizer = { display: 'flex', alignItems: 'center', gap: 4 };
const select = { padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' };
const srOnly = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
