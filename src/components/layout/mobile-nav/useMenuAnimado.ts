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

      const items = panel.querySelectorAll("[data-mnav-item]");
      const cta = panel.querySelector("[data-mnav-cta]");
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
        .to(panel, { autoAlpha: 1, duration: 0.3, ease: "power2.out" })
        .from(
          items,
          {
            autoAlpha: 0,
            y: 20,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.06,
          },
          "<0.05",
        )
        .from(
          cta,
          { autoAlpha: 0, y: 14, duration: 0.45, ease: "power3.out" },
          "<0.12",
        );
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
      }
    }
    // Foco al ABRIR: a la X, y DIFERIDO dos frames, porque el panel arranca
    // en `autoAlpha: 0` (visibility hidden) y un elemento invisible no puede
    // recibir foco (lo mismo que documenta el overlay del equipo). Para cuando
    // la timeline pintó su primer frame, la X ya es enfocable.
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
        raf = requestAnimationFrame(() => closeRef.current?.focus());
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [open, reduced, panelRef, toggleRef, closeRef]);
}
