import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ALTO_SVH,
  CABEZA_AL_CLAVAR,
  CABEZA_FIN_SOLO,
  ENTRADA_SVH,
  ESTELA_ALPHA,
  ESTELA_ATRASO,
  ESTELA_SEG,
  LAZO_SEG,
  PASO,
  PIVOTE,
  PUNTO_GAP,
  PUNTO_SEG,
  ROT,
  SALIDA,
  SOLO,
  SUBIDA,
  ZOOM,
} from "./proyectos-escena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Respiro después de la última ficha, antes de que el sticky se suelte.
const RESPIRO = 0.6;

/**
 * El archivo de fichas. La víbora de Niveles reaparece por arriba mientras
 * la sección sube (la cabeza queda quieta en pantalla, a media altura, y
 * el escenario se acomoda alrededor), y con el escenario clavado hace su
 * tramo EN SOLITARIO: cruza el escenario vacío con una estela, la cámara
 * la sigue con un zoom leve que se asienta, y recién entonces aparecen el
 * título y las fichas. VIAJA (la cabeza avanza, la cola se borra, la
 * cápsula verde la persigue) hasta irse por abajo entre la tercera y la
 * cuarta ficha, igual que allá; cada ficha CAE sobre la pila (sube
 * desde abajo, se endereza y se planta con su inclinación) y las anteriores
 * se hunden atrás, cada vez más chicas, con dos asomando por arriba y la
 * tercera ya oculta. Las de atrás siguen OPACAS: con transparencia, el
 * texto de una se leía a través de la otra y la pila era una mancha.
 * Cuando cae la primera ficha de un capítulo, cambia el título de la
 * izquierda. El contador se escribe directo al DOM
 * desde el onUpdate de la timeline (el scrub sigue moviéndose después de
 * que el scroll paró).
 *
 * `capInicio`: índice de la primera ficha de cada capítulo.
 * Devuelve la limpieza (`ctx.revert()`).
 */
