import type Lenis from "lenis";

/**
 * Registro de la instancia única de Lenis (la crea LenisProvider).
 *
 * Los overlays full-screen (perfil del equipo) necesitan congelar el smooth
 * scroll de la página mientras están abiertos y restaurar el punto EXACTO al
 * cerrar: si Lenis sigue vivo, su ResizeObserver + ScrollTrigger.refresh()
 * recalculan alturas con el portal a mitad de desmontar y el target interno
 * queda clampeado a una altura transitoria → la página "deriva" hacia otra
 * sección al volver. Con stop()/scrollTo(immediate)/start() el retorno es
 * determinístico.
 */

let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
