"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Detecta si el SO del usuario solicita prefers-reduced-motion: reduce.
 * Usa useSyncExternalStore (React 19) para subscribirse a la media query
 * sin causar cascading renders (lint react-hooks/set-state-in-effect).
 *
 * SSR-safe: en server devuelve false; en cliente lee el valor real y
 * actualiza si el usuario cambia la preferencia en vivo.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
