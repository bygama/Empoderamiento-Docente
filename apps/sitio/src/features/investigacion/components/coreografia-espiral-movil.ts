import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BISAGRA, CENTRO, ESTACIONES, LARGO_ESPIRAL, LONGITUD_NODO, NODOS, VIEWBOX_ESPIRAL, numero } from "./espiral";
import { crearRecorrido } from "./recorrido-espiral";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Las láminas, en orden: título, 01–04, la bisagra, 05–08 y el remate. */
const LAMINAS = ESTACIONES + 3;
const RELEVOS = LAMINAS - 1;
/** La lámina de la bisagra («Implementar no es terminar»). */
const LAMINA_BISAGRA = BISAGRA + 1;
const LVH_POR_RELEVO = 30;
const LVH_RESPIRO = 20;
/** Alto de la pista: una pantalla + un tramo por relevo + respiro. */
export const ALTO_ESPIRAL_MOVIL_LVH = 100 + RELEVOS * LVH_POR_RELEVO + LVH_RESPIRO;
/** Dónde cae la bisagra en la pista: ahí aterriza `#evidencia`. */
export const LVH_HASTA_LA_BISAGRA = LAMINA_BISAGRA * LVH_POR_RELEVO;
/** Unidades de timeline tras el último relevo (el respiro, en la misma escala). */
const COLA = LVH_RESPIRO / LVH_POR_RELEVO;
/** Un nodo por visitar, apenas insinuado. */
const TENUE = 0.3;
/** Desde qué altura caen los nodos en la entrada (unidades del viewBox). */
const CAIDA = 190;

/** Lo que cada plano tiene que mostrar, en unidades del viewBox: la vuelta
 *  interior con sus rótulos, y la figura entera con el lazo. */
const PLANO_INTERIOR = (() => {
  const interior = NODOS.slice(0, BISAGRA);
  const xs = interior.map(([x]) => x);
  const ys = interior.map(([, y]) => y);
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    ancho: Math.max(...xs) - Math.min(...xs) + 76,
    alto: Math.max(...ys) - Math.min(...ys) + 76,
  };
})();
// La 08 queda bien a la izquierda y su rótulo más todavía: el plano se
// corre hacia ella para que entre.
const PLANO_GENERAL = { cx: CENTRO.x - 9, cy: CENTRO.y + 18, ancho: 426, alto: 348 } as const;

/** Qué estación nombra el contador en cada lámina. */
function estacionDe(lamina: number) {
  if (lamina <= BISAGRA) return Math.max(1, lamina);
  if (lamina === LAMINA_BISAGRA) return BISAGRA;
  return Math.min(ESTACIONES, lamina - 1);
}

/**
 * El ciclo bajo `lg`: una estación por vez (EspiralMovil.tsx). El scroll de
 * la pista mueve una sola línea de tiempo: en cada tramo el personaje avanza
 * una estación con el trazo detrás y la lámina de texto se releva; en la
 * bisagra la cámara se aleja del primer plano al general y aparece la segunda
 * vuelta, y al final el lazo verde lo devuelve al primer nodo. El personaje y
 * la cámara salen del TIEMPO de la línea (recorrido-espiral.ts), no de
 * tweens: con scrub es lo único determinista en las dos direcciones.
 */
