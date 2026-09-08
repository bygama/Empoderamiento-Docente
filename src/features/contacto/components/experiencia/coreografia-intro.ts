import gsap from "gsap";
import { panelDe, type Contexto } from "./contexto";
import { crearGhostTitulo } from "./ghost-titulo";

// Los ghosts viven en <body> (position:fixed), fuera del ctx de GSAP: si la
// intro se saltea o el componente se desmonta a mitad de vuelo, nadie más
// los saca.
export function limpiarGhosts(c: Contexto) {
  c.estado.ghosts.forEach((g) => g.remove());
  c.estado.ghosts = [];
}

// Fin de la intro (por completarse o por salteo): se sueltan los listeners
// que retenían el scroll. NO se toca `body.overflow` ni se fuerza el top —
// ver el porqué en `montarIntro`.
export function finIntro(c: Contexto) {
  c.estado.introVivo = false;
  c.estado.animando = false;
  limpiarGhosts(c);
  c.setIntroListo(true);
}

// ── HERO → APERTURA: el desarme (viaje de ida) ────────────────────────────
export function desarmar(c: Contexto) {
  if (c.estado.animando) return;
  const root = c.root;
  if (!root) return;
  c.setVista("apertura");

  if (c.reduced) {
    gsap.set(panelDe(c, "hero"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
    finIntro(c);
    return;
  }

  c.estado.animando = true;
  const cards = gsap.utils.toArray<HTMLElement>("[data-tema-card]");
  const head = gsap.utils.toArray<HTMLElement>("[data-ap-head]");

  // preparar la apertura: visible como capa pero con TODO oculto, para que
  // el desarme la vaya encendiendo por partes
  gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
  gsap.set(cards, { autoAlpha: 0 });
  gsap.set(head, { autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => {
      gsap.set(panelDe(c, "hero"), { autoAlpha: 0 });
      finIntro(c);
    },
  });
  c.estado.desarmeTl = tl;

  // ── "Hablemos." VIAJA (no se dispersa) ────────────────────────────────
  // Es el mismo titular: se achica y se acomoda arriba del selector. El
  // ghost se anima por SCALE (no por font-size, que es layout) desde el
  // tamaño del hero hasta el del encabezado; con la misma familia, peso,
  // tracking y line-height en los dos, la razón de font-size alcanza para
  // que el ghost calce clavado sobre ambos.
  const srcTit = root.querySelector<HTMLElement>("[data-hero-titulo]");
  const dstTit = root.querySelector<HTMLElement>("[data-ap-titulo]");
  const h2 = root.querySelector<HTMLElement>("[data-ap-h2]");

  if (srcTit && dstTit && h2) {
    const s = srcTit.getBoundingClientRect();
    const d = dstTit.getBoundingClientRect();
    const cs = getComputedStyle(dstTit);
    const fsSrc = parseFloat(getComputedStyle(srcTit).fontSize);
    const fsDst = parseFloat(cs.fontSize);
    const ratio = fsDst > 0 ? fsSrc / fsDst : 1;

    const gt = crearGhostTitulo(d, cs, fsDst);
    c.estado.ghosts.push(gt);

    gsap.set(h2, { autoAlpha: 0 });
    tl.set(srcTit, { autoAlpha: 0 }, 0)
      .fromTo(
        gt,
        { x: s.left - d.left, y: s.top - d.top, scale: ratio },
        { x: 0, y: 0, scale: 1, duration: 0.8 },
        0,
      )
      .set(h2, { autoAlpha: 1 }, 0.78)
      .to(gt, { autoAlpha: 0, duration: 0.12, onComplete: () => gt.remove() }, 0.78);
  } else {
    // sin medida (titular no montado): corte simple, sin viaje
    tl.to(srcTit, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
  }

  // las filas del índice entran en cascada mientras el titular todavía
  // viaja: el layout se arma ALREDEDOR de la palabra que se acomoda. Slide
  // editorial (sin bounce): son renglones de un índice, no fichas.
  tl.fromTo(
    cards,
    { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 },
    0.35,
  );

  // eyebrow y bajada
  tl.fromTo(
    head,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 },
    0.5,
  );
}

// ── Saltear la intro ──────────────────────────────────────────────────────
// El gesto de scroll ya NO paga un peaje (la intro se desarma sola): saltea.
// Se lo traga en captura para que no le llegue a Lenis — si no, acumula el
// impulso y arrastra la página en pleno vuelo, con los ghosts fixed clavados
// en su destino viejo.
export function saltarIntro(c: Contexto) {
  if (!c.estado.introVivo) return;
  c.estado.introTl?.kill();
  c.estado.desarmeTl?.kill();
  c.setVista("apertura");

  gsap.set(panelDe(c, "hero"), { autoAlpha: 0 });
  gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
  gsap.set("[data-ap-h2]", { autoAlpha: 1 });
  gsap.set("[data-ap-head]", { autoAlpha: 1, y: 0 });
  gsap.set("[data-tema-card]", { autoAlpha: 1, x: 0, y: 0, scale: 1 });
  finIntro(c);
}

// ── Entrada inicial: el hero se arma y se desarma SOLO ────────────────────
// Sin piezas, el hero es solo la palabra: las letras suben y listo. Se fueron
// con ellas la deriva perpetua y el parallax de mouse, que no tenían a quién
// moverle nada. Cuerpo del layout effect del compositor; devuelve su limpieza.
export function montarIntro(c: Contexto) {
  const root = c.root;
  if (!root) return;

  const ctx = gsap.context(() => {
    // estado base: solo el hero visible
    gsap.set('[data-panel="apertura"]', { autoAlpha: 0 });
    gsap.set('[data-panel="formulario"]', { autoAlpha: 0 });
    gsap.set('[data-panel="cierre"]', { autoAlpha: 0 });
    if (c.reduced) return;

    const chars = gsap.utils.toArray<HTMLElement>("[data-hero-char]");

    const tl = gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } });
    c.estado.introTl = tl;
    tl.fromTo(
      chars,
      { autoAlpha: 0, yPercent: 105, rotateX: -70, transformOrigin: "50% 100%", transformPerspective: 600 },
      { autoAlpha: 1, yPercent: 0, rotateX: 0, duration: 0.7, ease: "back.out(1.5)", stagger: 0.04 },
      0,
    )
      // …y acá está el punto: NADIE tiene que hacer nada. La intro no pide un
      // gesto para pagar el peaje — se desarma sola apenas terminó de armarse
      // y de darse un beat para leerse.
      .call(() => desarmar(c), undefined, 1.2);
  }, root);

  // sin intro: se entra directo al selector, ya armado
  if (c.reduced) desarmar(c);

  // NADA de `body.overflow = "hidden"` para quieto el scroll durante la
  // intro: al soltarlo reaparece la barra, el viewport se ensancha y TODO el
  // contenido centrado pega un salto de media barra (~7px) justo cuando
  // termina la intro. La barra se queda siempre; al scroll lo frenan los
  // handlers en captura (useSaltoIntro), que además saltean la intro.
  return () => {
    ctx.revert();
    limpiarGhosts(c);
  };
}
