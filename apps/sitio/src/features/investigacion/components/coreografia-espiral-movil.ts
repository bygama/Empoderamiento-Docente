import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LARGO_ESPIRAL, LONGITUD_NODO, NODOS } from "./espiral";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * El ciclo bajo `lg`: la espiral queda fija arriba y acompaña los ocho
 * pasos que se leen debajo. El trazo avanza hasta la estación visible, el
 * nodo activo crece y el personaje (naranja) salta al nodo del paso que se
 * está leyendo. Solo atributos SVG y transform.
 */
export function crearEspiralMovil(zona: HTMLElement) {
  const path = zona.querySelector<SVGPathElement>("[data-espiral-path]");
  const lazo = zona.querySelector<SVGPathElement>("[data-espiral-lazo]");
  const personaje = zona.querySelector<SVGGElement>("[data-espiral-personaje]");
  const nodos = gsap.utils.toArray<SVGCircleElement>("[data-espiral-nodo]", zona);
  const estaciones = gsap.utils.toArray<HTMLElement>("[data-estacion]", zona);
  if (!path || !personaje || nodos.length !== estaciones.length) return () => {};
  const ctx = gsap.context(() => {
    gsap.set(path, { strokeDasharray: LARGO_ESPIRAL, strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[0] });
    if (lazo) {
      const l = lazo.getTotalLength();
      gsap.set(lazo, { strokeDasharray: l, strokeDashoffset: l });
    }
    gsap.set(personaje, { x: NODOS[0][0], y: NODOS[0][1], attr: { transform: "" } });
    gsap.set(nodos, { scale: 1, transformOrigin: "50% 50%" });
    let activo = 0;
    const ir = (k: number) => {
      activo = k;
      gsap.to(path, { strokeDashoffset: LARGO_ESPIRAL - LONGITUD_NODO[k], duration: 0.6, ease: "power2.out", overwrite: true });
      gsap.to(personaje, { x: NODOS[k][0], y: NODOS[k][1], duration: 0.6, ease: "power2.inOut", overwrite: true });
      nodos.forEach((n, i) => gsap.to(n, { scale: i === k ? 1.6 : 1, duration: 0.3, overwrite: true }));
      if (lazo) gsap.to(lazo, { strokeDashoffset: k === nodos.length - 1 ? 0 : lazo.getTotalLength(), duration: 0.8, ease: "power2.out", overwrite: true });
    };
    estaciones.forEach((e, k) => {
      ScrollTrigger.create({ trigger: e, start: "top 62%", end: "bottom 38%", onToggle: (self) => { if (self.isActive && activo !== k) ir(k); } });
    });
  }, zona);
  return () => ctx.revert();
}
