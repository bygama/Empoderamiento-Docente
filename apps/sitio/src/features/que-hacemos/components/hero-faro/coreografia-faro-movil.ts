import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VERBO_POS } from "../preguntas-faro";
import { crearCamaraMovil, type Punto } from "./camara-faro-movil";
import { ORIGEN_HAZ } from "./HacesFaro";
import { crearLuzMovil } from "./luz-faro-movil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Tiempos ───────────────────────────────────────────────────────────────
 * En unidades de recorrido: la línea de tiempo arranca una pantalla después
 * del principio del runway (esa pantalla va detrás del hero) y dura 800svh,
 * así que 1 unidad ≈ 6,3svh de scroll (runway de 1000svh en
 * QueHacemosHeroFaro). `u()` las pasa a progreso 0–1. */
const TOTAL = 126;
const u = (n: number) => n / TOTAL;
/**
 * Dónde está el faro en cada plano (fracción del ancho de la pantalla).
 * Arranca al centro (camara-faro-movil.ts) y vuelve al centro para el
 * cierre, salvo que su botón no entre encima de la torre: ver `cierreFx`.
 */
const FARO = { izq: 0.26, der: 0.74 } as const;
const S0_SALE = 9;
const ENCENDIDO = 12.5;
/** Cuánto tarda un texto en aparecer (fundido, como en escritorio). */
const ENTRA = 4;
/**
 * Un texto por momento, con el ritmo de escritorio: el haz GIRA hacia él
 * (un solo movimiento largo, `giro`), el texto aparece cuando la luz ya
 * está llegando (`entra`) y se va (`sale`) mientras el haz ya gira al
 * siguiente. Entre giro y giro, el haz quieto.
 */
const MENSAJE = { giro: [ENCENDIDO + 2, ENCENDIDO + 8], entra: 19, sale: 34 } as const;
const FRASES = [
  { giro: [34, 42], entra: 40, sale: 50 },
  { giro: [51, 63], entra: 60, sale: 71 }, // el giro dura el cruce entero del faro
  { giro: [71, 79], entra: 77, sale: 85 },
  { giro: [84, 94], entra: 92, sale: 100 }, // giro largo: baja casi 70°
] as const;
// El giro al cierre es el más grande (de la última frase, abajo a la
// izquierda, al titular, arriba): arranca apenas empieza a irse la frase y
// dura todo el viaje del faro de vuelta al centro.
const CIERRE = { viaje: 98, giro: [99, 111], entra: 109, cta: 112 } as const;
const DESLUMBRE = 117;
/**
 * Donde aterriza el botón «Entrá al recorrido» del hero en mobile: con la
 * primera frase en pantalla y el faro todavía apagado (ver portal-viaje.ts).
 */
export const LECTURA_S0_MOVIL = u(6);

/**
 * EL FARO EN CELULAR Y TABLET (< lg). Misma escena y mismos textos que
 * computadora, compuesta para una pantalla vertical en planos, con
 * travellings de cámara entre ellos (el mundo entero se corre, con
 * paralaje: camara-faro-movil.ts):
 *   llegada        la escena está detrás del hero y el faro sube mientras
 *                  el hero se va, con la llegada de escritorio;
 *   1 · apagado    faro al centro, la frase en la noche;
 *   2 · encendido  el faro viaja a la izquierda mientras se prende; el haz
 *                  nace apuntando al mensaje y se acomoda unos grados;
 *   3 · la tesis   el faro se queda; la luz baja a la primera frase;
 *   4 · el enfoque el faro cruza a la derecha con la luz prendida y las
 *                  otras tres frases entran desde la izquierda, cada una a
 *                  su altura;
 *   cierre         vuelve al centro, la luz sube al titular y su botón, y
 *                  el deslumbre lava la pantalla a blanco desde el medio,
 *                  como en escritorio.
 * La luz se mueve como en escritorio: un giro por texto y quieta mientras
 * se lee (luz-faro-movil.ts). Solo transform y opacity, salvo el subrayado,
 * que escritorio anima igual.
 */
