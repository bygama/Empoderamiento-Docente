import gsap from "gsap";
import { FOCO_X, FOCO_Y } from "../faro-geometria";

/** Ancho del dibujo (viewBox de las capas). */
const ANCHO_DIBUJO = 1440;
/**
 * Dónde queda la linterna en la pantalla, en fracción del alto: un poco
 * debajo de la mitad, así la mitad de arriba es cielo para el texto y la
 * torre baja hacia el mar.
 */
const FOCO_Y_PANTALLA = 0.52;
/**
 * Paralaje de los travellings: el fondo acompaña menos que el faro, y eso
 * da la profundidad. El mar medio va con el faro porque lleva el espejo de
 * la linterna (si se corriera distinto, el reflejo se despegaría de la luz).
 */
const PARALAJE = { cielo: 0.35, horizonte: 0.65, faro: 1, marMedio: 1 } as const;
/**
 * La punta de la torre (mástil) y el medio ancho de la linterna con su
 * alero, en unidades del dibujo desde el foco; y el aire que se le deja.
 */
const REMATE = { alto: 60, medio: 30, holgura: 12 } as const;
/** Lo más a la derecha que va el faro para dejarle lugar a algo. */
const FX_MAX = 0.82;
/**
 * La llegada, la MISMA de escritorio (coreografia-faro.ts): el mundo entero
 * arranca 0,86 pantallas más abajo y sube durante π/2 pantallas de scroll
 * con freno en seno. Arranca al ritmo del scroll (π/2 · 0,86 / (π/2) =
 * 0,86×) y desacelera hasta posarse con la primera frase en pantalla.
 */
const LLEGADA = { bajo: 0.86, pantallas: Math.PI / 2 } as const;
type Capa = keyof typeof PARALAJE;

export type Punto = { x: number; y: number };

/**
 * LA CÁMARA DEL FARO EN CELULAR Y TABLET: encuadre, llegada y travellings.
 *
 * `estado.fx` es dónde está el faro en la pantalla (fracción del ancho); la
 * línea de tiempo lo anima y `aplicar` corre el mundo entero para que la
 * linterna caiga ahí, cada capa en su medida (PARALAJE). Nunca deja ver un
 * borde del dibujo: el corrimiento se topa con el margen que haya a cada
 * lado de la torre (medido en `medir`). En un celular vertical sobra; con la
 * pantalla apaisada casi no hay, y el faro se queda cerca del centro.
 *
 * Todo en coordenadas del ESCENARIO (el sticky), no de la ventana: al medir
 * —al montar o en un resize— la escena puede estar todavía abajo.
 */
