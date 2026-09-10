import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ENTRADA_SVH,
  PASO,
  PIVOTE,
  PIVOTE_ESPEJO,
  ROT,
  SUBIDA,
  ZOOM,
  ZOOM_ESPEJO,
  ritmo,
} from "./proyectos-escena";
import { animarVibora } from "./coreografia-vibora";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type Escena = {
  /** Índice (dentro de esta mitad) de la primera ficha de cada capítulo. */
  capInicio: readonly number[];
  /** Cuántas fichas van antes de esta mitad: numera fichas y contador. */
  desde: number;
  /** Fichas del archivo entero, para el contador. */
  total: number;
  espejo: boolean;
};

/**
 * Una mitad del archivo de fichas. La víbora reaparece por arriba mientras
 * la mitad sube (la cabeza queda quieta en pantalla, a media altura, y el
 * escenario se acomoda alrededor), y con el escenario clavado hace su
 * tramo EN SOLITARIO: cruza vacío con una estela, la cámara la sigue con
 * un zoom leve que se asienta, y recién entonces aparecen el título y las
 * fichas (`coreografia-vibora.ts` tiene su viaje y su final). Cada ficha
 * CAE sobre la pila (sube desde abajo, se endereza y se planta con su
 * inclinación) y las anteriores se hunden atrás, cada vez más chicas, con
 * dos asomando por arriba y la tercera ya oculta. Las de atrás siguen
 * OPACAS: con transparencia, el texto de una se leía a través de la otra
 * y la pila era una mancha. Cuando cae la primera ficha de un capítulo,
 * cambia el título de la columna. El contador se escribe directo al DOM
 * desde el onUpdate de la timeline (el scrub sigue moviéndose después de
 * que el scroll paró).
 *
 * Devuelve la limpieza (`ctx.revert()`).
 */
export function crearFichas(zone: HTMLElement, stage: HTMLElement, e: Escena) {
  const ctx = gsap.context(() => {
    const fichas = gsap.utils.toArray<HTMLElement>("[data-ficha]", stage);
    const titulos = gsap.utils.toArray<HTMLElement>("[data-cap-titulo]", stage);
    const camara = stage.querySelector<HTMLElement>("[data-camara]");
    const textos = gsap.utils.toArray<HTMLElement>("[data-texto]", stage);
    const columna = stage.querySelector<HTMLElement>("[data-columna]");
    const tituloGrande = stage.querySelector<HTMLElement>("[data-titulo-grande]");
    const contador = stage.querySelector<HTMLElement>("[data-contador]");
    if (!fichas.length) return;

    const r = ritmo(fichas.length, e.espejo);
    const { entrada, solo, inicio } = r;

    gsap.set(fichas, { y: 720, rotation: -7, autoAlpha: 0, transformOrigin: "50% 100%" });
    gsap.set(titulos, { autoAlpha: 0, y: 18 });
    gsap.set(titulos[0], { autoAlpha: 1, y: 0 });
    // Hasta que termina el solo no hay texto: el escenario es de la víbora.
    gsap.set(textos, { autoAlpha: 0, y: 18 });
    if (columna) gsap.set(columna, { autoAlpha: 0, y: 18 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: `top ${ENTRADA_SVH}%`,
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    // La cámara: zoom leve durante la subida y el solo, que se asienta en 1
    // justo antes de que aparezca el texto. Solo transform.
    if (camara) {
      const zoom = e.espejo ? ZOOM_ESPEJO : ZOOM;
      const pivote = e.espejo ? PIVOTE_ESPEJO : PIVOTE;
      gsap.set(camara, { scale: zoom, transformOrigin: pivote, willChange: "transform" });
      tl.to(camara, { scale: 1, ease: "power2.inOut", duration: solo * 0.9 }, entrada + solo * 0.1);
      tl.set(camara, { willChange: "auto" }, inicio);
    }
    tl.to(textos, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, inicio - 0.4);
    // La columna del capítulo: en la primera mitad llega con el resto del
    // texto; en el espejo la trae la víbora, en grande y ya en su lugar
    // definitivo. Es el relevo del título grande de la primera mitad, sin
    // repetir el truco de achicarlo.
    if (columna) {
      const t = e.espejo ? entrada * 0.8 : inicio - 0.32;
      tl.to(columna, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4 }, t);
    }

    // El título en grande (solo en la primera mitad): la víbora lo trae
    // (aparece cuando la cabeza ya cruzó la mitad de la subida), se queda
    // todo el solo y se disuelve encogiéndose apenas en el relevo: el
    // encabezado chico aparece arriba a la izquierda y la ficha 01 cae en su
    // lugar. Dos copias y no un texto escalado: escalado se ve borroso.
    if (tituloGrande) {
      gsap.set(tituloGrande, { autoAlpha: 0, y: 28, transformOrigin: "0% 50%" });
      tl.to(tituloGrande, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 }, entrada * 0.8);
      tl.to(tituloGrande, { autoAlpha: 0, scale: 0.92, ease: "power2.in", duration: 0.35 }, inicio - 0.45);
    }

    animarVibora(tl, stage, r, e.espejo, fichas.length);

    fichas.forEach((ficha, i) => {
      const t = inicio + i * PASO;
      // La ficha entra OPACA desde abajo del escenario (que la recorta):
      // si se fundiera, la anterior se vería a través mientras llega.
      tl.set(ficha, { autoAlpha: 1 }, t);
      tl.to(ficha, { y: 0, rotation: ROT[e.desde + i] ?? 0, ease: "power3.out", duration: SUBIDA }, t);
      // La pila se hunde: la anterior atrás, la de antes más atrás, la
      // tercera se va.
      if (i > 0) tl.to(fichas[i - 1], { y: -30, scale: 0.95, ease: "power2.inOut", duration: SUBIDA }, t);
      if (i > 1) tl.to(fichas[i - 2], { y: -56, scale: 0.9, ease: "power2.inOut", duration: SUBIDA }, t);
      if (i > 2) tl.to(fichas[i - 3], { autoAlpha: 0, ease: "power1.in", duration: SUBIDA * 0.5 }, t);

      // Cambio de capítulo: título (sale uno, DESPUÉS entra el otro: nunca
      // se pisan).
      const c = e.capInicio.indexOf(i);
      if (c > 0) {
        tl.to(titulos[c - 1], { autoAlpha: 0, y: -18, ease: "power2.in", duration: 0.28 }, t);
        tl.to(titulos[c], { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.45 }, t + 0.3);
      }
    });

    tl.to({}, { duration: r.respiro }, inicio + fichas.length * PASO);

    if (contador) {
      const pad = (n: number) => String(n).padStart(2, "0");
      tl.eventCallback("onUpdate", () => {
        // Cambia cuando la ficha que llega ya asomó más de la mitad (con
        // su ease, a 0.2 del paso ya subió dos tercios).
        const i = gsap.utils.clamp(0, fichas.length - 1, Math.floor((tl.time() - inicio) / PASO - 0.2));
        const texto = `${pad(e.desde + i + 1)} / ${pad(e.total)}`;
        if (contador.textContent !== texto) contador.textContent = texto;
      });
    }
  }, stage);

  return () => ctx.revert();
}
