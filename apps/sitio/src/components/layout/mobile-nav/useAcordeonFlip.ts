import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

type Foto = Map<HTMLElement, { arriba: number; alto: number }>;

/**
 * El foco del menú SIN animar alturas (AGENTS §7: solo transform y opacity).
 * Poner una página en foco saca a las demás del layout de golpe; lo que se
 * anima es el antes y el después, en tres tiempos:
 *
 *  1. SALEN: las páginas que se van se desvanecen (0,15 s) mientras siguen en
 *     su lugar. Recién entonces cambia el estado.
 *  2. FLIP: se anotó dónde estaba cada pieza antes del cambio; el layout salta
 *     y cada una arranca corrida a su lugar viejo y se desliza al nuevo. La
 *     página elegida sube así al tope. Se mueve todo el panel, no solo lo de
 *     abajo, porque la lista va centrada en el alto.
 *  3. ENTRAN: lo que antes no estaba —los destinos de la página en foco o, al
 *     volver, las demás páginas— aparece escalonado.
 *
 * Las piezas son los `[data-mnav-flip]` del contenido del panel (el pie vive
 * en otro componente: por eso se buscan desde el contenedor y no desde el nav).
 *
 * Todo cambio de foco pasa por `cambiarFoco`. Uno que no —el reset al abrir el
 * menú o al cambiar de ruta— no tiene foto previa y no anima nada.
 */
export function useAcordeonFlip(
  navRef: RefObject<HTMLElement | null>,
  desplegado: string | null,
  reduced: boolean,
  onDesplegar: (href: string | null) => void,
) {
  const antes = useRef<Foto | null>(null);

  const piezas = () => {
    const contenido = navRef.current?.closest("[data-mnav-contenido]");
    return contenido ? Array.from(contenido.querySelectorAll<HTMLElement>("[data-mnav-flip]")) : [];
  };

  const cambiarFoco = (href: string | null) => {
    const nav = navRef.current;
    if (reduced || !nav) return onDesplegar(href);
    const cambiar = () => {
      antes.current = new Map(
        piezas().map((el) => {
          const caja = el.getBoundingClientRect();
          return [el, { arriba: caja.top, alto: caja.height }];
        }),
      );
      onDesplegar(href);
    };
    // Al volver no se va nadie: cambia ya.
    const salen = href ? nav.querySelectorAll(`[data-mnav-pagina]:not([data-mnav-pagina="${href}"])`) : [];
    if (salen.length === 0) return cambiar();
    gsap.to(salen, { autoAlpha: 0, duration: 0.15, ease: "power1.in", overwrite: true, onComplete: cambiar });
  };

  useIsomorphicLayoutEffect(() => {
    const previo = antes.current;
    antes.current = null;
    const nav = navRef.current;
    if (!previo || !nav) return;

    // Lo que dejó apagado el tiempo 1 se limpia acá, ya fuera del layout: si
    // quedara, la página seguiría invisible el día que vuelva a la lista.
    gsap.set(nav.querySelectorAll("[data-mnav-pagina]"), { clearProps: "opacity,visibility" });

    const ctx = gsap.context(() => {
      const entran: HTMLElement[] = [];
      for (const el of piezas()) {
        const foto = previo.get(el);
        const caja = el.getBoundingClientRect();
        if (!foto || caja.height === 0) continue;
        if (foto.alto === 0) {
          entran.push(el); // estaba fuera del layout: no tiene de dónde deslizarse
          continue;
        }
        // La foto previa es de lo que se VEÍA (con el `y` de un deslizamiento
        // a medio camino incluido); la de ahora también lo trae puesto, así
        // que se lo descuenta para llegar al lugar real del layout nuevo.
        const yEnVuelo = Number(gsap.getProperty(el, "y")) || 0;
        const desde = foto.arriba - (caja.top - yEnVuelo);
        if (Math.abs(desde) < 0.5) continue;
        gsap.fromTo(el, { y: desde }, { y: 0, duration: 0.5, ease: "power3.out", overwrite: true });
      }
      // Los destinos de la página en foco cuentan como «entran», después de
      // las páginas (que al abrir un foco no hay ninguna).
      entran.push(...nav.querySelectorAll<HTMLElement>("[data-mnav-sub]:not([hidden]) > li"));
      if (entran.length > 0) {
        gsap.fromTo(
          entran,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.04, delay: 0.12 },
        );
      }
    }, nav);
    return () => ctx.revert();
  }, [desplegado, navRef]);

  return cambiarFoco;
}
