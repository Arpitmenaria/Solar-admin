"use client";

import { useEffect, useState } from "react";

/**
 * Holds a value steady until it stops changing for `delay` ms. Used for search
 * inputs that feed a query key — without it, every keystroke is a request.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
