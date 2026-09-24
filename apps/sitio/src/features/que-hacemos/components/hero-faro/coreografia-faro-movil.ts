import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VERBO_POS } from "../preguntas-faro";
import { crearCamaraMovil } from "./camara-faro-movil";
import { crearLuzMovil } from "./luz-faro-movil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Tiempos ───────────────────────────────────────────────────────────────
 * En unidades de recorrido: 1 unidad ≈ 5svh de scroll (runway de 715svh en
 * QueHacemosHeroFaro). `u()` las pasa a progreso 0–1. */
const TOTAL = 123;
const u = (n: number) => n / TOTAL;
/**
 * Dónde está el faro en cada plano (fracción del ancho de la pantalla).
 * Arranca al centro (camara-faro-movil.ts) y vuelve al centro para el
 * cierre, salvo que su botón no entre encima de la torre: ver `cierreFx`.
 */
const FARO = { izq: 0.26, der: 0.74 } as const;
const S0_SALE = 9;
const ENCENDIDO = 12.5;
const MENSAJE = { lee: 20.5, sale: 34 };
/** Una por frase: cuándo gira el haz hacia ella, cuándo la lee y cuándo se va. */
const FRASES = [
  { giro: 35, lee: 39, sale: 50 },
  { giro: 52, lee: 61, sale: 71 },
  { giro: 71.5, lee: 75, sale: 85 },
  { giro: 85.5, lee: 89, sale: 99 },
] as const;
const CIERRE = { viaje: 97, giro: 100, lee: 104, cta: 108 };
const DESLUMBRE = 114;
/** Cuánto tarda la luz en destapar un texto. */
const LECTURA = 4;
/**
 * Donde aterriza el botón «Entrá al recorrido» del hero en mobile: con la
 * primera frase en pantalla y el faro todavía apagado (ver portal-viaje.ts).
 */
export const LECTURA_S0_MOVIL = u(6);

/**
 * EL FARO EN CELULAR Y TABLET (< lg). Misma escena y mismos textos que
 * computadora, compuesta para una pantalla vertical en cuatro planos, con
 * travellings de cámara entre ellos (el mundo entero se corre, con
 * paralaje: camara-faro-movil.ts):
 *   1 · apagado    faro al centro, la frase en la noche;
 *   2 · encendido  el faro viaja a la izquierda mientras se prende; el haz
 *                  se estira desde la linterna y destapa el mensaje, arriba
 *                  a la derecha (en tablet, con el logotipo a su lado);
 *   3 · la tesis   el faro se queda; la luz baja a la primera frase;
 *   4 · el enfoque el faro cruza a la derecha con la luz prendida y las
 *                  otras tres frases entran desde la izquierda;
 *   cierre         vuelve al centro, la luz sube al titular y su botón, y
 *                  el deslumbre lava la pantalla a blanco desde el medio,
 *                  como en escritorio.
 * La luz es la que revela y se queda quieta mientras se lee
 * (luz-faro-movil.ts). Solo transform y opacity, salvo la máscara que
 * destapa cada texto y el subrayado, que escritorio anima igual.
 */