export function crearCamaraMovil(root: HTMLElement) {
  const svgFaro = root.querySelector<SVGSVGElement>("[data-capa='faro'] svg");
  const capaFaro = root.querySelector<HTMLElement>("[data-capa='faro']");
  const shiftFaro = capaFaro?.querySelector<HTMLElement>("[data-faro-shift]");
  const escenario = root.querySelector<HTMLElement>("[data-escenario]");
  const shifts = Array.from(root.querySelectorAll<HTMLElement>("[data-faro-shift]")).map((el) => ({
    el,
    capa: (el.parentElement?.dataset.capa ?? "faro") as Capa,
    setX: gsap.quickSetter(el, "x", "px"),
  }));

  const estado = { fx: 0.5 };
  // x/y: cuánto correr el mundo para que la linterna quede centrada y a
  // FOCO_Y_PANTALLA. margenIzq/Der: cuánto más puede ir el faro hacia cada
  // lado sin que entre en cuadro un borde del dibujo.
  const m = { ancho: 0, alto: 0, escala: 1, x: 0, y: 0, margenIzq: 0, margenDer: 0 };

  const medir = () => {
    const ctm = svgFaro?.getScreenCTM();
    if (!ctm || !capaFaro || !shiftFaro || !escenario) return;
    const foco = new DOMPoint(FOCO_X, FOCO_Y).matrixTransform(ctm);
    const caja = escenario.getBoundingClientRect();
    m.ancho = caja.width;
    m.alto = caja.height;
    // Se descuenta el corrimiento que ya tenga la capa: así no hace falta
    // devolverla a cero para medir.
    m.x = caja.width / 2 - (foco.x - caja.left - Number(gsap.getProperty(shiftFaro, "x")));
    m.y = caja.height * FOCO_Y_PANTALLA - (foco.y - caja.top - Number(gsap.getProperty(shiftFaro, "y")));
    // El dibujo cubre el ancho de la capa (slice, ver FaroEscena): la torre
    // tiene FOCO_X unidades a su izquierda y el resto a su derecha.
    const escala = capaFaro.offsetWidth / ANCHO_DIBUJO;
    m.escala = escala;
    m.margenIzq = Math.max(0, FOCO_X * escala - caja.width / 2 - 2);
    m.margenDer = Math.max(0, (ANCHO_DIBUJO - FOCO_X) * escala - caja.width / 2 - 2);
  };

  /** Cuánto se corre el faro desde el centro, ya topado por los márgenes. */
  const corrimiento = () => {
    const d = m.ancho * (estado.fx - 0.5);
    return d < 0 ? Math.max(d, -m.margenDer) : Math.min(d, m.margenIzq);
  };

  const aplicar = () => {
    const d = corrimiento();
    for (const s of shifts) s.setX(m.x + d * PARALAJE[s.capa]);
  };

  /** La linterna en la pantalla (ya llegada), en coordenadas del escenario. */
  const foco = (): Punto => ({ x: m.ancho / 2 + corrimiento(), y: m.alto * FOCO_Y_PANTALLA });

  /**
   * Dónde poner el faro para que no pise algo que está arriba a la
   * izquierda (su borde derecho y su pie, en coordenadas del escenario): al
   * centro si ese algo termina por encima de la punta de la torre; si no,
   * corrido a la derecha lo justo para que la linterna quede al costado.
   */
  const faroLibre = (o: { derecha: number; abajo: number }) => {
    const punta = m.alto * FOCO_Y_PANTALLA - REMATE.alto * m.escala;
    if (o.abajo + REMATE.holgura <= punta) return 0.5;
    const fx = (o.derecha + REMATE.holgura + REMATE.medio * m.escala) / m.ancho;
    return Math.min(FX_MAX, Math.max(0.5, fx));
  };

  /**
   * Llegada: la escena está DETRÁS del hero (QueHacemosHeroFaro, -mt de una
   * pantalla), así que el faro se ve subir mientras el hero se va, sin hueco
   * negro en el medio. Antes la escena venía debajo del hero y al subir se
   * sumaban dos movimientos —el scroll de la página y la subida propia—: el
   * faro recorría el doble en el mismo tiempo y aterrizaba de golpe.
   */
  const llegar = (alto: HTMLElement) => {
    gsap.fromTo(
      shifts.map((s) => s.el),
      { y: () => m.y + window.innerHeight * LLEGADA.bajo, willChange: "transform" },
      {
        y: () => m.y,
        ease: "sine.out",
        immediateRender: true,
        scrollTrigger: {
          trigger: alto,
          start: "top top",
          end: () => `top+=${window.innerHeight * LLEGADA.pantallas} top`,
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      },
    );
  };

  /**
   * Al desarmar (cruzar a escritorio): el x lo escribe `setX` por fuera de
   * los tweens, así que el revert de gsap no lo devuelve. Girar la tablet a
   * mitad de un travelling dejaba el mundo de escritorio corrido.
   */
  const soltar = () => {
    for (const s of shifts) s.setX(0);
  };

  medir();
  aplicar();
  return { estado, escenario, medir, aplicar, foco, faroLibre, llegar, soltar };
}
