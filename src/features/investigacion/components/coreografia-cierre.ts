import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  aspectoBarra,
  proyectar,
  proyectarLente,
  RADIO_CRISTAL,
  RADIO_GALERIA,
} from "./LinternaFaro";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Coreografía del cierre de Investigación — «cae la noche sobre el archivo».
 *
 * La hoja llega enmarcada y, al pinnearse, el marco se disuelve: la noche se
 * expande hasta los bordes. El scroll cuenta el ascenso: el faro sube desde
 * el piso GIRANDO (una vuelta entera, frenando al llegar; la óptica rompe la
 * simetría del tambor para que una vuelta se lea como una) y casi arriba se
 * enciende — chispa → cristal → halo. Después el HAZ LEE DE COSTADO: nace
 * apuntando al cielo, gira y se posa sobre la Biblioteca (el título se
 * enciende), vuelve por arriba y se posa sobre el cierre (la Biblioteca queda
 * a media luz, el cierre se enciende). Nunca barre el piso. Las 13 estrellas
 * —los puntos del hero— reaccionan al paso de la luz: sin tocar → iluminada
 * (dentro del cono) → tocada. Todo scrubbeado y reversible: el estado de cada
 * estrella sale del tiempo del timeline y del ángulo del haz, no de la
 * historia del scroll.
 *
 * El giro es pseudo-3D: la linterna y la galería son cilindros vistos de
 * costado, y cada barra vertical se proyecta con x = cx + r·cos(φ + θ). Un
 * proxy {theta} tweeneado por el scroll y una función que re-proyecta las
 * barras y la óptica por frame — escrituras directas de atributos.
 *
 * Patrón: igual que coreografia-hero.ts, acá solo se construyen timelines;
 * el componente es dueño del gsap.context y del cleanup.
 */

type Escena = {
  /** El wrapper de la sección: es lo que se pinnea. */
  zona: HTMLElement;
  /** La hoja nocturna (section): de acá salen todos los actores. */
  hoja: HTMLElement;
};

/** Cuánto asoma el faro al principio: nada (queda bajo el piso de la hoja). */
const AIRE_OCULTO = 60;
/** El cristal apagado sigue siendo un panel: las barras giran contra él. */
const VIDRIO_APAGADO = 0.38;

/** Foco del haz en coordenadas del SVG de la linterna (= FOCO de LinternaFaro). */
const ORIGEN_HAZ = "950 385";
/** Semiángulo del cono de luz (grados): lo que el haz "toca" a su paso. */
const CONO = 12;
/** Ángulos del haz: 0 = derecha (cierre), −90 = cielo, −180 = izquierda (Biblioteca). */
const HAZ_CIELO = -90;
const HAZ_BIBLIOTECA = -180;
const HAZ_CIERRE = 0;
/** Ventanas de tiempo (unidades del timeline) de los dos barridos. */
const BARRIDO_1 = { desde: 1.3, hasta: 1.78 };
const BARRIDO_2 = { desde: 2.1, hasta: 2.78 };
/** Tamaño de estrella por estado (factor sobre PUNTOS[i].r). */
const ESTRELLA = { sinTocar: 0.8, tocada: 0.95, iluminada: 1.35 } as const;
const BRILLO = { sinTocar: 0.72, tocada: 1, iluminada: 1 } as const;
/** Títulos: a media luz, y encendidos cuando el haz los lee. */
const TITULO_PENUMBRA = "rgb(169, 197, 232)"; // azul-claro
const TITULO_ENCENDIDO = "rgb(255, 255, 255)";
const RESPLANDOR_ON = "0 0 28px rgba(169, 197, 232, 0.55)";
const RESPLANDOR_OFF = "0 0 0px rgba(169, 197, 232, 0)";

