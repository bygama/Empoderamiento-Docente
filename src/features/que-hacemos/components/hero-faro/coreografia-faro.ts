import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearCamara } from "./camara-faro";
import { crearHaces } from "./haz-faro";
import { armarEscenas } from "./escenas-faro";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La coreografía del faro, armada dentro de un gsap.matchMedia sobre
 * `root`: rearma/desarma al cruzar el breakpoint (el gate evaluado una sola
 * vez dejaba el estado congelado al resize). Devuelve el revert.
 */
export function crearCoreografiaFaro(root: HTMLElement, alto: HTMLElement) {
  const mm = gsap.matchMedia(root);

  mm.add("(min-width: 1024px)", () => {
    let rafQa = 0;

    const camara = crearCamara(root);

    // El apuntado del haz a las preguntas se resuelve POR FRAME en
    // `haces.girar` (haz-faro.ts), después de los tweens de cada tick: los
    // bloques de texto son HTML por fuera del SVG y la cámara transforma el
    // SVG en cada frame, así que el ángulo correcto cambia constantemente.

    // Promoción a GPU solo mientras la coreografía existe (el fallback
    // estático no paga las texturas de 6 capas full-viewport).
    gsap.set(camara.capas.map((c) => c.el), { willChange: "transform" });

    // El CTA del cierre es alcanzable solo cuando la coreografía corre
    // (en el fallback el bloque está invisible: inert lo saca del foco).
    const cierreEl = root.querySelector("[data-esc='cierre']");
    cierreEl?.removeAttribute("inert");

    /* ── Estados iniciales = S0 (el JSX por defecto es el fallback S1
          encendido; acá se apaga y se aleja todo) ─────────────────────── */
    // PIVOTES DE LA LUZ — nunca svgOrigin: su parse salía corrupto
    // (medido: xOrigin −2003 en vez de 950, derivando con los refreshes)
    // y todo transform pivotaba desde cualquier lado. En su lugar,
    // transformOrigin en el espacio del BBOX de cada elemento, declarado
    // UNA vez (los tweens usan el caché y ningún refresh lo recalcula):
    // - halo/núcleo: círculos centrados EXACTO en el foco → "50% 50%".
    // - haces: el foco (950,388) relativo al bbox de sus conos. Cono izq:
    //   x −360..946, y 288..644 → (950−(−360), 388−288) = 1310px, 100px.
    //   Cono der: x 954..2260 → (950−954, 388−288) = −4px, 100px.
    //   (Si cambia la geometría de los conos en FaroEscena, recalcular.)
    gsap.set("[data-haz='izq']", { autoAlpha: 0, transformOrigin: "1310px 100px" });
    gsap.set("[data-haz='der']", { autoAlpha: 0, transformOrigin: "-4px 100px" });
    gsap.set("[data-halo]", { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%" });
    gsap.set("[data-nucleo]", { autoAlpha: 0.16, scale: 0.5, transformOrigin: "50% 50%" });
    gsap.set("[data-linterna]", { opacity: 0.2 });
    gsap.set("[data-espejo]", { autoAlpha: 0 });
    gsap.set("[data-capa='marMedio']", { autoAlpha: 0.35 });
    gsap.set("[data-mensaje]", {
      autoAlpha: 0,
      clipPath: "inset(-8% 100% -8% 0)",
    });
    camara.aplicar();

    // El giro del haz va creado ANTES de la línea de tiempo (ver haz-faro).
    const haces = crearHaces(root);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onUpdate: () => {
        camara.aplicar();
        haces.girar();
      },
      scrollTrigger: {
        trigger: alto,
        // +100svh: el runway ahora empieza una pantalla antes (detrás del
        // hero), pero la coreografía tiene que seguir arrancando donde
        // arrancaba. Ese primer tramo muestra la escena quieta, en su
        // estado inicial, detrás del hero.
        start: () => `top+=${window.innerHeight} top`,
        end: "bottom bottom",
        scrub: 0.85,
        // Los ángulos del haz se calculan midiendo dónde quedó cada bloque
        // de texto: sin esto GSAP los evaluaría una sola vez y volverían a
        // desfasarse en cuanto cambie el layout (resize, fuente, copy).
        invalidateOnRefresh: true,
        // Un refresh de ScrollTrigger re-renderiza la línea pasando por el
        // progreso 0 CON eventos y vuelve al progreso actual SIN eventos:
        // cámara y haz quedaban en su estado inicial hasta el próximo tick
        // de scroll ("el haz se va a otro lado y vuelve"; medido: −8° tras
        // un resize a mitad de las preguntas). Se re-aplican al terminar.
        onRefresh: () => {
          camara.aplicar();
          haces.girar();
        },
      },
    });
    haces.setTimeline(tl);

    /* ── Detrás del hero: solo cielo ────────────────────────────────
       En el tramo que corre bajo el hero el faro queda HUNDIDO bajo el
       borde inferior y sube a su lugar mientras el hero se va. Así el
       titular se lee sobre el cielo estrellado sin que la torre se le
       cruce, y la aparición del faro sigue siendo la llegada de la cámara
       (la narrativa original de la escena).
       Se anima el wrapper interno, no [data-capa]: esa la escribe la
       cámara en cada frame y pisaría cualquier cosa que pongamos acá.

       LA LLEGADA FRENA, NO SE CLAVA. Antes la subida era lineal y
       terminaba justo en una pantalla: el mundo entero (torre, horizonte,
       estrellas) venía pegado al scroll y a 1vh se detenía en seco
       mientras la página seguía — y encima quedaba quieto casi una
       pantalla hasta que la cámara arrancaba (p=0.1). Ese cambio de
       velocidad era la "junta" que se sentía entre el hero y la escena,
       aunque el cielo fuera el mismo. Ahora la subida se reparte en
       LLEGADA_VH pantallas con freno en coseno: arranca al MISMO ritmo
       que antes (con sine.out la velocidad inicial es π/2 · 0.86 /
       LLEGADA_VH = 0.86× el scroll, así el tramo del hero no cambia) y
       desacelera hasta detenerse con la primera frase todavía en
       pantalla, un pelo antes de que la cámara empiece a avanzar. */
    const LLEGADA_VH = Math.PI / 2;
    gsap.fromTo(
      "[data-faro-shift]",
      { y: () => window.innerHeight * 0.86 },
      {
        y: 0,
        ease: "sine.out",
        scrollTrigger: {
          trigger: alto,
          start: "top top",
          end: () => `top+=${window.innerHeight * LLEGADA_VH} top`,
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      },
    );

    armarEscenas(tl, camara);

    // Solo dev: `#qa=0.42` clava el timeline en ese progreso (sin scroll:
    // el screenshot headless no respeta scrollTo). QA determinista.
    if (process.env.NODE_ENV === "development") {
      const m = window.location.hash.match(/qa=([\d.]+)/);
      if (m) {
        const p = Math.min(1, Math.max(0, parseFloat(m[1])));
        rafQa = requestAnimationFrame(() => {
          tl.scrollTrigger?.disable(false);
          tl.progress(p);
        });
      }
    }

    return () => {
      if (rafQa) cancelAnimationFrame(rafQa);
      cierreEl?.setAttribute("inert", "");
    };
  });

  return () => mm.revert();
}
