import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Nunca más de tres lomos a la vista: seis se comerían la pantalla. */
const LOMOS_MAX = 3;
/** Scroll por paso, en lvh: lo que lleva leer un panel. */
const LVH_POR_PASO = 62;
/** Scroll de más al final, con el último panel quieto antes de soltar. */
const LVH_RESPIRO = 40;

/**
 * «CÓMO TRABAJAMOS» EN CELULAR Y TABLET: la PILA, el mismo gesto que las
 * Áreas del Inicio (home/…/lineas-accion/pila-movil.ts) y el mismo que el
 * apilado de escritorio, en vertical. Un panel abierto por vez; el que sigue
 * sube desde abajo y lo tapa, y del tapado queda a la vista el lomo (número
 * y verbo). Los lomos dicen cuántos pasaron; los puntitos de arriba, en cuál
 * se va. Al final la pila se va hacia arriba, como en el Inicio.
 *
 * No se anima ninguna altura: los paneles comparten una celda de grilla
 * (miden lo que el más alto, ver `.is-pila` en globals.css) y el de adelante,
 * opaco, tapa al de atrás. Solo transform y opacity, en una línea atada al
 * scroll de la pista. La clase `is-pila` la pone esto y se va con el revert.
 */
export function crearPilaMirada(root: HTMLElement) {
  const pista = root.querySelector<HTMLElement>("[data-mirada-pista]");
  const escena = root.querySelector<HTMLElement>("[data-mirada-escena]");
  const pila = root.querySelector<HTMLElement>("[data-mirada-pila]");
  const titulo = root.querySelector<HTMLElement>("[data-mirada-titulo]");
  const cartas = gsap.utils.toArray<HTMLElement>("[data-mirada-card]", root);
  const puntos = gsap.utils.toArray<HTMLElement>("[data-punto]", root);
  const lomoDe = cartas[0]?.querySelector<HTMLElement>("[data-mirada-lomo]");
  if (!pista || !escena || !pila || !titulo || !lomoDe || cartas.length < 2) return () => {};

  const total = cartas.length;
  root.classList.add("is-pila");
  root.style.setProperty("--mirada-pista-alto", `${100 + (total - 1) * LVH_POR_PASO + LVH_RESPIRO}lvh`);

  const ctx = gsap.context(() => {
    const lomo = () => lomoDe.offsetHeight;
    // Cuántos lomos entran sin que el panel abierto se corte abajo: depende
    // del alto de la pantalla, y se recalcula en cada refresh.
    const lomos = () => Math.max(1, Math.min(LOMOS_MAX, Math.floor((pila.clientHeight - cartas[0].offsetHeight) / lomo())));
    // Dónde descansa el panel `j` cuando el abierto es el `k`: los últimos
    // tapados hacen escalera; los anteriores, un lomo más arriba y apagados.
    const reposo = (j: number, k: number) => Math.max(-1, j - Math.max(0, k - lomos())) * lomo();

    gsap.set(cartas, { willChange: "transform, opacity" });
    gsap.set(cartas.slice(1), { y: () => escena.clientHeight });

    // La entrada: el título y el primer panel suben mientras la sección llega.
    gsap.fromTo(
      [titulo, cartas[0]],
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: pista, start: "top 80%", end: "top 20%", scrub: 0.6 },
      },
    );

    const tramo = 1 / total;
    const llega = (k: number) => (k - 1) * tramo + tramo * 0.4;
    let activo = -1;
    const marcar = (k: number) => {
      if (k === activo) return;
      activo = k;
      puntos.forEach((p, i) => p.toggleAttribute("data-activo", i === k));
    };
    marcar(0);

    // ScrollTrigger puede actualizar la línea mientras se crea: los puntitos
    // esperan a que exista.
    const creada: { tl?: gsap.core.Timeline } = {};
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut", duration: tramo * 0.6 },
      onUpdate: () => {
        if (!creada.tl) return;
        const p = creada.tl.progress();
        let k = 0;
        while (k + 1 < total && p >= llega(k + 1) + tramo * 0.3) k++;
        marcar(k);
      },
      scrollTrigger: { trigger: pista, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
    });
    creada.tl = tl;

    for (let k = 1; k < total; k++) {
      // Cada tramo arranca con un rato quieto, para leer el panel abierto.
      tl.to(cartas[k], { y: () => reposo(k, k), ease: "power3.out" }, llega(k));
      for (let j = 0; j < k; j++) {
        tl.to(cartas[j], { y: () => reposo(j, k), autoAlpha: () => (reposo(j, k) < 0 ? 0 : 1) }, llega(k));
      }
    }
    // La línea dura 1 entero: si no, el scrub la estira y el último panel no
    // tiene su rato quieto antes de soltar.
    tl.set({}, {}, 1);

    // SALIDA: cuando la escena se suelta, la pila se va hacia arriba con el
    // mismo gesto que en el Inicio (sube, se achica apenas y se desvanece),
    // mientras la banda de aliados viene subiendo.
    gsap.fromTo(
      pila,
      { y: 0, scale: 1, autoAlpha: 1 },
      {
        y: -56,
        scale: 0.97,
        autoAlpha: 0,
        ease: "power2.in",
        scrollTrigger: { trigger: pista, start: "bottom bottom", end: "bottom 45%", scrub: 1 },
      },
    );
  }, root);

  return () => {
    ctx.revert();
    root.classList.remove("is-pila");
    root.style.removeProperty("--mirada-pista-alto");
    puntos.forEach((p) => p.removeAttribute("data-activo"));
  };
}
