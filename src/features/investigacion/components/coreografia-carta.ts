import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía de «Nacimos de una pregunta» — las notas del sobre.
 *
 * Un escenario pinneado de una pantalla, en tres beats:
 *
 * 1. EL WIPE. La hoja llega gris como el marco del hero, con un semicírculo
 *    navy asomando del borde inferior (la forma plana azul del manual §6) y
 *    el título en tinta arriba. Al pinnearse, el círculo crece hasta cubrir
 *    la pantalla: es la noche que llega desde abajo. El título tiene dos
 *    copias superpuestas —tinta navy fuera del campo, blanca adentro—, así
 *    el borde del círculo lo invierte a su paso sin ningún fade. El sobre
 *    sube al borde inferior y ahí se queda: es el ancla de la escena.
 * 2. SALE LA PRIMERA NOTA (la pregunta), lineal con el scroll, hasta que su
 *    pie se despega de la boca del sobre y se lee entera, con un giro leve.
 *    Respiro para leerla.
 * 3. SALE LA SEGUNDA (la postura) y se apila encima con el giro contrario:
 *    la primera asoma por los bordes —ya se leyó, pero sigue ahí—. Respiro
 *    y el pin suelta con las dos notas apiladas sobre el sobre.
 *
 * Un solo gesto, repetido, y nada más en pantalla: título atrás, sobre
 * abajo, notas cortas (decisión 2026-09-11: menos es más). Todo scrubbeado,
 * con fromTo explícitos y valores en función (se remiden en cada refresh).
 * Patrón: acá solo se construye la timeline; el componente es dueño del
 * gsap.context y del cleanup.
 */

type Escena = {
  /** El wrapper de la sección: es lo que se pinnea. */
  zona: HTMLElement;
  /** El escenario de una pantalla: de acá salen todos los actores. */
  hoja: HTMLElement;
};

/** Radio del semicírculo inicial, como fracción de la altura del escenario. */
const RADIO_INICIAL = 0.26;

/** Las notas apiladas: giro y corrimiento lateral de cada una (px). */
const PILA = {
  giros: [-2.2, 2.4],
  corrimientos: [-12, 14],
} as const;

/** Tiempos (unidades del timeline). 1 unidad = 1000px de scroll. */
const T = {
  wipe: { desde: 0, hasta: 0.7 },
  sobreEntra: { desde: 0.45, hasta: 0.95 },
  notas: [
    { desde: 1.0, hasta: 1.8 },
    { desde: 2.3, hasta: 3.1 },
  ],
  /** El título se apaga cuando la primera nota lo alcanza: ya se leyó
   *  durante el wipe, y una nota que lo tapa a medias se ve rota. */
  tituloSeVa: { desde: 1.35, hasta: 1.7 },
  fin: 3.7,
} as const;

/** Alto del recorrido pinneado en px de scroll. */
export const RECORRIDO_CARTA = 3700;

export function crearCarta({ zona, hoja }: Escena) {
  const q = gsap.utils.selector(hoja);
  const campo = q<HTMLElement>("[data-carta-campo]")[0];
  const tituloLuz = q<HTMLElement>("[data-carta-titulo-luz]")[0];
  const sobre = q<HTMLElement>("[data-carta-sobre]")[0];
  const notas = q<HTMLElement>("[data-carta-nota]");

  const alto = () => hoja.clientHeight;
  const ancho = () => hoja.clientWidth;
  const circulo = (r: number) => `circle(${r}px at 50% 100%)`;
  const radioInicial = () => alto() * RADIO_INICIAL;
  const radioTotal = () => Math.hypot(ancho() / 2, alto()) + 4;

  // ── Geometría, sin transforms (offsets de layout): el sobre es hijo
  //    posicionado de la hoja y cada nota, hija posicionada del sobre.
  /** El sobre espera bajo el piso con solapa y todo (la solapa asoma 9rem
   *  por arriba de su caja). */
  const hundidoSobre = () => sobre.offsetHeight + 200;
  /** Arriba: la nota sube hasta que su pie se despega de la boca del sobre
   *  y se lee entera. Si es más alta que ese hueco, el techo manda. */
  const yArriba = (nota: HTMLElement) => () => {
    const top = sobre.offsetTop + nota.offsetTop;
    return Math.max(
      alto() * 0.03 - top,
      alto() - sobre.offsetHeight - 12 - nota.offsetHeight - top,
    );
  };

  // ── Estado pre-paint: semicírculo asomando, título en tinta, sobre bajo
  //    el piso, notas adentro y derechas.
  gsap.set(campo, { clipPath: circulo(radioInicial()) });
  gsap.set(tituloLuz, { autoAlpha: 1 });
  gsap.set(sobre, { y: hundidoSobre });
  gsap.set(notas, { x: 0, y: 0, rotation: 0, transformOrigin: "50% 100%" });

  const sinRender = { immediateRender: false } as const;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: `+=${RECORRIDO_CARTA}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Este trigger nace DESPUÉS que los de las secciones de abajo (live se
      // decide en un layout effect). ScrollTrigger procesa los pins en orden
      // de creación salvo que algún trigger declare refreshPriority: con eso
      // ordena por posición en la página y el spacer de la carta se suma bien
      // al inicio de los pins siguientes (si no, el cierre pinneaba 4400px
      // antes de tiempo).
      refreshPriority: 0,
      onUpdate: (self) => {
        // Progreso expuesto para QA (scripts de scroll leen data-progreso).
        zona.dataset.progreso = self.progress.toFixed(3);
      },
    },
  });

  // ── 1. El wipe: la noche llega desde abajo y el título se invierte a su
  //    paso; el sobre sube al borde inferior y se queda.
  tl.fromTo(
    campo,
    { clipPath: () => circulo(radioInicial()) },
    {
      clipPath: () => circulo(radioTotal()),
      duration: T.wipe.hasta - T.wipe.desde,
      ease: "power2.inOut",
      ...sinRender,
    },
    T.wipe.desde,
  );
  tl.fromTo(
    sobre,
    { y: hundidoSobre },
    {
      y: 0,
      duration: T.sobreEntra.hasta - T.sobreEntra.desde,
      ease: "power2.out",
      ...sinRender,
    },
    T.sobreEntra.desde,
  );

  tl.fromTo(
    tituloLuz,
    { autoAlpha: 1 },
    { autoAlpha: 0, duration: T.tituloSeVa.hasta - T.tituloSeVa.desde, ...sinRender },
    T.tituloSeVa.desde,
  );

  // ── 2 y 3. Cada nota sale del sobre (lineal: es el scroll el que la saca)
  //    y se apila con su giro. La segunda va encima de la primera en el DOM,
  //    así al salir la tapa y deja asomar sus bordes.
  notas.forEach((nota, i) => {
    const ventana = T.notas[i];
    if (!ventana) return;
    tl.fromTo(
      nota,
      { x: 0, y: 0, rotation: 0 },
      {
        x: PILA.corrimientos[i],
        y: yArriba(nota),
        rotation: PILA.giros[i],
        duration: ventana.hasta - ventana.desde,
        ...sinRender,
      },
      ventana.desde,
    );
  });

  // Respiro final antes de soltar el pin (fija el largo total del timeline).
  tl.to({}, { duration: 0.01 }, T.fin - 0.01);

  return tl;
}
