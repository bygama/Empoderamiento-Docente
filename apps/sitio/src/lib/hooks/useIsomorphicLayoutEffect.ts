import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` emite warning cuando el componente se ejecuta en
 * servidor (App Router corre Client Components en SSR para el HTML
 * inicial). Fallback a `useEffect` en server mantiene la API igual sin
 * el warning. En cliente sigue siendo síncrono pre-paint.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
