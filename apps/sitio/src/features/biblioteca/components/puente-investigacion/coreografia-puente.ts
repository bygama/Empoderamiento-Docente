import gsap from "gsap";

/**
 * La pila de lomos, con el scroll como timeline: cada panel llega desde la
 * derecha y se apila sobre el anterior. El panel i descansa con su borde
 * izquierdo en i·PASO y ESPERA pegado al margen derecho con el lomo completo
 * a la vista; el corrimiento entre los dos estados es W−N·PASO, igual para
 * todos, recalculado en cada refresh. Devuelve su limpieza, que llama el
 * mismo efecto que la crea.
 */
export function crearPuente({ zone, stage, pila }: { zone: HTMLElement; stage: HTMLElement; pila: HTMLElement }): () => void {
  const ctx = gsap.context(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-pila-card]", pila);
    // El hint viene con la coreografía (solo con `live`) y se va con ella.
    gsap.set(cards, { willChange: "transform" });

    // El paso se mide del layout (offsetLeft ignora transforms).
    const paso = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    // Corrimiento reposo→espera (W − N·PASO), igual para todos los paneles.
    const park = () => pila.clientWidth - paso() * cards.length;

    cards.forEach((card, i) => {
      // immediateRender: los lomos quedan pegados al margen derecho ya
      // desde el arranque, no recién cuando les toca viajar.
      tl.fromTo(
        card,
        { x: park },
        { x: 0, duration: 1, ease: "power1.inOut", immediateRender: true },
        i,
      );
    });

    // El contenido del panel tapado se atenúa mientras lo cubre el que
    // llega (el lomo queda pleno: vive fuera de [data-pila-body]).
    cards.slice(0, -1).forEach((card, i) => {
      const body = card.querySelector("[data-pila-body]");
      if (body) {
        tl.to(body, { autoAlpha: 0.3, duration: 0.4, ease: "none" }, i + 1.55);
      }
    });

    // Respiro con la pila completa antes del unpin.
    tl.to({}, { duration: 0.4 });
  }, stage);
  return () => ctx.revert();
}
