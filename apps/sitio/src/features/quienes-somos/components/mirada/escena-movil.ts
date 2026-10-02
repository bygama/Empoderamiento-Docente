import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BARRA,
  BARRA_MARGEN,
  BARRA_Y_REM,
  CONSTELACION,
  INICIO_CIERRE,
  LARGO_RADIO,
  PRINCIPIOS,
  RAMAS_MOVIL,
  T_TOTAL,
  inicioDe,
} from "./geometria-movil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * «Nuestra mirada» bajo `lg`: la ESCENA FIJA. La cámara de escritorio no
 * entra en una pantalla vertical, y apilada era mucha información junta. Acá
 * cada cosa tiene su momento, en el mismo lugar:
 *
 *  1. El título, solo. Al avanzar se retira y de él nacen los tres nodos, que
 *     suben a formar la barra.
 *  2. Un principio por vez: la frase, después la afirmación, después las
 *     fichas. El trazo de la barra se llena mientras se lee y, al terminar, el
 *     nodo que sigue cruza la barra y toma el lugar del que se leyó.
 *  3. El cierre: los nodos bajan a la constelación, la síntesis aparece en el
 *     medio y de cada nodo brotan ramas (la red que anuncia al equipo).
 *
 * Todo va con el scroll salvo las fichas, que entran POR TIEMPO cuando el
 * scroll llega a su tramo: atadas al scrub quedaban a medio entrar en cada
 * parada (lo que ED marcó en escritorio: «se te pasa todo y tenés que
 * volver»). Solo transform y opacity.
 */
