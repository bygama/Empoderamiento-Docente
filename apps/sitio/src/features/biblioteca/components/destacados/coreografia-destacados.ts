import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { altoViewport } from "@/lib/viewport";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ElementosDestacados = {
  root: HTMLElement;
  /** La fila de las 4 portadas viajeras (se pinea y converge). */
  row: HTMLElement | null;
  /** El slot del primer artículo: define la geometría de la pila. */
  slot: HTMLElement | null;
  /** El contenedor de los artículos (fin del pin, barridos). */
  artsWrap: HTMLElement | null;
  /** Un artículo por destacado, en orden. */
  items: (HTMLElement | null)[];
  setActivo: (i: number) => void;
};

/**
 * Coreografía de «Material destacado»: foco por fila en todas las
 * resoluciones y, solo en desktop, el pin de la fila, la convergencia 4 → 1
 * sobre el slot, el barrido por divisoria y el cierre antes del unpin.
 * Devuelve la limpieza (`ctx.revert()`, que también mata el `matchMedia`).
 */
export function crearDestacados({ root, row, slot, artsWrap, items, setActivo }: ElementosDestacados) {
  const ctx = gsap.context(() => {
    // Foco por fila (todas las resoluciones): índice + atenuado.
    items.forEach((el, i) => {
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActivo(i);
        },
      });
    });

    // Coreografía de las imágenes: solo desktop (en mobile van inline).
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const wrap = artsWrap;
      if (!row || !slot || !wrap) return;

      const imgs = gsap.utils.toArray<HTMLElement>("[data-viajera]", row);
      // El hint de composición lo pone la coreografía y se va con ella (antes
      // vivía en la clase, promoviendo cuatro capas toda la sesión).
      gsap.set(imgs, { willChange: "transform" });
      const arts = items.filter((el): el is HTMLElement => !!el);

      // Geometría del destino: la pila vive centrada verticalmente en el
      // viewport (top S, alto H), sobre la columna de medios (slot).
      const H = () => slot.getBoundingClientRect().height;
      const S = () => (altoViewport() - H()) / 2;

      // z invertido: la primera portada arriba de la pila.
      imgs.forEach((img, i) => gsap.set(img, { zIndex: imgs.length - i }));

      // ── Fase 2a: pin de la fila al centro; la banda sube por detrás ──
      ScrollTrigger.create({
        trigger: row,
        start: "center center",
        endTrigger: wrap,
        end: "bottom center",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
      });

      // ── Fase 2b: convergencia 4 → 1 sobre el slot ───────────────────
      // Deltas medidos por función (invalidateOnRefresh): los x/left no
      // cambian con el pin, y el top pineado se deduce del alto de la fila
      // (quedó clavada en "center center").
      gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 95%",
          end: "top 30%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      }).to(imgs, {
        x: (_i, el) =>
          slot.getBoundingClientRect().left -
          (el as HTMLElement).getBoundingClientRect().left,
        y: (_i, el) => {
          const rowRect = row.getBoundingClientRect();
          const offsetEnFila =
            (el as HTMLElement).getBoundingClientRect().top - rowRect.top;
          const topPineado =
            (window.innerHeight - rowRect.height) / 2 + offsetEnFila;
          return S() - topPineado;
        },
        scale: (_i, el) =>
          slot.getBoundingClientRect().width /
          (el as HTMLElement).getBoundingClientRect().width,
        transformOrigin: "0 0",
        stagger: 0.06,
        ease: "none",
      });

      // ── Fase 3: barrido por divisoria ───────────────────────────────
      // La divisoria del artículo i recorre la pila de abajo (S+H) hacia
      // arriba (S) con el scroll natural, sin GSAP. Por eso el recorte no
      // es un tween con scrub —un suavizado lo despegaría de la línea—:
      // se escribe en cada tick desde el progreso crudo de ese mismo
      // rango, así el borde del recorte ES la línea. Acá el `scrub` no
      // suaviza nada porque no hay animación atada; solo hace que
      // `onUpdate` corra en cada tick.
      arts.slice(1).forEach((art, k) => {
        const recortar = (p: number) => gsap.set(imgs[k], { clipPath: `inset(0% 0% ${p * 100}% 0%)` });
        recortar(0);
        ScrollTrigger.create({
          trigger: art,
          start: () => `top ${S() + H()}`,
          end: () => `top ${S()}`,
          scrub: 0.5,
          onRefresh: (self) => recortar(self.progress),
          onUpdate: (self) => recortar(self.progress),
        });
      });

      // ── Cierre: desvanecer ANTES del unpin (evita el salto) ─────────
      gsap.to(row, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "bottom 70%",
          end: "bottom 55%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    });
  }, root);

  return () => ctx.revert();
}
