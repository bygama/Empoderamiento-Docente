import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

type Opciones = {
  open: boolean;
  reduced: boolean;
  /** true recién en cliente: hasta entonces el panel no existe en el DOM. */
  hydrated: boolean;
  panelRef: RefObject<HTMLDialogElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
  closeRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Apertura y cierre del panel: la timeline (que se arma una vez que el panel
 * existe), el `showModal()` / `close()` del `<dialog>` y el manejo del foco.
 */
export function useMenuAnimado({ open, reduced, hydrated, panelRef, toggleRef, closeRef }: Opciones) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Timeline de apertura — se arma una vez que el panel existe en el DOM.
  useEffect(() => {
    if (!hydrated) return;
    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      gsap.set(panel, { autoAlpha: 0 });
      if (reduced) return; // sin timeline: lo maneja el efecto de abajo.

      // La cortina: el filo cruza la pantalla entera mientras el contenido
      // recorre la mitad. Ese desfase es todo el efecto —las palabras aparecen
      // cortadas por el filo y se terminan de acomodar con él—, por eso NO hay
      // entrada escalonada de ítems: competiría con la cortina. Las dos capas
      // comparten duración y curva para llegar juntas, y al ser una curva
      // simétrica la reversa es la misma cortina yéndose.
      const cortina = { duration: 0.7, ease: "power3.inOut" };
      tlRef.current = gsap
        .timeline({
          paused: true,
          // El `close()` va acá y no en el efecto: el panel tiene que seguir
          // pintado mientras la reversa corre (un dialog cerrado no se ve). Y
          // el foco vuelve al burger JUSTO DESPUÉS de ese close: mientras el
          // diálogo es modal el resto de la página está inerte y `focus()` no
          // hace nada (mismo orden que documenta `usePortalModal`).
          onReverseComplete: () => {
            panelRef.current?.close();
            toggleRef.current?.focus({ preventScroll: true });
          },
        })
        // El panel se prende de una: lo que se ve entrar es la cortina, no un
        // fundido. (Un tween mínimo y no un `set`: en la reversa tiene que
        // volver a apagarse, y un `set` en el instante 0 no siempre lo hace.)
        .to(panel, { autoAlpha: 1, duration: 0.01 })
        .fromTo("[data-mnav-velo]", { opacity: 0 }, { opacity: 1, ...cortina }, 0)
        .fromTo("[data-mnav-cortina]", { xPercent: 100 }, { xPercent: 0, ...cortina }, 0)
        .fromTo("[data-mnav-contenido]", { xPercent: -50 }, { xPercent: 0, ...cortina }, 0);
    }, panel);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, [hydrated, reduced, panelRef, toggleRef]);

  // Play/reverse del panel + manejo de foco al abrir/cerrar.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) {
      if (open) {
        // showModal antes de animar: recién ahí el panel existe en el top
        // layer y puede recibir el foco.
        if (!panel.open) panel.showModal();
        if (reduced) gsap.set(panel, { autoAlpha: 1 });
        else tlRef.current?.play();
      } else if (panel.open) {
        if (reduced || !tlRef.current) {
          gsap.set(panel, { autoAlpha: 0 });
          panel.close();
          // Sin timeline no hay onReverseComplete: el foco vuelve acá, también
          // después del close.
          toggleRef.current?.focus({ preventScroll: true });
        } else {
          tlRef.current.reverse(); // el close() lo hace onReverseComplete
        }
      } else {
        // Ya lo cerró el navegador por su cuenta (ver `onClose` en MobileNav):
        // la timeline quedó al final y hay que rebobinarla, o la próxima
        // apertura arrancaría con la cortina ya puesta.
        tlRef.current?.pause(0);
      }
    }
    // Foco al ABRIR: a la X, y DIFERIDO dos frames, porque el panel arranca
    // en `autoAlpha: 0` (visibility hidden) y un elemento invisible no puede
    // recibir foco (lo mismo que documenta el overlay del equipo). Para cuando
    // la timeline pintó su primer frame, la X ya es enfocable. `preventScroll`
    // porque a esa altura la X todavía viaja con la cortina, fuera de pantalla:
    // sin él, el navegador scrollea lo que haga falta para traerla a la vista.
    //
    // El foco al CERRAR no vive acá: va pegado al `close()` (arriba y en el
    // onReverseComplete). Si se restaurara en este efecto, correría con el
    // diálogo todavía abierto —y por lo tanto no haría nada—, y además le
    // robaría el foco a cualquiera cada vez que el efecto se re-corre con el
    // menú cerrado (basta que la persona cambie `prefers-reduced-motion`, que
    // `useReducedMotion` escucha en vivo).
    let raf = 0;
    if (open) {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [open, reduced, panelRef, toggleRef, closeRef]);
}
