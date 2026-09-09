import { getLenis } from "@/lib/lenis";

/**
 * Duración del viaje, en segundos, acotada a propósito: proporcional a la
 * distancia, ir del hero al cierre de Qué hacemos —15.000px— sería eterno, y
 * un salto corto se sentiría lento. Los números salieron de mirarlo: 0,55 a
 * 1,5s llegaba tan rápido que el viaje no se registraba, y 2,2s todavía
 * quedaba corto. Con el techo en 3s, todo salto de más de 5.400px lo usa
 * entero; sigue por debajo del viaje nocturno del portal de Qué hacemos (~4s).
 */
function duracionDelViaje(distancia: number) {
  return Math.min(3, Math.max(0.9, distancia / 1800));
}

/** easeInOutCubic: arranca despacio, cruza rápido y llega frenando. */
const SUAVE = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Ir a una sección de la página. Por defecto DESLIZA; antes cortaba de una,
 * para no pasar por las escenas del medio, pero se leía como teletransporte.
 * `corte: true` va instantáneo, y no es cuestión de gusto: lo necesitan los
 * aterrizajes programáticos —llegar desde otra página por el hash, restaurar
 * `?persona=` o un `#slug` del historial—, donde deslizar mostraría un viaje
 * que nadie pidió desde un punto donde nunca se estuvo. Sin Lenis (reduced
 * motion) siempre corta. Respeta el `scroll-margin-top` de la sección.
 */
export function irASeccion(id: string, { corte = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const margen = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const destino = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - margen,
  );

  // Al aterrizar se disparan los triggers de todo lo que quedó arriba (escenas
  // que se pinnean o sueltan, imágenes que recién cargan) y la página puede
  // cambiar de alto: el borde de la sección se corre unos píxeles. Se vuelve a
  // medir un par de frames después y otra vez más tarde, y se corrige; si
  // mientras tanto la persona ya scrolleó, no se toca nada. Con el viaje suave
  // esperan a que TERMINE: si no, le arrebatan la página a Lenis a mitad de camino.
  let ultimoY = window.scrollY;
  const corregir = () => {
    if (Math.abs(window.scrollY - ultimoY) > 2) return;
    const desvio = el.getBoundingClientRect().top - margen;
    if (Math.abs(desvio) > 2) ultimoY = saltarA(Math.max(0, ultimoY + desvio));
  };
  const corregirDesdeAca = () => {
    ultimoY = window.scrollY;
    requestAnimationFrame(() => requestAnimationFrame(corregir));
    window.setTimeout(corregir, 400);
    window.setTimeout(corregir, 1200);
  };

  if (corte) {
    saltarA(destino);
    corregirDesdeAca();
    return;
  }
  deslizarA(destino, corregirDesdeAca);
}

/** Va hasta un elemento; con `centrar`, lo deja al medio de la pantalla. */
export function irAElemento(el: HTMLElement, { centrar = false, corte = false } = {}) {
  const r = el.getBoundingClientRect();
  const destino = Math.max(
    0,
    r.top + window.scrollY - (centrar ? (window.innerHeight - r.height) / 2 : 0),
  );
  if (corte) saltarA(destino);
  else deslizarA(destino);
}

export function irArriba() {
  deslizarA(0);
}

/** Corta a `y` y devuelve dónde quedó la página (el documento puede ser más corto). */
function saltarA(y: number): number {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: "auto" });
  return window.scrollY;
}

/** Desliza hasta `y` y avisa al terminar. Sin Lenis no hay viaje: corta. */
function deslizarA(y: number, alTerminar?: () => void) {
  const lenis = getLenis();
  if (!lenis) {
    window.scrollTo({ top: y, behavior: "auto" });
    alTerminar?.();
    return;
  }
  lenis.scrollTo(y, {
    duration: duracionDelViaje(Math.abs(y - window.scrollY)),
    easing: SUAVE,
    force: true,
    onComplete: alTerminar,
  });
}
