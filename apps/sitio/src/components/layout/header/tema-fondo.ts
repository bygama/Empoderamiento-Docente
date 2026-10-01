/**
 * El logo suelto del Header (< lg) cambia de azul a negativo según lo que tenga
 * DEBAJO. No lleva vidrio propio —un blanco al 70 % sobre un fondo oscuro se
 * agrisa—, así que tiene que leerse solo, sobre lo que sea.
 *
 * Se decide midiendo, no con una lista de secciones oscuras: una lista se
 * desactualiza el día que alguien suma una sección y el logo desaparece sin
 * que nadie lo note. Se mira qué hay pintado en el punto del logo, de arriba
 * hacia abajo, y manda lo primero que sea opaco: si su color es oscuro, el nav
 * queda en `data-tema="noche"`. Lo que no se puede medir —un degradé, una
 * escena dibujada— lo declara su contenedor con `data-nav-tema="noche" | "dia"`.
 *
 * Escribe el atributo en el DOM y no en estado de React: cambia al scrollear y
 * no hay por qué re-renderizar el Header por eso. Los estilos lo leen con
 * `group-data-[tema=noche]/nav:`.
 */

// Luz percibida, de 0 (negro) a 1 (blanco), de un color computado. El navegador
// devuelve `rgb()` para los tokens planos y `color(srgb …)` u `oklab()` cuando
// hubo un `color-mix` o una opacidad de Tailwind v4 de por medio.
function luzDe(color: string): { luz: number; alfa: number } | null {
  const n = color.match(/-?[\d.]+(?:e-?\d+)?/g)?.map(Number);
  if (!n || n.length < 3) return null;
  const alfa = n[3] ?? 1;
  if (color.startsWith("oklab") || color.startsWith("oklch")) return { luz: n[0], alfa };
  const escala = color.startsWith("rgb") ? 255 : 1;
  const [r, g, b] = n.map((v) => v / escala);
  return { luz: 0.2126 * r + 0.7152 * g + 0.0722 * b, alfa };
}

const UMBRAL_NOCHE = 0.35;

function temaEn(x: number, y: number, nav: HTMLElement): "noche" | "dia" | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (nav.contains(el)) continue;
    // Un modal abierto (el menú mismo) tapa la página: lo que hay en el punto
    // es el modal, no el fondo. No se mide; vale el tema que ya estaba.
    if (el.closest("dialog")) return null;
    const declarado = el.getAttribute("data-nav-tema");
    if (declarado === "noche" || declarado === "dia") return declarado;
    const fondo = luzDe(getComputedStyle(el).backgroundColor);
    if (fondo && fondo.alfa > 0.5) return fondo.luz < UMBRAL_NOCHE ? "noche" : "dia";
  }
  return "dia";
}

/** Mantiene `nav[data-tema]` al día. Devuelve la limpieza. */
export function crearTemaSegunFondo(nav: HTMLElement): () => void {
  let raf = 0;
  const medir = () => {
    raf = 0;
    const logo = nav.querySelector("[data-nav-logo]")?.getBoundingClientRect();
    // Si el logo no está en pantalla no hay nada que medir: se queda con el
    // último tema.
    if (!logo || logo.bottom <= 0) return;
    const tema = temaEn(logo.left + logo.width / 2, logo.top + logo.height / 2, nav);
    if (tema && nav.dataset.tema !== tema) nav.dataset.tema = tema;
  };
  // A lo sumo una medición por cuadro: `elementsFromPoint` fuerza layout.
  const pedir = () => {
    if (!raf) raf = requestAnimationFrame(medir);
  };
  // Y una de cola, cuando el scroll se aquieta: las escenas con scrub siguen
  // moviéndose un rato después del último evento, y lo que queda debajo del
  // logo puede cambiar sin que llegue otro scroll.
  let cola = 0;
  const alScrollear = () => {
    pedir();
    window.clearTimeout(cola);
    cola = window.setTimeout(pedir, 500);
  };

  medir();
  // En captura: hay capas que scrollean por su cuenta (el expediente de
  // Investigación) y ese scroll no burbujea hasta la ventana.
  document.addEventListener("scroll", alScrollear, { passive: true, capture: true });
  window.addEventListener("resize", pedir);
  // Al cerrarse un modal vuelve a verse lo de abajo, y puede ser otro fondo: al
  // elegir una página en el menú, la ruta cambia con la cortina todavía
  // cerrándose, la medición de la página nueva cae en el menú y se saltea, y
  // si nadie scrollea (un hero a pantalla completa) el logo se queda con el
  // tema de la página anterior. `close` no burbujea: se escucha en captura.
  document.addEventListener("close", pedir, { capture: true });
  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(cola);
    document.removeEventListener("scroll", alScrollear, { capture: true });
    window.removeEventListener("resize", pedir);
    document.removeEventListener("close", pedir, { capture: true });
    delete nav.dataset.tema;
  };
}
