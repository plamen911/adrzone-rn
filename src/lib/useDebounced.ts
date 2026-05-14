import { useEffect, useState } from 'react';

export function useDebounced<T>(value: T, delayMs = 220): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return v;
}
