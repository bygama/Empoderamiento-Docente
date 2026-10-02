import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PERSONAJE } from "../../constelacion";
import { FOCO } from "../../linterna-geometria";
import { crearGirador } from "../../linterna-giro";
import { HAZ_CIELO, VIDRIO_APAGADO } from "../coreografia-encendido";
import { ESTRELLA } from "../estrellas";
import type { Cielo } from "./cielo";

/** Semiángulo del cono (grados): lo que el haz «toca» a su paso. */
const CONO = 13;
const BRILLO = { sinTocar: 0.72, tocada: 1, iluminada: 1 } as const;
/** El titular: a media luz, y encendido cuando el haz lo lee. */
const TITULO_PENUMBRA = "rgb(169, 197, 232)"; // azul-claro
const TITULO_ENCENDIDO = "rgb(255, 255, 255)";
const RESPLANDOR_OFF = "0 0 0px rgba(169, 197, 232, 0)";
/** Lo que le queda al titular cuando la luz ya pasó: apenas un aura. */
const RESPLANDOR_LEIDO = "0 0 22px rgba(169, 197, 232, 0.3)";
const ORIGEN = `${FOCO.x} ${FOCO.y}`;

/** Ángulo (grados) del centro de `a` al centro de `b`, en el rango del haz:
 *  siempre ≤ 0, porque bajar del cielo por la izquierda es RESTAR. */
export function medirAngulo(a: Element, b: Element) {
  const f = a.getBoundingClientRect();
  const r = b.getBoundingClientRect();
  const grados =
    (Math.atan2(r.top + r.height / 2 - (f.top + f.height / 2), r.left + r.width / 2 - (f.left + f.width / 2)) * 180) /
    Math.PI;
  return grados > 0 ? grados - 360 : grados;
}

/** Cada estrella a su lugar del cielo de celular, del tamaño de «tocada». */
export function ubicarEstrellas(estrellas: SVGCircleElement[], cielo: Cielo) {
  estrellas.forEach((e, i) => {
    const [x, y] = cielo.estrella(i);
    e.setAttribute("cx", String(x));
    e.setAttribute("cy", String(y));
  });
}

type Partes = {
  /** El wrapper del faro de celular (`[data-hero-linterna-movil]`). */
  raiz: Element;
  titulo: HTMLElement;
  botones: HTMLElement;
  estrellas: SVGCircleElement[];
};

/**
 * El encendido del hero bajo `lg`: el de escritorio (coreografia-encendido.ts)
 * con otro final. La lámpara se enciende, el haz nace apuntando al cielo y
 * baja por la izquierda: al pasar LEE el titular —que se enciende con él— y
 * sigue de largo hasta posarse en el cielo libre, sobre las estrellas, con la
 * naranja en el centro. En un celular el faro y el titular están en esquinas
 * opuestas: un haz posado sobre el texto lo cruza entero y no deja leerlo.
 * Las estrellas que la luz toca quedan tocadas; después el haz respira.
 *
 * Autónomo, unos 2.3 s, sin bloquear el scroll. Cuando el scroll toma el
 * control, `completar()` salta al frame final y presta la luz a la escena;
 * `retomar()` la devuelve en el tope. Acá solo se construye el timeline:
 * quien llama es dueño del gsap.context y del cleanup.
 */
