import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearGirador } from "../linterna-giro";
import { ESTRELLA } from "./estrellas";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * El encendido del hero de Investigación — «la luz abre el archivo».
 *
 * Autónomo y corto (unos 2.5 s), sin scrub: el scroll nunca se bloquea, y
 * quien baja antes de que termine no se pierde nada porque el titular está
 * en pantalla desde el primer frame, en penumbra. La lámpara se enciende
 * (chispa → cristal → halo) mientras el tambor da un cuarto de vuelta, el
 * haz nace apuntando al cielo, baja y se POSA sobre el titular: cuando el
 * cono lo cruza, el titular se enciende. Las estrellas que la luz toca a su
 * paso quedan tocadas. Al final el haz respira apenas sobre el mensaje
 * (nunca se va: si girara, cada vuelta lo dejaría a oscuras).
 *
 * El ángulo del haz no se hardcodea: se mide en pantalla del foco de la
 * lámpara al centro del titular, así el haz cae sobre el texto en
 * cualquier viewport. Investigar es alumbrar lo que no se ve; el gesto es
 * ese.
 *
 * Convive con la historia scrolleada (coreografia-historia.ts): cuando el
 * scroll toma el control, `completar()` salta al frame final, frena el
 * vaivén y le presta la luz —el proxy del haz, el girador del tambor, el
 * ángulo posado— para que la apague y la baje a su ritmo; al volver al
 * tope, `retomar()` devuelve el vaivén. Patrón: acá solo se construye el
 * timeline; el componente es dueño del gsap.context y del cleanup.
 */

/** Foco del haz en coordenadas del SVG de la linterna (= FOCO de LinternaFaro). */
const ORIGEN_HAZ = "950 385";
/** Semiángulo del cono de luz (grados): lo que el haz "toca" a su paso. */
const CONO = 12;
/** 0 = derecha, −90 = cielo, −180 = izquierda. */
export const HAZ_CIELO = -90;
/** El cristal apagado sigue siendo un panel: las barras giran contra él. */
export const VIDRIO_APAGADO = 0.38;
/** Brillo de estrella por estado (el tamaño está en estrellas.ts). */
const BRILLO = { sinTocar: 0.72, tocada: 1, iluminada: 1 } as const;
/** El titular: a media luz, y encendido cuando el haz lo lee. */
const TITULO_PENUMBRA = "rgb(169, 197, 232)"; // azul-claro
const TITULO_ENCENDIDO = "rgb(255, 255, 255)";
const RESPLANDOR_ON = "0 0 28px rgba(169, 197, 232, 0.55)";
const RESPLANDOR_OFF = "0 0 0px rgba(169, 197, 232, 0)";

/** Ángulo (grados) del centro de `a` al centro de `b`, en el rango del haz
 *  (siempre ≤ 0: bajar del cielo a la izquierda es RESTAR, y un valor
 *  positivo mandaría al haz por la derecha, la vuelta larga). */
function medirAngulo(a: Element, b: Element) {
  const f = a.getBoundingClientRect();
  const r = b.getBoundingClientRect();
  const grados =
    (Math.atan2(
      r.top + r.height / 2 - (f.top + f.height / 2),
      r.left + r.width / 2 - (f.left + f.width / 2),
    ) *
      180) /
    Math.PI;
  return grados > 0 ? grados - 360 : grados;
}

