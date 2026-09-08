import gsap from "gsap";

/**
 * Lee las piezas internas de la historia. `q`/`qa` van acotados a `root`:
 * sin eso, toArray barre todo el documento y cualquier data-attr homónimo de
 * otra sección se colaría en silencio. (`nodos` conserva su lectura global
 * de siempre: `[data-const-node]` solo existe acá.)
 */
export function leerPiezas(root: HTMLElement) {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);
  return {
    q,
    qa,
    chars0: qa("[data-beat='0'] [data-char]"),
    quoteCard: q("[data-quote-card]"),
    quoteLines: qa("[data-quote-line]"),
    quoteMark: q("[data-quote-mark]"),
    quoteSub: q("[data-quote-sub]"),
    typeChars: qa("[data-type] [data-char]"),
    sub2: q("[data-beat='2'] [data-sub]"),
    path: root.querySelector<SVGPathElement>("[data-const-path]"),
    nodos: gsap.utils.toArray<SVGCircleElement>("[data-const-node]"),
    labels: qa("[data-const-label]"),
    finWords: qa("[data-fin-word]"),
    finRule: q("[data-fin-rule]"),
    finSub: q("[data-fin-sub]"),
    constTitle: q("[data-const-title]"),
    constvLine: q("[data-constv-line]"),
    constvNodes: qa("[data-constv-node]"),
    constvCopies: qa("[data-constv-copy]"),
    panel: q("[data-photo-panel]"),
    lamina: q("[data-photo-lamina]"),
    photoFrames: qa("[data-photo]"),
    photoImgs: qa("[data-photo-img]"),
    notchRail: q("[data-notch-rail]"),
  };
}

export type Piezas = ReturnType<typeof leerPiezas>;

/** Estados iniciales de piezas internas (solo con motion). */
export function prepararEstados(p: Piezas) {
  const { quoteCard, quoteLines, quoteMark, quoteSub, typeChars, sub2, path, nodos } = p;
  const { labels, finWords, finRule, finSub } = p;
  if (quoteCard) {
    gsap.set(quoteCard, {
      rotateX: -72,
      y: 80,
      autoAlpha: 0,
      transformPerspective: 1000,
      transformOrigin: "center bottom",
    });
  }
  gsap.set(quoteLines, { yPercent: 115 });
  // La comilla y la atribución viven FUERA de las máscaras: sin esto
  // aparecerían antes que la cita (la tarjeta que las contenía ya no
  // está) y se leería la firma antes que la frase.
  if (quoteMark) gsap.set(quoteMark, { autoAlpha: 0 });
  if (quoteSub) gsap.set(quoteSub, { autoAlpha: 0, y: 16 });
  gsap.set(typeChars, { opacity: 0.13 });
  if (sub2) gsap.set(sub2, { autoAlpha: 0, y: 18 });
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  }
  nodos.forEach((n) => gsap.set(n, { attr: { r: 0 } }));
  // Hitos futuros: presentes como expectativa (tenues), no invisibles.
  gsap.set(labels, { autoAlpha: 0.16, y: 14 });
  gsap.set(finWords, { autoAlpha: 0, scale: 1.7, filter: "blur(10px)" });
  if (finRule) gsap.set(finRule, { scaleX: 0 });
  if (finSub) gsap.set(finSub, { autoAlpha: 0, y: 18 });
}

/**
 * Indicador de 5 puntos (cápsula naranja = beat activo, mismo idioma que el
 * home). Se crea ANTES del timeline: su onUpdate puede dispararse apenas se
 * crea el ScrollTrigger.
 */
export function crearIndicador(dots: HTMLElement[]) {
  let lastIdx = -1;
  return (p: number) => {
    // umbrales = inicio de cada beat sobre la duración total (11.5)
    const bounds = [0.13, 0.35, 0.57, 0.85];
    let idx = 0;
    for (let i = 0; i < bounds.length; i++) if (p >= bounds[i]) idx = i + 1;
    if (idx === lastIdx) return;
    lastIdx = idx;
    dots.forEach((d, i) => {
      gsap.to(d, {
        width: i === idx ? 26 : 8,
        backgroundColor: i === idx ? "#e07a2f" : "rgba(255,255,255,0.25)",
        duration: 0.35,
        ease: "power2.out",
      });
    });
  };
}
