import gsap from "gsap";
import { LARGO_GUIA } from "./lamina-espiral";

/**
 * Los gestos de una anotación de la lámina: cómo se despliega desde su
 * nodo, cómo se atenúa cuando entra la siguiente y cómo se retira. La
 * entrada es escalonada —la guía se dibuja, el bloque asoma desde el nodo,
 * el nombre entra, después el texto, y al final se subraya en verde la
 * frase clave— para que la lectura tenga un orden. Lo ya leído no se borra:
 * baja a ATENUADA y queda para releer (Facundo, 2026-09-12); solo se va del
 * todo cuando la cámara se abre o al lazo final. Todo fromTo explícito (ver
 * coreografia-espiral.ts) y solo transform y opacity.
 */

const sinRender = { immediateRender: false } as const;

/** Opacidad de una anotación ya leída. */
export const ATENUADA = 0.4;

export function gestosAnotacion(
  tl: gsap.core.Timeline,
  bloque: HTMLElement,
  guia: SVGLineElement,
  normal: readonly [number, number],
) {
  const nombre = bloque.querySelector<HTMLElement>("[data-anot-nombre]");
  const texto = bloque.querySelector<HTMLElement>("[data-anot-texto]");
  const subrayado = bloque.querySelector<HTMLElement>("[data-anot-subrayado]");
  const partes = [nombre, texto].filter((p): p is HTMLElement => p !== null);
  const [nx, ny] = normal;

  /** Estado pre-paint: a la vista o guardada del todo. */
  const reposo = (visible: boolean) => {
    gsap.set(guia, { strokeDasharray: LARGO_GUIA, strokeDashoffset: visible ? 0 : LARGO_GUIA, autoAlpha: visible ? 1 : 0 });
    gsap.set(bloque, { autoAlpha: visible ? 1 : 0, x: 0, y: 0 });
    gsap.set(partes, { autoAlpha: visible ? 1 : 0, y: visible ? 0 : 8 });
    if (subrayado) gsap.set(subrayado, { scaleX: visible ? 1 : 0, transformOrigin: "0% 50%" });
  };

  const entra = (at: number) => {
    tl.fromTo(guia, { strokeDashoffset: LARGO_GUIA, autoAlpha: 0 }, { strokeDashoffset: 0, autoAlpha: 1, duration: 0.15, ...sinRender }, at);
    tl.fromTo(
      bloque,
      { autoAlpha: 0, x: -nx * 12, y: -ny * 12 },
      { autoAlpha: 1, x: 0, y: 0, duration: 0.3, ease: "power2.out", ...sinRender },
      at + 0.06,
    );
    partes.forEach((parte, j) => {
      tl.fromTo(parte, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out", ...sinRender }, at + 0.1 + j * 0.1);
    });
    if (subrayado) {
      tl.fromTo(subrayado, { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: "power2.out", ...sinRender }, at + 0.36);
    }
  };

  const atenua = (at: number) => {
    tl.fromTo(bloque, { autoAlpha: 1 }, { autoAlpha: ATENUADA, duration: 0.25, ease: "power1.inOut", ...sinRender }, at);
    tl.fromTo(guia, { autoAlpha: 1 }, { autoAlpha: ATENUADA, duration: 0.25, ease: "power1.inOut", ...sinRender }, at);
  };

  /** `desde` es la opacidad con la que llega: 1 si es la última de su
   *  vuelta (nadie la atenuó), ATENUADA si ya se leyó. */
  const sale = (at: number, desde = 1) => {
    tl.fromTo(bloque, { autoAlpha: desde, x: 0, y: 0 }, { autoAlpha: 0, duration: 0.2, ease: "power1.in", ...sinRender }, at);
    tl.fromTo(guia, { autoAlpha: desde }, { autoAlpha: 0, duration: 0.2, ease: "power1.in", ...sinRender }, at);
  };

  return { reposo, entra, atenua, sale };
}
