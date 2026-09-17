import gsap from "gsap";
import type { RefObject } from "react";

/** Tiempos de la transformación card → perfil (y su reverso). */
export const APERTURA = 0.95;
export const CIERRE = 0.55;
/** La foto viajera se apoya y se queda QUIETA un instante antes de fundirse
 *  en la figura recortada: primero llega, después cambia de piel. */
const PAUSA_APOYO = 0.15;
export const LLEGADA_FOTO = APERTURA + PAUSA_APOYO;
/** Espera máxima a que cargue la imagen del perfil antes de viajar (para
 *  medir su recuadro real, no la caja que lo reserva). */
export const ESPERA_IMAGEN = 300;
/** Arranca decidido y frena largo: "despacio" en la curva, no en la duración. */
export const EASE_VIAJE = "power3.inOut";

/** Rectángulo de la card como recorte del lienzo (con su radio). */
export function clipDe(r: DOMRect) {
  return `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 1.5rem)`;
}

/** Las demás cards del equipo (las que no se abrieron): se alejan y vuelven. */
export function paresDe(originEl: HTMLElement | null): HTMLElement[] {
  const seccion = originEl?.closest("#equipo");
  if (!seccion) return [];
  const propia = originEl?.closest("[data-reveal]");
  return Array.from(seccion.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => el !== propia);
}

/** Las piezas del overlay que animan apertura y cierre (refs del compositor). */
export type RefsOverlay = {
  backdrop: RefObject<HTMLDivElement | null>;
  hero: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  back: RefObject<HTMLButtonElement | null>;
  copiar: RefObject<HTMLButtonElement | null>;
  patron: RefObject<HTMLDivElement | null>;
  inmersivo: RefObject<HTMLDivElement | null>;
  viajera: RefObject<HTMLDivElement | null>;
};

type Cierre = {
  root: HTMLDialogElement | null;
  originEl: HTMLElement | null;
  reduced: boolean;
  immersive: boolean;
  refs: RefsOverlay;
  /** Se llama al terminar (o de inmediato sin motion). */
  alTerminar: () => void;
};

/**
 * CIERRE — LO MISMO AL REVÉS, MÁS RÁPIDO: la foto vuelve a la card, el lienzo
 * se contrae hasta su rectángulo y la sección recupera su opacidad. Sin motion
 * (o sin root) termina de inmediato.
 */
export function cerrarOverlay({ root, originEl, reduced, immersive, refs, alTerminar }: Cierre) {
  // El `close()` va al final de la salida: un `<dialog>` cerrado no se pinta,
  // así que cerrarlo antes cortaría la animación en el primer frame.
  const finish = () => {
    root?.close();
    alTerminar();
  };
  if (reduced || !root) {
    finish();
    return;
  }
  const from = originEl?.getBoundingClientRect();
  const desdeCard = !!(from && from.width > 0);
  const pares = paresDe(originEl);
  const tl = gsap.timeline({ onComplete: finish });
  if (pares.length) tl.to(pares, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0.15);
  tl.to([refs.back.current, refs.copiar.current], { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" }, 0);
  if (immersive) {
    // El scroller no puede llevar la figura de vuelta: su contenido se
    // disuelve mientras el lienzo se contrae hacia la card.
    if (refs.inmersivo.current)
      tl.to(refs.inmersivo.current, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
  } else {
    const hero = refs.hero.current;
    const originImg = originEl?.querySelector("img");
    if (hero && originImg) {
      const f = originImg.getBoundingClientRect();
      const to = hero.getBoundingClientRect();
      if (f.width > 0 && to.width > 0) {
        tl.to(
          hero,
          {
            x: f.left - to.left,
            y: f.top - to.top,
            scaleX: f.width / to.width,
            scaleY: f.height / to.height,
            duration: CIERRE,
            ease: EASE_VIAJE,
          },
          0,
        );
      }
    }
    tl.to(refs.content.current, { autoAlpha: 0, x: -12, duration: 0.25, ease: "power2.in" }, 0);
  }
  if (refs.patron.current) tl.to(refs.patron.current, { autoAlpha: 0, duration: 0.25 }, 0);
  if (refs.backdrop.current && desdeCard) {
    tl.fromTo(
      refs.backdrop.current,
      { clipPath: "inset(0px 0px 0px 0px round 0rem)" },
      { clipPath: clipDe(from), duration: CIERRE, ease: EASE_VIAJE },
      0.05,
    );
    tl.to(refs.backdrop.current, { autoAlpha: 0, duration: 0.15 }, 0.05 + CIERRE - 0.1);
  } else {
    tl.to(refs.backdrop.current, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0.05);
  }
}
