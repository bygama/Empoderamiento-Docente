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
  const firstFocusRun = useRef(true);

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
          // pintado mientras la reversa corre (un dialog cerrado no se ve).
          onReverseComplete: () => panelRef.current?.close(),
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
  }, [hydrated, reduced, panelRef]);

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
        } else {
          tlRef.current.reverse(); // el close() lo hace onReverseComplete
        }
      }
    }
    // Foco: al abrir, a la X; al cerrar, de vuelta al botón hamburguesa. Se
    // saltea la PRIMERA corrida (montaje) para no robar el foco al cargar.
    //
    // Al abrir va DIFERIDO dos frames: el panel arranca en `autoAlpha: 0`, o
    // sea visibility hidden, y un elemento invisible no puede recibir foco
    // (lo mismo que documenta el overlay del equipo). Para cuando la timeline
    // pintó su primer frame, la X ya es enfocable.
    let raf = 0;
    if (firstFocusRun.current) {
      firstFocusRun.current = false;
    } else if (open) {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => closeRef.current?.focus());
      });
    } else {
      toggleRef.current?.focus({ preventScroll: true });
    }
    return () => cancelAnimationFrame(raf);
  }, [open, reduced, panelRef, toggleRef, closeRef]);
}
