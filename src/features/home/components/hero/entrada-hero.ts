import gsap from "gsap";

/**
 * ENTRADA (fórmula del proyecto de referencia / blueprintapps.io): las cards
 * arrancan APILADAS en el centro y se despliegan a su lugar. La dispara la
 * coreografía al atravesar el gate. Mide `getBoundingClientRect()` para el
 * offset al centro, así que cuando corre en el montaje lo hace desde el layout
 * effect del hero, antes del primer paint.
 */
export function entradaHero(inners: HTMLElement[]) {
  // Mismos TEMPOS que el hero de Empoderamiento Docente (BlueprintHero):
  // delay 0.2 → cards aparecen apiladas (0.7s) → beat 0.15 → se despliegan
  // (1.7s) → el titular sube en el ÚLTIMO ~1s del despliegue (-=1.0), y
  // recién después la descripción (-=0.55) y las acciones (-=0.4).
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.2 });

  // Durante el despliegue, las cards van DELANTE del título.
  tl.set("[data-hero-cards]", { zIndex: 40 }, 0);

  // Estado inicial: apiladas/superpuestas en el centro del viewport,
  // chicas e invisibles (offset al centro calculado en runtime).
  gsap.set(inners, {
    x: (_i, el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return window.innerWidth / 2 - (r.left + r.width / 2);
    },
    y: (_i, el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return window.innerHeight / 2 - (r.top + r.height / 2);
    },
    scale: 0.5,
    autoAlpha: 0,
  });

  // 1a — aparecen apiladas en el centro.
  tl.to(
    inners,
    { autoAlpha: 1, scale: 0.62, duration: 0.7, ease: "power2.out", stagger: 0.04 },
    0,
  );

  // 1b — se despliegan desde el centro hasta su lugar (crecen a 1; stagger
  // desde el centro, easing power3.inOut suave). Beat de 0.15 entre ambas.
  tl.to(
    inners,
    { x: 0, y: 0, scale: 1, duration: 1.7, ease: "power3.inOut", stagger: { each: 0.06, from: "center" } },
    "+=0.15",
  );

  // Asentadas, vuelven DETRÁS del título justo cuando el texto va a entrar.
  tl.set("[data-hero-cards]", { zIndex: 10 }, "-=1.0");

  // Copy (idioma de Empoderamiento Docente): el titular SUBE línea por
  // línea desde su máscara (mask-rise, sin blur) en el último tramo del
  // despliegue, y después la descripción y las acciones. Tempos del FUENTE.
  tl.to(
    "[data-hero-word]",
    {
      opacity: 1,
      yPercent: 0,
      rotateX: 0,
      duration: 0.95,
      ease: "back.out(1.5)",
      stagger: 0.07,
    },
    "<",
  )
    // Pop del acento (aprendizaje) justo cuando termina de armarse el título.
    .to(
      "[data-hero-accent]",
      {
        keyframes: [
          { scale: 1.16, color: "#1f9a78", duration: 0.22, ease: "power2.out" },
          { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" },
        ],
      },
      "-=0.35",
    )
    .to(
      "[data-hero-desc]",
      { autoAlpha: 1, y: 0, duration: 0.7 },
      "-=0.6",
    )
    .to(
      "[data-hero-actions]",
      { autoAlpha: 1, y: 0, duration: 0.6 },
      "-=0.4",
    )
    // Carteles de las fotos: entran al final, ya con las cards en su lugar
    // (fade-up, stagger), como remate del armado.
    .to(
      "[data-card-label]",
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 },
      "-=0.25",
    )
    // Halo blanco de legibilidad: entra RECIÉN acá, con un fade suave, ya
    // con las cards y el título asentados → no molesta en la entrada.
    .to(
      "[data-hero-halo]",
      { autoAlpha: 1, duration: 0.9, ease: "power2.out" },
      "-=0.15",
    );

  // Cards mobile (< lg): MISMO gesto stack→deploy, pero sobre [data-mcard]
  // (capa con transform 100% de GSAP; el slot la centra por CSS → sin
  // conflicto ni doble-centrado). Timeline propio para no tocar los tempos
  // del desktop. En desktop estas cards están display:none → tween invisible.
  const mcards = gsap.utils.toArray<HTMLElement>("[data-mcard]");
  if (mcards.length) {
    gsap.set(mcards, {
      x: (_i, el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return window.innerWidth / 2 - (r.left + r.width / 2);
      },
      y: (_i, el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return window.innerHeight / 2 - (r.top + r.height / 2);
      },
      scale: 0.5,
      autoAlpha: 0,
    });
    gsap
      .timeline({ defaults: { ease: "power3.out" }, delay: 0.2 })
      .to(
        mcards,
        { autoAlpha: 1, scale: 0.62, duration: 0.7, ease: "power2.out", stagger: 0.05 },
        0,
      )
      .to(
        mcards,
        { x: 0, y: 0, scale: 1, duration: 1.5, ease: "power3.inOut", stagger: { each: 0.08, from: "center" } },
        "+=0.15",
      );
  }
}
