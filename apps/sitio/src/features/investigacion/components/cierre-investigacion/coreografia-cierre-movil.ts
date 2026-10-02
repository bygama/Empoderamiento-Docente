import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOCO } from "../linterna-geometria";
import { crearGirador } from "../linterna-giro";
import { crearEstrellasMovil } from "./estrellas-movil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Cuánto baja la cámara entre nubes antes de que el faro asome (unidades). */
const DESCENSO = 0.9;
/** Las nubes: mismo tiempo para todas y distinta distancia (el paralaje), en
 *  altos de escena por unidad. Como en escritorio (coreografia-cierre.ts). */
const NUBES = { recorridoCerca: 1.4, recorridoLejos: 0.45, viaje: DESCENSO + 1 } as const;
/** Ventanas de los dos barridos del haz, en el tiempo de la escena del faro. */
const BARRIDO_1 = { desde: 1.3, hasta: 1.78 };
const BARRIDO_2 = { desde: 2.1, hasta: 2.78 };
const FIN_ESCENA = 2.9;
const RESPIRO = 0.35;
/** Alto de la pista: una pantalla + el recorrido (unos 45 lvh por unidad). */
export const ALTO_CIERRE_LVH = 100 + Math.round((DESCENSO + FIN_ESCENA + RESPIRO) * 45);

const HAZ_CIELO = -90;
/** El haz barre solo la mitad de arriba: hacia abajo cruzaría la torre. */
const HAZ_MIN = -172;
const HAZ_MAX = -10;
const VIDRIO_APAGADO = 0.38;
const AIRE_OCULTO = 40;
const ORIGEN = `${FOCO.x} ${FOCO.y}`;
const TITULO_PENUMBRA = "rgb(169, 197, 232)"; // azul-claro
const TITULO_ENCENDIDO = "rgb(255, 255, 255)";
const RESPLANDOR_ON = "0 0 24px rgba(169, 197, 232, 0.5)";
const RESPLANDOR_OFF = "0 0 0px rgba(169, 197, 232, 0)";
const sinRender = { immediateRender: false } as const;

/**
 * El cierre en celular y tablet: «cae la noche sobre el archivo», la escena
 * de escritorio (coreografia-cierre.ts) contada en vertical. La hoja llega
 * metida entre nubes; el scroll es un descenso de cámara —las cercanas suben
 * rápido y se van, las lejanas se disuelven— y el faro sube a su encuentro
 * GIRANDO, adentro de la última, y se enciende al llegar: chispa, cristal,
 * halo. Después el haz lee: nace al cielo, gira y se posa sobre la
 * Biblioteca, y sigue hasta el cierre. Las 13 estrellas —los puntos del
 * hero— se prenden mientras el faro sube y reaccionan al paso de la luz.
 *
 * Sin pin de GSAP: la pista alta (`ALTO_CIERRE_LVH`) y la sección `sticky`
 * hacen ese trabajo. Sin `invalidateOnRefresh`: lo medido se vuelve a medir
 * en `alRefrescar`, adentro de este contexto (ver hero/movil/partes.ts).
 */
