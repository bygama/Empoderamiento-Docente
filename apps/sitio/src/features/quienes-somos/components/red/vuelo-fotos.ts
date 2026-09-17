import gsap from "gsap";
import { R, type SpecKey } from "./red-datos";

/**
 * Interacción: highlight por RADIO/COLOR del nodo elegido y vuelo de las fotos
 * de especialistas desde el nodo hasta el dock fijo de abajo. Con `area` nula,
 * solo devuelve todo al reposo. Corre en cada cambio de área; no deja nada
 * que limpiar (los tweens se pisan con `overwrite: "auto"`).
 */
export function resaltarArea(root: HTMLElement, area: SpecKey | null) {
  gsap.to(root.querySelectorAll("[data-spec-halo]"), { attr: { r: R.specHalo }, duration: 0.3, overwrite: "auto" });
  gsap.to(root.querySelectorAll("[data-spec-dot]"), { attr: { r: R.specDot }, duration: 0.3, overwrite: "auto" });
  gsap.to(root.querySelectorAll("[data-spec-text]"), { fill: "#1f2d4d", duration: 0.25, overwrite: "auto" });
  gsap.to(root.querySelectorAll("[data-net-line][data-link-key]"), {
    stroke: "rgba(74,111,165,0.35)",
    strokeWidth: 1.5,
    duration: 0.25,
    overwrite: "auto",
  });
  if (!area) return;

  const halo = root.querySelector(`[data-spec-halo="${area}"]`);
  const dot = root.querySelector(`[data-spec-dot="${area}"]`);
  const text = root.querySelector(`[data-spec-text="${area}"]`);
  const line = root.querySelector(`[data-link-key="${area}"]`);
  if (halo) gsap.to(halo, { attr: { r: 30 }, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
  if (dot) gsap.to(dot, { attr: { r: 16 }, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
  if (text) gsap.to(text, { fill: "#1f9a78", duration: 0.25, overwrite: "auto" });
  if (line) gsap.to(line, { stroke: "#1f9a78", strokeWidth: 3, duration: 0.25, overwrite: "auto" });

  const dockBits = root.querySelectorAll<HTMLElement>("[data-dock-bit]");
  gsap.fromTo(
    dockBits,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
  );

  const from = (dot as SVGCircleElement | null)?.getBoundingClientRect();
  const avs = root.querySelectorAll<HTMLElement>("[data-dock-av]");
  if (from) {
    const fx = from.left + from.width / 2;
    const fy = from.top + from.height / 2;
    avs.forEach((av, i) => {
      const r = av.getBoundingClientRect();
      gsap.fromTo(
        av,
        {
          x: fx - (r.left + r.width / 2),
          y: fy - (r.top + r.height / 2),
          scale: 0.25,
          autoAlpha: 0,
          // El hint dura el vuelo y se limpia al aterrizar (antes vivía en la
          // clase de cada avatar, promovido desde el SSR).
          willChange: "transform",
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.55,
          ease: "power3.out",
          delay: i * 0.07,
          overwrite: "auto",
          onComplete: () => gsap.set(av, { clearProps: "willChange" }),
        },
      );
    });
  }
}