export function armarFaroMovil(root: HTMLElement, alto: HTMLElement) {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const cierreEl = q("[data-esc='cierre']");
  const mensaje = q("[data-mensaje]");
  const mensajeTxt = q("[data-mensaje] p");
  const titular = q("[data-cierre-titular]");
  const boton = q("[data-esc='cierre'] [data-cta] a");
  const cta = q("[data-esc='cierre'] [data-cta]");
  // Una por lugar de frase: el contenido editable trae exactamente esas (VERBO_POS).
  const frases = VERBO_POS.map((_, i) => q(`[data-verbo-txt='${i}'] [data-v]`));
  const camara = crearCamaraMovil(root);
  const escenario = camara.escenario;
  if (!escenario || !cierreEl || !mensaje || !mensajeTxt || !titular || !boton || !cta || frases.some((f) => !f)) {
    // La cámara ya corrió el mundo al crearse: sin escena, se suelta.
    camara.soltar();
    return () => {};
  }
  cierreEl.removeAttribute("inert");

  const luz = crearLuzMovil(root, escenario, camara.foco);
  // Dónde se queda la luz mientras se lee cada texto: del lado opuesto al
  // faro, así lo cruza en diagonal (con el faro a la izquierda, hacia la
  // derecha del texto; con el faro a la derecha, hacia su izquierda).
  luz.agregar(mensajeTxt, mensaje, 0, u(MENSAJE.lee), u(LECTURA), 0.62);
  frases.forEach((f, i) => f && luz.agregar(f, f, u(FRASES[i].giro), u(FRASES[i].lee), u(LECTURA), i === 0 ? 0.62 : 0.42));
  luz.agregar(titular, cierreEl, u(CIERRE.giro), u(CIERRE.lee), u(LECTURA), 0.45);
  // El cierre va con el faro al centro, salvo en las pantallas bajas
  // (320×568): ahí su botón caía sobre la linterna, y el faro se corre a la
  // derecha lo justo para dejarlo al costado.
  let cierreFx = 0.5;
  const medirCierre = () => {
    const base = escenario.getBoundingClientRect();
    const b = boton.getBoundingClientRect();
    const dy = Number(gsap.getProperty(cta, "y")) + Number(gsap.getProperty(cierreEl, "y"));
    cierreFx = camara.faroLibre({ derecha: b.right - base.left, abajo: b.bottom - base.top - dy });
  };
  // Antes de cada refresh (resize, fuentes): el encuadre y los textos se
  // vuelven a medir, así los valores por función de la línea de tiempo
  // leen medidas nuevas.
  const remedir = () => {
    camara.medir();
    luz.medir();
    medirCierre();
  };
  remedir();
  ScrollTrigger.addEventListener("refreshInit", remedir);
  // Con las fuentes finales cambian los renglones: se mide de nuevo.
  let vivo = true;
  document.fonts?.ready.then(() => {
    if (vivo) remedir();
  });

  /* ── Estados iniciales: faro apagado, textos fuera ────────────────── */
  gsap.set("[data-haz='izq']", { autoAlpha: 0, scaleX: 0.06, transformOrigin: "1310px 100px", willChange: "transform, opacity" });
  gsap.set("[data-haz='der']", { autoAlpha: 0 });
  gsap.set("[data-halo]", { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set("[data-nucleo]", { autoAlpha: 0.16, scale: 0.5, transformOrigin: "50% 50%" });
  gsap.set("[data-linterna]", { opacity: 0.2 });
  gsap.set("[data-espejo]", { autoAlpha: 0 });
  gsap.set("[data-capa='marMedio']", { autoAlpha: 0.6 });
  gsap.set("[data-verbo-punto], [data-rastro]", { autoAlpha: 0 });
  gsap.set([mensaje, "[data-mensaje] img", "[data-luz-texto]"], { autoAlpha: 0 });
  gsap.set("[data-luz-texto]", { xPercent: -50, yPercent: -50 });
  camara.llegar(alto);

  // ScrollTrigger puede actualizar la línea ya mientras se crea: el giro
  // espera a que exista.
  const creada: { tl?: gsap.core.Timeline } = {};
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onUpdate: () => {
      camara.aplicar();
      if (creada.tl) luz.girar(creada.tl.progress());
    },
    scrollTrigger: { trigger: alto, start: "top top", end: "bottom bottom", scrub: 0.85, invalidateOnRefresh: true },
  });
  creada.tl = tl;

  /* ── Travellings ───────────────────────────────────────────────────── */
  tl.to(camara.estado, { fx: FARO.izq, duration: u(15), ease: "sine.inOut" }, u(10)) // se prende mientras va
    .to(camara.estado, { fx: FARO.der, duration: u(12), ease: "sine.inOut" }, u(51)) // cruza con la luz prendida
    .to(camara.estado, { fx: () => cierreFx, duration: u(8), ease: "sine.inOut" }, u(CIERRE.viaje));

  /* ── 1 · La frase en la noche ──────────────────────────────────────── */
  tl.fromTo("[data-esc='0']", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: u(3.5), ease: "sine.out" }, 0)
    .to("[data-esc='0']", { autoAlpha: 0, y: -16, duration: u(3), ease: "sine.in" }, u(S0_SALE));

  /* ── 2 · Encendido lento: chispa → núcleo → halo → el haz se estira ─ */
  tl.to("[data-capa='marMedio']", { autoAlpha: 1, duration: u(7), ease: "none" }, u(ENCENDIDO - 2))
    .to("[data-nucleo]", { autoAlpha: 1, scale: 1.6, duration: u(1.5), ease: "power3.in" }, u(ENCENDIDO))
    .to("[data-nucleo]", { scale: 1, duration: u(2.5) }, u(ENCENDIDO + 1.5))
    .to("[data-linterna]", { opacity: 1, duration: u(2) }, u(ENCENDIDO + 0.5))
    .to("[data-halo]", { autoAlpha: 1, scale: 1, duration: u(4.5) }, u(ENCENDIDO + 1))
    .to("[data-haz='izq']", { autoAlpha: 1, duration: u(3), ease: "power1.out" }, u(ENCENDIDO + 2))
    // Se estira despacio desde la linterna: con power2.in el primer tramo
    // es lento y la punta del haz se ve crecer dentro de la pantalla.
    .to("[data-haz='izq']", { scaleX: 1, duration: u(8.5), ease: "power2.in" }, u(ENCENDIDO + 2))
    .to("[data-espejo]", { autoAlpha: 1, duration: u(6) }, u(ENCENDIDO + 2.5));

  /* ── El mensaje: logo y frase, destapados por la luz ──────────────── */
  tl.fromTo(mensaje, { autoAlpha: 0 }, { autoAlpha: 1, duration: u(0.5), ease: "none" }, u(MENSAJE.lee - 0.5))
    .fromTo("[data-mensaje] img", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: u(3) }, u(MENSAJE.lee - 0.5))
    .fromTo("[data-mensaje] mark", { backgroundSize: "0% 0.14em" }, { backgroundSize: "100% 0.14em", duration: u(3), ease: "power1.inOut" }, u(MENSAJE.lee + LECTURA + 0.5))
    .to(mensaje, { autoAlpha: 0, y: -22, duration: u(3), ease: "power2.in" }, u(MENSAJE.sale));
  resplandor(tl, MENSAJE.lee, MENSAJE.sale);

  /* ── 3 y 4 · Las frases del enfoque ───────────────────────────────── */
  // La tesis sube apenas (el faro no se movió); las otras tres entran desde
  // la izquierda, del lado opuesto al faro, hacia la luz.
  FRASES.forEach((f, i) => {
    const bloque = `[data-verbo-txt='${i}']`;
    const desde = i === 0 ? { autoAlpha: 0, y: 16 } : { autoAlpha: 0, x: -28 };
    tl.fromTo(`${bloque} [data-v]`, desde, { autoAlpha: 1, x: 0, y: 0, duration: u(5), ease: "sine.out" }, u(f.lee))
      .fromTo(`${bloque} mark`, { backgroundSize: "0% 0.12em" }, { backgroundSize: "100% 0.12em", duration: u(3), ease: "sine.inOut" }, u(f.lee + LECTURA + 0.5))
      .to(`${bloque} [data-v]`, { autoAlpha: 0, y: -14, duration: u(3), ease: "sine.in" }, u(f.sale));
    resplandor(tl, f.lee, f.sale);
  });

  /* ── Cierre y deslumbre ────────────────────────────────────────────── */
  tl.fromTo(cierreEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: u(0.5), ease: "none" }, u(CIERRE.lee - 0.5))
    .fromTo("[data-esc='cierre'] [data-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: u(3) }, u(CIERRE.cta))
    .to("[data-haz='izq']", { autoAlpha: 0, duration: u(4), ease: "power2.in" }, u(DESLUMBRE - 1))
    .to([cierreEl, "[data-luz-texto]"], { autoAlpha: 0, duration: u(3), ease: "none" }, u(DESLUMBRE + 2.5))
    .to("[data-halo]", { scale: 46, duration: u(8), ease: "power2.in" }, u(DESLUMBRE))
    .to("[data-nucleo]", { scale: 30, duration: u(8), ease: "power2.in" }, u(DESLUMBRE + 0.5))
    .to("[data-capa='marMedio']", { autoAlpha: 0, duration: u(6), ease: "power2.in" }, u(DESLUMBRE + 1))
    .to("[data-velo-blanco]", { opacity: 1, duration: u(6.5), ease: "sine.inOut" }, u(DESLUMBRE + 2.5));
  resplandor(tl, CIERRE.lee, null);
  tl.set({}, {}, 1);
  luz.girar(0);

  return () => {
    vivo = false;
    ScrollTrigger.removeEventListener("refreshInit", remedir);
    luz.limpiar();
    camara.soltar();
    cierreEl.setAttribute("inert", "");
  };
}

/** El resplandor sobre el texto: se prende con la lectura y se apaga cuando el texto se va. */
function resplandor(tl: gsap.core.Timeline, lee: number, sale: number | null) {
  tl.to("[data-luz-texto]", { autoAlpha: 1, duration: u(LECTURA), ease: "sine.out" }, u(lee));
  if (sale !== null) tl.to("[data-luz-texto]", { autoAlpha: 0, duration: u(3), ease: "sine.in" }, u(sale));
}
