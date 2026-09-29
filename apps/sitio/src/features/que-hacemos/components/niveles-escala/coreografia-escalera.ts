import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ── Ritmo, en unidades de la línea de tiempo ──────────────────────────── */
/** La frase grande se va y entra la cabecera. */
const FRASE_SALE = 0.9;
/** La cinta arranca a bajar. */
const CINTA = 1.3;
/** Lo que tarda la cinta en llegar de un nivel al siguiente. */
const TRAMO = 1;
/** Con los cinco encendidos, antes de soltar. */
const RESPIRO = 0.9;
const NIVELES = 5;
/** Cuando la cinta toca el nodo k. */
const toca = (k: number) => CINTA + 0.35 + k * TRAMO;
/**
 * El REMATE: con el quinto encendido y su tarjeta adentro, la cinta sigue un
 * último tramo hasta un nodo final, al centro, y a su lado vuelve la frase
 * de la apertura, chica: «Del aula al sistema educativo.» cierra el
 * recorrido micro → macro. Va dentro del respiro que antes no hacía nada
 * (Gastón, 2026-09-29: la cinta terminaba en una cola colgada al borde).
 */
const REMATE = toca(NIVELES - 1) + 0.6;
const TOCA_REMATE = REMATE + 0.5;
const FIN = toca(NIVELES - 1) + 0.6 + RESPIRO;
/** Scroll por unidad, en lvh. */
const LVH_POR_UNIDAD = 48;

/** Alto de la zona: una pantalla de escena más el scroll de la línea (arranca clavada). */
export const ALTO_ESCALERA_LVH = Math.round(100 + FIN * LVH_POR_UNIDAD);

type Punto = { x: number; y: number };

/**
 * LA ESCALERA DE NIVELES EN CELULAR. La cinta baja en zigzag de nodo en
 * nodo (el trazo se revela con strokeDashoffset, como la víbora de
 * escritorio) y su punta verde la encabeza; cuando toca un nodo, el nodo se
 * enciende y la tarjeta del nivel entra desde su lado. El camino se arma
 * midiendo dónde quedaron los nodos, así sigue al layout en cualquier
 * pantalla, y se rearma en cada refresh. Fuera de la cinta, solo transform
 * y opacity.
 */