export function armarFaroMovil(root: HTMLElement, alto: HTMLElement) {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const cierreEl = q("[data-esc='cierre']");
  const mensaje = q("[data-mensaje]");
  const mensajeTxt = q("[data-mensaje] p");
  const titular = q("[data-cierre-titular]");
  const boton = q("[data-esc='cierre'] [data-cta] a");
  const cta = q("[data-esc='cierre'] [data-cta]");
  const logoMovil = q("[data-logo-movil]");
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
  // En celular la luz del mensaje no le apunta de lleno: pasa ENTRE la
  // frase y el logotipo que va debajo, a la derecha del faro, y se pierde
  // arriba a la derecha (Gastón, 2026-09-24). Destino: el borde derecho
  // del logo, más cerca del pie de la frase que de la punta del logo: el
  // cono se abre unas cuatro veces más hacia abajo que hacia arriba de su
  // eje, y apuntando a mitad de camino le rozaba la punta. Así el cono
  // entero queda centrado en el hueco (medido en 320, 390 y 430). En tablet el logo va al lado del texto (y este no se muestra):
  // null, y la luz apunta al centro de la frase como siempre.
  let hueco: Punto | null = null;
  const medirHueco = () => {
    const logo = logoMovil?.getBoundingClientRect();
    if (!logoMovil || !logo || logo.width === 0) {
      hueco = null;
      return;
    }
    const base = escenario.getBoundingClientRect();
    const pie = mensajeTxt.getBoundingClientRect().bottom - Number(gsap.getProperty(mensaje, "y"));
    const punta = logo.top - Number(gsap.getProperty(logoMovil, "y"));
    hueco = { x: logo.right - base.left, y: pie + (punta - pie) * 0.22 - base.top };
  };
  // El encendido nace apuntando un poco más arriba y se acomoda: el −8 → −2
  // de escritorio.
  luz.apuntar(mensajeTxt, mensaje, u(MENSAJE.giro[0]), u(MENSAJE.giro[1]), {
    hacia: () => hueco,
    inicio: (p) => ({ x: p.x, y: p.y - 60 }),
  });
  frases.forEach((f, i) => f && luz.apuntar(f, f, u(FRASES[i].giro[0]), u(FRASES[i].giro[1])));
  luz.apuntar(titular, cierreEl, u(CIERRE.giro[0]), u(CIERRE.giro[1]));
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
    medirHueco();
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
  gsap.set("[data-haz='izq']", { autoAlpha: 0, scaleX: 0.06, transformOrigin: ORIGEN_HAZ.izq, willChange: "transform, opacity" });
  gsap.set("[data-haz='der']", { autoAlpha: 0 });
  gsap.set("[data-halo]", { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set("[data-nucleo]", { autoAlpha: 0.16, scale: 0.5, transformOrigin: "50% 50%" });
  gsap.set("[data-linterna]", { opacity: 0.2 });
  gsap.set("[data-espejo]", { autoAlpha: 0 });
  gsap.set("[data-capa='marMedio']", { autoAlpha: 0.6 });
  gsap.set("[data-verbo-punto], [data-rastro]", { autoAlpha: 0 });
  gsap.set([mensaje, "[data-logo-movil]", "[data-luz-texto]"], { autoAlpha: 0 });
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
    scrollTrigger: {
      trigger: alto,
      // Como en escritorio: la primera pantalla del runway va detrás del
      // hero (la llegada), y la línea arranca recién después.
      start: () => `top+=${window.innerHeight} top`,
      end: "bottom bottom",
      scrub: 0.85,
      invalidateOnRefresh: true,
    },
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

  /* ── Los textos: aparecen donde ya está la luz ────────────────────── */
  // En celular el logotipo va aparte, a la derecha del faro: entra y sale
  // con la frase.
  aparecer(tl, [mensaje, "[data-logo-movil]"], { sel: "[data-mensaje] mark", grosor: "0.14em" }, { autoAlpha: 0, y: 12 }, MENSAJE.entra, MENSAJE.sale);
  // La tesis sube apenas (el faro no se movió); las otras tres entran desde
  // la izquierda, del lado opuesto al faro, hacia la luz.
  FRASES.forEach((f, i) => {
    const bloque = `[data-verbo-txt='${i}']`;
    const desde = i === 0 ? { autoAlpha: 0, y: 14 } : { autoAlpha: 0, x: -20 };
    aparecer(tl, `${bloque} [data-v]`, { sel: `${bloque} mark`, grosor: "0.12em" }, desde, f.entra, f.sale);
  });
  aparecer(tl, cierreEl, null, { autoAlpha: 0, y: 12 }, CIERRE.entra, null);
  tl.fromTo("[data-esc='cierre'] [data-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: u(3) }, u(CIERRE.cta));

  /* ── Deslumbre ─────────────────────────────────────────────────────── */
  tl.to("[data-haz='izq']", { autoAlpha: 0, duration: u(4), ease: "power2.in" }, u(DESLUMBRE - 1))
    .to([cierreEl, "[data-luz-texto]"], { autoAlpha: 0, duration: u(3), ease: "none" }, u(DESLUMBRE + 2.5))
    .to("[data-halo]", { scale: 46, duration: u(8), ease: "power2.in" }, u(DESLUMBRE))
    .to("[data-nucleo]", { scale: 30, duration: u(8), ease: "power2.in" }, u(DESLUMBRE + 0.5))
    .to("[data-capa='marMedio']", { autoAlpha: 0, duration: u(6), ease: "power2.in" }, u(DESLUMBRE + 1))
    .to("[data-velo-blanco]", { opacity: 1, duration: u(6.5), ease: "sine.inOut" }, u(DESLUMBRE + 2.5));
  tl.set({}, {}, 1);
  luz.girar(0);

  return () => {
    vivo = false;
    ScrollTrigger.removeEventListener("refreshInit", remedir);
    camara.soltar();
    cierreEl.setAttribute("inert", "");
  };
}

/**
 * Un texto: aparece con un fundido corto, se le pinta el subrayado de su
 * palabra clave (si tiene: el titular del cierre no) y se va; el
 * resplandor lo acompaña. Sin `sale` se queda (el cierre se va con el
 * deslumbre).
 */
function aparecer(
  tl: gsap.core.Timeline,
  texto: gsap.TweenTarget,
  marca: { sel: string; grosor: string } | null,
  desde: gsap.TweenVars,
  entra: number,
  sale: number | null,
) {
  tl.fromTo(texto, desde, { autoAlpha: 1, x: 0, y: 0, duration: u(ENTRA), ease: "sine.out" }, u(entra)).to(
    "[data-luz-texto]",
    { autoAlpha: 1, duration: u(ENTRA), ease: "sine.out" },
    u(entra),
  );
  if (marca) {
    tl.fromTo(
      marca.sel,
      { backgroundSize: `0% ${marca.grosor}` },
      { backgroundSize: `100% ${marca.grosor}`, duration: u(3), ease: "sine.inOut" },
      u(entra + ENTRA),
    );
  }
  if (sale === null) return;
  tl.to(texto, { autoAlpha: 0, y: -14, duration: u(3), ease: "sine.in" }, u(sale)).to(
    "[data-luz-texto]",
    { autoAlpha: 0, duration: u(3), ease: "sine.in" },
    u(sale),
  );
}
