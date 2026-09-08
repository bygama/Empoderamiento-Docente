import gsap from "gsap";
import { APERTURA, EASE_VIAJE, LLEGADA_FOTO } from "./coreografia-overlay";

/**
 * El DESTINO se mide recién al arrancar el viaje, con la imagen del perfil
 * ya cargada: su recuadro real (alineado a la derecha dentro de la caja que
 * lo reserva). Medirlo antes daba la caja entera y la foto aterrizaba
 * corrida respecto de la figura. Sin imagen medible, la caja.
 */
export function medirDestino(
  imgFigura: HTMLImageElement | null | undefined,
  cajaFigura: HTMLElement | null,
) {
  const dImg = imgFigura?.getBoundingClientRect();
  if (!dImg || dImg.width === 0) return cajaFigura?.getBoundingClientRect();
  return dImg;
}

/**
 * Estado inicial de la foto viajera: sobre la foto de la card, con su misma
 * imagen (la que la card ya decodificó: misma URL, sale de caché) y su mismo
 * encuadre; la figura recortada espera escondida.
 */
export function apoyarViajera(
  viajera: HTMLDivElement,
  originImg: HTMLImageElement | null | undefined,
  f: DOMRect,
  figura: HTMLElement | null,
) {
  if (originImg) {
    viajera.style.backgroundImage = `url("${originImg.currentSrc || originImg.src}")`;
    viajera.style.backgroundPosition = getComputedStyle(originImg).objectPosition;
  }
  gsap.set(viajera, { left: f.left, top: f.top, width: f.width, height: f.height, autoAlpha: 1, borderRadius: "1.25rem" });
  if (figura) gsap.set(figura, { autoAlpha: 0 });
}

/**
 * La foto viaja (inmersivo): hasta el recuadro exacto de la figura recortada,
 * creciendo; se apoya, queda quieta un instante y recién ahí se funde en
 * ella. Nada se mueve durante el fundido.
 */
export function viajarFoto(viajera: HTMLDivElement, d: DOMRect, figura: HTMLElement | null) {
  gsap.to(viajera, {
    left: d.left,
    top: d.top,
    width: d.width,
    height: d.height,
    borderRadius: "1.75rem",
    duration: APERTURA,
    ease: EASE_VIAJE,
  });
  // Se apoya, queda quieta un instante y recién ahí se funde en la figura.
  gsap.to(viajera, { autoAlpha: 0, duration: 0.3, delay: LLEGADA_FOTO, ease: "power2.inOut" });
  if (figura) gsap.to(figura, { autoAlpha: 1, duration: 0.3, delay: LLEGADA_FOTO, ease: "power2.out" });
}