export function crearCierreMovil(zona: HTMLElement) {
  const q = gsap.utils.selector(zona);
  const hoja = q<HTMLElement>("section")[0];
  const capaNubes = q<HTMLElement>("[data-cierre-nubes-movil]")[0];
  const nubes = q<HTMLElement>("[data-cierre-nube-movil]");
  const linterna = q<HTMLElement>("[data-cierre-linterna-movil]")[0];
  const bloques = q<HTMLElement>("[data-cierre-bloque]");
  const titulos = q<HTMLElement>("[data-cierre-titulo]");
  const anclas = q<HTMLElement>("#biblioteca, #conversemos");
  const ql = gsap.utils.selector(linterna);
  const pose = ql<SVGGElement>("[data-linterna-pose]")[0];
  const haces = ql<SVGGElement>("[data-linterna-haces]")[0];
  const nucleo = ql<SVGCircleElement>("[data-linterna-nucleo]")[0];
  const halo = ql<SVGCircleElement>("[data-linterna-halo]")[0];
  const vidrio = ql<SVGGElement>("[data-linterna-vidrio]")[0];
  if (!hoja || !capaNubes || !linterna || !pose || !haces || !nucleo || !halo || !vidrio || bloques.length !== 2) {
    return () => {};
  }

  const { giro, girar } = crearGirador(linterna, 360);
  const estrellas = crearEstrellasMovil({ hoja, nucleo, bloques, linterna });
  const altoOculto = () => linterna.offsetHeight + AIRE_OCULTO;

  /** Ángulo en pantalla de la lámpara al centro de `el`, en la mitad de
   *  arriba. Se mide con el faro ya en su lugar (se descuenta lo que suba). */
  const hacia = (el: HTMLElement) => {
    const f = nucleo.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const hundido = Number(gsap.getProperty(linterna, "y"));
    const grados =
      (Math.atan2(r.top + r.height / 2 - (f.top + f.height / 2 - hundido), r.left + r.width / 2 - (f.left + f.width / 2)) * 180) /
      Math.PI;
    return gsap.utils.clamp(HAZ_MIN, HAZ_MAX, grados > 90 ? grados - 360 : grados);
  };

  let alRefrescar = () => {};
  const ctx = gsap.context(() => {
    // ── Estado pre-paint: metidos en las nubes, el faro bajo el piso y
    //    apagado, mensajes y estrellas esperando.
    gsap.set(pose, { attr: { transform: `rotate(0 ${ORIGEN})` } });
    gsap.set(capaNubes, { autoAlpha: 1 });
    nubes.forEach((nb) => gsap.set(nb, { rotation: Number(nb.dataset.nubeGiro), transformOrigin: "50% 50%", willChange: "transform" }));
    gsap.set(linterna, { y: altoOculto });
    gsap.set(vidrio, { opacity: VIDRIO_APAGADO });
    gsap.set([nucleo, halo], { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
    gsap.set(haces, { autoAlpha: 0, rotation: HAZ_CIELO, svgOrigin: ORIGEN });
    gsap.set(bloques, { autoAlpha: 0, y: 18 });
    gsap.set(titulos, { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF });
    gsap.set(estrellas.circulos, { autoAlpha: 0 });
    girar();

    const haz = { beta: HAZ_CIELO };
    const apuntar = () => gsap.set(haces, { rotation: haz.beta, svgOrigin: ORIGEN });
    // La escena del faro va en su propio tiempo, corrida DESCENSO.
    const escena = gsap.timeline({ defaults: { ease: "none" } });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // El disparador es el primer mensaje porque vive adentro de las dos
      // anclas: así irASeccion encuentra la escena y, con
      // data-aterrizaje="fin", llegar por el hash corta al FINAL de la pista.
      // Los bordes son los de la pista, numéricos: el mensaje va pegado.
      scrollTrigger: {
        trigger: bloques[0],
        start: () => zona.getBoundingClientRect().top + window.scrollY,
        end: () => zona.getBoundingClientRect().top + window.scrollY + zona.offsetHeight - window.innerHeight,
        scrub: 0.6,
      },
      onUpdate: () => estrellas.pintar(escena.time() >= BARRIDO_1.desde ? haz.beta : null),
    });

    // ── Las nubes: UN movimiento de cámara; cada una recorre según su
    //    profundidad y se disuelve en su último tramo.
    const altoHoja = () => hoja.clientHeight;
    nubes.forEach((nb, i) => {
      const cerca = Number(nb.dataset.nubeCerca);
      const recorrido = NUBES.recorridoLejos + (NUBES.recorridoCerca - NUBES.recorridoLejos) * cerca;
      tl.fromTo(
        nb,
        { y: 0, xPercent: 0 },
        { y: () => -altoHoja() * recorrido * NUBES.viaje, xPercent: (i % 2 === 0 ? 1 : -1) * (2 + 4 * cerca), duration: NUBES.viaje, ease: "power1.out", ...sinRender },
        0,
      );
      tl.fromTo(nb, { autoAlpha: 1 }, { autoAlpha: 0, duration: NUBES.viaje * 0.25, ...sinRender }, NUBES.viaje * 0.75);
    });
    tl.fromTo(capaNubes, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.05, ...sinRender }, NUBES.viaje);

    // ── El faro sube girando una vuelta y, casi arriba, se enciende.
    escena.fromTo(linterna, { y: altoOculto }, { y: 0, duration: 1.2, ease: "power1.out", ...sinRender }, 0);
    escena.fromTo(giro, { theta: 360 }, { theta: 0, duration: 1.2, ease: "power1.out", onUpdate: girar, ...sinRender }, 0);
    escena.fromTo(estrellas.circulos, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: { each: 0.055, from: "random" }, ...sinRender }, 0.1);
    escena.fromTo(nucleo, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1.3, duration: 0.06, ease: "power2.out", ...sinRender }, 1.0);
    escena.fromTo(nucleo, { scale: 1.3 }, { scale: 1, duration: 0.1, ease: "power1.inOut", ...sinRender }, 1.06);
    escena.fromTo(vidrio, { opacity: VIDRIO_APAGADO }, { opacity: 1, duration: 0.14, ...sinRender }, 1.04);
    escena.fromTo(halo, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out", ...sinRender }, 1.1);

    // ── El haz nace al cielo y lee: primero la Biblioteca, después el cierre.
    escena.fromTo(haces, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ...sinRender }, 1.2);
    escena.fromTo(
      haz,
      { beta: HAZ_CIELO },
      { beta: () => hacia(bloques[0]), duration: BARRIDO_1.hasta - BARRIDO_1.desde, ease: "power2.inOut", onUpdate: apuntar, ...sinRender },
      BARRIDO_1.desde,
    );
    escena.fromTo(bloques[0], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender }, 1.55);
    escena.fromTo(titulos[0], { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF }, { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON, duration: 0.22, ...sinRender }, 1.62);
    escena.fromTo(
      haz,
      { beta: () => hacia(bloques[0]) },
      { beta: () => hacia(bloques[1]), duration: BARRIDO_2.hasta - BARRIDO_2.desde, ease: "power2.inOut", onUpdate: apuntar, ...sinRender },
      BARRIDO_2.desde,
    );
    // La luz se va de la Biblioteca: su título vuelve a la penumbra, leído.
    escena.fromTo(titulos[0], { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON }, { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF, duration: 0.3, ...sinRender }, 2.22);
    escena.fromTo(bloques[1], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender }, 2.55);
    escena.fromTo(titulos[1], { color: TITULO_PENUMBRA, textShadow: RESPLANDOR_OFF }, { color: TITULO_ENCENDIDO, textShadow: RESPLANDOR_ON, duration: 0.22, ...sinRender }, 2.66);
    escena.to({}, { duration: 0.01 }, FIN_ESCENA);

    tl.add(escena, DESCENSO);
    tl.to({}, { duration: RESPIRO });

    // Tras un refresh (rotación, fuentes): rebobinar, volver a medir y
    // volver adonde estaba. Invalidar a mitad de camino deja a los tweens
    // tomando como partida lo que ya habían movido.
    alRefrescar = () => {
      const en = tl.time();
      tl.time(0, true).invalidate();
      estrellas.ubicar();
      if (en > 0) tl.time(en, true);
      apuntar();
      girar();
      estrellas.pintar(escena.time() >= BARRIDO_1.desde ? haz.beta : null);
    };
  }, zona);

  const oir = () => ctx.add(alRefrescar);
  ScrollTrigger.addEventListener("refresh", oir);
  // Las dos anclas aterrizan con la historia ya contada (ver el trigger).
  for (const el of anclas) el.dataset.aterrizaje = "fin";

  return () => {
    ScrollTrigger.removeEventListener("refresh", oir);
    ctx.revert();
    // Lo escrito a mano (barras, óptica, estrellas) el revert no lo conoce.
    giro.theta = 0;
    girar();
    estrellas.restaurar();
    for (const el of anclas) delete el.dataset.aterrizaje;
  };
}
