import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La entrada del archivo en desktop (Facundo, 2026-09-14): una
 * sola timeline scrubbeada, SIN pin, sobre una escena pegada (sticky)
 * que lleva el título arriba y la pila abajo.
 *
 * 1. EL TÍTULO llega grande y centrado en la pantalla y, en el primer
 *    tramo de la pista, se achica y va directo a su lugar: arriba a la
 *    izquierda, con la pila todavía invisible debajo.
 * 2. LAS CARPETAS SE APILAN (Gastón, 2026-09-17): mientras el título
 *    termina su viaje —desde el 70 %— entran una por una desde abajo, con
 *    un recorrido corto, en orden: 01 apoya y 02 apoya encima. Se lee como
 *    alguien armando la pila sobre el escritorio. Solo posición y opacidad,
 *    escalonadas; nada encima. La última carpeta termina justo cuando la
 *    escena se despega, sean las que sean: no queda scroll muerto con la
 *    pila quieta. (Antes aparecían todas a la vez con un fundido plano
 *    —Facundo, 14-09, que había sacado un barrido doble de líneas verdes:
 *    «sin ningún efecto»—; a Gastón el fundido plano no le gustó.)
 *
 * Sin pin de ScrollTrigger a propósito: el expediente abierto es una capa
 * fija adentro de esta sección y un pin (position fixed más spacer) se le
 * cruzaría; el sticky no le molesta. El hook (maquina/useEscenaIndice.ts)
 * la crea en un gsap.context y la revierte al desmontar el índice.
 *
 * LA ESCENA MIDE LO QUE NECESITA, y nada más (2026-10-01). Gastón la había
 * dejado el 16/9 en «lo que necesita, con la ventana como mínimo»: medía
 * exactamente una ventana, y con cuatro carpetas aire + título + pila
 * sumaban ~900 px, así que en ventanas más bajas la última se salía por el
 * pie. Con dos carpetas el mínimo sobraba: la escena cargaba un tercio de
 * pantalla vacío abajo y, al despegarse, dejaba media pantalla gris antes
 * del cierre (415 px a 1440×900). Ahora la escena es su contenido y la
 * pista, la escena más los dos tramos: el sticky dura justo los tramos, así
 * el achique dura lo mismo con cualquier alto, y la timeline termina cuando
 * la escena se despega. Con «bottom bottom», una escena más baja que la
 * ventana terminaba antes del despegue y dejaba ese resto de scroll clavado
 * sin que pasara nada. Si el contenido no entra en la ventana, la escena se
 * pega igual y la timeline sigue hasta que su pie llega al borde de abajo,
 * como antes: las carpetas de abajo terminan de entrar a la vista. En
 * ventanas bajas además se quita aire (arriba y entre título y pila) para
 * que entre sin crecer.
 */

/** Tramos de la pista, en pantallas de scroll: el achique y la aparición. */
const TRAMO_TITULO = 0.6;
const TRAMO_APARICION = 0.25;
/** Escala máxima del título grande; se limita al ancho de la pantalla. */
const ESCALA_MAX = 2.6;
/** Aire a cada lado del título grande, en px. */
const MARGEN = 72;
/** Desde cuánto más abajo entra cada carpeta al apilarse, en px. */
const DESDE_ABAJO = 40;
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
  /** Lo que dura la escena pegada, en px de scroll: los dos tramos. */
  const tramos = () => (TRAMO_TITULO + TRAMO_APARICION) * window.innerHeight;
  const dimensionar = () => {
    const baja = window.innerHeight < VENTANA_BAJA;
    gsap.set(escena, {
      position: "sticky",
      top: 0,
      height: "auto",
      paddingTop: baja ? "5rem" : "7rem",
    });
    if (lista) gsap.set(lista, { marginTop: baja ? "3rem" : "5rem" });
    ajustarPista();
  };
  // La pista es siempre la escena más los dos tramos. Y se RE-AJUSTA cada
  // vez que la escena cambia de alto —desplegar la anticipación de una
  // carpeta la estira ~170 px—: si la pista quedara fija, al final de la
  // pista el sticky tiene que meter la escena entera antes del borde y
  // la corre hacia arriba lo que creció; al cerrarse vuelve a bajar, y el
  // cursor quedaba sobre otra carpeta (loop medido 2026-09-17). Con la
  // pista creciendo lo mismo, la escena no se mueve y lo que se empuja
  // es lo que sigue, como en cualquier acordeón.
  function ajustarPista() {
    gsap.set(pista, { height: escena.offsetHeight + tramos() });
  }
  const observador = new ResizeObserver(ajustarPista);
  observador.observe(escena);
  dimensionar();
  // Sin will-change a propósito, como el título de Áreas
  // (que-hacemos/areas/coreografia-titulo.ts): promueve el título a capa y
  // Chrome la rasteriza una sola vez al tamaño de layout (36 px), después
  // estira esa textura con la matriz. Arrancando en scale 2.6 se veía un
  // upscale del 260 % —texto pixelado hasta que el achique lo limpiaba
  // (medido 2026-09-17)—. Sin él vuelve a rasterizar en la escala grande.
  gsap.set(titulo, { transformOrigin: "50% 50%" });
  const carpetas = Array.from(pila.querySelectorAll<HTMLElement>("[data-carpeta-item]"));
  // Nacen escondidas y abajo: el fromTo no aplica su «from» hasta que
  // arranca (immediateRender false, por el scrub), y sin esto las que
  // todavía no entraron se veían desde el principio.
  gsap.set(carpetas, { autoAlpha: 0, y: DESDE_ABAJO });

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

  // Termina cuando la escena se despega, que es al pasar los tramos. Si la
  // escena no entra en la ventana, sigue hasta que su pie llega al borde de
  // abajo: la última carpeta entra a la vista y no debajo del borde.
  const fin = () => tramos() + Math.max(0, escena.offsetHeight - window.innerHeight);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pista,
      start: "top top",
      end: () => `+=${fin()}`,
      scrub: 0.6,
      invalidateOnRefresh: true,
      // La ventana cambió: la escena y la pista se vuelven a medir antes
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
  // Cada carpeta: 22 % del recorrido, escalonadas 8 %, arrancando cuando
  // el título va por el 70 % de su viaje; la última termina antes del fin.
  tl.fromTo(
    carpetas,
    { autoAlpha: 0, y: DESDE_ABAJO },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.22,
      ease: "power2.out",
      stagger: 0.08,
      immediateRender: false,
    },
    parteTitulo * 0.7,
  );
  return { tl, limpiar: () => observador.disconnect() };
}
