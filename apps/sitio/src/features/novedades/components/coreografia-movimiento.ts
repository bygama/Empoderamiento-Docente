import gsap from "gsap";

// La coreografía de «ED en movimiento» (EdEnMovimiento.tsx): cada momento sale
// del punto de fuga, se acerca por su lado y pasa de largo, con el scroll
// como timeline; las frases aparecen al centro de a una. Devuelve su limpieza,
// y la llama el mismo efecto de siempre (AI_GUIDELINES §2).

// Lane de cada momento: lado (-1 izq / +1 der) y altura final (fracción del
// alto). Se recorren en orden, alternando lados.
const LANES = [
  { side: -1, y: -0.16 },
  { side: 1, y: 0.08 },
  { side: -1, y: 0.2 },
  { side: 1, y: -0.12 },
  { side: -1, y: 0.04 },
  { side: 1, y: 0.16 },
];

const STEP = 1.7; // separación entre momentos en el timeline

type Escena = { zone: HTMLElement; stage: HTMLElement; contador: () => HTMLElement | null; total: number };

export function crearMovimiento({ zone, stage, contador, total }: Escena): () => void {
  const ctx = gsap.context(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-mov-card]");
    // El hint viene con la coreografía (solo con `live`) y se va con ella.
    gsap.set(cards, { willChange: "transform" });
    const phrases = gsap.utils.toArray<HTMLElement>("[data-mov-phrase]");
    const luz = stage.querySelector<HTMLElement>("[data-mov-luz]");
    const W = window.innerWidth;
    const H = window.innerHeight;
    const vpY = -H * 0.06; // punto de fuga: la luz del horizonte, algo arriba del centro

    // Estado inicial: todos diminutos en el punto de fuga.
    cards.forEach((card) => {
      gsap.set(card, { xPercent: -50, yPercent: -50, x: 0, y: vpY, scale: 0.05, autoAlpha: 0, transformOrigin: "50% 50%" });
    });
    gsap.set(phrases, { autoAlpha: 0, y: 16 });

    // El faro se enciende MIENTRAS la sección entra en cuadro: la luz nace
    // chica y apagada y llega a plena justo cuando el navy terminó de ocupar
    // la pantalla. Ventana exacta: de "top bottom" a "top top".
    if (luz) {
      gsap.fromTo(
        luz,
        { autoAlpha: 0, scale: 0.45 },
        { autoAlpha: 1, scale: 1, ease: "none", scrollTrigger: { trigger: zone, start: "top bottom", end: "top top", scrub: 0.5 } },
      );
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        // Contador de progreso: qué momento está en escena. Se escribe
        // directo al DOM (sin estado React) para no re-renderizar por tick.
        onUpdate: (self) => {
          const el = contador();
          if (!el || !self.animation) return;
          const i = Math.min(total - 1, Math.max(0, Math.floor(self.animation.time() / STEP)));
          const label = String(i + 1).padStart(2, "0");
          if (el.textContent !== label) el.textContent = label;
        },
      },
    });

    cards.forEach((card, i) => {
      const lane = LANES[i % LANES.length];
      const t = i * STEP;
      // Acercarse: del punto de fuga a su lane, creciendo y apareciendo.
      tl.to(card, { x: lane.side * W * 0.26, y: lane.y * H, scale: 1, autoAlpha: 1, ease: "none", duration: 2.2 }, t)
        // Pasar de largo: sigue derivando, crece y se desvanece.
        .to(card, { x: lane.side * W * 0.46, y: lane.y * H * 1.5, scale: 1.7, autoAlpha: 0, ease: "none", duration: 1.1 }, t + 2.2);
    });

    // Frases al centro, de a una: la salida de cada frase termina (t+2.45)
    // antes de que entre la siguiente (t+step+0.8 = t+2.5). Si se pisan,
    // se superponen legibles en el mismo punto y se lee sucio.
    phrases.forEach((ph, i) => {
      const t = i * STEP;
      tl.fromTo(ph, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, t + 0.8).to(
        ph,
        { autoAlpha: 0, y: -12, ease: "none", duration: 0.45 },
        t + 2.0,
      );
    });
  }, stage);
  return () => ctx.revert();
}
