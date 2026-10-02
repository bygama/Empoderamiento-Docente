import gsap from "gsap";
import { FIGURAS } from "../../constelacion";
import type { Piezas } from "./escena";
import { TRAZO } from "./vuelo";

/* Tinta de las palabras y números del riel: los de la hoja de escritorio
   (coreografia-historia.ts). GSAP no tweenea color-mix(): van resueltos. */
const TINTA_APAGADA = "rgba(31, 45, 77, 0.16)";
const TINTA_PRENDIDA = "rgba(31, 45, 77, 0.94)";
const NUMERO_APAGADO = "rgba(107, 116, 128, 0.8)";
const NUMERO_PRENDIDO = "rgba(31, 45, 77, 1)";
const APARATO = TRAZO + 0.2;
const PASO_1 = TRAZO + 0.35;
/** El hallazgo: el punto de la lupa que queda en el centro del vidrio. */
const HALLAZGO = 9;
const sinRender = { immediateRender: false } as const;

/** Entra la frase y se pinta palabra por palabra, al ritmo del scroll. */
function agregarFrase(tl: gsap.core.Timeline, frase: HTMLElement, inicio: number) {
  const palabras = gsap.utils.toArray<HTMLElement>(frase.querySelectorAll("[data-palabra]"));
  tl.fromTo(frase, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ...sinRender }, inicio);
  tl.fromTo(
    palabras,
    { color: TINTA_APAGADA },
    { color: TINTA_PRENDIDA, duration: 0.25, stagger: 0.05, ...sinRender },
    inicio + 0.15,
  );
}

/**
 * Los cuatro pasos sobre la hoja, en celular: riel 01–04, verbo que se
 * releva, frase que se pinta y la constelación que morfea de pregunta a lupa,
 * red y espiral. Es el tramo 5 de escritorio (coreografia-historia.ts) sobre
 * el mismo DOM de la hoja; la chispa reaparece en el vidrio de la lupa.
 */
export function agregarPasos(tl: gsap.core.Timeline, p: Piezas) {
  const { cielo } = p;
  const q = gsap.utils.selector(p.hoja);
  const numeros = q<HTMLElement>("[data-riel-numero]");
  const rellenos = q<HTMLElement>("[data-riel-relleno]");
  const verbos = q<HTMLElement>("[data-verbo]");
  const frases = q<HTMLElement>("[data-frase]");
  const X = (punto: readonly [number, number]) => () => cielo.x(punto[0]);
  const Y = (punto: readonly [number, number]) => () => cielo.y(punto[1]);

  tl.fromTo(q("[data-riel]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ...sinRender }, APARATO);
  tl.fromTo(numeros[0], { color: NUMERO_APAGADO }, { color: NUMERO_PRENDIDO, duration: 0.3, ...sinRender }, PASO_1);
  tl.fromTo(verbos[0], { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power2.out", ...sinRender }, PASO_1);
  agregarFrase(tl, frases[0], PASO_1 + 0.25);
  tl.to({}, { duration: 0.3 }); // la pregunta respira

  for (let idx = 1; idx < FIGURAS.length; idx++) {
    const desde = FIGURAS[idx - 1];
    const hacia = FIGURAS[idx];
    const inicio = tl.duration();

    tl.fromTo(rellenos[idx - 1], { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power1.inOut", ...sinRender }, inicio);
    tl.fromTo(
      numeros[idx - 1],
      { color: NUMERO_PRENDIDO },
      { color: NUMERO_APAGADO, duration: 0.3, ...sinRender },
      inicio + 0.15,
    );
    tl.fromTo(numeros[idx], { color: NUMERO_APAGADO }, { color: NUMERO_PRENDIDO, duration: 0.3, ...sinRender }, inicio + 0.3);

    p.circulos.forEach((c, i) => {
      tl.fromTo(
        c,
        { attr: { cx: X(desde.puntos[i]), cy: Y(desde.puntos[i]) } },
        { attr: { cx: X(hacia.puntos[i]), cy: Y(hacia.puntos[i]) }, duration: 0.85, ease: "power2.inOut", ...sinRender },
        inicio + 0.12 + i * 0.01,
      );
    });
    p.lineas.forEach((l, j) => {
      const antes = desde.aristas[j];
      const despues = hacia.aristas[j];
      const [a0, b0] = antes ?? despues ?? [0, 0];
      const [a1, b1] = despues ?? antes ?? [0, 0];
      const origen = antes ? desde : hacia;
      const meta = despues ? hacia : desde;
      tl.fromTo(
        l,
        {
          autoAlpha: antes ? 1 : 0,
          attr: { x1: X(origen.puntos[a0]), y1: Y(origen.puntos[a0]), x2: X(origen.puntos[b0]), y2: Y(origen.puntos[b0]) },
        },
        {
          autoAlpha: despues ? 1 : 0,
          attr: { x1: X(meta.puntos[a1]), y1: Y(meta.puntos[a1]), x2: X(meta.puntos[b1]), y2: Y(meta.puntos[b1]) },
          duration: 0.85,
          ease: "power2.inOut",
          ...sinRender,
        },
        inicio + 0.12,
      );
    });

    // La luz cambia de instrumento: reaparece en el vidrio de la lupa y se
    // reparte cuando la lupa se vuelve red.
    if (hacia.id === "lupa") {
      const vidrio = hacia.puntos[HALLAZGO];
      tl.set(p.chispa, { x: X(vidrio), y: Y(vidrio) }, inicio + 0.72);
      tl.fromTo(
        p.chispa,
        { autoAlpha: 0, scale: 0.3 },
        { autoAlpha: 1, scale: 1.3, duration: 0.35, ease: "power2.out", ...sinRender },
        inicio + 0.72,
      );
    }
    if (desde.id === "lupa") {
      tl.fromTo(
        p.chispa,
        { autoAlpha: 1, scale: 1.3 },
        { autoAlpha: 0, scale: 2.2, duration: 0.45, ease: "power1.out", ...sinRender },
        inicio + 0.1,
      );
    }

    // Las salidas también van con su `from` explícito: tras un refresh el
    // timeline se invalida, y un `to` volvería a tomar como partida el valor
    // de llegada.
    tl.fromTo(
      verbos[idx - 1],
      { yPercent: 0 },
      { yPercent: -110, duration: 0.4, ease: "power2.in", ...sinRender },
      inicio + 0.1,
    );
    tl.fromTo(verbos[idx], { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "power2.out", ...sinRender }, inicio + 0.32);
    tl.fromTo(frases[idx - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.3, ...sinRender }, inicio + 0.1);
    agregarFrase(tl, frases[idx], inicio + 0.42);
    tl.to({}, { duration: 0.3 }); // respiro entre pasos
  }
  // Respiro final antes de soltar la escena hacia «Líneas».
  tl.to({}, { duration: 0.45 });
}
