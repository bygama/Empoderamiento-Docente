import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {
  CINTA_INICIO,
  ESTELA_ALPHA,
  ESTELA_ATRASO_PX,
  ESTELA_PX,
  GAP_PX,
  GIRO,
  LAZO_PX,
  PUNTO_PX,
  SOLO,
  TRAMOS,
  type Ritmo,
} from "./proyectos-escena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

/** Largo acumulado del recorrido al final de cada tramo, en píxeles. */
function medirHitos(svg: SVGSVGElement) {
  const sonda = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svg.appendChild(sonda);
  const hitos = TRAMOS.map((_, k) => {
    sonda.setAttribute("d", `${CINTA_INICIO} ${TRAMOS.slice(0, k + 1).join(" ")}`);
    return sonda.getTotalLength();
  });
  sonda.remove();
  return hitos;
}

/**
 * Una curva SUAVE por los hitos (tiempo → píxel de recorrido): cúbica
 * monótona de Fritsch–Butland, que pasa exactamente por cada punto sin
 * pasarse ni volver atrás, y con la velocidad continua. Antes cada tramo
 * era un tween con su ease y en cada hito la víbora frenaba a cero y
 * volvía a arrancar, o saltaba de velocidad (Gastón, 2026-09-10: «cambia
 * de velocidades, no está bien planteado»). Devuelve el ease para un único
 * tween de 0 a `T` unidades que lleva la cabeza de `c0` a `cFin`.
 */
function easePorHitos(puntos: [number, number][]) {
  const n = puntos.length - 1;
  const T = puntos[n][0];
  const c0 = puntos[0][1];
  const rango = puntos[n][1] - c0;
  const xs = puntos.map(([t]) => t / T);
  const ys = puntos.map(([, c]) => (c - c0) / rango);
  const h = xs.slice(0, -1).map((x, i) => xs[i + 1] - x);
  const d = h.map((hi, i) => (ys[i + 1] - ys[i]) / hi);
  const m = xs.map((_, i) => {
    if (i === 0) return d[0];
    if (i === n) return d[n - 1];
    if (d[i - 1] * d[i] <= 0) return 0;
    const w1 = 2 * h[i] + h[i - 1];
    const w2 = h[i] + 2 * h[i - 1];
    return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
  });
  const p = (v: number) => v.toFixed(5);
  let ruta = "M0,0";
  for (let i = 0; i < n; i++) {
    const k = h[i] / 3;
    ruta += ` C${p(xs[i] + k)},${p(ys[i] + m[i] * k)} ${p(xs[i + 1] - k)},${p(ys[i + 1] - m[i + 1] * k)} ${p(xs[i + 1])},${p(ys[i + 1])}`;
  }
  return { ease: CustomEase.create("vibora", ruta), T, cFin: puntos[n][1] };
}

/**
 * La víbora, exactamente como en Niveles: una ventana visible que se
 * desliza a lo largo del recorrido vía dashoffset, y la cápsula corrida
 * detrás de la cola sobre el mismo path. Lo que se anima es la CABEZA (en
 * píxeles de recorrido) con UN solo tween y una curva suave por los hitos:
 * durante la subida está quieta en la costura con Niveles (tramo P); con
 * el escenario clavado dispara en solitario hasta el pie, con la estela;
 * repta por el pie mientras caen las fichas del lado A; en el giro sube
 * por el costado y vuelve a bajar por el centro, otra vez con estela; con
 * las fichas del lado B hace el pie y vuelve al centro; y cuando el
 * escenario se suelta y el cierre viene subiendo, se zambulle y se esconde
 * debajo del cartel que sigue. Nunca se detiene.
 */
export function animarVibora(tl: gsap.core.Timeline, stage: HTMLElement, r: Ritmo) {
  const cinta = stage.querySelector<SVGPathElement>("[data-cinta]");
  const capsula = stage.querySelector<SVGPathElement>("[data-capsula]");
  const estela = stage.querySelector<SVGPathElement>("[data-estela]");
  const svg = cinta?.ownerSVGElement;
  if (!cinta || !capsula || !svg) return;

  const [hP, , hB, hC, hD, hE, hF, L] = medirHitos(svg);
  const seg = LAZO_PX;
  const corrimiento = GAP_PX + PUNTO_PX;
  gsap.set(cinta, { strokeDasharray: `${seg} ${L * 2}` });
  gsap.set(capsula, { strokeDasharray: `${PUNTO_PX} ${L * 2}` });
  if (estela) gsap.set(estela, { strokeDasharray: `${ESTELA_PX} ${L * 2}` });
  const st = { c: hP };
  const colocar = () => {
    gsap.set(cinta, { strokeDashoffset: seg - st.c });
    gsap.set(capsula, { strokeDashoffset: seg + corrimiento - st.c });
    if (estela) gsap.set(estela, { strokeDashoffset: seg * 2 - st.c - ESTELA_PX + ESTELA_ATRASO_PX });
  };
  colocar();

  const { entrada, inicio, giro, inicio2, fin } = r;
  const { ease, T, cFin } = easePorHitos([
    [0, hP],
    [entrada, hP],
    [inicio, hB],
    [giro, hC],
    [giro + GIRO * 0.6, hD],
    [inicio2, hE],
    // Al soltarse, la cabeza llega a la boca de la zambullida con el cartel
    // ya asomando, y se va entera (cola y cápsula) en media unidad, más
    // rápido de lo que sube el escenario: se la ve meterse debajo del
    // cartel, que la va tapando desde abajo.
    [fin + 0.15, hF],
    [fin + 0.6, L + seg + corrimiento + 40],
  ]);
  tl.to(st, { c: cFin, ease, duration: T, onUpdate: colocar }, 0);

  // La estela solo existe en los dos solos.
  if (estela) {
    tl.to(estela, { autoAlpha: ESTELA_ALPHA, duration: SOLO * 0.25 }, entrada);
    tl.to(estela, { autoAlpha: 0, duration: SOLO * 0.3 }, inicio - SOLO * 0.3);
    tl.to(estela, { autoAlpha: ESTELA_ALPHA, duration: GIRO * 0.2 }, giro + GIRO * 0.1);
    tl.to(estela, { autoAlpha: 0, duration: GIRO * 0.2 }, inicio2 - GIRO * 0.2);
  }
}