export function crearEncendido(zona: HTMLElement) {
  const q = gsap.utils.selector(zona);
  const vidrio = q<SVGGElement>("[data-linterna-vidrio]")[0];
  const nucleo = q<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const halo = q<SVGCircleElement>("[data-linterna-halo]")[0];
  const pose = q<SVGGElement>("[data-linterna-pose]")[0];
  const haces = q<SVGGElement>("[data-linterna-haces]")[0];
  const resplandor = q<HTMLElement>("[data-hero-resplandor]")[0];
  const estrellas = q<SVGCircleElement>("[data-hero-estrella]");
  const titulo = q<HTMLElement>("[data-hero-titulo]")[0];
  const suben = q<HTMLElement>("[data-hero-rise]");

  const { giro, girar } = crearGirador(zona, 90);
  const radios = estrellas.map((e) => Number(e.getAttribute("r")) / ESTRELLA.tocada);

  // ── Estado pre-paint: noche, lámpara apagada, titular en penumbra. La
  //    pose estática del haz (SSR) se anula: de acá en más lo apunta GSAP.
  gsap.set(pose, { attr: { transform: "rotate(0 950 385)" } });
  gsap.set(vidrio, { opacity: VIDRIO_APAGADO });
  gsap.set([nucleo, halo], { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(haces, { autoAlpha: 0, rotation: HAZ_CIELO, svgOrigin: ORIGEN_HAZ });
  gsap.set(resplandor, { autoAlpha: 0 });
  gsap.set(titulo, { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF });
  gsap.set(suben, { autoAlpha: 0, y: 18 });
  girar();

  // ── La luz que lee: el haz gira (proxy beta) y las estrellas reaccionan.
  //    Los ángulos se miden una vez, al arrancar el barrido (layout listo).
  const haz = { beta: HAZ_CIELO };
  let angulos: number[] | null = null;
  const distanciaAngular = (a: number, b: number) =>
    Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  const pintarEstrellas = () => {
    if (!angulos) angulos = estrellas.map((e) => medirAngulo(nucleo, e));
    estrellas.forEach((e, i) => {
      const a = angulos![i];
      const iluminada = distanciaAngular(a, haz.beta) <= CONO;
      // Cobertura del barrido: del cielo hasta donde va el haz (bajando).
      const tocada = iluminada || (a >= haz.beta - CONO && a <= HAZ_CIELO + CONO);
      const estado = iluminada ? "iluminada" : tocada ? "tocada" : "sinTocar";
      e.setAttribute("r", String(radios[i] * ESTRELLA[estado]));
      e.setAttribute("fill-opacity", String(BRILLO[estado]));
    });
  };
  /** Solo rotar el haz (lo que presta a la historia: las estrellas que la
   *  luz ya tocó quedan tocadas aunque el haz vuelva al cielo). */
  const apuntarHaz = () => {
    gsap.set(haces, { rotation: haz.beta, svgOrigin: ORIGEN_HAZ });
  };
  const apuntar = () => {
    apuntarHaz();
    pintarEstrellas();
  };
  /** Dónde queda posado el haz: se mide una vez, cuando el barrido lo
   *  necesita, y la historia arranca su salida desde ese mismo valor. */
  let objetivo: number | null = null;
  const posado = () => objetivo ?? (objetivo = medirAngulo(nucleo, titulo));
  estrellas.forEach((e, i) => {
    e.setAttribute("r", String(radios[i] * ESTRELLA.sinTocar));
    e.setAttribute("fill-opacity", String(BRILLO.sinTocar));
  });

  const tl = gsap.timeline({ defaults: { ease: "none" }, delay: 0.25 });

  // ── El encendido: chispa → cristal → halo, con el tambor dando un cuarto
  //    de vuelta hasta mirar de frente.
  tl.fromTo(
    nucleo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1.3, duration: 0.12, ease: "power2.out" },
    0,
  );
  tl.to(nucleo, { scale: 1, duration: 0.2, ease: "power1.inOut" }, 0.12);
  tl.fromTo(vidrio, { opacity: VIDRIO_APAGADO }, { opacity: 1, duration: 0.3 }, 0.08);
  tl.to(giro, { theta: 0, duration: 1.2, ease: "power2.out", onUpdate: girar }, 0);
  tl.fromTo(
    halo,
    { autoAlpha: 0, scale: 0.3 },
    { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" },
    0.2,
  );
  tl.fromTo(resplandor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.25);

  // ── El haz nace apuntando al cielo, baja y se posa sobre el titular.
  tl.fromTo(haces, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.4);
  tl.fromTo(
    haz,
    { beta: HAZ_CIELO },
    {
      beta: posado,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: apuntar,
    },
    0.45,
  );
  // El titular se enciende cuando el cono lo alcanza.
  tl.fromTo(
    titulo,
    { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF },
    { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON, duration: 0.35 },
    1.45,
  );
  // Con la luz puesta, suben los botones y el cue de scroll.
  tl.fromTo(
    suben,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 },
    1.7,
  );

  // ── Y después, la luz respira sobre el mensaje: vaivén de pocos grados
  //    (menos que el cono, para que el titular nunca salga de la luz). Se
  //    crea acá, pausado, para que el gsap.context del componente lo
  //    conozca: un tween nacido dentro de un callback tardío se le escapa
  //    al revert.
  const vaiven = gsap.to(haz, {
    beta: "-=2.5",
    duration: 4.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    paused: true,
    onUpdate: apuntar,
  });
  let terminado = false;
  /** El scroll tiene la luz: el vaivén no se mete hasta que la devuelva. */
  let prestada = false;
  tl.add(() => {
    terminado = true;
    if (!prestada) vaiven.invalidate().play();
  });

  // ── Fuera de viewport nada se mueve (batería). El vaivén recién existe
  //    cuando la intro terminó: si no, un toggle temprano lo arrancaría
  //    con el haz todavía en el cielo.
  ScrollTrigger.create({
    trigger: zona,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive) {
        tl.play();
        if (terminado && !prestada) vaiven.play();
      } else {
        tl.pause();
        vaiven.pause();
      }
    },
  });

  /** El scroll tomó el control: saltar al frame final (luz posada, botones
   *  puestos) para que el scrub parta de un estado conocido —quien
   *  scrollea a los 2 s ve un pop, no un error— y dejar el haz quieto en
   *  su ángulo posado, que es de donde la historia lo levanta. */
  /** Cómo quedó cada estrella cuando la luz se cedió (tamaño y brillo por
   *  estado: tocada o no). La historia hace despegar la bandada DESDE acá,
   *  así al volver cada estrella recupera exactamente lo suyo. */
  const reposo = { r: [] as number[], brillo: [] as number[] };
  const completar = () => {
    prestada = true;
    if (tl.progress() < 1) tl.progress(1);
    vaiven.pause(0);
    reposo.r = estrellas.map((e) => Number(e.getAttribute("r")));
    reposo.brillo = estrellas.map((e) => Number(e.getAttribute("fill-opacity")));
  };
  /** El scroll volvió al tope: la luz vuelve a respirar sobre el titular. */
  const retomar = () => {
    prestada = false;
    if (terminado) vaiven.invalidate().play();
  };

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

  return {
    tl,
    completar,
    retomar,
    restaurar,
    /** La luz, prestada a la historia para apagarla y bajarla. */
    luz: { haz, apuntar: apuntarHaz, posado, giro, girar, reposo },
  };
}

export type Encendido = ReturnType<typeof crearEncendido>;