export function crearFichas(zone: HTMLElement, stage: HTMLElement, capInicio: readonly number[]) {
  const ctx = gsap.context(() => {
    const fichas = gsap.utils.toArray<HTMLElement>("[data-ficha]", stage);
    const titulos = gsap.utils.toArray<HTMLElement>("[data-cap-titulo]", stage);
    const cinta = stage.querySelector<SVGPathElement>("[data-cinta]");
    const capsula = stage.querySelector<SVGPathElement>("[data-capsula]");
    const estela = stage.querySelector<SVGPathElement>("[data-estela]");
    const camara = stage.querySelector<HTMLElement>("[data-camara]");
    const textos = gsap.utils.toArray<HTMLElement>("[data-texto]", stage);
    const tituloGrande = stage.querySelector<HTMLElement>("[data-titulo-grande]");
    const contador = stage.querySelector<HTMLElement>("[data-contador]");
    if (!fichas.length) return;

    const total = fichas.length;
    const CUERPO = SOLO + total * PASO + RESPIRO;
    // La entrada vale lo mismo por unidad de scroll que el resto.
    const ENTRADA = (CUERPO * ENTRADA_SVH) / (ALTO_SVH - 100);
    // Las fichas arrancan después del solo.
    const INICIO = ENTRADA + SOLO;

    gsap.set(fichas, { y: 720, rotation: -7, autoAlpha: 0, transformOrigin: "50% 100%" });
    gsap.set(titulos, { autoAlpha: 0, y: 18 });
    gsap.set(titulos[0], { autoAlpha: 1, y: 0 });
    // Hasta que termina el solo no hay texto: el escenario es de la víbora.
    gsap.set(textos, { autoAlpha: 0, y: 18 });

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
      gsap.set(camara, { scale: ZOOM, transformOrigin: PIVOTE, willChange: "transform" });
      tl.to(camara, { scale: 1, ease: "power2.inOut", duration: SOLO * 0.9 }, ENTRADA + SOLO * 0.1);
      tl.set(camara, { willChange: "auto" }, INICIO);
    }
    tl.to(textos, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.4, stagger: 0.08 }, INICIO - 0.4);

    // El título en grande: la víbora lo trae (aparece cuando la cabeza ya
    // cruzó la mitad de la subida), se queda todo el solo y se disuelve
    // encogiéndose apenas en el relevo: el encabezado chico aparece arriba a
    // la izquierda y la ficha 01 cae en su lugar. Dos copias y no un texto
    // escalado: escalado se ve borroso mientras está grande.
    if (tituloGrande) {
      gsap.set(tituloGrande, { autoAlpha: 0, y: 28, transformOrigin: "0% 50%" });
      tl.to(tituloGrande, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.35 }, ENTRADA * 0.8);
      tl.to(tituloGrande, { autoAlpha: 0, scale: 0.92, ease: "power2.in", duration: 0.35 }, INICIO - 0.45);
    }

    // La víbora, exactamente como en Niveles: una ventana visible que se
    // desliza a lo largo del recorrido vía dashoffset, y la cápsula corrida
    // detrás de la cola sobre el mismo path. Lo que se anima es la CABEZA
    // (fracción del recorrido) en tres tramos: asoma a mitad de la subida
    // y baja al ritmo con que sube la sección; con el escenario clavado
    // dispara en solitario hasta el pie; y después sale con las fichas.
    if (cinta && capsula) {
      const L = cinta.getTotalLength();
      const seg = L * LAZO_SEG;
      const dot = L * PUNTO_SEG;
      const gap = L * PUNTO_GAP;
      const corrimiento = gap + dot;
      const estelaSeg = L * ESTELA_SEG;
      const atraso = L * ESTELA_ATRASO;
      gsap.set(cinta, { strokeDasharray: `${seg} ${L * 2}` });
      gsap.set(capsula, { strokeDasharray: `${dot} ${L * 2}` });
      if (estela) gsap.set(estela, { strokeDasharray: `${estelaSeg} ${L * 2}` });
      const cabeza = { f: 0 };
      const colocar = () => {
        const d = seg - cabeza.f * L;
        gsap.set(cinta, { strokeDashoffset: d });
        gsap.set(capsula, { strokeDashoffset: d + corrimiento });
        if (estela) gsap.set(estela, { strokeDashoffset: d + seg - estelaSeg + atraso });
      };
      colocar();
      const fFinal = 1 + (corrimiento + L * 0.02) / L;
      tl.to(cabeza, { f: CABEZA_AL_CLAVAR, ease: "none", duration: ENTRADA * 0.5, onUpdate: colocar }, ENTRADA * 0.5);
      tl.to(cabeza, { f: CABEZA_FIN_SOLO, ease: "power1.inOut", duration: SOLO, onUpdate: colocar }, ENTRADA);
      tl.to(cabeza, { f: fFinal, ease: "none", duration: SALIDA, onUpdate: colocar }, INICIO);
      // La estela solo existe en el solo.
      if (estela) {
        tl.to(estela, { autoAlpha: ESTELA_ALPHA, duration: SOLO * 0.25 }, ENTRADA);
        tl.to(estela, { autoAlpha: 0, duration: SOLO * 0.3 }, INICIO - SOLO * 0.3);
      }
    }

    fichas.forEach((ficha, i) => {
      const t = INICIO + i * PASO;
      // La ficha entra OPACA desde abajo del escenario (que la recorta):
      // si se fundiera, la anterior se vería a través mientras llega.
      tl.set(ficha, { autoAlpha: 1 }, t);
      tl.to(ficha, { y: 0, rotation: ROT[i] ?? 0, ease: "power3.out", duration: SUBIDA }, t);
      // La pila se hunde: la anterior atrás, la de antes más atrás, la
      // tercera se va.
      if (i > 0) tl.to(fichas[i - 1], { y: -30, scale: 0.95, ease: "power2.inOut", duration: SUBIDA }, t);
      if (i > 1) tl.to(fichas[i - 2], { y: -56, scale: 0.9, ease: "power2.inOut", duration: SUBIDA }, t);
      if (i > 2) tl.to(fichas[i - 3], { autoAlpha: 0, ease: "power1.in", duration: SUBIDA * 0.5 }, t);

      // Cambio de capítulo: título (sale uno, DESPUÉS entra el otro: nunca
      // se pisan).
      const c = capInicio.indexOf(i);
      if (c > 0) {
        tl.to(titulos[c - 1], { autoAlpha: 0, y: -18, ease: "power2.in", duration: 0.28 }, t);
        tl.to(titulos[c], { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.45 }, t + 0.3);
      }
    });

    tl.to({}, { duration: RESPIRO }, INICIO + total * PASO);

    if (contador) {
      tl.eventCallback("onUpdate", () => {
        // Cambia cuando la ficha que llega ya asomó más de la mitad (con
        // su ease, a 0.2 del paso ya subió dos tercios). Sin el «+ 1» que
        // había: mostraba 03 con la ficha 02 recién apoyada.
        const i = gsap.utils.clamp(0, total - 1, Math.floor((tl.time() - INICIO) / PASO - 0.2));
        const texto = `${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        if (contador.textContent !== texto) contador.textContent = texto;
      });
    }
  }, stage);

  return () => ctx.revert();
}
