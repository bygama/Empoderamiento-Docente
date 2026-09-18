import { useEffect } from "react";

/**
 * Bloquea el scroll del <body> mientras `locked` sea true. Mantiene
 * un contador de consumidores activos a nivel módulo: si dos overlays
 * piden lock al mismo tiempo (ej. menú mobile abierto + TeamModal),
 * el segundo no pisa el `overflow` del primero y solo restauramos el
 * valor original cuando el último consumidor libera.
 */
let activeLocks = 0;
let originalOverflow = "";

export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (activeLocks === 0) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    activeLocks += 1;
    return () => {
      activeLocks -= 1;
      if (activeLocks === 0) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [locked]);
}
