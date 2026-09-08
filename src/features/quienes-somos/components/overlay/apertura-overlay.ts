import gsap from "gsap";
import { APERTURA, clipDe, EASE_VIAJE, ESPERA_IMAGEN, paresDe, type RefsOverlay } from "./coreografia-overlay";
import { apoyarViajera, medirDestino, viajarFoto } from "./viaje-foto";

type Apertura = {
  root: HTMLDivElement | null;
  originEl: HTMLElement | null;
  reduced: boolean;
  immersive: boolean;
  /** En el inmersivo de escritorio la foto de la card viaja (ver compositor). */
  fotoViaja: boolean;
  refs: RefsOverlay;
};

/**
 * ENTRADA del overlay. Corre con el portal ya en el DOM, visible y enfocado.
 * Las otras cards se alejan mientras la elegida se convierte en el perfil;
 * se restauran al cerrar — viven fuera del portal, así que no entran en el
 * gsap.context del root. Devuelve la limpieza: revert del contexto y
 * restauración de los pares, en ese orden (la primera que corre al cerrar).
 */
export function abrirOverlay({ root, originEl, reduced, immersive, fotoViaja, refs }: Apertura) {
  let ctx: gsap.Context | undefined;
  const pares = paresDe(originEl);
  if (root && !reduced) {
    if (pares.length) gsap.to(pares, { opacity: 0.4, scale: 0.98, duration: 0.45, ease: "power2.out" });
    ctx = gsap.context((self) => {
      const backdrop = refs.backdrop.current;
      const from = originEl?.getBoundingClientRect();
      const desdeCard = !!(from && from.width > 0);
      const originImg = originEl?.querySelector("img");
      const f = originImg?.getBoundingClientRect();
      const hero = refs.hero.current;
      const viajera = refs.viajera.current;
      // Destino: la caja de la figura recortada; lo que se revela es su
      // MOVER (la caja la gobierna la coreografía de scroll del perfil).
      const figura = root.querySelector<HTMLElement>("[data-portrait-mover]");
      // El destino es el recuadro de la IMAGEN recortada (no su caja, que
      // tiene aire a la izquierda): así el fundido cambia de foto a figura
      // sobre el mismo lugar.
      const cajaFigura = root.querySelector<HTMLElement>("[data-portrait-outer]");
      const imgFigura = figura?.querySelector("img");
      const viaja = !!(immersive && fotoViaja && viajera && f && f.width > 0 && (imgFigura || cajaFigura));
      const heroFlip = !!(!immersive && hero && f && f.width > 0);
      const lineas = refs.content.current ? Array.from(refs.content.current.children) : [];

      // ── ESTADOS INICIALES, YA: todo arranca en la card (el lienzo
      //    recortado a su rectángulo, la foto sobre su foto), así el primer
      //    frame no muestra el perfil terminado.
      if (backdrop && desdeCard) gsap.set(backdrop, { clipPath: clipDe(from) });
      else if (backdrop) gsap.set(backdrop, { autoAlpha: 0 });
      if (refs.patron.current) gsap.set(refs.patron.current, { autoAlpha: 0 });
      gsap.set([refs.back.current, refs.copiar.current], { opacity: 0, y: -8 });
      if (viaja && viajera && f) apoyarViajera(viajera, originImg, f, figura);
      if (heroFlip && hero && f) {
        const to = hero.getBoundingClientRect();
        gsap.set(hero, {
          x: f.left - to.left,
          y: f.top - to.top,
          scaleX: f.width / to.width,
          scaleY: f.height / to.height,
          transformOrigin: "top left",
        });
      }
      if (!immersive) gsap.set(lineas, { opacity: 0, x: -22 });

      // ── EL VIAJE arranca dos frames después: el montaje del perfil (y
      //    la decodificación de sus imágenes) traba el primer frame, y con
      //    lagSmoothing(0) —que fija Lenis— GSAP no perdona esa pausa: los
      //    tweens saltarían al final. Con los estados ya puestos no se ve
      //    nada raro mientras tanto.
      const arrancar = () => {
        // El fondo nace de la card.
        if (backdrop && desdeCard) {
          gsap.to(backdrop, {
            clipPath: "inset(0px 0px 0px 0px round 0rem)",
            duration: APERTURA,
            ease: EASE_VIAJE,
            onComplete: () => gsap.set(backdrop, { clearProps: "clipPath" }),
          });
        } else if (backdrop) {
          gsap.to(backdrop, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        }
        if (refs.patron.current)
          gsap.to(refs.patron.current, { autoAlpha: 0.35, duration: 0.5, delay: 0.35 });
        gsap.to([refs.back.current, refs.copiar.current], {
          opacity: 1,
          y: 0,
          duration: 0.45,
          delay: APERTURA * 0.75,
          ease: "power2.out",
        });

        // La foto viaja (inmersivo) hasta el recuadro exacto de la figura.
        const d = viaja ? medirDestino(imgFigura, cajaFigura) : undefined;
        if (viaja && viajera && d && d.width > 0) {
          viajarFoto(viajera, d, figura);
        } else if (immersive && fotoViaja) {
          // Sin destino medible la foto no viaja; la figura no puede quedar
          // escondida (ImmersiveProfile la dejó en 0 esperando a este overlay).
          if (viajera) gsap.set(viajera, { autoAlpha: 0 });
          if (figura) gsap.to(figura, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        }

        // La foto viaja (shell): el retrato mismo, desde la card.
        if (heroFlip && hero) {
          gsap.to(hero, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: APERTURA, ease: EASE_VIAJE });
        }
        // El texto llega último, desde la izquierda, escalonado.
        if (!immersive && lineas.length) {
          gsap.to(lineas, { opacity: 1, x: 0, duration: 0.55, delay: APERTURA * 0.55, stagger: 0.08, ease: "power3.out" });
        }
      };
      // ...y si la imagen del perfil todavía no cargó, la espera (hasta
      // ESPERA_IMAGEN) para conocer el destino exacto. La card ya la
      // precargó al pasar el mouse, así que casi siempre está lista.
      let raf = 0;
      let timer = 0;
      let arrancado = false;
      const arrancarUnaVez = () => {
        if (arrancado) return;
        arrancado = true;
        imgFigura?.removeEventListener("load", arrancarUnaVez);
        self.add(arrancar);
      };
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          if (imgFigura && !imgFigura.complete && viaja) {
            imgFigura.addEventListener("load", arrancarUnaVez, { once: true });
            timer = window.setTimeout(arrancarUnaVez, ESPERA_IMAGEN);
          } else {
            arrancarUnaVez();
          }
        });
      });
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
        imgFigura?.removeEventListener("load", arrancarUnaVez);
      };
    }, root);
  } else if (root && reduced) {
    gsap.set(root, { autoAlpha: 1 });
  }

  return () => {
    ctx?.revert();
    if (pares.length) gsap.set(pares, { clearProps: "opacity,transform" });
  };
}
