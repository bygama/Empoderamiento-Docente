import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Enciende el nodo del principio que se lee, dibuja el trazo y hace florecer las fichas. */
export function crearMapaMovil(root: HTMLElement) {
  const trazo = root.querySelector<SVGPathElement>("[data-mapa-trazo]");
  const nodos = gsap.utils.toArray<HTMLElement>("[data-mapa-nodo]", root);
  const detalles = gsap.utils.toArray<HTMLElement>("[data-detalle]", root);
  if (!trazo || nodos.length !== detalles.length) return () => {};
  const ctx = gsap.context(() => {
    gsap.set(trazo, { scaleX: 0, transformOrigin: "0% 50%" });
    const marcar = (i: number) => nodos.forEach((n, k) => n.toggleAttribute("data-activo", k === i));
    detalles.forEach((d, i) => {
      ScrollTrigger.create({ trigger: d, start: "top 70%", end: "bottom 30%", onToggle: (self) => { if (self.isActive) marcar(i); } });
      const fichas = root.querySelectorAll<HTMLElement>(`[data-fichas="${i}"] [data-ficha]`);
      gsap.fromTo(fichas, { autoAlpha: 0, scale: 0.9, y: 8 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: d, start: "top 75%", once: true } });
    });
    gsap.to(trazo, { scaleX: 1, ease: "none", scrollTrigger: { trigger: detalles[0], endTrigger: detalles[detalles.length - 1], start: "top 60%", end: "top 60%", scrub: 0.6 } });
    marcar(0);
  }, root);
  return () => {
    ctx.revert();
    nodos.forEach((n) => n.removeAttribute("data-activo"));
  };
}