export function crearEncendidoMovil({ raiz, titulo, botones, estrellas }: Partes) {
  const q = gsap.utils.selector(raiz);
  const vidrio = q<SVGGElement>("[data-linterna-vidrio]")[0];
  const nucleo = q<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const halo = q<SVGCircleElement>("[data-linterna-halo]")[0];
  const pose = q<SVGGElement>("[data-linterna-pose]")[0];
  const haces = q<SVGGElement>("[data-linterna-haces]")[0];
  const { giro, girar } = crearGirador(raiz, 90);
  const radios = estrellas.map((e) => Number(e.getAttribute("r")) / ESTRELLA.tocada);

  // ── Estado pre-paint: lámpara apagada, titular en penumbra, botones por
  //    llegar, estrellas sin tocar. La pose estática del haz (SSR) se anula.
  gsap.set(pose, { attr: { transform: `rotate(0 ${ORIGEN})` } });
  gsap.set(vidrio, { opacity: VIDRIO_APAGADO });
  gsap.set([nucleo, halo], { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
  gsap.set(haces, { autoAlpha: 0, rotation: HAZ_CIELO, svgOrigin: ORIGEN });
  gsap.set(titulo, { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF });
  gsap.set(botones, { autoAlpha: 0, y: 18 });
  girar();

  const haz = { beta: HAZ_CIELO };
  let angulos: number[] | null = null;
  let objetivo: number | null = null;
  let anguloTitulo: number | null = null;
  const distancia = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);
  const pintarEstrellas = () => {
    if (!angulos) angulos = estrellas.map((e) => medirAngulo(nucleo, e));
    estrellas.forEach((e, i) => {
      const a = angulos![i];
      const iluminada = distancia(a, haz.beta) <= CONO;
      const tocada = iluminada || (a >= haz.beta - CONO && a <= HAZ_CIELO + CONO);
      const estado = iluminada ? "iluminada" : tocada ? "tocada" : "sinTocar";
      e.setAttribute("r", String(radios[i] * ESTRELLA[estado]));
      e.setAttribute("fill-opacity", String(BRILLO[estado]));
    });
  };
  const apuntarHaz = () => gsap.set(haces, { rotation: haz.beta, svgOrigin: ORIGEN });
  /** Dónde se posa: sobre la estrella naranja, en el cielo libre. */
  const posado = () => objetivo ?? (objetivo = medirAngulo(nucleo, estrellas[PERSONAJE]));
  pintarEstrellas();

  // El titular se enciende cuando el cono lo alcanza. Pausado y creado acá
  // (no en el callback) para que el gsap.context lo conozca.
  const leer = gsap.fromTo(
    titulo,
    { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF },
    { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_LEIDO, duration: 0.45, ease: "power1.out", paused: true },
  );
  const apuntar = () => {
    apuntarHaz();
    pintarEstrellas();
    anguloTitulo ??= medirAngulo(nucleo, titulo);
    if (leer.progress() === 0 && haz.beta <= anguloTitulo + CONO) leer.play();
  };

  const tl = gsap.timeline({ defaults: { ease: "none" }, delay: 0.25 });
  // ── Chispa → cristal → halo, con el tambor dando un cuarto de vuelta.
  tl.fromTo(nucleo, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1.3, duration: 0.12, ease: "power2.out" }, 0);
  tl.to(nucleo, { scale: 1, duration: 0.2, ease: "power1.inOut" }, 0.12);
  tl.fromTo(vidrio, { opacity: VIDRIO_APAGADO }, { opacity: 1, duration: 0.3 }, 0.08);
  tl.to(giro, { theta: 0, duration: 1.2, ease: "power2.out", onUpdate: girar }, 0);
  tl.fromTo(halo, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0.2);
  // ── El haz nace al cielo, lee el titular al pasar y se posa en las estrellas.
  tl.fromTo(haces, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.4);
  tl.fromTo(haz, { beta: HAZ_CIELO }, { beta: posado, duration: 1.5, ease: "power2.inOut", onUpdate: apuntar }, 0.45);
  tl.fromTo(botones, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.55);

  // ── Después la luz respira sobre las estrellas (menos que el cono).
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
  let prestada = false;
  tl.add(() => {
    terminado = true;
    if (!prestada) vaiven.invalidate().play();
  });

  /** Cómo quedó cada estrella cuando la luz se cedió: la bandada despega de acá. */
  const reposo = { r: [] as number[], brillo: [] as number[] };
  const completar = () => {
    prestada = true;
    if (tl.progress() < 1) tl.progress(1);
    leer.progress(1);
    vaiven.pause(0);
    reposo.r = estrellas.map((e) => Number(e.getAttribute("r")));
    reposo.brillo = estrellas.map((e) => Number(e.getAttribute("fill-opacity")));
  };
  const retomar = () => {
    prestada = false;
    if (terminado) vaiven.invalidate().play();
  };
  /** Tras un refresh (rotación, fuentes): las estrellas cambiaron de lugar. */
  const remedir = () => {
    angulos = null;
    objetivo = null;
    anguloTitulo = null;
    if (terminado && !prestada) {
      vaiven.pause(0);
      haz.beta = posado();
      apuntar();
      vaiven.invalidate().play();
    }
  };
  // Fuera de pantalla nada se mueve (batería).
  ScrollTrigger.create({
    trigger: raiz,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (!self.isActive) vaiven.pause();
      else if (terminado && !prestada) vaiven.play();
    },
  });

  /** Lo escrito a mano (barras, óptica, tamaño de las estrellas) el revert no
   *  lo conoce: volver al frame que dibuja el SSR. */
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
    remedir,
    restaurar,
    nucleo,
    /** La luz, prestada a la escena para apagarla y bajarla. */
    luz: { haz, apuntar: apuntarHaz, posado, giro, girar, reposo },
  };
}

export type EncendidoMovil = ReturnType<typeof crearEncendidoMovil>;
