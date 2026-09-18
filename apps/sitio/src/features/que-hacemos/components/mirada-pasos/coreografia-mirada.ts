import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearBloqueoScroll } from "./bloqueo-scroll";
import { crearVisibilidadSeccion } from "./visibilidad-seccion";

gsap.registerPlugin(ScrollTrigger);

/**
 * La entrada de «Cómo trabajamos» (el usuario, 2026-09-11): apenas se prende
 * la luz del faro, el título aparece en el medio del blanco, se queda un
 * momento, viaja a su lugar arriba a la izquierda achicándose, y mientras
 * viaja las cards entran en cascada debajo y el paso a paso aparece en la
 * franja. Es la intro de Contacto, y como ella corre SOLA, POR TIEMPO: nadie
 * tiene que scrollear para verla.
 *
 * EL RELEVO CON EL FARO —heredado de la torre de líneas, la escena que ocupaba
 * este lugar hasta el 2026-09-08—: la sección
 * se mete una pantalla debajo del final del faro y pinta por encima (z-20
 * contra su z-10), pero NACE APAGADA y se prende cuando su borde llega arriba,
 * donde el faro termina en blanco pleno (`visibilidad-seccion.ts`); si no,
 * quedaba una pantalla de blanco muerto entre la luz y el título. Al salir por
 * arriba se apaga con un fundido y la entrada se rebobina; desde abajo se
 * completa de golpe, sin repetir.
 *
 * MIENTRAS CORRE, EL SCROLL HACIA ABAJO QUEDA FRENADO (`bloqueo-scroll.ts`):
 * si no, quien seguía empujando la rueda veía las cards ya apiladas.
 *
 * El título es sticky —lo ubica el CSS en la franja— y acá sólo se le SUMA un
 * desplazamiento hasta el centro, que el viaje saca. Las cards y el indicador
 * nacen invisibles sólo desde acá, nunca por CSS: si el JS no corre, se ven.
 *
 * Todo sobre `transform` y `opacity`, y el `will-change` lo pone y lo saca
 * esta coreografía, nunca un className (AI_GUIDELINES §11). Nada de esto en
 * celular ni con reduced-motion: ahí la sección se lee quieta y completa.
 */

/** Cuánto más grande se ve el título en el centro que en la franja. */
const ESCALA_CENTRO = 1.6;
/** Tiempos de la entrada, en segundos. */
const TIEMPOS = {
  aparecer: 0.7,
  quedarse: 0.9,
  viajar: 0.8,
  /** Las cards arrancan a esta altura del viaje: el layout se arma
   *  alrededor del título mientras todavía se acomoda. */
  cardsDesde: 0.35,
  card: 0.55,
  cadencia: 0.07,
} as const;

export function crearMirada(root: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 1024px)",
      reducido: "(prefers-reduced-motion: reduce)",
    },
    (contexto) => {
      const { desktop, reducido } = contexto.conditions as {
        desktop: boolean;
        reducido: boolean;
      };
      if (!desktop || reducido) return;

      const franja = root.querySelector<HTMLElement>("[data-mirada-franja]");
      const titulo = root.querySelector<HTMLElement>("[data-mirada-titulo]");
      const indicador = gsap.utils.toArray<HTMLElement>("[data-mirada-indicador]", root);
      const cards = gsap.utils.toArray<HTMLElement>("[data-mirada-card]", root);
      if (!franja || !titulo || !cards.length) return;

      // El tope es el `top` del sticky de la franja, y lo pone globals.css
      // con las demás medidas de la pila: cambia con el alto de la pantalla,
      // así que se lee y no se recalcula (ver PanelMirada).
      const cajaTope = root.querySelector<HTMLElement>("[data-mirada-tope]");
      const tope = () =>
        cajaTope ? parseFloat(getComputedStyle(cajaTope).top) || 0 : 0;

      const { mostrar, apagarSuave, limpiar } = crearVisibilidadSeccion(root);
      mostrar(false);

      // Del centro del viewport al centro que el título tiene en la franja.
      // La `x` sale de la franja, que no se transforma; el título sí, y su
      // rect mentiría a mitad de camino.
      const alCentroX = () =>
        window.innerWidth / 2 -
        (franja.getBoundingClientRect().left + titulo.offsetLeft + titulo.offsetWidth / 2);
      const alCentroY = () => window.innerHeight / 2 - (tope() + franja.offsetHeight / 2);

      gsap.set(titulo, { transformOrigin: "50% 50%" });
      gsap.set(cards, { autoAlpha: 0, y: 26 });
      // El indicador aparece cuando el título ya atracó: desde el arranque, la
      // franja se vería a medio armar mientras el título viaja por el centro.
      gsap.set(indicador, { autoAlpha: 0 });

      const bloqueo = crearBloqueoScroll(root);

      const entrada = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onStart: () => gsap.set([titulo, ...cards], { willChange: "transform, opacity" }),
        onComplete: () => {
          gsap.set([titulo, ...cards], { clearProps: "willChange" });
          bloqueo.liberar();
        },
      });
      entrada
        .fromTo(
          titulo,
          { autoAlpha: 0, x: alCentroX, y: alCentroY, scale: ESCALA_CENTRO },
          { autoAlpha: 1, duration: TIEMPOS.aparecer, ease: "power2.out" },
        )
        // VIAJA, no se dispersa: es el mismo título que se acomoda.
        .to(titulo, { x: 0, y: 0, scale: 1, duration: TIEMPOS.viajar }, `+=${TIEMPOS.quedarse}`)
        // Slide editorial, sin bounce: son los pasos de un método, no fichas.
        .fromTo(
          cards,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: TIEMPOS.card,
            ease: "power3.out",
            stagger: TIEMPOS.cadencia,
            immediateRender: false,
          },
          `<${TIEMPOS.cardsDesde}`,
        )
        .to(indicador, { autoAlpha: 1, duration: TIEMPOS.card }, "-=0.3");

      const arrancar = () => {
        if (entrada.progress() !== 0 || entrada.isActive()) return;
        bloqueo.bloquear();
        entrada.play();
      };
      // Desde abajo se completa de golpe: no hay nada que frenar.
      const completar = () => {
        bloqueo.liberar();
        entrada.progress(1);
      };
      const rebobinar = () => {
        bloqueo.liberar();
        entrada.pause(0);
      };

      // Un solo trigger, sin scrub: solo decide prendido/apagado y dispara
      // la entrada, que corre por su cuenta. Los cuatro bordes y el refresh,
      // como en la torre: un salto que cruza la sección entera en un update
      // no pasa por onToggle, pero sí por los bordes.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => {
          mostrar(true);
          arrancar();
        },
        onLeaveBack: () => {
          bloqueo.liberar();
          apagarSuave(rebobinar);
        },
        onEnterBack: () => {
          mostrar(true);
          completar();
        },
        // Un salto que cruza la sección entera (el navbar yendo a una
        // sección de más abajo) pasa por onEnter y onLeave en el mismo
        // update: sin completar acá, el bloqueo que armó onEnter clavaba
        // la página al principio de esta sección y el salto se perdía.
        onLeave: () => {
          mostrar(true);
          completar();
        },
        onRefresh: (self) => {
          if (self.isActive) {
            mostrar(true);
            arrancar();
          } else if (self.progress >= 1) {
            mostrar(true);
            completar();
          } else {
            mostrar(false);
            rebobinar();
          }
        },
      });

      return () => {
        bloqueo.liberar();
        limpiar();
        entrada.kill();
        gsap.set([titulo, ...indicador, ...cards], { clearProps: "opacity,visibility,transform,willChange" });
      };
    },
  );

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
