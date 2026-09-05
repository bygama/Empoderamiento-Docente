import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BISAGRA,
  ESTACIONES,
  LARGO_ESPIRAL,
  LONGITUD_NODO,
  RADIO_NODO,
} from "./espiral";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía de la espiral doble — «Cómo una experiencia se convierte en
 * transformación» + «Implementar no es terminar», un solo escenario
 * pinneado (Hoja 03 del archivo).
 *
 * El personaje —el punto naranja del hero— recorre la espiral estación por
 * estación. Cada tramo: el personaje viaja al nodo siguiente mientras la
 * espiral se traza detrás, el nodo aparece al llegar y el texto de la
 * estación releva al anterior. Ocho estaciones en dos vueltas:
 *
 * - Vuelta 1 (nodos 0–3): el ciclo pedagógico.
 * - LA BISAGRA (viaje 3→4): «no cierra el ciclo: abre nuevas preguntas».
 *   El personaje no se va: sigue girando. El título cambia a «Implementar
 *   no es terminar» y la volanta a «Volvemos a investigar».
 * - Vuelta 2 (nodos 4–7): el ciclo de evidencia, más abierto.
 * - EL LAZO: del último nodo vuelve al primero por afuera (se traza en
 *   verde) y el personaje aterriza donde empezó: abrimos otro ciclo. El
 *   remate: la evidencia vuelve al proceso.
 *
 * El personaje NO se anima con tweens: su posición sale del TIEMPO de la
 * timeline (tramos de longitud sobre espiral + lazo encadenados, con
 * getPointAtLength), como las estrellas del cierre. Con scrub, el orden en
 * que GSAP renderiza varios tweens sobre un mismo proxy no es de fiar;
 * una función del tiempo es determinista en ambas direcciones.
 * Patrón: como las otras coreografías, acá solo se construye la timeline.
 */

type Escena = {
  /** Lo que se pinnea (la hoja de una pantalla). */
  zona: HTMLElement;
};

/** Tiempos (unidades del timeline). */
const T = {
  intro: 0.3,
  viaje: 0.6,
  lectura: 0.55,
  /** Pausa extra en la bisagra, para leer «no cierra el ciclo». */
  bisagra: 0.6,
  lazo: 0.9,
  remate: 0.8,
} as const;

/** Alto del recorrido pinneado en px de scroll. */
export const RECORRIDO_ESPIRAL = 7000;