export function crearEscenaMovil(root: HTMLElement, zona: HTMLElement) {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);
  const mapa = q("[data-mapa-movil]");
  const centro = q("[data-centro]");
  const sintesis = q("[data-sintesis]");
  const riel = q("[data-mapa-riel]");
  const trazo = q("[data-mapa-trazo]");
  const capitulos = qa("[data-capitulo]");
  const nodos = qa("[data-mapa-nodo]");
  if (!mapa || !centro || !sintesis || !riel || !trazo) return () => {};
  if (capitulos.length !== PRINCIPIOS || nodos.length !== PRINCIPIOS) return () => {};

  const ctx = gsap.context(() => {
    const rotulos = qa("[data-mapa-rotulo]");
    const halos = qa("[data-mapa-halo]");
    const radios = qa("[data-mapa-radio]");
    const ramas = qa("[data-mapa-rama]");
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const W = () => mapa.clientWidth;
    const H = () => mapa.clientHeight;
    const barraX = (f: number) => BARRA_MARGEN + f * (W() - 2 * BARRA_MARGEN);
    const barraY = () => BARRA_Y_REM * rem;
    const fin = (i: number) => ({ x: CONSTELACION[i].x * W(), y: CONSTELACION[i].y * H() });

    // ── Capas: todo se superpone en la pantalla fija ──────────────────────
    const pantalla = { position: "absolute", top: 0, left: 0, right: 0, height: "100svh", paddingTop: 0, paddingBottom: 0 };
    gsap.set([centro, sintesis], pantalla);
    gsap.set(capitulos, { display: "block", position: "absolute", left: 0, right: 0, top: `${BARRA_Y_REM + 4.5}rem`, autoAlpha: 0 });
    gsap.set(qa("[data-detalle]"), { paddingTop: 0, paddingBottom: 0 });
    gsap.set(qa("[data-fichas]"), { marginTop: "1.5rem", paddingBottom: 0 });
    gsap.set(q("[data-sintesis-frase]"), { autoAlpha: 0, y: 22 });
    gsap.set(qa("[data-puente]"), { autoAlpha: 0, y: 14 });
    gsap.set([...rotulos, ...halos], { autoAlpha: 0 });
    gsap.set([riel, trazo, ...radios, ...ramas], { scaleX: 0 });
    gsap.set(radios, { opacity: 0.5 });
    gsap.set(qa("[data-mapa-brote]"), { scale: 0 });
    gsap.set(qa("[data-afirma-underline]"), { scaleX: 0, transformOrigin: "0% 50%" });

    // Lo que depende del tamaño de la pantalla y no anima el timeline.
    const ubicar = () => {
      gsap.set([riel, trazo], { x: barraX(0), y: barraY(), width: W() - 2 * BARRA_MARGEN });
      radios.forEach((r, i) => {
        const p = fin(i);
        const dx = W() / 2 - p.x;
        const dy = H() / 2 - p.y;
        gsap.set(r, { x: p.x, y: p.y, width: Math.hypot(dx, dy) * LARGO_RADIO, rotation: (Math.atan2(dy, dx) * 180) / Math.PI });
      });
      ramas.forEach((r, k) => {
        const p = fin(RAMAS_MOVIL[k].nodo);
        gsap.set(r, { x: p.x, y: p.y, rotation: RAMAS_MOVIL[k].angulo });
      });
    };
    ubicar();

    // ── Las fichas: suben en cascada, por tiempo ──────────────────────────
    const cascadas = capitulos.map((cap) =>
      gsap
        .timeline({ paused: true })
        .fromTo(
          cap.querySelectorAll("[data-ficha]"),
          { autoAlpha: 0, y: 46, scale: 0.94, rotation: (i: number) => (i % 2 ? 1.5 : -1.5) },
          { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.5)", stagger: 0.07 },
        ),
    );
    const arriba = cascadas.map(() => false);
    const moverFichas = (t: number) => {
      cascadas.forEach((cascada, k) => {
        const dentro = t >= inicioDe(k) + 0.5 && t < inicioDe(k) + 1.2;
        if (dentro === arriba[k]) return;
        arriba[k] = dentro;
        // Se van más rápido de lo que llegan: lo que sigue no espera.
        if (dentro) cascada.timeScale(1).play();
        else cascada.timeScale(2.6).reverse();
      });
    };

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onUpdate: () => moverFichas(tl.time()),
      scrollTrigger: { trigger: zona, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true, onRefresh: ubicar },
    });

    // 1 · El título se retira y de él nacen los nodos, que suben a la barra.
    tl.to(qa("[data-centro-bit]"), { autoAlpha: 0, y: -36, scale: 0.9, duration: 0.35, stagger: 0.05, ease: "power2.in" }, 0.45);
    tl.fromTo(
      nodos,
      { x: () => W() / 2, y: () => H() / 2, scale: 0, autoAlpha: 0 },
      { x: (i: number) => barraX(BARRA[0][i]), y: () => barraY(), scale: (i: number) => (i === 0 ? 1 : 0.7), autoAlpha: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" },
      0.55,
    );
    tl.to(riel, { scaleX: 1, duration: 0.35 }, 0.7);
    tl.to([rotulos[0], halos[0]], { autoAlpha: 1, duration: 0.18 }, 0.92);

    // 2 · Un principio por vez.
    capitulos.forEach((cap, k) => {
      const S = inicioDe(k);
      const [barra, frase, afirmacion] = gsap.utils.toArray<HTMLElement>("[data-detalle-inner] > *", cap);
      const piezas = [barra, frase, afirmacion];
      gsap.set(piezas, { autoAlpha: 0, y: 24 });
      tl.set(cap, { autoAlpha: 1 }, S);
      tl.to([barra, frase], { autoAlpha: 1, y: 0, duration: 0.24, ease: "power3.out" }, S + 0.05);
      tl.to(afirmacion, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power3.out" }, S + 0.3);
      tl.to(cap.querySelectorAll("[data-afirma-underline]"), { scaleX: 1, duration: 0.2, ease: "power2.out" }, S + 0.48);
      // El trazo se llena hacia el nodo que sigue mientras se lee.
      tl.to(trazo, { scaleX: k < PRINCIPIOS - 1 ? BARRA[k][k + 1] : 1, duration: 1.14, ease: "none" }, S + 0.1);
      tl.to(piezas, { autoAlpha: 0, y: -18, duration: 0.14, ease: "power2.in" }, S + 1.24);
      tl.set(cap, { autoAlpha: 0 }, S + 1.42);
      tl.to([rotulos[k], halos[k]], { autoAlpha: 0, duration: 0.1 }, S + 1.24);
      if (k === PRINCIPIOS - 1) return;
      // El que sigue cruza la barra y toma el lugar del que se leyó.
      nodos.forEach((n, j) => {
        tl.to(n, { x: () => barraX(BARRA[k + 1][j]), scale: j === k + 1 ? 1 : 0.7, duration: 0.22 }, S + 1.28);
      });
      tl.to(trazo, { scaleX: BARRA[k + 1][k + 1], duration: 0.22 }, S + 1.28);
      tl.to([rotulos[k + 1], halos[k + 1]], { autoAlpha: 1, duration: 0.14 }, S + 1.4);
    });

    // 3 · El cierre: la constelación alrededor de la síntesis.
    const F = INICIO_CIERRE;
    tl.to([riel, trazo], { autoAlpha: 0, duration: 0.2 }, F - 0.12);
    tl.to(nodos, { x: (i: number) => fin(i).x, y: (i: number) => fin(i).y, scale: 1.5, duration: 0.6, stagger: 0.04 }, F);
    tl.to(radios, { scaleX: 1, duration: 0.3, stagger: 0.06, ease: "power2.out" }, F + 0.55);
    tl.to(q("[data-sintesis-frase]"), { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, F + 0.6);
    tl.to(ramas, { scaleX: 1, duration: 0.25, stagger: 0.03, ease: "power2.out" }, F + 0.95);
    tl.to(qa("[data-mapa-brote]"), { scale: 1, duration: 0.15, stagger: 0.03, ease: "back.out(3)" }, F + 1.1);
    tl.to(qa("[data-puente]"), { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, F + 1.15);
    tl.set({}, {}, T_TOTAL);
  }, root);

  return () => ctx.revert();
}
