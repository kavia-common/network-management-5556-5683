import { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * useDebouncedValue
 * Returns a debounced value which updates only after the provided delay has elapsed
 * since the last change. Useful to reduce expensive computations or API calls as
 * users type.
 */
export function useDebouncedValue(value, delay = 250) {
  /** Returns a debounced version of the provided value. */
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
