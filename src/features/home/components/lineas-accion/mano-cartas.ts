import gsap from "gsap";

/**
 * La mano de cartas: al recorrer el abanico con el mouse, la carta cuyo
 * centro queda más cerca del puntero se saca del mazo y pasa al frente.
 *
 * - Asoma primero por encima de las vecinas y recién en ese punto alto cambia
 *   de capa: el salto de z-index queda escondido dentro del movimiento.
 * - Se endereza (compensa su giro de reposo) y queda apoyada al frente.
 * - Las vecinas le abren lugar, menos cuanto más lejos, y se apagan apenas.
 * - Elegir por cercanía con histéresis, y no por enter/leave de cada carta,
 *   es lo que evita el parpadeo: las cartas se superponen.
 *
 * Todo vive en las capas internas de cada <li> (el <li> lo mueve el reparto
 * con scroll). Cada carta responde apenas aterriza, sin esperar al resto del
 * reparto ni depender de cuántas cartas haya: solo se eligen entre las que ya
 * están en la mesa. Devuelve `revisar` (para cada paso del scroll: si la
 * elegida vuelve a moverse, se suelta) y `limpiar`.
 */

type Opciones = {
  escenario: HTMLElement;
  cartas: HTMLElement[];
  /** Giro de reposo de la carta i en el abanico: la elegida lo compensa. */
  giroReposo: (i: number) => number;
  /** Si la carta i ya aterrizó: mientras sube, el hover pelearía con el scroll. */
  aterrizada: (i: number) => boolean;
};

const ASOMA = -46; // px que sube para asomar sobre las vecinas
const APOYO = -20; // px en los que queda apoyada al frente
const ESCALA = 1.05;
const ABRE = [0, 34, 16, 6]; // px que se corren las vecinas según la distancia
const VELO = 0.05; // opacidad del velo azul sobre las vecinas
const TILT = 2.5; // grados máximos de inclinación con el cursor
const HISTERESIS = 20; // px de ventaja que necesita otra carta para robar el foco
const MARGEN = 24; // px de tolerancia alrededor del abanico

const SELECTORES = {
  mano: "[data-deck-mano]",
  cara: "[data-deck-inner]",
  sombra: "[data-deck-sombra]",
  velo: "[data-deck-velo]",
  luz: "[data-deck-luz]",
  foco: "[data-deck-luz-foco]",
  borde: "[data-deck-borde]",
  focoBorde: "[data-deck-borde-foco]",
} as const;

type Capas = { -readonly [K in keyof typeof SELECTORES]: HTMLElement } & { carta: HTMLElement };

