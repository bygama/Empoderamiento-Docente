import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { construirCamino } from "./camino";
import type { RefsPerfil, St } from "./refs-perfil";

/**
 * CAMINO MAESTRO: nace bajo el nombre, serpentea, converge. Se construye ya
 * (setupPath) y expone el rebuild para los recálculos. dasharray = longitud
 * EXACTA actual (un único dash que el offset revela) → se re-sincroniza en
 * cada rebuild junto al tween de dibujo.
 */
export function crearCaminoMaestro(r: RefsPerfil, st: St) {
  const buildPath = () => {
    const track = r.track.current;
    const svg = r.svg.current;
    const path = r.path.current;
    if (!track || !svg || !path) return;
    construirCamino(track, svg, path);
  };
  const path = r.path.current;
  let drawTween: gsap.core.Tween | null = null;
  const setupPath = () => {
    buildPath();
    if (!path) return;
    const len = path.getTotalLength();
    if (!len) return;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    drawTween?.scrollTrigger?.kill();
    drawTween?.kill();
    drawTween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: st({ trigger: r.track.current, start: "top 72%", end: "bottom 82%", scrub: 0.5 }),
    });
  };
  setupPath();
  return { setupPath };
}

/**
 * Recalcular tras layout inicial + carga de la figura + resize. Devuelve la
 * limpieza (raf, timer, listeners), en el mismo orden de siempre.
 */
export function programarRecalculos(
  self: gsap.Context,
  setupPath: () => void,
  img: HTMLImageElement | null,
) {
  const rafId = requestAnimationFrame(() => self.add(() => { setupPath(); ScrollTrigger.refresh(); }));
  const onImgLoad = () => self.add(() => { setupPath(); ScrollTrigger.refresh(); });
  if (img && !img.complete) img.addEventListener("load", onImgLoad, { once: true });
  let rz = 0;
  const onResize = () => {
    window.clearTimeout(rz);
    rz = window.setTimeout(() => self.add(() => { setupPath(); ScrollTrigger.refresh(); }), 180);
  };
  window.addEventListener("resize", onResize);
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(rz);
    img?.removeEventListener("load", onImgLoad);
    window.removeEventListener("resize", onResize);
  };
}
