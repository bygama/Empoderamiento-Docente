import { getLenis } from "@/lib/lenis";

/**
 * Salto directo a una sección de la página, sin recorrer lo que hay en el
 * medio. Es un corte, no un scroll suave: la gracia es no tener que pasar
 * por todas las escenas animadas para llegar a la que se busca. Con Lenis
 * vivo se lo pide a Lenis (`immediate`, así no arrastra su inercia); si no
 * está (reduced motion) va el scroll nativo instantáneo. Respeta el
 * `scroll-margin-top` de la sección, así las que tienen ancla propia
 * aterrizan donde ya estaba previsto.
 */
export function irASeccion(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const margen = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const destino = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - margen,
  );
  let ultimoY = saltarA(destino);

  // Al aterrizar se disparan los triggers de todo lo que quedó arriba (escenas
  // que se pinnean o sueltan, imágenes que recién cargan) y la página puede
  // cambiar de alto: el borde de la sección se corre unos píxeles. Se vuelve
  // a medir un par de frames después y otra vez más tarde, y se corrige.
  // Si mientras tanto la persona ya scrolleó, no se toca nada.
  const corregir = () => {
    if (Math.abs(window.scrollY - ultimoY) > 2) return;
    const desvio = el.getBoundingClientRect().top - margen;
    if (Math.abs(desvio) > 2) ultimoY = saltarA(Math.max(0, ultimoY + desvio));
  };
  requestAnimationFrame(() => requestAnimationFrame(corregir));
  window.setTimeout(corregir, 400);
  window.setTimeout(corregir, 1200);
}

/** Corta hasta un elemento; con `centrar`, lo deja al medio de la pantalla. */
export function irAElemento(el: HTMLElement, centrar = false) {
  const r = el.getBoundingClientRect();
  const destino = Math.max(
    0,
    r.top + window.scrollY - (centrar ? (window.innerHeight - r.height) / 2 : 0),
  );
  saltarA(destino);
}

export function irArriba() {
  saltarA(0);
}

/** Corta a `y` y devuelve dónde quedó la página (el documento puede ser más corto). */
function saltarA(y: number): number {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: "auto" });
  return window.scrollY;
}
