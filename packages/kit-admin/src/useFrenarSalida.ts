import { useEffect, useRef } from "react";

const PREGUNTA = "Tenés cambios sin guardar. Si salís ahora, se pierden. ¿Salir igual?";

/** Un clic que navega a otra pantalla del admin: ni una sección de esta misma, ni otra pestaña, ni una descarga. */
function saleDeLaPantalla(e: MouseEvent): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const enlace = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!(enlace instanceof HTMLAnchorElement) || enlace.target === "_blank" || enlace.hasAttribute("download")) return false;
  const destino = new URL(enlace.href, window.location.href);
  // Otro sitio: lo frena `beforeunload`, que es una navegación completa.
  if (destino.origin !== window.location.origin) return false;
  return destino.pathname !== window.location.pathname || destino.search !== window.location.search;
}

/**
 * Mientras `activo`, frena la salida del editor: `beforeunload` al cerrar o
 * recargar, y un `confirm` al tocar un link que va a otra pantalla (Next no
 * avisa al navegar adentro de la app). El clic se escucha en la fase de
 * captura del `document`, antes que el `Link`: si la respuesta es no, el
 * `Link` ni se entera.
 *
 * Devuelve `soltar`, para cuando el propio editor sale a propósito (descartar
 * recarga la página): sin eso preguntaría dos veces.
 */
export function useFrenarSalida(activo: boolean) {
  const suelto = useRef(false);
  useEffect(() => {
    if (!activo) return;
    const alCerrar = (e: BeforeUnloadEvent) => {
      if (suelto.current) return;
      e.preventDefault();
      // Los navegadores que todavía no leen `preventDefault` acá piden esto.
      e.returnValue = "";
    };
    const alClic = (e: MouseEvent) => {
      if (suelto.current || !saleDeLaPantalla(e)) return;
      if (window.confirm(PREGUNTA)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("beforeunload", alCerrar);
    document.addEventListener("click", alClic, true);
    return () => {
      window.removeEventListener("beforeunload", alCerrar);
      document.removeEventListener("click", alClic, true);
    };
  }, [activo]);
  return () => {
    suelto.current = true;
  };
}
