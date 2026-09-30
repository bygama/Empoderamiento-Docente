import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Tiempos } from "./tiempos-quienes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Lo que el barrido recorta en celular: los bloques de texto, y la foto de Misión que entra de un corte. */
export type PiezasMovil = { textoQs: HTMLElement; textoMision: HTMLElement; fotoMision: HTMLElement };

/**
 * BARRIDO verde: "Quiénes somos" → "Misión". La barra mide EXACTO el alto del
 * bloque (no de la pantalla) y viaja solo por su ancho. Todo en píxeles para
 * que la LÍNEA y el borrado (clip) queden siempre pegados. Coreografía: abre
 * desde el centro → barre der→izq → cierra al centro. Corre adentro del
 * `gsap.context` de `crearQuienes`, que la limpia con su `revert()`.
 *
 * En celular y tablet (`movil`) cruza SOLO el texto: la foto va arriba y
 * cambia de un corte a mitad del barrido, como un cambio de plano.
 */
export function barrerQuienes(
  { about, mision, line, panel, zone }: Record<"about" | "mision" | "line" | "panel" | "zone", HTMLElement>,
  T: Tiempos,
  movil?: PiezasMovil,
) {
  const bounds = about.querySelector<HTMLElement>("[data-wipe-bounds]");
  // Qué se recorta: en escritorio las capas enteras; en celular solo el bloque
  // de texto. Ahí el recorte deja 8px de aire en los lados que no barren: al
  // ras, el aro de foco del CTA (outline-offset) quedaba cortado.
  const capaQs = movil?.textoQs ?? about;
  const capaMision = movil?.textoMision ?? mision;
  const AIRE = movil ? 8 : 0;
  gsap.set(capaQs, { clipPath: `inset(${-AIRE}px 0px ${-AIRE}px ${-AIRE}px)` });
  gsap.set(capaMision, { clipPath: `inset(${-AIRE}px ${-AIRE}px ${-AIRE}px 100%)` });
  if (movil) {
    // La capa de Misión, sin recorte, taparía el toque sobre el CTA de
    // Quiénes somos: no recibe punteros hasta que el barrido termina.
    gsap.set(movil.fotoMision, { autoAlpha: 0 });
    gsap.set(mision, { pointerEvents: "none" });
  }

  const OPEN = 0.16; // 0..OPEN abre | OPEN..CLOSE barre | CLOSE..1 cierra
  const CLOSE = 0.84;
  const openScale = (p: number) =>
    p < OPEN ? p / OPEN : p > CLOSE ? (1 - p) / (1 - CLOSE) : 1;
  const travel = (p: number) =>
    p <= OPEN ? 0 : p >= CLOSE ? 1 : (p - OPEN) / (CLOSE - OPEN);

  let panelW = 0;
  let xRight = 0;
  let xLeft = 0;
  // En celular los `inset` se miden desde el borde de cada caja de texto.
  let misionLeft = 0;
  const measure = () => {
    const pr = panel.getBoundingClientRect();
    panelW = pr.width;

    const cr = (movil?.textoQs ?? bounds ?? about).getBoundingClientRect();
    xRight = cr.right - pr.left;
    xLeft = cr.left - pr.left;
    // la barra arranca con el alto y el centro vertical del bloque.
    gsap.set(line, { top: cr.top - pr.top, height: cr.height });
    if (movil) misionLeft = movil.textoMision.getBoundingClientRect().left - pr.left;

    // igualo la caja de Misión al alto real de QS (arrancan a la misma altura)
    const pAbout = about.querySelector<HTMLElement>("[data-qs-fill]");
    const pMision = mision.querySelector<HTMLElement>("[data-qs-fill]");
    if (pAbout && pMision) {
      gsap.set(pMision, { minHeight: 0 });
      gsap.set(pMision, { minHeight: pAbout.getBoundingClientRect().height });
    }
  };

  const apply = (p: number) => {
    const t = travel(p);
    const x = xRight + (xLeft - xRight) * t; // der → izq
    gsap.set(line, { x, scaleY: openScale(p) });
    if (!movil) {
      gsap.set(about, { clipPath: `inset(0px ${panelW - x}px 0px 0px)` });
      gsap.set(mision, { clipPath: `inset(0px 0px 0px ${x}px)` });
      return;
    }
    gsap.set(capaQs, { clipPath: `inset(-${AIRE}px ${Math.max(0, xRight - x)}px -${AIRE}px -${AIRE}px)` });
    gsap.set(capaMision, { clipPath: `inset(-${AIRE}px -${AIRE}px -${AIRE}px ${Math.max(0, x - misionLeft)}px)` });
    // La foto cambia de un corte a mitad del barrido; el CTA de Quiénes somos
    // deja de recibir toques cuando el barrido lo borró.
    gsap.set(movil.fotoMision, { autoAlpha: t >= 0.5 ? 1 : 0 });
    gsap.set(mision, { pointerEvents: t >= 1 ? "auto" : "none" });
    gsap.set(about, { pointerEvents: t >= 1 ? "none" : "auto" });
  };
  ScrollTrigger.create({
    trigger: zone,
    start: () => "top top-=" + window.innerHeight * T.barrido[0],
    end: () => "top top-=" + window.innerHeight * T.barrido[1],
    scrub: 0.6,
    onRefresh: (self) => {
      measure();
      apply(self.progress);
    },
    onUpdate: (self) => apply(self.progress),
  });
}
