import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOCO } from "../linterna-geometria";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Alto de la pista pinneada bajo `lg`: una pantalla de acercamiento (100) +
 * el ascenso del faro y los dos giros del haz (120) + un respiro antes de
 * soltar hacia el footer (30). Fijo: no depende de cuánto midan las cartas.
 */
export const ALTO_CIERRE_LVH = 100 + 120 + 30;

/** Ángulo de reposo del haz mientras el faro sube: apunta al cielo. */
const HAZ_CIELO = -90;
/**
 * El haz solo barre la mitad de arriba: entre casi-derecha y casi-izquierda.
 * Hacia abajo cruzaría la torre y apuntaría al piso.
 */
const HAZ_MIN = -170;
const HAZ_MAX = -10;
/** Duración total del timeline, en unidades propias (no fracción de scroll). */
const DURACION = 1.5;

/**
 * El cierre en celular/tablet: «el faro sube y gira la luz hacia cada
 * mensaje», el mismo gesto de lectura de escritorio (coreografia-cierre.ts)
 * pero sin pin de GSAP — la pista alta (`ALTO_CIERRE_LVH`) y la sección
 * `sticky top-0 h-lvh` hacen ese trabajo con CSS. La linterna llega ya
 * ENCENDIDA (es la LinternaFaro estática, igual que en el hero chico): acá
 * solo se anima que suba, se abran dos nubes alrededor y el haz gire de
 * costado hacia cada bloque de texto.
 *
 * El faro vive en la esquina inferior derecha y los mensajes en una columna
 * a su izquierda: el primero arriba, el segundo a la altura de la lámpara.
 * Por eso el haz lee primero arriba-izquierda y después a la izquierda. Los
 * ángulos se miden en pantalla (getBoundingClientRect + atan2 desde la
 * lámpara, `girarHacia`) en vez de ser constantes de diseño. Como el SVG
 * escala parejo (sin `preserveAspectRatio="none"`) y la pose estática se
 * anula, el ángulo en pantalla es el mismo que el `rotation` local del grupo
 * del haz.
 */
export function crearCierreMovil(zona: HTMLElement) {
  const q = gsap.utils.selector(zona);
  const nubes = q<HTMLElement>("[data-cierre-nube-movil]");
  const linterna = q<HTMLElement>("[data-cierre-linterna-movil]")[0];
  const bloques = q<HTMLElement>("[data-cierre-bloque]");
  const anclas = q<HTMLElement>("#biblioteca, #conversemos");
  const pose = linterna?.querySelector<SVGGElement>("[data-linterna-pose]") ?? null;
  const haces = linterna?.querySelector<SVGGElement>("[data-linterna-haces]") ?? null;
  const nucleo = linterna?.querySelector<SVGCircleElement>("[data-linterna-nucleo]") ?? null;
  if (!linterna || !pose || !haces || !nucleo || bloques.length !== 2 || nubes.length !== 2) {
    return () => {};
  }

  const FOCO_ORIGEN = `${FOCO.x} ${FOCO.y}`;
  /**
   * Ángulo en pantalla, en grados, desde la lámpara hasta el centro de `el`,
   * acotado a la mitad de arriba. Un blanco abajo a la izquierda (atan2 cerca
   * de +180) se lleva a −180 antes de acotar, para que quede en −170 y no
   * salte a −10.
   */
  const girarHacia = (el: HTMLElement) => {
    const f = nucleo.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const grados =
      (Math.atan2(
        r.top + r.height / 2 - (f.top + f.height / 2),
        r.left + r.width / 2 - (f.left + f.width / 2),
      ) *
        180) /
      Math.PI;
    return gsap.utils.clamp(HAZ_MIN, HAZ_MAX, grados > 90 ? grados - 360 : grados);
  };

  /** Dónde empieza la pista en el documento (la sección, pegada, no sirve). */
  const inicio = () => zona.getBoundingClientRect().top + window.scrollY;

  const ctx = gsap.context(() => {
    // La pose estática del haz (la que ve movimiento reducido) se anula: de
    // acá en más lo apunta GSAP.
    gsap.set(pose, { attr: { transform: `rotate(0 ${FOCO_ORIGEN})` } });
    gsap.set(nubes, { autoAlpha: 0, willChange: "transform" });
    gsap.set(nubes[0], { x: "-40%" });
    gsap.set(nubes[1], { x: "40%" });
    gsap.set(linterna, { y: "40%", autoAlpha: 0, willChange: "transform" });
    gsap.set(haces, { rotation: HAZ_CIELO, svgOrigin: FOCO_ORIGEN });
    gsap.set(bloques, { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        // El disparador es el primer mensaje porque vive adentro de las dos
        // anclas (#biblioteca y #conversemos): así irASeccion (lib/indice)
        // encuentra la escena y, con data-aterrizaje="fin", llegar por el
        // hash o por el navbar corta al FINAL de la pista y no al cielo
        // vacío. Los bordes son los de la pista, numéricos: el mensaje va
        // pegado y su posición depende del scroll.
        trigger: bloques[0],
        start: () => inicio(),
        end: () => inicio() + zona.offsetHeight - window.innerHeight,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // ── Las dos nubes se abren, como el marco de la hoja en escritorio.
    tl.to(nubes[0], { x: "0%", autoAlpha: 1, duration: 0.3 }, 0);
    tl.to(nubes[1], { x: "0%", autoAlpha: 1, duration: 0.3 }, 0);

    // ── El faro sube desde el piso y se deja ver.
    tl.to(linterna, { y: "0%", autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.1);

    // ── El haz gira hacia el primer mensaje (arriba-izquierda: la
    //    Biblioteca) y lo enciende.
    tl.to(
      haces,
      { rotation: () => girarHacia(bloques[0]), duration: 0.3, ease: "power2.inOut" },
      0.5,
    );
    tl.to(bloques[0], { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, 0.55);

    // ── Pausa de lectura; el haz baja a la izquierda, al segundo mensaje
    //    (a la altura de la lámpara: el cierre), y el primero queda a media
    //    luz.
    tl.to(
      haces,
      { rotation: () => girarHacia(bloques[1]), duration: 0.2, ease: "power2.inOut" },
      1.0,
    );
    tl.to(bloques[0], { autoAlpha: 0.35, duration: 0.15, ease: "none" }, 1.0);
    tl.to(bloques[1], { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, 1.05);

    // Respiro antes de soltar hacia el footer.
    tl.set({}, {}, DURACION);
  }, zona);

  // Las dos anclas aterrizan con la historia ya contada (ver el trigger).
  for (const el of anclas) el.dataset.aterrizaje = "fin";

  return () => {
    ctx.revert();
    for (const el of anclas) delete el.dataset.aterrizaje;
  };
}
