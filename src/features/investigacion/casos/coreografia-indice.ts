import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La entrada del archivo en desktop (Facundo, 2026-09-14): una
 * sola timeline scrubbeada, SIN pin, sobre una pantalla pegada (sticky)
 * que lleva el título arriba y la pila abajo.
 *
 * 1. EL TÍTULO llega grande y centrado en la pantalla y, en el primer
 *    tramo de la pista, se achica y va directo a su lugar: arriba a la
 *    izquierda, con la pila todavía invisible debajo.
 * 2. LA PILA APARECE, sin más efecto, cuando el título ya está quieto en
 *    su esquina. (Hubo un barrido doble de líneas verdes descubriéndola
 *    desde el centro, como el de «Quiénes somos» del inicio; Facundo lo
 *    sacó: «que aparezcan después de que se mueve el título, sin ningún
 *    efecto».)
 *
 * Sin pin de ScrollTrigger a propósito: el expediente abierto es una capa
 * fija adentro de esta sección y un pin (position fixed más spacer) se le
 * cruzaría; el sticky no le molesta. El hook (maquina/useEscenaIndice.ts)
 * la crea en un gsap.context y la revierte al desmontar el índice.
 *
 * LA PANTALLA MIDE LO QUE NECESITA, con la ventana como mínimo (Gastón,
 * 2026-09-16). Medía exactamente una ventana, y aire + título + pila suman
 * ~900 px: en ventanas más bajas la carpeta 04 se salía por el pie y la
 * sección la recortaba contra el cierre. Ahora, si el contenido no entra,
 * la pantalla es más alta que la ventana: se pega arriba mientras dura la
 * pista y, cuando la escena termina, se despega y las carpetas terminan de
 * entrar completas antes del aire de abajo. La pista es siempre la
 * pantalla más los dos tramos, así el achique dura lo mismo. En ventanas
 * bajas además se quita aire (arriba y entre título y pila) para que entre
 * sin crecer.
 */

/** Tramos de la pista, en pantallas de scroll: el achique y la aparición. */
const TRAMO_TITULO = 0.6;
const TRAMO_APARICION = 0.25;
/** Escala máxima del título grande; se limita al ancho de la pantalla. */
const ESCALA_MAX = 2.6;
/** Aire a cada lado del título grande, en px. */
const MARGEN = 72;
/** Por debajo de este alto de ventana (px) la pantalla achica sus aires. */
const VENTANA_BAJA = 900;

export function escenaIndice({
  pista,
  escena,
  titulo,
  pila,
}: {
  pista: HTMLElement;
  escena: HTMLElement;
  titulo: HTMLElement;
  pila: HTMLElement;
}) {
  // El mismo aire arriba que la sección (py-28): el título queda en su
  // esquina de siempre, no pegado al borde ni bajo el header flotante. En
  // ventanas bajas, menos: 5rem arriba y 3rem entre título y pila (el
  // `mt-20` de la lista), lo justo para pasar por debajo del header.
  const lista = pila.firstElementChild as HTMLElement | null;
  const dimensionar = () => {
    const baja = window.innerHeight < VENTANA_BAJA;
    gsap.set(escena, {
      position: "sticky",
      top: 0,
      height: "auto",
      minHeight: "100svh",
      paddingTop: baja ? "5rem" : "7rem",
    });
    if (lista) gsap.set(lista, { marginTop: baja ? "3rem" : "5rem" });
    gsap.set(pista, {
      height: escena.offsetHeight + (TRAMO_TITULO + TRAMO_APARICION) * window.innerHeight,
    });
  };
  dimensionar();
  gsap.set(titulo, { transformOrigin: "50% 50%", willChange: "transform" });
  gsap.set(pila, { autoAlpha: 0 });

  // De dónde parte el título: centrado en la pantalla y grande. Se mide
  // con la geometría de layout (offset*), que no ve el transform que el
  // título tenga puesto en el momento del refresh.
  const desde = () => {
    const w = titulo.offsetWidth;
    const h = titulo.offsetHeight;
    const izquierda = escena.getBoundingClientRect().left + titulo.offsetLeft;
    return {
      scale: Math.min(ESCALA_MAX, (window.innerWidth - 2 * MARGEN) / w),
      x: window.innerWidth / 2 - (izquierda + w / 2),
      y: window.innerHeight / 2 - (titulo.offsetTop + h / 2),
    };
  };

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pista,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      invalidateOnRefresh: true,
      // La ventana cambió: la pantalla y la pista se vuelven a medir antes
      // de que ScrollTrigger tome sus posiciones.
      onRefreshInit: dimensionar,
    },
  });
  const parteTitulo = TRAMO_TITULO / (TRAMO_TITULO + TRAMO_APARICION);
  tl.fromTo(
    titulo,
    { scale: () => desde().scale, x: () => desde().x, y: () => desde().y },
    { scale: 1, x: 0, y: 0, duration: parteTitulo, ease: "power2.inOut" },
    0,
  );
  tl.fromTo(
    pila,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 1 - parteTitulo, ease: "power1.out", immediateRender: false },
    parteTitulo,
  );
  return tl;
}
