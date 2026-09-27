import gsap from "gsap";

/** Inclinación de la carpeta al entrar y al salir (grados, sentido de la referencia). */
const INCLINACION = -5;

/**
 * La coreografía de Líneas, en desktop con puntero: la carpeta entra
 * inclinada, se aplana al centrarse y se vuelve a inclinar al irse, y las
 * filas se revelan en cascada una vez. Devuelve su limpieza, que llama el
 * mismo efecto que la crea.
 */
export function crearLineas({ zona, carpeta, lista }: { zona: HTMLElement; carpeta: HTMLElement; lista: HTMLElement }): () => void {
  const ctx = gsap.context(() => {
    // El hint acompaña al giro por scroll y se va con el contexto.
    gsap.set(carpeta, { willChange: "transform" });
    // La regla de la referencia: la carpeta está derecha solo cuando está
    // CENTRADA en la ventana. Viene inclinada, se aplana al llegar al
    // medio y se vuelve a inclinar (mismo ángulo, mismo sentido) al irse.
    // El tramo "top bottom → bottom top" tiene su mitad exacta cuando el
    // centro de la carpeta pasa por el centro de la ventana. Pivote en el
    // centro para que al girar no se desplace.
    const tl = gsap.timeline({
      defaults: { transformOrigin: "50% 50%" },
      scrollTrigger: {
        trigger: carpeta,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      carpeta,
      { rotation: INCLINACION },
      { rotation: 0, duration: 0.42, ease: "power2.out", immediateRender: false },
      0,
    );
    tl.to(carpeta, { rotation: INCLINACION, duration: 0.42, ease: "power2.in" }, 0.58);

    // Las filas se revelan en cascada, una vez, cuando la lista llega.
    gsap.fromTo(
      lista.querySelectorAll("[data-linea]"),
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: lista, start: "top 78%", once: true },
      },
    );
  }, zona);
  return () => ctx.revert();
}
