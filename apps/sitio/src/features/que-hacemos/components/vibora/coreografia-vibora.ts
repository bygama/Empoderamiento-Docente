import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ENTRADA_SVH as ENTRADA_NIVELES } from "../niveles-escala/niveles-escena";
import { SVH_POR_UNIDAD, ritmo } from "../proyectos-aplicaciones/proyectos-escena";
import { CINTA_INICIO, GAP_PX, LAZO_PX, PUNTO_PX, SALIDA_VH, TRAMOS } from "./vibora-escena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
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
 * Una curva SUAVE por los hitos (scroll → píxel de recorrido): cúbica
 * monótona de Fritsch–Butland, que pasa exactamente por cada punto sin
 * pasarse ni volver atrás, y con la velocidad continua. Así la víbora
 * nunca frena a cero ni salta de velocidad: acelera y se calma. Devuelve
 * el ease para un único tween de 0 a `T` píxeles de scroll.
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
 * La víbora entera. Un ScrollTrigger que arranca donde arranca el de
 * Niveles (su zona a ENTRADA_NIVELES % de la pantalla) y termina cuando la
 * zona de Proyectos se fue del todo por arriba; la timeline mide lo mismo
 * en píxeles, así 1 unidad = 1 px de scroll. La cabeza va con UN tween y
 * la curva suave por los hitos, que se calculan con la geometría real de
 * las dos zonas: dónde se suelta Niveles, dónde se clava Proyectos, dónde
 * caen sus fichas (el ritmo viene de `ritmo()`), dónde se suelta. Regla
 * de la curva (Gastón, 2026-09-11): velocidad base pareja, la de Niveles,
 * y tres aceleraciones cortas, en la costura, en el giro y en la salida;
 * nunca cero. La capa se enciende con Niveles y se apaga después de que
 * el cartel del cierre la tapó.
 *
 * Devuelve la limpieza (`ctx.revert()`).
 */
export function crearVibora(capa: HTMLElement, niveles: HTMLElement, proyectos: HTMLElement) {
  const ctx = gsap.context(() => {
    const cinta = capa.querySelector<SVGPathElement>("[data-cinta]");
    const capsula = capa.querySelector<SVGPathElement>("[data-capsula]");
    const svg = cinta?.ownerSVGElement;
    if (!cinta || !capsula || !svg) return;

    const [hN, hK, , hB, hC, , hE, hF, L] = medirHitos(svg);
    const seg = LAZO_PX;
    const corrimiento = GAP_PX + PUNTO_PX;
    gsap.set(cinta, { strokeDasharray: `${seg} ${L * 2}` });
    gsap.set(capsula, { strokeDasharray: `${PUNTO_PX} ${L * 2}` });
    const st = { c: 0 };
    const colocar = () => {
      gsap.set(cinta, { strokeDashoffset: seg - st.c });
      gsap.set(capsula, { strokeDashoffset: seg + corrimiento - st.c });
    };
    colocar();

    // Geometría en píxeles de scroll desde el arranque del trigger.
    const vh = window.innerHeight;
    const u = (SVH_POR_UNIDAD / 100) * vh; // una unidad de Proyectos
    const arranque = (ENTRADA_NIVELES / 100) * vh;
    const sSuelta = niveles.offsetHeight - vh + arranque; // Niveles se suelta
    const sClava = arranque + niveles.offsetHeight; // Proyectos se clava
    const sFin = sClava + proyectos.offsetHeight - vh; // Proyectos se suelta
    const S = sClava + proyectos.offsetHeight; // Proyectos se fue del todo
    const fichasA = proyectos.querySelectorAll('[data-lado="a"] [data-ficha]').length;
    const fichasB = proyectos.querySelectorAll('[data-lado="b"] [data-ficha]').length;
    const r = ritmo(fichasA, fichasB);
    const enProyectos = (t: number) => sClava + (t - r.entrada) * u;

    const { ease, T, cFin } = easePorHitos([
      [0, 0],
      [sSuelta, hN],
      [sClava, hK],
      [enProyectos(r.inicio), hB],
      [enProyectos(r.giro), hC],
      [enProyectos(r.inicio2), hE],
      [sFin, hF],
      [sFin + SALIDA_VH * vh, L + seg + corrimiento + 40],
    ]);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: niveles,
        start: `top ${ENTRADA_NIVELES}%`,
        endTrigger: proyectos,
        end: "bottom top",
        scrub: 0.6,
      },
    });
    tl.to(st, { c: cFin, ease, duration: T, onUpdate: colocar }, 0);
    // La capa: se enciende con Niveles y se apaga cuando la víbora ya se
    // metió bajo el cartel.
    gsap.set(capa, { autoAlpha: 0 });
    tl.to(capa, { autoAlpha: 1, duration: arranque, ease: "none" }, 0);
    tl.to(capa, { autoAlpha: 0, duration: 0.2 * vh, ease: "none" }, sFin + SALIDA_VH * vh + 0.1 * vh);
    tl.to({}, { duration: 1 }, S - 1);
  }, capa);

  return () => ctx.revert();
}