export function crearEspiralMovil(zona: HTMLElement) {
  const q = gsap.utils.selector(zona);
  const pista = q<HTMLElement>("[data-espiral-pista]")[0];
  const svg = q<SVGSVGElement>("[data-espiral-svg]")[0];
  const camara = q<SVGGElement>("[data-espiral-camara]")[0];
  const espiral = q<SVGPathElement>("[data-espiral-path]")[0];
  const lazo = q<SVGPathElement>("[data-espiral-lazo]")[0];
  const personaje = q<SVGGElement>("[data-espiral-personaje]")[0];
  const contador = q<HTMLElement>("[data-espiral-contador]")[0];
  const nodos = q<SVGCircleElement>("[data-espiral-nodo]");
  const rotulos = q<SVGTextElement>("[data-espiral-rotulo]");
  const laminas = q<HTMLElement>("[data-espiral-lamina]");
  if (!pista || !svg || !camara || !espiral || !lazo || !personaje || laminas.length !== LAMINAS) return () => {};

  const recorrido = crearRecorrido(espiral, lazo, personaje);
  const { tramos, largoLazo } = recorrido;
  const suave = gsap.parseEase("power2.inOut");
  const sinRender = { immediateRender: false } as const;

  /** El transform que muestra un plano entero en la caja del SVG (que dibuja
   *  el viewBox con `meet`, centrado): se mide, porque la caja cambia con la
   *  pantalla. */
  const encuadre = (plano: { cx: number; cy: number; ancho: number; alto: number }) => {
    const caja = svg.getBoundingClientRect();
    const base = Math.min(caja.width / VIEWBOX_ESPIRAL.w, caja.height / VIEWBOX_ESPIRAL.h) || 1;
    const s = Math.min(caja.width / plano.ancho, caja.height / plano.alto) / base;
    return { x: VIEWBOX_ESPIRAL.w / 2 - s * plano.cx, y: VIEWBOX_ESPIRAL.h / 2 - s * plano.cy, s };
  };
  let planos = { interior: encuadre(PLANO_INTERIOR), general: encuadre(PLANO_GENERAL) };
  /** Cuándo viaja la cámara: durante el relevo que trae la bisagra. */
  const viaje = { t0: BISAGRA + 0.05, t1: BISAGRA + 0.75 };
  const encuadrar = (time: number) => {
    const u = suave(Math.min(1, Math.max(0, (time - viaje.t0) / (viaje.t1 - viaje.t0))));
    const { interior: a, general: b } = planos;
    const s = a.s + (b.s - a.s) * u;
    camara.setAttribute("transform", `translate(${a.x + (b.x - a.x) * u} ${a.y + (b.y - a.y) * u}) scale(${s})`);
  };

  let observador: IntersectionObserver | undefined;
  const ctx = gsap.context(() => {
    // ── Estado pre-paint: solo la primera lámina, trazo y lazo sin dibujar,
    //    la vuelta interior insinuada y la de afuera todavía sin aparecer.
    gsap.set(laminas.slice(1), { autoAlpha: 0 });
    gsap.set(espiral, { strokeDasharray: LARGO_ESPIRAL, strokeDashoffset: LARGO_ESPIRAL });
    gsap.set(lazo, { strokeDasharray: largoLazo, strokeDashoffset: largoLazo, autoAlpha: 0 });
    nodos.forEach((n, k) => {
      const tono = k === 0 ? 1 : k < BISAGRA ? TENUE : 0;
      gsap.set([n, rotulos[k]], { autoAlpha: tono });
    });

    // ── La entrada, antes de que el scroll mueva nada: cuando la hoja llega,
    //    el personaje y los nodos de la primera vuelta CAEN desde arriba y se
    //    asientan en su lugar, como la bandada de escritorio; después entran
    //    sus rótulos y el título. Por tiempo y una sola vez, no atada al
    //    scroll: es el gesto que abre la hoja. Lo que cae son los círculos
    //    del personaje, no su grupo (a ese lo ubica el recorrido), y del
    //    título su texto, no la lámina (a esa la releva el scroll).
    const caen = [...personaje.querySelectorAll("circle"), ...nodos.slice(1, BISAGRA)];
    const frase = laminas[0].firstElementChild;
    // El punto de partida va escrito a mano: en un timeline en pausa, los
    // `from` de los tweens que no arrancan en cero no se aplican solos.
    gsap.set(caen, { y: -CAIDA });
    gsap.set([personaje, frase, ...nodos.slice(0, BISAGRA), ...rotulos.slice(0, BISAGRA)], { autoAlpha: 0 });
    const entrada = gsap.timeline({ paused: true, defaults: { ease: "back.out(1.5)" } });
    // El halo del personaje lleva su propia opacidad: la del conjunto va en el grupo.
    entrada.fromTo(caen.slice(0, 2), { y: -CAIDA }, { y: 0, duration: 0.7 }, 0);
    entrada.fromTo(personaje, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none" }, 0);
    entrada.fromTo(nodos[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, 0.45);
    entrada.fromTo(
      caen.slice(2),
      { y: -CAIDA, autoAlpha: 0 },
      { y: 0, autoAlpha: TENUE, duration: 0.7, stagger: 0.12 },
      0.18,
    );
    entrada.fromTo(rotulos[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, 0.6);
    entrada.fromTo(
      rotulos.slice(1, BISAGRA),
      { autoAlpha: 0 },
      { autoAlpha: TENUE, duration: 0.3, ease: "none", stagger: 0.12 },
      0.75,
    );
    entrada.fromTo(frase, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.5);
    // La suelta un IntersectionObserver y no un ScrollTrigger: las posiciones
    // de ScrollTrigger se miden al crearlo y arriba hay escenas que cambian
    // de alto después. Dos cuadros de espera: con el `lagSmoothing(0)` de
    // Lenis, una línea que arranca con el reloj de GSAP dormido salta al final.
    observador = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        observador?.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => entrada.play()));
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    observador.observe(pista);

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: pista, start: "top top", end: "bottom bottom", scrub: 0.6 },
      onUpdate: () => {
        const time = tl.time();
        recorrido.enTiempo(time);
        encuadrar(time);
        const texto = numero(estacionDe(Math.min(RELEVOS, Math.max(0, Math.floor(time + 0.6)))) - 1);
        if (contador && contador.textContent !== texto) contador.textContent = texto;
      },
    });

    /** El personaje va del nodo `a` al `b` (o por el lazo), con el trazo detrás. */
    const camina = (a: number, b: number, t0: number) => {
      const l0 = LONGITUD_NODO[a];
      const l1 = LONGITUD_NODO[b];
      tramos.push({ t0: t0 + 0.05, t1: t0 + 0.6, l0, l1, ease: suave });
      tl.fromTo(
        espiral,
        { strokeDashoffset: LARGO_ESPIRAL - l0 },
        { strokeDashoffset: LARGO_ESPIRAL - l1, duration: 0.55, ease: "power2.inOut", ...sinRender },
        t0 + 0.05,
      );
      tl.fromTo([nodos[b], rotulos[b]], { autoAlpha: TENUE }, { autoAlpha: 1, duration: 0.15, ...sinRender }, t0 + 0.5);
    };

    for (let i = 1; i < LAMINAS; i++) {
      const t0 = i - 1;
      // El relevo: la lámina anterior sube y se va, la nueva entra desde abajo.
      tl.fromTo(laminas[i - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: 0.22, ease: "power1.in", ...sinRender }, t0 + 0.08);
      tl.fromTo(laminas[i], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", ...sinRender }, t0 + 0.34);

      if (i === LAMINA_BISAGRA) {
        // La cámara se aleja (encuadrar) y la segunda vuelta se insinúa.
        for (let k = BISAGRA; k < ESTACIONES; k++) {
          tl.fromTo([nodos[k], rotulos[k]], { autoAlpha: 0 }, { autoAlpha: TENUE, duration: 0.3, ...sinRender }, t0 + 0.35 + (k - BISAGRA) * 0.06);
        }
      } else if (i === LAMINAS - 1) {
        // El lazo: vuelve al primer nodo, que late.
        tramos.push({ t0: t0 + 0.05, t1: t0 + 0.65, l0: LARGO_ESPIRAL, l1: LARGO_ESPIRAL + largoLazo, ease: suave });
        tl.fromTo(lazo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ...sinRender }, t0 + 0.05);
        tl.fromTo(lazo, { strokeDashoffset: largoLazo }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", ...sinRender }, t0 + 0.05);
      } else if (i > 1) {
        const destino = estacionDe(i) - 1;
        camina(destino - 1, destino, t0);
      }
    }
    tl.to({}, { duration: 0.01 }, RELEVOS + COLA);

    recorrido.enTiempo(0);
    encuadrar(0);
  }, zona);

  // La caja de la figura cambia con la pantalla: se vuelven a medir los planos.
  const remedir = () => {
    planos = { interior: encuadre(PLANO_INTERIOR), general: encuadre(PLANO_GENERAL) };
  };
  ScrollTrigger.addEventListener("refresh", remedir);

  return () => {
    ScrollTrigger.removeEventListener("refresh", remedir);
    observador?.disconnect();
    ctx.revert();
    recorrido.restaurar();
    camara.removeAttribute("transform");
    if (contador) contador.textContent = numero(0);
  };
}
