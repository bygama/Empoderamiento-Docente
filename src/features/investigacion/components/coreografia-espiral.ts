import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BISAGRA, ESTACIONES, LARGO_ESPIRAL, LONGITUD_NODO, RADIO_NODO } from "./espiral";
import { ATENUADA, gestosAnotacion } from "./anotacion-espiral";
import { ANOTACIONES, INDICE_REMATE } from "./lamina-espiral";
import { crearCamara, crearRecorrido } from "./recorrido-espiral";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía de la lámina (Hoja 03), en tres movimientos: la vuelta 1 en
 * primer plano (el título se va en cuanto el personaje arranca, y de ahí
 * recorre 01→04 de un gesto con cada nodo brotando y anotando al paso); la
 * bisagra (cruza 04→05 mientras la cámara se aleja); la vuelta 2 y el lazo
 * (05→08, las anotaciones se retiran, el lazo verde lo devuelve al 01 y ahí
 * aterriza el remate). El rincón ya no releva títulos: antes pasaba de
 * título 1 → nota → «Implementar no es terminar», y Facundo (2026-09-12)
 * pidió que al empezar el recorrido vuelen todos. La escena completa está
 * contada en EspiralInvestigacion.tsx. Personaje y cámara salen del TIEMPO
 * de la timeline (recorrido-espiral.ts); acá solo se construye la timeline.
 */

/** Tiempos (unidades del timeline). */
const T = {
  intro: 0.3,
  /** 2.4 (antes 1.6) con el recorrido en 3800 px: cada etapa se lee con
   *  unos 230 px de scroll en vez de 145. Antes se iba en una muesca y
   *  media de rueda, antes de terminar la frase. */
  vuelta: 2.4,
  /** Al fin de cada vuelta: la última anotación termina de entrar en ~0.56
   *  (guía, bloque, nombre, texto, subrayado) y hay que poder leerla. */
  pausa: 0.8,
  bisagra: 1.0,
  lazo: 0.8,
  remate: 0.6,
} as const;

/** Alto del recorrido pinneado en px de scroll. */
export const RECORRIDO_ESPIRAL = 3800;

