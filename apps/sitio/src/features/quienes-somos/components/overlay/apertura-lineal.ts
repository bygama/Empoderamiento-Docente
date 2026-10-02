import gsap from "gsap";
import { CIERRE, clipDe, EASE_VIAJE, paresDe, type RefsOverlay } from "./coreografia-overlay";
import { apoyarViajera } from "./viaje-foto";

/** Lo que tarda la card en volverse el perfil, bajo `lg`. */
const VIAJE = 0.7;

type Lineal = {
  root: HTMLDialogElement | null;
  originEl: HTMLElement | null;
  refs: RefsOverlay;
};

/**
 * El lugar de la figura con el perfil sin scrollear: de ahí sale la foto al
 * cerrar. Si el perfil está scrolleado la figura quedó arriba, fuera de
 * pantalla, y `lejos` lo avisa.
 */
function lugarDeLaFigura(root: HTMLElement) {
  const d = root.querySelector<HTMLElement>("[data-figura-lineal]")?.getBoundingClientRect();
  if (!d || d.width === 0) return null;
  return { rect: new DOMRect(d.left, d.top + root.scrollTop, d.width, d.height), lejos: d.bottom <= 0 };
}

/**
 * ENTRADA del perfil LINEAL (celular y tablet). La card se convierte en el
 * perfil: el panel blanco crece desde su rectángulo y la FOTO de la card viaja
 * hasta el lugar de la figura, donde se funde en ella. El contenido espera
 * escondido y entra escalonado cuando el panel ya cubrió: antes estaba
 * dibujado entero desde el primer cuadro, y mientras el panel crecía se veían
 * el texto cortado por su borde y la figura suelta sobre las cards.
 * Devuelve la limpieza, igual que `abrirOverlay`.
 */
export function abrirLineal({ root, originEl, refs }: Lineal) {
  if (!root) return () => {};
  const pares = paresDe(originEl);
  if (pares.length) gsap.to(pares, { opacity: 0.4, scale: 0.98, duration: 0.45, ease: "power2.out" });

  const ctx = gsap.context(() => {
    const backdrop = refs.backdrop.current;
    const viajera = refs.viajera.current;
    const botones = [refs.back.current, refs.copiar.current];
    const from = originEl?.getBoundingClientRect();
    const originImg = originEl?.querySelector("img");
    const f = originImg?.getBoundingClientRect();
    const figura = root.querySelector<HTMLElement>("[data-figura-lineal]");
    const textos = gsap.utils.toArray<HTMLElement>("[data-lineal-texto] > *", root);
    const resto = gsap.utils.toArray<HTMLElement>("[data-perfil-lineal] > :not(header)", root);
    const viaja = !!(viajera && figura && f && f.width > 0);

    // Estados iniciales, ya: el primer cuadro es la card, no el perfil.
    if (backdrop && from && from.width > 0) gsap.set(backdrop, { clipPath: clipDe(from) });
    else if (backdrop) gsap.set(backdrop, { autoAlpha: 0 });
    gsap.set(botones, { opacity: 0, y: -8 });
    gsap.set(textos, { opacity: 0, y: 18 });
    gsap.set(resto, { opacity: 0 });
    if (figura) gsap.set(figura, { opacity: 0 });
    if (viaja && viajera && f) apoyarViajera(viajera, originImg, f, null);

    // El viaje arranca dos cuadros después (el montaje traba el primero y,
    // con el lagSmoothing(0) de Lenis, los tweens saltarían al final).
    const arrancar = () => {
      if (backdrop && from && from.width > 0) {
        gsap.to(backdrop, {
          clipPath: "inset(0px 0px 0px 0px round 0rem)",
          duration: VIAJE,
          ease: EASE_VIAJE,
          onComplete: () => gsap.set(backdrop, { clearProps: "clipPath" }),
        });
      } else if (backdrop) {
        gsap.to(backdrop, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
      }
      const d = viaja ? figura?.getBoundingClientRect() : undefined;
      if (viajera && d && d.width > 0) {
        gsap.to(viajera, { left: d.left, top: d.top, width: d.width, height: d.height, borderRadius: "1.5rem", duration: VIAJE, ease: EASE_VIAJE });
        // Llega, y recién ahí cambia de piel: nada se mueve durante el fundido.
        gsap.to(viajera, { autoAlpha: 0, duration: 0.3, delay: VIAJE + 0.08, ease: "power2.inOut" });
        gsap.to(figura, { opacity: 1, duration: 0.3, delay: VIAJE, ease: "power2.out" });
      } else {
        if (viajera) gsap.set(viajera, { autoAlpha: 0 });
        if (figura) gsap.to(figura, { opacity: 1, duration: 0.5, delay: VIAJE * 0.6, ease: "power2.out" });
      }
      gsap.to(textos, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, delay: VIAJE * 0.7, ease: "power3.out" });
      gsap.to(resto, { opacity: 1, duration: 0.5, delay: VIAJE + 0.25, ease: "power2.out" });
      gsap.to(botones, { opacity: 1, y: 0, duration: 0.4, delay: VIAJE * 0.8, ease: "power2.out" });
    };
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(arrancar);
    });
    return () => cancelAnimationFrame(raf);
  }, root);

  return () => {
    ctx.revert();
    if (pares.length) gsap.set(pares, { clearProps: "opacity,transform" });
  };
}

