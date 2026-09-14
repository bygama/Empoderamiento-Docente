import { ScrollTrigger } from "gsap/ScrollTrigger";
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
 * Dónde termina la escena de una sección: el final del ScrollTrigger más
 * largo (pin o scrub, no los reveals cortos ni los toggles) que vive
 * adentro. Solo para secciones marcadas `data-aterrizaje="fin"`: las que
 * cuentan una historia con el scroll (la carta, el ciclo, los casos, los
 * destacados…), donde llegar al borde de arriba es caer en el primer
 * fotograma y tener que recorrerla entera. Las demás aterrizan arriba.
 */
function finDeEscena(seccion: HTMLElement): number | null {
  if (seccion.getAttribute("data-aterrizaje") !== "fin") return null;
  const minimo = window.innerHeight * 0.5;
  let fin = -Infinity;
  for (const st of ScrollTrigger.getAll()) {
    if (!st.pin && !st.vars.scrub) continue;
    const trigger = st.trigger as Element | null;
    const pin = st.pin as Element | null;
    const adentro = (trigger && seccion.contains(trigger)) || (pin && seccion.contains(pin));
    if (!adentro || st.end - st.start < minimo) continue;
    fin = Math.max(fin, st.end);
  }
  return Number.isFinite(fin) ? Math.max(0, fin - 1) : null;
}

/**
 * Ir a una sección de la página. Por defecto DESLIZA (los CTA de los heros
 * son parte de la lectura y el viaje se entiende). `corte: true` va
 * instantáneo: lo necesitan los aterrizajes programáticos —llegar desde
 * otra página por el hash, restaurar `?persona=` o un `#slug` del
 * historial— y, desde el 2026-09-14, también la navegación por secciones
 * (submenús del navbar, índice del borde, chips del menú de celular):
 * Facundo, «cada vez que apretás te comés todo el scroll y las animaciones,
 * queda rarísimo». `alFinal: true` aterriza donde las animaciones de la
 * sección ya terminaron (finDeEscena), «ya para consumir el material».
 * Sin Lenis (reduced motion) siempre corta. Respeta el `scroll-margin-top`
 * de la sección.
 */
export function irASeccion(id: string, { corte = false, alFinal = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const margen = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const arriba = Math.max(0, el.getBoundingClientRect().top + window.scrollY - margen);
  const destino = (alFinal && finDeEscena(el)) || arriba;
  const enElFin = destino !== arriba;

  // Al aterrizar se disparan los triggers de todo lo que quedó arriba (escenas
  // que se pinnean o sueltan, imágenes que recién cargan) y la página puede
  // cambiar de alto: el borde de la sección se corre unos píxeles. Se vuelve a
  // medir un par de frames después y otra vez más tarde, y se corrige; si
  // mientras tanto la persona ya scrolleó, no se toca nada. Con el viaje suave
  // esperan a que TERMINE: si no, le arrebatan la página a Lenis a mitad de camino.
  // Dónde tendría que estar la página ahora: el borde de la sección, o el
  // final de su escena si se aterrizó ahí (se vuelve a calcular: el borde
  // no sirve, porque con la sección pinneada mide 0 y la corrección la
  // empujaba una escena entera más abajo).
  const objetivo = () => {
    const bordeAhora = Math.max(0, el.getBoundingClientRect().top + window.scrollY - margen);
    return (enElFin && finDeEscena(el)) || bordeAhora;
  };
  let ultimoY = window.scrollY;
  const corregir = () => {
    if (Math.abs(window.scrollY - ultimoY) > 2) return;
    const desvio = objetivo() - ultimoY;
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

type OpcionesViaje = { corte?: boolean; alTerminar?: () => void };

/** Va hasta un elemento; con `centrar`, lo deja al medio de la pantalla. */
export function irAElemento(
  el: HTMLElement,
  { centrar = false, corte = false, alTerminar }: OpcionesViaje & { centrar?: boolean } = {},
) {
  const r = el.getBoundingClientRect();
  const destino = Math.max(
    0,
    r.top + window.scrollY - (centrar ? (window.innerHeight - r.height) / 2 : 0),
  );
  irAPosicion(destino, { corte, alTerminar });
}

/** Va hasta una posición de la página y avisa al llegar (con corte, enseguida). */
export function irAPosicion(y: number, { corte = false, alTerminar }: OpcionesViaje = {}) {
  if (corte) {
    saltarA(y);
    alTerminar?.();
    return;
  }
  deslizarA(y, alTerminar);
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
