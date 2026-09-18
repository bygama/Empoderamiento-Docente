import { VUELO, VUELO_PERSONAJE, controlDe, puntoDeVuelo } from "./bandada-espiral";
import { LARGO_ESPIRAL } from "./espiral";
import { ENCUADRE_GENERAL, ENCUADRE_INTERIOR, transformDeEncuadre } from "./lamina-espiral";

/**
 * El personaje y la cámara como FUNCIONES DEL TIEMPO de la timeline, no
 * como tweens. Con scrub, el orden en que GSAP renderiza varios tweens
 * sobre un mismo objetivo no es de fiar, y el transform de un <g> de SVG
 * con origen propio tampoco: una función del tiempo es determinista en
 * ambas direcciones y escribe el atributo a mano. La coreografía programa
 * los tramos y llama a `enTiempo` en cada update del scroll.
 */

export type Ease = (u: number) => number;

/** Un tramo del personaje: entre t0 y t1 va de la longitud l0 a la l1. */
export type Tramo = { t0: number; t1: number; l0: number; l1: number; ease: Ease };

export function crearRecorrido(espiral: SVGPathElement, lazo: SVGPathElement, personaje: SVGGElement) {
  const largoLazo = lazo.getTotalLength();
  const tramos: Tramo[] = [];
  const longitudEn = (time: number) => {
    let l = 0;
    for (const tr of tramos) {
      if (time <= tr.t0) break;
      const u = Math.min(1, (time - tr.t0) / (tr.t1 - tr.t0));
      l = tr.l0 + (tr.l1 - tr.l0) * tr.ease(u);
    }
    return l;
  };
  const colocarEn = (x: number, y: number) => personaje.setAttribute("transform", `translate(${x} ${y})`);
  /** Longitudes mayores que la espiral siguen por el lazo. */
  const colocar = (l: number) => {
    const p =
      l <= LARGO_ESPIRAL
        ? espiral.getPointAtLength(l)
        : lazo.getPointAtLength(Math.min(l - LARGO_ESPIRAL, largoLazo));
    colocarEn(p.x, p.y);
  };
  /** El vuelo de entrada (bandada-espiral.ts): antes de recorrer nada, el
   *  personaje baja del cielo a la estación 01, con la misma curva que los
   *  nodos. Hasta el despegue espera en el cielo. */
  let salidaVuelo: number | null = null;
  const { cielo, hasta } = VUELO_PERSONAJE;
  const control = controlDe(cielo, hasta, 8);
  const enTiempo = (time: number) => {
    if (salidaVuelo !== null && time < salidaVuelo + VUELO.bajada) {
      const [x, y] = puntoDeVuelo(cielo, control, hasta, (time - salidaVuelo) / VUELO.bajada);
      colocarEn(x, y);
      return;
    }
    colocar(longitudEn(time));
  };
  return {
    tramos,
    largoLazo,
    enTiempo,
    /** Programa el vuelo de entrada: despega en `t0`. */
    programarVuelo: (t0: number) => {
      salidaVuelo = t0;
    },
    /** Al nodo 0, que es lo que dibuja el SSR. */
    restaurar: () => colocar(0),
  };
}

/** La cámara: primer plano hasta que empieza el viaje, plano general
 *  desde que termina, y la interpolación entre ambos en el medio. */
export function crearCamara(camara: SVGGElement) {
  const interior = transformDeEncuadre(ENCUADRE_INTERIOR);
  const general = transformDeEncuadre(ENCUADRE_GENERAL);
  let viaje = { t0: Infinity, t1: Infinity, ease: (u: number) => u };
  const enTiempo = (time: number) => {
    const u = time <= viaje.t0 ? 0 : time >= viaje.t1 ? 1 : viaje.ease((time - viaje.t0) / (viaje.t1 - viaje.t0));
    const x = interior.x + (general.x - interior.x) * u;
    const y = interior.y + (general.y - interior.y) * u;
    const s = interior.scale + (general.scale - interior.scale) * u;
    camara.setAttribute("transform", `translate(${x} ${y}) scale(${s})`);
  };
  return {
    /** Programa el viaje del encuadre interior al general. */
    programar: (t0: number, t1: number, ease: Ease) => {
      viaje = { t0, t1, ease };
    },
    enTiempo,
    /** Sin transform: el viewBox tal cual, que es lo que dibuja el SSR (el
     *  plano general vivo está apenas corrido; ver ENCUADRE_GENERAL). */
    restaurar: () => camara.removeAttribute("transform"),
  };
}
