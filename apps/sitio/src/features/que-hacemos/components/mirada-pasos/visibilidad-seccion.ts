import gsap from "gsap";

/**
 * Prende y apaga la sección entera en el relevo con el faro.
 *
 * Prender es SECO: pasa donde el faro ya está blanco pleno, blanco sobre
 * blanco, y no se ve. Apagar al salir por arriba es un FUNDIDO (el usuario,
 * 2026-09-11: «que sea smooth»): la sección ya no está pineada y baja con la
 * página mientras se va, pero lo único que se ve resbalar son el título y
 * las cards sobre blanco, y medio segundo alcanza. Quien apaga suave pasa
 * qué hacer al terminar (rebobinar la entrada): hacerlo antes dejaría el
 * contenido invisible de golpe.
 *
 * Apagada no atrapa el mouse: el CTA del faro está debajo.
 */
export function crearVisibilidadSeccion(root: HTMLElement) {
  let fundido: gsap.core.Tween | null = null;

  const mostrar = (visible: boolean) => {
    fundido?.kill();
    fundido = null;
    root.style.opacity = visible ? "1" : "0";
    root.style.pointerEvents = visible ? "" : "none";
  };

  const apagarSuave = (alTerminar: () => void) => {
    fundido?.kill();
    root.style.pointerEvents = "none";
    fundido = gsap.to(root, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        fundido = null;
        alTerminar();
      },
    });
  };

  const limpiar = () => {
    fundido?.kill();
    fundido = null;
    root.style.opacity = "";
    root.style.pointerEvents = "";
  };

  return { mostrar, apagarSuave, limpiar };
}
