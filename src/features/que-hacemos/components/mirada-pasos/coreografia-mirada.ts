import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearBloqueoScroll } from "./bloqueo-scroll";
import { TOPE_REM } from "./PanelMirada";
import { crearVisibilidadSeccion } from "./visibilidad-seccion";

gsap.registerPlugin(ScrollTrigger);

/**
 * La entrada de «Cómo trabajamos» (el usuario, 2026-09-11): apenas se prende
 * la luz del faro, el título aparece en el medio del blanco, se queda un
 * momento, viaja a su lugar arriba a la izquierda achicándose, y mientras
 * viaja las cards entran en cascada debajo. Es la intro de Contacto
 * («Hablemos.» viaja y las filas del índice se arman alrededor), y como
 * ella corre SOLA, POR TIEMPO: nadie tiene que scrollear para verla.
 *
 * EL RELEVO CON EL FARO es el de la torre de líneas (TorreLineas, que sigue
 * en components/): la sección se mete una pantalla debajo del final del faro
 * y pinta por encima (z-20 contra su z-10), pero NACE APAGADA y se prende
 * cuando su borde llega arriba, que es exactamente donde el faro termina en
 * blanco pleno (`visibilidad-seccion.ts`). Así no queda la pantalla de
 * blanco muerto que había antes entre la luz y el título. Al salir por
 * arriba se apaga con un fundido y la entrada se rebobina; desde abajo se
 * completa de golpe, sin repetir.
 *
 * MIENTRAS CORRE, EL SCROLL HACIA ABAJO QUEDA FRENADO (`bloqueo-scroll.ts`):
 * si no, quien seguía empujando la rueda apilaba las cards invisibles y las
 * veía aparecer ya apiladas. Vuelve al terminar la cascada.
 *
 * El título es sticky —lo ubica el CSS en la franja— y acá solo se le SUMA
 * un desplazamiento hasta el centro, que el viaje saca. Las cards nacen
 * invisibles solo desde acá, nunca por CSS: si el JS no corre, se ven.
 *
 * Todo sobre `transform` y `opacity`. Sin nada de esto en celular ni con
 * reduced-motion: ahí no hay solape y la sección se lee quieta y completa.
 *
 * El `will-change` lo pone y lo saca esta coreografía, nunca un className
 * (AI_GUIDELINES §11): dura lo que dura la entrada.
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
      const cards = gsap.utils.toArray<HTMLElement>("[data-mirada-card]", root);
      if (!franja || !titulo || !cards.length) return;

      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const tope = TOPE_REM * rem;

      const { mostrar, apagarSuave, limpiar } = crearVisibilidadSeccion(root);
      mostrar(false);

      // Del centro del viewport al centro que el título tiene en la franja.
      // La `x` sale de la franja, que no se transforma; el título sí, y su
      // rect mentiría a mitad de camino.
      const alCentroX = () =>
        window.innerWidth / 2 -
        (franja.getBoundingClientRect().left + titulo.offsetLeft + titulo.offsetWidth / 2);
      const alCentroY = () => window.innerHeight / 2 - (tope + franja.offsetHeight / 2);

      gsap.set(titulo, { transformOrigin: "50% 50%" });
      gsap.set(cards, { autoAlpha: 0, y: 26 });

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
        );

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
        onLeave: () => mostrar(true),
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
        gsap.set([titulo, ...cards], { clearProps: "opacity,visibility,transform,willChange" });
      };
    },
  );

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