/** `zona` es lo que se pinnea: la hoja de una pantalla. */
export function crearEspiral({ zona }: { zona: HTMLElement }) {
  const q = gsap.utils.selector(zona);
  const espiral = q<SVGPathElement>("[data-espiral-path]")[0];
  const lazo = q<SVGPathElement>("[data-espiral-lazo]")[0];
  const nodos = q<SVGCircleElement>("[data-espiral-nodo]");
  const rotulos = q<SVGTextElement>("[data-espiral-rotulo]");
  // Guías y anotaciones vienen en orden de ANOTACIONES. La voz es el título
  // de la hoja, único.
  const guias = q<SVGLineElement>("[data-espiral-guia]");
  const anotaciones = q<HTMLElement>("[data-espiral-anotacion]");
  const titulo = q<HTMLElement>("[data-espiral-voz]")[0];

  const recorrido = crearRecorrido(espiral, lazo, q<SVGGElement>("[data-espiral-personaje]")[0]);
  const camara = crearCamara(q<SVGGElement>("[data-espiral-camara]")[0]);
  const { tramos, largoLazo } = recorrido;
  const suave = gsap.parseEase("power1.inOut");
  const lineal = (u: number) => u;

  // ── Estado pre-paint: cámara en primer plano, espiral sin trazar, solo
  //    el primer nodo con su anotación, el personaje en él, título 1.
  gsap.set(espiral, { strokeDasharray: LARGO_ESPIRAL, strokeDashoffset: LARGO_ESPIRAL });
  // El lazo arranca invisible: con linecap redondo, un dash de largo cero
  // igual pinta un punto en el nodo de salida.
  gsap.set(lazo, { strokeDasharray: largoLazo, strokeDashoffset: largoLazo, autoAlpha: 0 });
  nodos.forEach((n, k) => gsap.set(n, { attr: { r: k === 0 ? RADIO_NODO : 0 } }));
  rotulos.forEach((r, k) => gsap.set(r, { autoAlpha: k === 0 ? 1 : 0 }));
  gsap.set(titulo, { autoAlpha: 1, y: 0 });
  recorrido.enTiempo(0);
  camara.enTiempo(0);

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
        recorrido.enTiempo(tl.time());
        camara.enTiempo(tl.time());
      },
    },
  });

  // Los gestos de cada anotación (anotacion-espiral.ts); solo la primera
  // arranca a la vista.
  const gestos = ANOTACIONES.map((a, i) => gestosAnotacion(tl, anotaciones[i], guias[i], a.normal));
  gestos.forEach((g, i) => g.reposo(i === 0));

  // ── Gestos. Todo fromTo explícito: con scrub e invalidateOnRefresh, un
  //    .to() captura como inicio lo que encuentre y deja estados fantasma.
  const brotaNodo = (k: number, at: number) => {
    tl.fromTo(nodos[k], { attr: { r: 0 } }, { attr: { r: RADIO_NODO }, duration: 0.18, ease: "back.out(2)", ...sinRender }, at);
    tl.fromTo(rotulos[k], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ...sinRender }, at + 0.05);
  };
  /** Una vuelta: un solo tramo del nodo `a` al `b` a velocidad constante,
   *  con el trazo detrás; cada nodo brota y anota al paso, y la anotación
   *  anterior se atenúa en vez de irse: lo leído queda para releer. */
  const vuelta = (a: number, b: number, t0: number) => {
    const l0 = LONGITUD_NODO[a];
    const l1 = LONGITUD_NODO[b];
    tramos.push({ t0, t1: t0 + T.vuelta, l0, l1, ease: lineal });
    tl.fromTo(
      espiral,
      { strokeDashoffset: LARGO_ESPIRAL - l0 },
      { strokeDashoffset: LARGO_ESPIRAL - l1, duration: T.vuelta, ...sinRender },
      t0,
    );
    for (let k = a + 1; k <= b; k++) {
      const tk = t0 + T.vuelta * ((LONGITUD_NODO[k] - l0) / (l1 - l0));
      brotaNodo(k, tk - 0.04);
      gestos[k - 1].atenua(tk);
      gestos[k].entra(tk);
    }
    return t0 + T.vuelta;
  };

  // ── 1. Vuelta 1, en primer plano. El título vuela en cuanto el personaje
  //    arranca: de acá en adelante la hoja es la figura y sus anotaciones.
  tl.fromTo(titulo, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -28, duration: 0.3, ease: "power2.in", ...sinRender }, T.intro);
  let t = vuelta(0, BISAGRA - 1, T.intro) + T.pausa;

  // ── 2. La bisagra: 04→05 mientras la cámara se aleja.
  tramos.push({ t0: t, t1: t + T.bisagra, l0: LONGITUD_NODO[BISAGRA - 1], l1: LONGITUD_NODO[BISAGRA], ease: suave });
  camara.programar(t, t + T.bisagra, gsap.parseEase("power2.inOut"));
  tl.fromTo(
    espiral,
    { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[BISAGRA - 1] },
    { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[BISAGRA], duration: T.bisagra, ease: "power1.inOut", ...sinRender },
    t,
  );
  // Las cuatro de adentro sí se van: no entran en el plano general.
  for (let k = 0; k < BISAGRA; k++) gestos[k].sale(t, k === BISAGRA - 1 ? 1 : ATENUADA);
  brotaNodo(BISAGRA, t + T.bisagra - 0.04);
  gestos[BISAGRA].entra(t + T.bisagra);
  const tLlegadaBisagra = t + T.bisagra;
  // La misma pausa que al fin de cada vuelta: que la anotación 05 se lea.
  t = tLlegadaBisagra + T.pausa;

  // ── 3. Vuelta 2, en plano general.
  t = vuelta(BISAGRA, ESTACIONES - 1, t) + T.pausa;

  // ── El lazo: las anotaciones se retiran, se traza en verde y el
  //    personaje vuelve al primer nodo, que late. Ahí aterriza el remate.
  for (let k = BISAGRA; k < ESTACIONES; k++) gestos[k].sale(t, k === ESTACIONES - 1 ? 1 : ATENUADA);
  tramos.push({ t0: t, t1: t + T.lazo, l0: LARGO_ESPIRAL, l1: LARGO_ESPIRAL + largoLazo, ease: suave });
  tl.fromTo(lazo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ...sinRender }, t);
  tl.fromTo(lazo, { strokeDashoffset: largoLazo }, { strokeDashoffset: 0, duration: T.lazo, ease: "power1.inOut", ...sinRender }, t);
  const tLlegada = t + T.lazo;
  tl.fromTo(nodos[0], { attr: { r: RADIO_NODO } }, { attr: { r: RADIO_NODO * 1.6 }, duration: 0.12, ease: "power2.out", ...sinRender }, tLlegada);
  tl.fromTo(nodos[0], { attr: { r: RADIO_NODO * 1.6 } }, { attr: { r: RADIO_NODO }, duration: 0.18, ease: "power1.inOut", ...sinRender }, tLlegada + 0.12);
  gestos[INDICE_REMATE].entra(tLlegada);
  t = tLlegada + T.remate;

  // Respiro final antes de soltar el pin (fija el largo total del timeline).
  tl.to({}, { duration: 0.01 }, t);

  /** Progreso (0–1) en el que el personaje llega a 05: destino de #evidencia. */
  const progresoBisagra = tLlegadaBisagra / tl.duration();

  /** Personaje y cámara se escriben a mano: ctx.revert() no los conoce. */
  const restaurar = () => {
    recorrido.restaurar();
    camara.restaurar();
  };

  return { tl, progresoBisagra, restaurar };
}