export function crearEspiral({ zona }: Escena) {
  const q = gsap.utils.selector(zona);
  const espiral = q<SVGPathElement>("[data-espiral-path]")[0];
  const lazo = q<SVGPathElement>("[data-espiral-lazo]")[0];
  const nodos = q<SVGCircleElement>("[data-espiral-nodo]");
  const rotulos = q<SVGTextElement>("[data-espiral-rotulo]");
  const personaje = q<SVGGElement>("[data-espiral-personaje]")[0];
  const bloques = q<HTMLElement>("[data-espiral-bloque]");
  const volantas = q<HTMLElement>("[data-espiral-volanta]");
  const titulos = q<HTMLElement>("[data-espiral-titulo]");

  const largoLazo = lazo.getTotalLength();

  // ── El personaje: tramos {t0, t1, l0, l1} sobre espiral + lazo
  //    encadenados; la longitud actual sale del tiempo de la timeline.
  type Tramo = { t0: number; t1: number; l0: number; l1: number };
  const tramos: Tramo[] = [];
  const suave = gsap.parseEase("power1.inOut");
  const longitudEn = (time: number) => {
    let l = 0;
    for (const tr of tramos) {
      if (time <= tr.t0) break;
      const u = Math.min(1, (time - tr.t0) / (tr.t1 - tr.t0));
      l = tr.l0 + (tr.l1 - tr.l0) * suave(u);
    }
    return l;
  };
  const colocar = (l: number) => {
    const p =
      l <= LARGO_ESPIRAL
        ? espiral.getPointAtLength(l)
        : lazo.getPointAtLength(Math.min(l - LARGO_ESPIRAL, largoLazo));
    personaje.setAttribute("transform", `translate(${p.x} ${p.y})`);
  };

  // Índice del bloque de texto de cada estación (la bisagra ocupa un lugar
  // entre la 3 y la 4; el remate va al final).
  const bloqueEstacion = (k: number) => (k < BISAGRA ? k : k + 1);
  const bloqueBisagra = BISAGRA;
  const bloqueRemate = ESTACIONES + 1;

  // ── Estado pre-paint: espiral sin trazar, solo el primer nodo, el
  //    personaje en él, primer bloque y primer título visibles.
  gsap.set(espiral, { strokeDasharray: LARGO_ESPIRAL, strokeDashoffset: LARGO_ESPIRAL });
  // El lazo arranca invisible: con linecap redondo, un dash de largo cero
  // igual pinta un punto en el nodo de salida.
  gsap.set(lazo, { strokeDasharray: largoLazo, strokeDashoffset: largoLazo, autoAlpha: 0 });
  nodos.forEach((n, k) => gsap.set(n, { attr: { r: k === 0 ? RADIO_NODO : 0 } }));
  rotulos.forEach((r, k) => gsap.set(r, { autoAlpha: k === 0 ? 1 : 0 }));
  colocar(0);
  bloques.forEach((b, i) => gsap.set(b, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 14 }));
  volantas.forEach((v, i) => gsap.set(v, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 12 }));
  titulos.forEach((t, i) => gsap.set(t, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 18 }));

  const sinRender = { immediateRender: false } as const;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: `+=${RECORRIDO_ESPIRAL}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // Nace un render después que los triggers de abajo (live se decide en
      // un layout effect): ordenar por posición, no por creación.
      refreshPriority: 0,
      onUpdate: (self) => {
        zona.dataset.progreso = self.progress.toFixed(3);
        colocar(longitudEn(tl.time()));
      },
    },
  });

  const salida = (el: Element, at: number) =>
    tl.to(el, { autoAlpha: 0, y: -12, duration: 0.22, ease: "power1.in" }, at);
  const entrada = (el: Element, at: number) =>
    tl.fromTo(
      el,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender },
      at,
    );
  const brotaNodo = (k: number, at: number) => {
    tl.fromTo(
      nodos[k],
      { attr: { r: 0 } },
      { attr: { r: RADIO_NODO }, duration: 0.18, ease: "back.out(2)", ...sinRender },
      at,
    );
    tl.fromTo(rotulos[k], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ...sinRender }, at + 0.05);
  };

  let t = T.intro;
  let tBisagra = 0;

  // ── Las siete travesías entre estaciones.
  for (let k = 0; k < ESTACIONES - 1; k++) {
    const llegada = k + 1;
    const esBisagra = llegada === BISAGRA;

    // El personaje viaja y la espiral se traza detrás.
    tramos.push({ t0: t, t1: t + T.viaje, l0: LONGITUD_NODO[k], l1: LONGITUD_NODO[llegada] });
    tl.fromTo(
      espiral,
      { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[k] },
      { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[llegada], duration: T.viaje, ease: "power1.inOut", ...sinRender },
      t,
    );
    salida(bloques[bloqueEstacion(k)], t + 0.05);

    if (esBisagra) {
      // La bisagra: el título y la volanta cambian en pleno viaje, y entra
      // «no cierra el ciclo: abre nuevas preguntas».
      salida(titulos[0], t + 0.1);
      salida(volantas[0], t + 0.1);
      entrada(titulos[1], t + 0.3);
      entrada(volantas[1], t + 0.3);
      entrada(bloques[bloqueBisagra], t + 0.3);
      brotaNodo(llegada, t + T.viaje - 0.06);
      tBisagra = t + T.viaje;
      // Pausa de lectura de la bisagra; después releva la estación 05.
      const tRelevo = t + T.viaje + T.bisagra;
      salida(bloques[bloqueBisagra], tRelevo);
      entrada(bloques[bloqueEstacion(llegada)], tRelevo + 0.12);
      t = tRelevo + 0.12 + T.lectura;
    } else {
      brotaNodo(llegada, t + T.viaje - 0.06);
      entrada(bloques[bloqueEstacion(llegada)], t + T.viaje - 0.02);
      t += T.viaje + T.lectura;
    }
  }

  // ── El lazo: se traza en verde y el personaje vuelve al primer nodo.
  tramos.push({ t0: t, t1: t + T.lazo, l0: LARGO_ESPIRAL, l1: LARGO_ESPIRAL + largoLazo });
  tl.fromTo(lazo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ...sinRender }, t);
  tl.fromTo(
    lazo,
    { strokeDashoffset: largoLazo },
    { strokeDashoffset: 0, duration: T.lazo, ease: "power1.inOut", ...sinRender },
    t,
  );
  salida(bloques[bloqueEstacion(ESTACIONES - 1)], t + 0.05);
  entrada(bloques[bloqueRemate], t + T.lazo * 0.55);
  // Al aterrizar, el primer nodo late: acá empieza otra vez.
  tl.fromTo(
    nodos[0],
    { attr: { r: RADIO_NODO } },
    { attr: { r: RADIO_NODO * 1.6 }, duration: 0.12, ease: "power2.out", ...sinRender },
    t + T.lazo,
  );
  tl.to(nodos[0], { attr: { r: RADIO_NODO }, duration: 0.18, ease: "power1.inOut" }, t + T.lazo + 0.12);
  t += T.lazo + T.remate;

  // Respiro final antes de soltar el pin (fija el largo total del timeline).
  tl.to({}, { duration: 0.01 }, t);

  /** Progreso (0–1) en el que llega la bisagra: destino del ancla #evidencia. */
  const progresoBisagra = tBisagra / tl.duration();

  /** El transform del personaje se escribe a mano: ctx.revert() no lo
   *  conoce. Volver al nodo 0, que es lo que dibuja el SSR. */
  const restaurar = () => colocar(0);

  return { tl, progresoBisagra, restaurar };
}
