import gsap from "gsap";

/**
 * Entrada del hero de «Qué hacemos»: las dos líneas del titular suben desde
 * su máscara, el subrayado se dibuja de izquierda a derecha y el celeste se
 * revela desde la derecha (barrido cruzado); bajada y cápsula suben después.
 * Devuelve la limpieza (`ctx.revert()`).
 */
export function crearEntradaQH(root: HTMLElement) {
  const ctx = gsap.context(() => {
    gsap.set("[data-qh-word]", { yPercent: 115 });
    gsap.set("[data-qh-underline]", { scaleX: 0 });
    // El celeste entra desde la DERECHA (cruzado con el subrayado, que se
    // dibuja desde la izquierda).
    gsap.set("[data-qh-pintura]", { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set("[data-qh-rise]", { autoAlpha: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to("[data-qh-word]", { yPercent: 0, duration: 1, stagger: 0.12 }, 0.75)
      // El subrayado se dibuja de izquierda a derecha cuando el titular
      // ya está arriba — el gesto del marcador — y la palabra se tiñe de
      // celeste con un barrido cruzado, desde la derecha.
      .to("[data-qh-underline]", { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 1.7)
      .to("[data-qh-pintura]", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.inOut" }, 1.7)
      .to("[data-qh-rise]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 1.45);
  }, root);

  return () => ctx.revert();
}
