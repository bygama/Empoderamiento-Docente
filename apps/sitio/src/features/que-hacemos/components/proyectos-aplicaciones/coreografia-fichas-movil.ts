import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ESTRUCTURA } from "./fichas";
import { ROT } from "./proyectos-escena";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Ritmo, en unidades de la línea de tiempo ──────────────────────────── */
/** El título grande entra, se queda y se va. */
const INTRO = { entra: 0, sale: 1.1 } as const;
/** La cabecera (capítulo + contador) y la primera ficha. */
const PRIMERA = 1.5;
/** Entre ficha y ficha: lo que lleva leer una. */
const PASO = 1;
/** Lo que tarda una ficha en posarse. */
const SUBIDA = 0.7;
/** El cambio de capítulo: la pila se va y entra el título nuevo. */
const CAMBIO = 0.9;
/** Después de la última, antes de soltar la escena. */
const RESPIRO = 0.8;
/** Scroll por unidad, en lvh. */
const LVH_POR_UNIDAD = 46;
/** La línea arranca con la escena subiendo: cuando su borde pasa el 60% de la pantalla. */
const ARRANQUE = 0.6;

/** El capítulo de cada ficha, en orden: es estructura (fichas.ts), no copy. */
const FICHAS = ESTRUCTURA.flatMap((cap, c) => cap.fichas.map(() => ({ cap: c })));

/** Cuándo cae cada ficha, y cuándo cambia cada capítulo (antes de su primera). */
function tiempos() {
  const caen: number[] = [];
  const cambios: number[] = [];
  let t = PRIMERA;
  FICHAS.forEach((f, i) => {
    if (i > 0 && f.cap !== FICHAS[i - 1].cap) {
      cambios.push(t);
      t += CAMBIO;
    }
    caen.push(t);
    t += PASO;
  });
  return { caen, cambios, fin: t - PASO + SUBIDA + RESPIRO };
}
const T = tiempos();

/**
 * Alto de la zona en lvh. La línea corre desde que la zona asoma al 60% de
 * la pantalla hasta que su pie llega al pie: (alto − 100) + 60 = el scroll
 * de la línea.
 */
export const ALTO_MOVIL_LVH = Math.round(T.fin * LVH_POR_UNIDAD + 100 - ARRANQUE * 100);

/**
 * LA PILA DE FICHAS EN CELULAR. Cada ficha sube desde abajo, se endereza y
 * se posa con su inclinación (la misma de escritorio, ROT); la de abajo
 * retrocede un escalón (más chica y más arriba), la de más abajo otro, y la
 * cuarta se apaga. Al cambiar de capítulo la pila entera se va por arriba,
 * el título del capítulo se funde al nuevo y el contador sigue. Solo
 * transform y opacity. Una ficha que no entra debajo de la cabecera se
 * achica sola, lo justo (las pantallas de menos de 620px de alto no llegan
 * acá: ahí van las fichas en columna, ver ProyectosAplicaciones).
 */
export function crearFichasMovil(zona: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => Array.from(zona.querySelectorAll<T>(sel));
  const uno = (sel: string) => zona.querySelector<HTMLElement>(sel);
  const intro = uno("[data-pm-intro]");
  const cabecera = uno("[data-pm-cabecera]");
  const contador = uno("[data-pm-contador]");
  const pila = uno("[data-pm-pila]");
  const caps = q("[data-pm-cap]");
  const fichas = q("[data-ficha]");
  if (!intro || !cabecera || !contador || !pila || fichas.length !== FICHAS.length) return () => {};

  // Cada ficha que no entra se achica lo justo, por separado: con una
  // escala pareja, la más alta (tres banderas) achicaba a todas. Se escala
  // la tarjeta de adentro, porque el artículo ya se escala al retroceder.
  // pila.clientHeight incluye los 32px de arriba, para las pestañas.
  const encajar = () => {
    const lugar = pila.clientHeight - 32;
    for (const f of fichas) {
      const tarjeta = f.firstElementChild as HTMLElement | null;
      if (!tarjeta) continue;
      gsap.set(tarjeta, { scale: Math.min(1, lugar / tarjeta.offsetHeight), transformOrigin: "50% 0%" });
    }
  };

  const ctx = gsap.context(() => {
    encajar();
    const abajo = () => window.innerHeight * 0.95;
    // Se achican desde arriba: las de atrás asoman como pestañas sobre la
    // de adelante (desde el centro asomaban 10px).
    gsap.set(fichas, { autoAlpha: 1, transformOrigin: "50% 0%" });

    let n = -1;
    // ScrollTrigger puede actualizar la línea mientras se crea: el contador
    // espera a que exista.
    const creada: { tl?: gsap.core.Timeline } = {};
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onUpdate: () => {
        if (!creada.tl) return;
        const ahora = creada.tl.time();
        let k = 0;
        while (k + 1 < T.caen.length && ahora >= T.caen[k + 1]) k++;
        if (k !== n) {
          n = k;
          contador.textContent = `${String(k + 1).padStart(2, "0")} / ${String(FICHAS.length).padStart(2, "0")}`;
        }
      },
      scrollTrigger: {
        trigger: zona,
        start: `top ${ARRANQUE * 100}%`,
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: encajar,
      },
    });

    creada.tl = tl;

    tl.fromTo(intro, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, INTRO.entra)
      .to(intro, { autoAlpha: 0, y: -40, duration: 0.4, ease: "power2.in" }, INTRO.sale)
      .fromTo(cabecera, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, PRIMERA - 0.3)
      .fromTo(caps[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, PRIMERA - 0.3);

    FICHAS.forEach((f, i) => {
      const t = T.caen[i];
      tl.fromTo(fichas[i], { y: abajo, rotation: 7 }, { y: 0, rotation: ROT[i] ?? 0, duration: SUBIDA, ease: "power3.out" }, t);
      // Las de abajo retroceden, solo las del mismo capítulo.
      for (let d = 1; d <= 3 && i - d >= 0 && FICHAS[i - d].cap === f.cap; d++) {
        const atras = d < 3 ? { y: -15 * d, scale: 1 - 0.05 * d, autoAlpha: 1 } : { autoAlpha: 0 };
        tl.to(fichas[i - d], { ...atras, duration: SUBIDA }, t);
      }
    });

    // Cambio de capítulo: la pila anterior se va por arriba y entra el título.
    T.cambios.forEach((t, j) => {
      const capAnterior = FICHAS[T.caen.findIndex((c) => c > t) - 1]?.cap ?? j;
      const idas = fichas.filter((_, i) => FICHAS[i].cap === capAnterior);
      // Se van por arriba, pero apagándose antes de llegar al título: si no,
      // pasaban por encima del capítulo nuevo.
      tl.to(idas, { y: () => -window.innerHeight * 1.1, rotation: -5, duration: CAMBIO, ease: "power2.in", stagger: 0.04 }, t)
        .to(idas, { autoAlpha: 0, duration: 0.35, ease: "power1.in", stagger: 0.04 }, t + 0.1)
        .to(caps[capAnterior], { autoAlpha: 0, y: -10, duration: 0.35, ease: "power2.in" }, t)
        .fromTo(caps[capAnterior + 1], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, t + 0.4);
    });
    tl.set({}, {}, T.fin);
  }, zona);

  return () => ctx.revert();
}
