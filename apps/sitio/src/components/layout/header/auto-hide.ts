import gsap from "gsap";

// Auto-hide: al scrollear hacia abajo la píldora se esconde arriba; al
// scrollear un poco hacia arriba (o cerca del tope) reaparece. Animamos
// `top` (no `transform`) para no pisar el -translate-x-1/2 del centrado.
//
// El recorrido no siempre vive en la ventana: una capa a viewport completo
// (el expediente de Investigación) congela la página y se queda con el
// scroll. Por eso el listener va en CAPTURA sobre el documento —los eventos
// `scroll` de un elemento no burbujean, pero sí bajan en captura— y sigue a
// la superficie que se declara dueña del recorrido con
// `data-scroll-principal`. Mientras esa capa está montada, la ventana
// congelada SIGUE emitiendo su propio `scroll` en cada frame: si se lo
// escuchara, alternaría de superficie a cada evento y el navbar nunca
// llegaría a decidir. Un panel interno cualquiera (menú mobile, listas con
// overflow) tampoco lleva la marca y por lo tanto no mueve el navbar.
export function crearAutoHide(nav: HTMLElement) {

  const TOP_SHOWN = 16; // top-4 (1rem) — posición visible
  const TOP_HIDDEN = -120; // fuera de cuadro por arriba
  const DELTA = 6; // ignora micro-jitter de scroll
  const TOP_ZONE = 120; // cerca del tope siempre visible

  let superficie: HTMLElement | null = null; // null = la ventana
  let lastY = window.scrollY;
  let hidden = false;

  const show = () => {
    if (!hidden) return;
    hidden = false;
    gsap.to(nav, { top: TOP_SHOWN, duration: 0.45, ease: "power3.out" });
  };
  const hide = () => {
    if (hidden) return;
    hidden = true;
    gsap.to(nav, { top: TOP_HIDDEN, duration: 0.45, ease: "power3.out" });
  };

  const onScroll = (e: Event) => {
    // El scroll del documento tiene por target al `document`, que no es un
    // Element; un Element solo cuenta si vive dentro de una capa marcada.
    const objetivo = e.target instanceof Element ? e.target : null;
    const capa =
      objetivo?.closest<HTMLElement>("[data-scroll-principal]") ?? null;
    if (objetivo && !capa) return; // panel interno: no mueve el navbar

    if (capa !== superficie) {
      // Quién manda AHORA: si hay capa montada, el recorrido es suyo y los
      // eventos de la ventana congelada debajo (los emite igual) son ruido.
      const capaMontada = document.querySelector<HTMLElement>(
        "[data-scroll-principal]",
      );
      if (capa !== capaMontada) return;
      // Cambió la superficie (se abrió o se cerró la capa): las posiciones
      // de una y otra no son comparables. Se recalibra sin animar, salvo la
      // regla del tope — la capa nace arriba y ahí el navbar se muestra.
      superficie = capaMontada;
      lastY = capaMontada ? capaMontada.scrollTop : window.scrollY;
      if (lastY < TOP_ZONE) show();
      return;
    }

    const y = capa ? capa.scrollTop : window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) < DELTA) return;
    if (y < TOP_ZONE || dy < 0) show();
    else if (dy > 0) hide();
    lastY = y;
  };

  document.addEventListener("scroll", onScroll, {
    passive: true,
    capture: true,
  });
  return () => {
    document.removeEventListener("scroll", onScroll, { capture: true });
    gsap.set(nav, { clearProps: "top" });
  };
}
