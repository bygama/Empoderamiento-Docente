import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * BARRIDO verde: "Quiénes somos" → "Misión". La barra mide EXACTO el alto del
 * bloque (no de la pantalla) y viaja solo por su ancho. Todo en píxeles para
 * que la LÍNEA y el borrado (clip) queden siempre pegados. Coreografía: abre
 * desde el centro → barre der→izq → cierra al centro. Corre adentro del
 * `gsap.context` de `crearQuienes`, que la limpia con su `revert()`.
 */
export function barrerQuienes({ about, mision, line, panel, zone }: Record<"about" | "mision" | "line" | "panel" | "zone", HTMLElement>) {
  const bounds = about.querySelector<HTMLElement>("[data-wipe-bounds]");
  const OPEN = 0.16; // 0..OPEN abre | OPEN..CLOSE barre | CLOSE..1 cierra
  const CLOSE = 0.84;
  const openScale = (p: number) =>
    p < OPEN ? p / OPEN : p > CLOSE ? (1 - p) / (1 - CLOSE) : 1;
  const travel = (p: number) =>
    p <= OPEN ? 0 : p >= CLOSE ? 1 : (p - OPEN) / (CLOSE - OPEN);

  let panelW = 0;
  let xRight = 0;
  let xLeft = 0;
  const measure = () => {
    const pr = panel.getBoundingClientRect();
    panelW = pr.width;

    const cr = (bounds ?? about).getBoundingClientRect();
    xRight = cr.right - pr.left;
    xLeft = cr.left - pr.left;
    // la barra arranca con el alto y el centro vertical del bloque.
    gsap.set(line, { top: cr.top - pr.top, height: cr.height });

    // igualo la caja de Misión al alto real de QS (arrancan a la misma altura)
    const pAbout = about.querySelector<HTMLElement>("[data-qs-fill]");
    const pMision = mision.querySelector<HTMLElement>("[data-qs-fill]");
    if (pAbout && pMision) {
      gsap.set(pMision, { minHeight: 0 });
      gsap.set(pMision, { minHeight: pAbout.getBoundingClientRect().height });
    }
  };

  const apply = (p: number) => {
    const x = xRight + (xLeft - xRight) * travel(p); // der → izq
    gsap.set(line, { x, scaleY: openScale(p) });
    gsap.set(about, { clipPath: `inset(0px ${panelW - x}px 0px 0px)` });
    gsap.set(mision, { clipPath: `inset(0px 0px 0px ${x}px)` });
  };
  ScrollTrigger.create({
    trigger: zone,
    start: () => "top top-=" + window.innerHeight * 1.0,
    end: () => "top top-=" + window.innerHeight * 1.5,
    scrub: true,
    onRefresh: (self) => {
      measure();
      apply(self.progress);
    },
    onUpdate: (self) => apply(self.progress),
  });
}