export function crearManoCartas({ escenario, cartas, giroReposo, aterrizada }: Opciones) {
  const capas: Capas[] = [];
  for (const carta of cartas) {
    const c = { carta } as Partial<Capas> & { carta: HTMLElement };
    for (const [nombre, sel] of Object.entries(SELECTORES)) {
      const el = carta.querySelector<HTMLElement>(sel);
      if (!el) return { revisar: () => {}, limpiar: () => {} };
      c[nombre as keyof typeof SELECTORES] = el;
    }
    capas.push(c as Capas);
  }
  const zBase = cartas.map((carta) => carta.style.zIndex);
  const capasMovidas = capas.flatMap((c) => [c.mano, c.cara, c.foco, c.focoBorde]);
  const capasEncendidas = capas.flatMap((c) => [c.sombra, c.velo, c.luz, c.borde]);

  gsap.set(capas.map((c) => c.cara), { transformPerspective: 1000 });
  gsap.set(capasMovidas, { willChange: "transform" });

  const suave = { duration: 0.45, ease: "power3.out" } as const;
  const agil = { duration: 0.22, ease: "power2.out" } as const;
  const seguir = capas.map((c) => ({
    rotX: gsap.quickTo(c.cara, "rotationX", suave),
    rotY: gsap.quickTo(c.cara, "rotationY", suave),
    luz: [gsap.quickTo(c.foco, "x", agil), gsap.quickTo(c.foco, "y", agil)],
    borde: [gsap.quickTo(c.focoBorde, "x", agil), gsap.quickTo(c.focoBorde, "y", agil)],
  }));

  let activa = -1;
  let z = 100;
  const subidas: Array<gsap.core.Timeline | null> = capas.map(() => null);

  const abrirVecinas = (i: number) => {
    capas.forEach((c, j) => {
      const d = i < 0 ? 0 : j - i;
      const paso = ABRE[Math.min(Math.abs(d), ABRE.length - 1)];
      gsap.to(c.mano, { x: Math.sign(d) * paso, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      gsap.to(c.velo, { opacity: d === 0 ? 0 : VELO, duration: 0.4, overwrite: "auto" });
    });
  };

  const subir = (i: number, px: number, py: number) => {
    const c = capas[i];
    subidas[i]?.kill();
    gsap.set([c.foco, c.focoBorde], { x: px, y: py });
    gsap.to([c.sombra, c.luz, c.borde], { opacity: 1, duration: 0.5, overwrite: "auto" });
    subidas[i] = gsap
      .timeline()
      .to(c.mano, {
        y: ASOMA,
        rotation: -giroReposo(i),
        scale: 1.02,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      })
      .call(() => {
        z += 1;
        c.carta.style.zIndex = String(z);
      })
      .to(c.mano, { y: APOYO, scale: ESCALA, duration: 0.42, ease: "power3.out" });
  };

  const bajar = (i: number) => {
    const c = capas[i];
    subidas[i]?.kill();
    subidas[i] = null;
    seguir[i].rotX(0);
    seguir[i].rotY(0);
    gsap.to([c.sombra, c.luz, c.borde], { opacity: 0, duration: 0.35, overwrite: "auto" });
    gsap.to(c.mano, {
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => {
        if (activa !== i) c.carta.style.zIndex = zBase[i];
      },
    });
  };

  const soltar = () => {
    if (activa < 0) return;
    const previa = activa;
    activa = -1;
    bajar(previa);
    capas.forEach((c) => gsap.to(c.mano, { x: 0, duration: 0.55, ease: "power3.out", overwrite: "auto" }));
    gsap.to(capas.map((c) => c.velo), { opacity: 0, duration: 0.4, overwrite: "auto" });
  };

  const revisar = () => {
    if (activa >= 0 && !aterrizada(activa)) soltar();
  };

  const alMover = (e: PointerEvent) => {
    revisar();
    const enMesa = cartas.map((_, i) => i).filter(aterrizada);
    if (enMesa.length === 0) return soltar();
    // Los rects del <li> no incluyen los desplazamientos del hover: los
    // centros quedan quietos mientras las vecinas se abren (sin rebote).
    const rects = cartas.map((carta) => carta.getBoundingClientRect());
    const distancias = rects.map((r, i) =>
      aterrizada(i) ? Math.abs(e.clientX - (r.left + r.width / 2)) : Infinity,
    );
    let cerca = distancias.indexOf(Math.min(...distancias));
    if (activa >= 0 && cerca !== activa && distancias[activa] - distancias[cerca] < HISTERESIS) {
      cerca = activa;
    }
    const r = rects[cerca];
    const dentro =
      e.clientY > r.top - MARGEN &&
      e.clientY < r.bottom &&
      e.clientX > rects[enMesa[0]].left - MARGEN &&
      e.clientX < rects[enMesa[enMesa.length - 1]].right + MARGEN;
    if (!dentro) return soltar();

    const px = e.clientX - r.left;
    const py = e.clientY - r.top - APOYO;
    if (cerca !== activa) {
      if (activa >= 0) bajar(activa);
      activa = cerca;
      subir(cerca, px, py);
      abrirVecinas(cerca);
    }
    seguir[cerca].rotY((px / r.width - 0.5) * TILT * 2);
    seguir[cerca].rotX(-(py / r.height - 0.5) * TILT * 2);
    seguir[cerca].luz.forEach((mover, eje) => mover(eje === 0 ? px : py));
    seguir[cerca].borde.forEach((mover, eje) => mover(eje === 0 ? px : py));
  };

  escenario.addEventListener("pointermove", alMover);
  escenario.addEventListener("pointerleave", soltar);

  const limpiar = () => {
    escenario.removeEventListener("pointermove", alMover);
    escenario.removeEventListener("pointerleave", soltar);
    subidas.forEach((tl) => tl?.kill());
    gsap.killTweensOf([...capasMovidas, ...capasEncendidas]);
    gsap.set([...capasMovidas, ...capasEncendidas], { clearProps: "transform,opacity,willChange" });
    cartas.forEach((carta, i) => (carta.style.zIndex = zBase[i]));
  };

  return { revisar, limpiar };
}
