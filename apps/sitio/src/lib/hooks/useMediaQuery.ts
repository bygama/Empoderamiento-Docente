"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lee una media query en vivo, con el mismo patrón que useReducedMotion
 * (useSyncExternalStore, sin cascading renders).
 *
 * SSR-safe: en server devuelve false. Quien lo use debe elegir la query de
 * modo que `false` sea el fallback seguro (p. ej. "es desktop" → false = la
 * variante lineal, que siempre es accesible).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