export function crearAscenso({ zona, hoja }: Escena) {
  const q = gsap.utils.selector(hoja);
  const linterna = q<HTMLElement>("[data-cierre-linterna]")[0];
  const parantes = q<SVGLineElement>("[data-linterna-parante]");
  const montantes = q<SVGLineElement>("[data-linterna-montante]");
  const lente = q<SVGRectElement>("[data-linterna-lente]")[0];
  const vidrio = q<SVGGElement>("[data-linterna-vidrio]")[0];
  const nucleo = q<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const halo = q<SVGCircleElement>("[data-linterna-halo]")[0];
  const haces = q<SVGGElement>("[data-linterna-haces]")[0];
  const estrellas = q<SVGCircleElement>("[data-cierre-estrella]");
  const bloques = q<HTMLElement>("[data-cierre-bloque]");
  const titulos = q<HTMLElement>("[data-cierre-titulo]");
  const palabra = q<HTMLElement>("[data-cierre-palabra]")[0];
  const marco = q<HTMLElement>("[data-cierre-marco]")[0];

  // ── El giro: proyectar las barras y la óptica para el θ actual.
  const giro = { theta: 360 };
  const girar = () => {
    parantes.forEach((l) => {
      const phi = Number(l.dataset.linternaParante);
      const { x, frente } = proyectar(phi, giro.theta, RADIO_CRISTAL);
      const { opacity, grosor } = aspectoBarra(frente, x, RADIO_CRISTAL);
      l.setAttribute("x1", String(x));
      l.setAttribute("x2", String(x));
      l.setAttribute("stroke-opacity", String(opacity));
      l.setAttribute("stroke-width", String(grosor));
    });
    montantes.forEach((l) => {
      const phi = Number(l.dataset.linternaMontante);
      const { x, frente } = proyectar(phi, giro.theta, RADIO_GALERIA);
      const { opacity, grosor } = aspectoBarra(frente, x, RADIO_GALERIA);
      l.setAttribute("x1", String(x));
      l.setAttribute("x2", String(x));
      l.setAttribute("stroke-opacity", String(0.5 * opacity));
      l.setAttribute("stroke-width", String(0.55 + grosor * 0.35));
    });
    const optica = proyectarLente(giro.theta);
    lente.setAttribute("x", String(optica.x));
    lente.setAttribute("width", String(optica.ancho));
    lente.setAttribute("opacity", String(optica.opacity));
  };

  const altoOculto = () => linterna.offsetHeight + AIRE_OCULTO;

  // ── Estado pre-paint: la hoja enmarcada, el faro bajo el piso, luz
  //    apagada, mensajes y estrellas esperando. θ = 360 ≡ 0: la pose de
  //    partida es la del SSR.
  gsap.set(marco, { autoAlpha: 1 });
  gsap.set(linterna, { y: altoOculto });
  gsap.set(vidrio, { opacity: VIDRIO_APAGADO });
  gsap.set([nucleo, halo], { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(haces, { autoAlpha: 0, rotation: HAZ_CIELO, svgOrigin: ORIGEN_HAZ });
  gsap.set(estrellas, { autoAlpha: 0 });
  gsap.set(bloques, { autoAlpha: 0, y: 18 });
  gsap.set(titulos, { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF });
  girar();

  // ── La luz que lee: el haz gira (proxy beta) y las estrellas reaccionan.
  //    Los ángulos de cada estrella respecto del foco se miden en pantalla,
  //    una vez que el faro llegó arriba (y se olvidan en cada refresh).
  const haz = { beta: HAZ_CIELO };
  const radios = estrellas.map((e) => Number(e.getAttribute("r")) / ESTRELLA.tocada);
  let angulos: number[] | null = null;
  const medirAngulos = () => {
    const f = nucleo.getBoundingClientRect();
    const fx = f.left + f.width / 2;
    const fy = f.top + f.height / 2;
    angulos = estrellas.map((e) => {
      const r = e.getBoundingClientRect();
      return (Math.atan2(r.top + r.height / 2 - fy, r.left + r.width / 2 - fx) * 180) / Math.PI;
    });
  };
  const distanciaAngular = (a: number, b: number) =>
    Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  const pintarEstrellas = (t: number) => {
    if (t < BARRIDO_1.desde) {
      estrellas.forEach((e, i) => {
        e.setAttribute("r", String(radios[i] * ESTRELLA.sinTocar));
        e.setAttribute("fill-opacity", String(BRILLO.sinTocar));
      });
      return;
    }
    if (!angulos) medirAngulos();
    const beta = haz.beta;
    // Cobertura acumulada del barrido (determinista por tiempo): el 1º va del
    // cielo a la izquierda; el 2º vuelve por arriba hasta la derecha.
    const enSegundo = t >= BARRIDO_2.desde;
    const lo = enSegundo ? HAZ_BIBLIOTECA : Math.min(HAZ_CIELO, beta);
    const hi = enSegundo ? beta : HAZ_CIELO;
    estrellas.forEach((e, i) => {
      const a = angulos![i];
      const iluminada = distanciaAngular(a, beta) <= CONO;
      const tocada = iluminada || (a >= lo - CONO && a <= hi + CONO);
      const estado = iluminada ? "iluminada" : tocada ? "tocada" : "sinTocar";
      e.setAttribute("r", String(radios[i] * ESTRELLA[estado]));
      e.setAttribute("fill-opacity", String(BRILLO[estado]));
    });
  };
  const apuntar = () => {
    gsap.set(haces, { rotation: haz.beta, svgOrigin: ORIGEN_HAZ });
  };
  pintarEstrellas(0);

  // ── La palabra llega con la hoja (antes del pin): sube del piso y se asienta.
  gsap.fromTo(
    palabra,
    { y: 70, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: { trigger: hoja, start: "top 90%", end: "top 20%", scrub: true },
    },
  );

  const sinRender = { immediateRender: false } as const;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: zona,
      start: "top top",
      end: "+=2800",
      scrub: true,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: () => {
        angulos = null;
      },
      onUpdate: () => pintarEstrellas(tl.time()),
    },
  });

  // ── Cae la noche: el marco se disuelve y el navy llega a los bordes.
  tl.fromTo(
    marco,
    { top: "0.625rem", right: "0.625rem", bottom: "0.625rem", left: "0.625rem", borderRadius: "0.75rem" },
    { top: 0, right: 0, bottom: 0, left: 0, borderRadius: 0, duration: 0.22, ease: "power2.out", ...sinRender },
    0,
  );
  tl.to(marco, { autoAlpha: 0, duration: 0.12 }, 0.18);

  // ── Ascenso y giro: sube frenando y gira una vuelta entera con el MISMO
  //    ease que la subida (cuadrático): la vuelta se reparte sobre todo el
  //    ascenso y se ve mientras el faro asoma.
  tl.fromTo(
    linterna,
    { y: altoOculto },
    { y: 0, duration: 1.2, ease: "power1.out", ...sinRender },
    0,
  );
  tl.fromTo(
    giro,
    { theta: 360 },
    { theta: 0, duration: 1.2, ease: "power1.out", onUpdate: girar, ...sinRender },
    0,
  );

  // ── Las estrellas (los puntos del hero) se prenden durante el ascenso.
  tl.fromTo(
    estrellas,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 0.3,
      stagger: { each: 0.055, from: "random" },
      ...sinRender,
    },
    0.1,
  );

  // ── El encendido, casi llegando arriba: chispa → cristal → halo.
  tl.fromTo(
    nucleo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1.3, duration: 0.06, ease: "power2.out", ...sinRender },
    1.0,
  );
  tl.to(nucleo, { scale: 1, duration: 0.1, ease: "power1.inOut" }, 1.06);
  tl.fromTo(
    vidrio,
    { opacity: VIDRIO_APAGADO },
    { opacity: 1, duration: 0.14, ...sinRender },
    1.04,
  );
  tl.fromTo(
    halo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out", ...sinRender },
    1.1,
  );

  // ── El haz nace apuntando al cielo (el `set` explícito evita que el orden
  //    de render de la primera carga lo deje en el from del segundo barrido).
  tl.set(haz, { beta: HAZ_CIELO, onUpdate: apuntar }, 1.19);
  tl.fromTo(
    haces,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.15, ...sinRender },
    1.2,
  );
  // ...gira y se posa sobre la Biblioteca (primer barrido).
  tl.fromTo(
    haz,
    { beta: HAZ_CIELO },
    {
      beta: HAZ_BIBLIOTECA,
      duration: BARRIDO_1.hasta - BARRIDO_1.desde,
      ease: "power2.inOut",
      onUpdate: apuntar,
      ...sinRender,
    },
    BARRIDO_1.desde,
  );
  // El bloque izquierdo llega con la luz y su título se enciende.
  tl.fromTo(
    bloques[0],
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender },
    1.55,
  );
  tl.fromTo(
    titulos[0],
    { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF },
    { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON, duration: 0.22, ...sinRender },
    1.62,
  );
  // Pausa de lectura, y el haz vuelve por arriba hasta el cierre (segundo barrido).
  tl.fromTo(
    haz,
    { beta: HAZ_BIBLIOTECA },
    {
      beta: HAZ_CIERRE,
      duration: BARRIDO_2.hasta - BARRIDO_2.desde,
      ease: "power2.inOut",
      onUpdate: apuntar,
      ...sinRender,
    },
    BARRIDO_2.desde,
  );
  // La luz se va de la Biblioteca: el título vuelve a la penumbra, leído.
  tl.to(
    titulos[0],
    { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF, duration: 0.3 },
    2.22,
  );
  // ...y llega al cierre: el bloque derecho, con el único naranja, se enciende.
  tl.fromTo(
    bloques[1],
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender },
    2.55,
  );
  tl.fromTo(
    titulos[1],
    { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF },
    { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON, duration: 0.22, ...sinRender },
    2.66,
  );

  // Respiro final antes de soltar el pin hacia el footer.
  tl.to({}, { duration: 0.35 });

  /** Lo escrito a mano (barras, óptica, estrellas) ctx.revert() no lo
   *  conoce: volver al frame final, que es el que dibuja el SSR. */
  const restaurar = () => {
    giro.theta = 0;
    girar();
    estrellas.forEach((e, i) => {
      e.setAttribute("r", String(radios[i] * ESTRELLA.tocada));
      e.setAttribute("fill-opacity", String(BRILLO.tocada));
    });
  };

  return { tl, restaurar };
}
