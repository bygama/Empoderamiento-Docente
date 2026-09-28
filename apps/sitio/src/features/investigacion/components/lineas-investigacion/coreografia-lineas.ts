import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    // El hint acompaña al giro por scroll y se va con el contexto. El giro y
    // la escala van explícitos en este primer set para que no herede lo que
    // haya quedado en el estilo: en dev, StrictMode monta dos veces y el
    // segundo montaje encuentra la carpeta ya girada; si GSAP la parseara
    // de la matriz, arrastraría `rotate(-5.00022deg) scale(1.00001)`.
    gsap.set(carpeta, { willChange: "transform", transformOrigin: "50% 50%", rotation: INCLINACION, scale: 1 });
    // La regla de la referencia: la carpeta está derecha solo cuando está
    // CENTRADA en la ventana. Viene inclinada, se aplana al llegar al
    // medio y se vuelve a inclinar (mismo ángulo, mismo sentido) al irse.
    // El tramo "top bottom → bottom top" tiene su mitad exacta cuando el
    // centro de la carpeta pasa por el centro de la ventana. Pivote en el
    // centro para que al girar no se desplace.
    //
    // El giro se escribe en cada tick desde el progreso crudo del tramo, no
    // con un tween con scrub: un suavizado la enderezaría después del
    // centro. Las curvas son las de siempre —power2.out al entrar hasta
    // 0.42, derecha hasta 0.58, power2.in al irse— calculadas a mano (en
    // GSAP power2 es cúbica). Sin animación atada, el `scrub` no suaviza;
    // solo hace que `onUpdate` corra en cada tick.
    //
    // Antes de medir, la carpeta se endereza: el timeline de antes se
    // revertía solo al refrescar, y así el tramo se mide con el rect sin
    // girar, como siempre; `onRefresh` la vuelve a girar. El `set` no se
    // devuelve a propósito: si ScrollTrigger lo revierte, GSAP descompone
    // la matriz y deja un `scale(1.00001)` de ruido en el estilo.
    const girar = (p: number) => {
      let rotation = 0;
      if (p < 0.42) rotation = INCLINACION * (1 - p / 0.42) ** 3;
      else if (p > 0.58) rotation = INCLINACION * ((p - 0.58) / 0.42) ** 3;
      gsap.set(carpeta, { rotation });
    };
    ScrollTrigger.create({
      trigger: carpeta,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.5,
      onRefreshInit: () => {
        gsap.set(carpeta, { rotation: 0 });
      },
      onRefresh: (self) => girar(self.progress),
      onUpdate: (self) => girar(self.progress),
    });

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
