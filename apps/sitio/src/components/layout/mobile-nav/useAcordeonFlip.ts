import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/**
 * El acordeón del menú SIN animar alturas (AGENTS §7: solo transform y
 * opacity). El submenú aparece y desaparece de golpe en el layout; lo que se
 * anima es todo lo demás acomodándose, con la técnica FLIP: se anota dónde
 * estaba cada pieza ANTES del cambio, se deja que el layout salte, y cada una
 * arranca corrida a su lugar viejo y se desliza al nuevo. Se mueve todo el
 * panel y no solo lo de abajo, porque la lista va centrada en el alto: al
 * crecer un submenú, lo de arriba también sube.
 *
 * Las piezas son los `[data-mnav-flip]` del contenido del panel (el pie vive
 * en otro componente: por eso se buscan desde el contenedor y no desde el nav).
 *
 * `capturar` se llama en el clic, ANTES de cambiar el estado. Un cambio que no
 * pasó por ahí —el reset al cambiar de ruta, con el panel cerrado y todo
 * midiendo cero— no tiene foto previa y no anima nada.
 */
export function useAcordeonFlip(
  navRef: RefObject<HTMLElement | null>,
  desplegado: string | null,
  reduced: boolean,
) {
  const antes = useRef<Map<HTMLElement, number> | null>(null);

  const piezas = () => {
    const contenido = navRef.current?.closest("[data-mnav-contenido]");
    return contenido ? Array.from(contenido.querySelectorAll<HTMLElement>("[data-mnav-flip]")) : [];
  };

  const capturar = () => {
    if (reduced) return;
    antes.current = new Map(piezas().map((el) => [el, el.getBoundingClientRect().top]));
  };

  useIsomorphicLayoutEffect(() => {
    const previo = antes.current;
    antes.current = null;
    const nav = navRef.current;
    if (!previo || !nav) return;

    const ctx = gsap.context(() => {
      for (const el of piezas()) {
        const arribaAntes = previo.get(el);
        if (arribaAntes === undefined) continue;
        // La foto previa es de lo que se VEÍA (con el `y` de un deslizamiento
        // a medio camino incluido); la de ahora también lo trae puesto, así
        // que se lo descuenta para llegar al lugar real del layout nuevo.
        const yEnVuelo = Number(gsap.getProperty(el, "y")) || 0;
        const desde = arribaAntes - (el.getBoundingClientRect().top - yEnVuelo);
        if (Math.abs(desde) < 0.5) continue;
        gsap.fromTo(el, { y: desde }, { y: 0, duration: 0.5, ease: "power3.out", overwrite: true });
      }
      // Los destinos del submenú recién abierto entran escalonados, apenas
      // después de que las piezas empiezan a hacerle lugar.
      const destinos = nav.querySelectorAll("[data-mnav-sub]:not([hidden]) > li");
      if (destinos.length > 0) {
        gsap.fromTo(
          destinos,
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out", stagger: 0.03, delay: 0.08 },
        );
      }
    }, nav);
    return () => ctx.revert();
  }, [desplegado, navRef]);

  return capturar;
}