/**
 * CIERRE del perfil lineal: lo mismo al revés. El contenido se disuelve, el
 * panel se contrae hasta la card y la foto vuelve a su lugar con él. Sale
 * siempre de donde vive en el perfil (arriba): si se cerró desde abajo, con
 * el perfil scrolleado, primero reaparece ahí mientras el texto se va y recién
 * después viaja — aparecer ya sobre la card, en medio del blanco, se leía
 * como un salto. Sin la foto, lo que se achicaba era un rectángulo vacío.
 */
export function cerrarLineal({ root, originEl, refs, alTerminar }: Lineal & { alTerminar: () => void }) {
  const terminar = () => {
    root?.close();
    alTerminar();
  };
  if (!root) return terminar();
  const from = originEl?.getBoundingClientRect();
  const originImg = originEl?.querySelector("img");
  const f = originImg?.getBoundingClientRect();
  const viajera = refs.viajera.current;
  const backdrop = refs.backdrop.current;
  const pares = paresDe(originEl);
  const tl = gsap.timeline({ onComplete: terminar });
  if (pares.length) tl.to(pares, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0.15);
  tl.to([refs.back.current, refs.copiar.current], { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" }, 0);

  const d = lugarDeLaFigura(root);
  // Desde abajo, el viaje espera a que el texto se haya ido y la foto esté.
  const sale = d?.lejos ? 0.24 : 0.05;
  if (viajera && f && f.width > 0) {
    apoyarViajera(viajera, originImg, d?.rect ?? f, null);
    if (d) {
      gsap.set(viajera, { borderRadius: "1.5rem" });
      if (d.lejos) tl.fromTo(viajera, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power2.out" }, 0.06);
      tl.to(viajera, { left: f.left, top: f.top, width: f.width, height: f.height, borderRadius: "1.25rem", duration: CIERRE, ease: EASE_VIAJE }, sale);
    } else {
      tl.fromTo(viajera, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.2);
    }
  }
  if (refs.inmersivo.current) tl.to(refs.inmersivo.current, { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, 0);
  if (backdrop && from && from.width > 0) {
    tl.fromTo(backdrop, { clipPath: "inset(0px 0px 0px 0px round 0rem)" }, { clipPath: clipDe(from), duration: CIERRE, ease: EASE_VIAJE }, sale);
    tl.to(backdrop, { autoAlpha: 0, duration: 0.15 }, sale + CIERRE - 0.1);
  } else if (backdrop) {
    tl.to(backdrop, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0.05);
  }
}
