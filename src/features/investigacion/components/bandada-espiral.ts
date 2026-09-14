import gsap from "gsap";
import { NODOS, RADIO_NODO } from "./espiral";

/**
 * La bandada de la hoja 03 (Facundo, 2026-09-14): los nodos del
 * ciclo bajan sobre el papel como las estrellas del hero bajan sobre la
 * hoja 01 (hero/coreografia-historia.ts §4), caen sueltos —datos sin orden
 * todavía— y cada uno vuela a su lugar en la espiral justo antes de que el
 * personaje llegue. El camino se arma nodo por nodo: nada está pretrazado.
 * Los que abren cada vuelta (01 y 05) no bajan: brotan donde el personaje
 * aterriza. El personaje baja primero y lidera, como el naranja del hero.
 *
 * Los nodos son FUNCIONES DEL TIEMPO, igual que el personaje y la cámara
 * (recorrido-espiral.ts): cada uno tiene sus vuelos programados y en cada
 * tick se calcula dónde está. Determinista en las dos direcciones del
 * scrub y sin tweens de cx/cy peleando entre sí. El DOM lo trae
 * coreografia-espiral.ts.
 */

const sinRender = { immediateRender: false } as const;

/** Radio de un nodo suelto: todavía no es estación. */
export const RADIO_SUELTO = 5.5;

/** Duraciones (unidades del timeline): la bajada del cielo y el acomodo a
 *  la estación. Largas a propósito —unos 340 y 260 px de scroll— para que
 *  el vuelo se vea entero en vez de pasar en una muesca de la rueda. */
export const VUELO = { bajada: 0.9, acomodo: 0.7 } as const;
/** Cada nodo despega un poco después del anterior. */
export const ESCALON = 0.12;
/** Cuánto antes de que el personaje llegue termina de acomodarse el nodo. */
const ANTICIPO = 0.05;

/** El cielo: por encima del borde de la hoja en cada encuadre. En el
 *  interior el borde de la hoja queda en y ≈ 0 del viewBox; en el general,
 *  en ≈ -150. La hoja recorta (overflow-hidden): en el cielo no se ven. */
const CIELO = { interior: -70, general: -250 } as const;

type Punto = readonly [number, number];
type Bajada = { cielo: Punto; suelto: Punto };

/** De dónde baja cada nodo y dónde cae suelto (unidades del viewBox). Los
 *  de la vuelta interior caen dentro del encuadre interior, lejos de las
 *  cajas de texto; los de la exterior, alrededor de la vuelta de afuera y
 *  lejos de sus notas. `null`: brota en su estación. */
export const BANDADA: ReadonlyArray<Bajada | null> = [
  null,
  { cielo: [80, CIELO.interior], suelto: [98, 158] },
  { cielo: [250, CIELO.interior], suelto: [282, 352] },
  { cielo: [120, CIELO.interior], suelto: [118, 392] },
  null,
  { cielo: [330, CIELO.general], suelto: [352, 438] },
  { cielo: [60, CIELO.general], suelto: [24, 468] },
  { cielo: [40, CIELO.general], suelto: [24, 110] },
];

/** El vuelo del personaje: del cielo directo a la estación 01. */
export const VUELO_PERSONAJE = { cielo: [150, CIELO.interior] as Punto, hasta: NODOS[0] } as const;

/** Un vuelo es UNA curva (Bézier cuadrática) con un solo ease, sin
 *  quiebres: el control va a mitad de la cuerda, corrido en la
 *  perpendicular un 18 % de su largo hacia un lado que alterna por índice.
 *  Un solo arco que llega apuntando al destino (Facundo, 2026-09-14: «más
 *  fluida y puntual a donde se dirigen»; antes eran dos tramos rectos con
 *  un waypoint y el nodo se quebraba en el aire). */
export function controlDe(desde: Punto, hasta: Punto, i: number): Punto {
  const dx = hasta[0] - desde[0];
  const dy = hasta[1] - desde[1];
  const lado = i % 2 === 0 ? 1 : -1;
  return [(desde[0] + hasta[0]) / 2 - dy * 0.18 * lado, (desde[1] + hasta[1]) / 2 + dx * 0.18 * lado];
}

const ease = gsap.parseEase("power2.inOut");

/** Punto de la curva para el avance `u` (0..1), con el ease aplicado. */
export function puntoDeVuelo(desde: Punto, control: Punto, hasta: Punto, u: number): Punto {
  const e = ease(Math.min(1, Math.max(0, u)));
  const v = 1 - e;
  return [
    v * v * desde[0] + 2 * v * e * control[0] + e * e * hasta[0],
    v * v * desde[1] + 2 * v * e * control[1] + e * e * hasta[1],
  ];
}

type Tramo = { t0: number; t1: number; desde: Punto; control: Punto; hasta: Punto };

/** Los vuelos de los nodos, programados sobre el tiempo del timeline. */
export function crearVuelos(nodos: SVGCircleElement[]) {
  const tramos: Tramo[][] = nodos.map(() => []);
  const colocar = (k: number, [x, y]: Punto) => {
    nodos[k].setAttribute("cx", String(x));
    nodos[k].setAttribute("cy", String(y));
  };
  const programar = (k: number, t0: number, dur: number, desde: Punto, hasta: Punto) => {
    tramos[k].push({ t0, t1: t0 + dur, desde, control: controlDe(desde, hasta, k), hasta });
  };
  return {
    /** Baja del cielo y cae suelto. */
    baja: (k: number, at: number) => {
      const v = BANDADA[k];
      if (v) programar(k, at, VUELO.bajada, v.cielo, v.suelto);
    },
    /** Del lugar donde cayó a su estación, llegando antes que el personaje;
     *  `noAntesDe` frena el despegue si la vuelta todavía no arrancó. */
    acomoda: (k: number, llegada: number, noAntesDe: number) => {
      const v = BANDADA[k];
      if (!v) return;
      const t1 = llegada - ANTICIPO;
      const t0 = Math.max(noAntesDe, t1 - VUELO.acomodo);
      programar(k, t0, t1 - t0, v.suelto, NODOS[k]);
    },
    enTiempo: (time: number) => {
      tramos.forEach((vuelos, k) => {
        if (!vuelos.length) return;
        let p: Punto = vuelos[0].desde;
        for (const tr of vuelos) {
          if (time <= tr.t0) break;
          p = puntoDeVuelo(tr.desde, tr.control, tr.hasta, (time - tr.t0) / (tr.t1 - tr.t0));
        }
        colocar(k, p);
      });
    },
    /** A su estación, que es lo que dibuja el SSR. */
    restaurar: () => nodos.forEach((_, k) => colocar(k, NODOS[k])),
  };
}

/** El nodo crece al radio de estación al asentarse. */
export function asienta(tl: gsap.core.Timeline, nodo: SVGCircleElement, at: number) {
  tl.fromTo(
    nodo,
    { attr: { r: RADIO_SUELTO } },
    { attr: { r: RADIO_NODO }, duration: 0.18, ease: "back.out(2)", ...sinRender },
    at,
  );
}
