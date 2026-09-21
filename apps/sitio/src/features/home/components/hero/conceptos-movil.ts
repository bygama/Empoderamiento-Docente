import gsap from "gsap";

/**
 * Tramo de conceptos (< lg): cada foto sube con un fade cuando entra en
 * pantalla y su cartel la sigue un instante después. Una sola vez: al volver a
 * subir ya están. Se llama desde adentro del contexto del hero, que se lleva
 * todo en su limpieza. El `fromTo` deja el estado oculto puesto al crearse, o
 * sea antes del primer paint.
 */
export function revelarConceptos() {
  gsap.utils.toArray<HTMLElement>("[data-concepto]").forEach((item) => {
    gsap
      .timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: item, start: "top 88%", once: true },
      })
      .fromTo(
        item.querySelector("[data-concepto-foto]"),
        { autoAlpha: 0, y: 28, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
      )
      .fromTo(
        item.querySelector("[data-concepto-cartel]"),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.45",
      );
  });
}