export function crearEscalera(zona: HTMLElement) {
  const q = <T extends Element>(sel: string) => Array.from(zona.querySelectorAll<T>(sel));
  const escalera = zona.querySelector<HTMLElement>("[data-esc-escalera]");
  const riel = zona.querySelector<SVGPathElement>("[data-esc-riel]");
  const cinta = zona.querySelector<SVGPathElement>("[data-esc-cinta]");
  const punta = zona.querySelector<SVGCircleElement>("[data-esc-punta]");
  const frase = zona.querySelector<HTMLElement>("[data-esc-frase]");
  const cabecera = zona.querySelector<HTMLElement>("[data-esc-cabecera]");
  const nodos = q<HTMLElement>("[data-esc-nodo]");
  const luces = q<HTMLElement>("[data-esc-luz]");
  const niveles = q<HTMLElement>("[data-esc-nivel]");
  const remate = zona.querySelector<HTMLElement>("[data-esc-remate]");
  const remateNodo = zona.querySelector<HTMLElement>("[data-esc-remate-nodo]");
  const remateFrase = zona.querySelector<HTMLElement>("[data-esc-remate-frase]");
  if (!escalera || !riel || !cinta || !punta || !frase || !cabecera || !remate || !remateNodo || !remateFrase || nodos.length !== NIVELES) {
    return () => {};
  }

  // El camino y cuánto mide hasta cada nodo, medidos sobre el layout real.
  const camino = { largo: 1, hasta: [] as number[] };
  const medir = () => {
    // Una tarjeta que no entra en su renglón (pantallas bajas) se achica lo
    // justo, desde el lado del nodo; si no, se encimaban.
    niveles.forEach((nivel, k) => {
      const renglon = nivel.parentElement;
      if (!renglon) return;
      gsap.set(nivel, { scale: 1 });
      const escala = Math.min(1, renglon.clientHeight / nivel.offsetHeight);
      gsap.set(nivel, { scale: escala, transformOrigin: k % 2 === 0 ? "0% 50%" : "100% 50%" });
    });
    const caja = escalera.getBoundingClientRect();
    // Los cinco nodos y, último, el del remate.
    const p: Punto[] = [...nodos, remateNodo].map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - caja.left, y: r.top + r.height / 2 - caja.top };
    });
    // Entra por arriba y termina en el nodo del remate (el último punto): ya
    // no cae hasta el borde de la caja, que quedaba como una cola colgada.
    let d = `M${p[0].x},0 L${p[0].x},${p[0].y}`;
    const tramos = [d];
    for (let k = 0; k + 1 < p.length; k++) {
      const dy = (p[k + 1].y - p[k].y) * 0.6;
      const c = ` C${p[k].x},${p[k].y + dy} ${p[k + 1].x},${p[k + 1].y - dy} ${p[k + 1].x},${p[k + 1].y}`;
      d += c;
      tramos.push(d);
    }
    riel.setAttribute("d", d);
    cinta.setAttribute("d", d);
    camino.largo = cinta.getTotalLength();
    // Largo hasta cada nodo: el del camino parcial que termina en él.
    const tmp = document.createElementNS("http://www.w3.org/2000/svg", "path");
    camino.hasta = tramos.map((t) => {
      tmp.setAttribute("d", t);
      return tmp.getTotalLength();
    });
    gsap.set(cinta, { strokeDasharray: camino.largo });
  };
  medir();

  // Cuánto de la cinta está dibujado a cada tiempo: interpolado entre nodos.
  // Suave dentro de cada tramo: frena al llegar a cada nodo.
  const suave = (p: number) => p * p * (3 - 2 * p);
  const dibujado = (t: number) => {
    if (t <= CINTA) return 0;
    if (t >= TOCA_REMATE) return camino.largo;
    if (t <= toca(0)) return camino.hasta[0] * ((t - CINTA) / (toca(0) - CINTA));
    let k = 0;
    while (k + 1 < NIVELES && t >= toca(k + 1)) k++;
    const desde = camino.hasta[k];
    if (k === NIVELES - 1) {
      // En el quinto la cinta espera a que entre su tarjeta y recién
      // después sigue hasta el remate.
      if (t <= REMATE) return desde;
      return desde + (camino.largo - desde) * suave((t - REMATE) / (TOCA_REMATE - REMATE));
    }
    const hacia = camino.hasta[k + 1];
    return desde + (hacia - desde) * suave((t - toca(k)) / (toca(k + 1) - toca(k)));
  };

  const ctx = gsap.context(() => {
    gsap.set([...nodos, remateNodo], { scale: 0.5, transformOrigin: "50% 50%" });
    const creada: { tl?: gsap.core.Timeline } = {};
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onUpdate: () => {
        if (!creada.tl) return;
        const largo = dibujado(creada.tl.time());
        cinta.style.strokeDashoffset = String(camino.largo - largo);
        const pt = cinta.getPointAtLength(Math.max(0.01, largo));
        punta.setAttribute("cx", String(pt.x));
        punta.setAttribute("cy", String(pt.y));
        punta.style.opacity = largo > 0 && largo < camino.largo - 1 ? "1" : "0";
      },
      scrollTrigger: {
        trigger: zona,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: medir,
      },
    });
    creada.tl = tl;

    tl.to(frase, { autoAlpha: 0, y: -36, scale: 0.96, duration: 0.45, ease: "power2.in" }, FRASE_SALE)
      .fromTo(cabecera, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45 }, FRASE_SALE + 0.25)
      // El riel (el camino todavía sin dibujar) aparece con la cabecera: detrás
      // de la frase grande distraía.
      .fromTo([riel, ...nodos], { opacity: 0 }, { opacity: 1, duration: 0.45 }, FRASE_SALE + 0.25);
    niveles.forEach((nivel, k) => {
      const lado = k % 2 === 0 ? -24 : 24;
      tl.to(nodos[k], { scale: 1, duration: 0.3 }, toca(k))
        .to(luces[k], { opacity: 1, duration: 0.3 }, toca(k))
        .fromTo(nivel, { autoAlpha: 0, x: lado }, { autoAlpha: 1, x: 0, duration: 0.5 }, toca(k));
    });
    // El remate: la cinta toca el nodo final y la frase vuelve, chica. El
    // contenedor solo se funde: si se trasladara, el nodo (contra el que se
    // mide el camino) cambiaría de lugar según cuándo mida `medir`.
    tl.to(remateNodo, { scale: 1, duration: 0.3 }, TOCA_REMATE)
      .fromTo(remate, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, TOCA_REMATE - 0.05)
      .fromTo(remateFrase, { y: 10 }, { y: 0, duration: 0.4 }, TOCA_REMATE - 0.05);
    tl.set({}, {}, FIN);
    cinta.style.strokeDashoffset = String(camino.largo);
  }, zona);

  return () => {
    ctx.revert();
    cinta.style.removeProperty("stroke-dashoffset");
  };
}
