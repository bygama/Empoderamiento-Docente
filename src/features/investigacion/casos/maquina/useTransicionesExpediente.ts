import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { aperturaLugar, switchEntrada, transicionCierre } from "../coreografia";
import type { Maquina } from "./useLugarExpediente";

/**
 * Las tres transiciones del lugar, como layout effects en este orden:
 * entrada del expediente (opening / switching), cierre y foco al volver al
 * índice. Las timelines viven en coreografia.ts.
 */
export function useTransicionesExpediente(m: Maquina, cerrar: () => void) {
  const { activo, estado, reduced, setEstado, setActivo, registrar } = m;
  const { sectionRef, lugarRef, shellRef, tituloRef, introRef, itemsRef, botonesRef } = m;
  const { estadoRef, ultimaAbiertaRef, regresoPendienteRef, cierrePendienteRef, ghostRef } = m;
  const { alinearConSeccion, detenerScroll, reanudarScroll } = m;

  /* ── Entrada del expediente (tras abrir o cambiar de caso) ────────── */
  useIsomorphicLayoutEffect(() => {
    if (activo === null) return;
    const lugar = lugarRef.current;
    const shell = shellRef.current;
    const fase = estadoRef.current;
    const finalizar = () => {
      // La página queda CONGELADA debajo del lugar (Lenis detenido): el
      // scroll del expediente vive en su propia capa.
      detenerScroll();
      setEstado("open");
      // Sin ScrollTrigger.refresh() acá: era global (toda la página, ~80 ms
      // medidos) y redundante. Los triggers del expediente se miden al
      // crearse —su scroller es la capa fija, que no se mueve— y el
      // corrimiento de la página por el índice que se desmonta lo detecta el
      // ResizeObserver de LenisProvider, que refresca cuando el alto se
      // asienta.
      tituloRef.current?.focus({ preventScroll: true });
      // Back presionado a mitad de la transición: cerrar recién ahora.
      if (cierrePendienteRef.current) {
        cierrePendienteRef.current = false;
        cerrar();
      }
    };
    if (reduced || !lugar || !shell || (fase !== "opening" && fase !== "switching")) {
      finalizar();
      return;
    }
    if (fase === "opening") {
      const i = ultimaAbiertaRef.current ?? 0;
      const li = itemsRef.current[i];
      const hoja = lugar.querySelector<HTMLElement>("[data-exp-hoja]");
      if (!li || !hoja) {
        gsap.set(shell, { autoAlpha: 1 });
        finalizar();
        return;
      }
      // UNA sola timeline: pre-paint por piezas + física de la carpeta +
      // nacimiento del lugar en paralelo + morph medido. (Sin desplazar:
      // la hoja destino vive en la capa fija; mover la página correría a
      // la carpeta de origen y rompería el aterrizaje.)
      aperturaLugar({
        registrar,
        li,
        otrasArriba: itemsRef.current.filter(
          (el, j): el is HTMLLIElement => j < i && el !== null,
        ),
        otrasAbajo: itemsRef.current.filter(
          (el, j): el is HTMLLIElement => j > i && el !== null,
        ),
        introEls: introRef.current ? [introRef.current] : [],
        shell,
        hoja,
        lugar,
        onFin: finalizar,
      });
    } else {
      // Pre-paint del switch: el lugar nuevo monta invisible; si hay ghost
      // de la banda, aterriza sobre la geometría real del shell.
      gsap.set(shell, { autoAlpha: 0 });
      gsap.set(
        lugar.querySelectorAll("[data-exp-entrada],[data-exp-tab-lateral]"),
        { autoAlpha: 0 },
      );
      const ghost = ghostRef.current;
      ghostRef.current = null;
      switchEntrada({ registrar, lugar, shell, ghost, onFin: finalizar });
    }

  }, [activo]);

  /* ── Cierre: el expediente vuelve al cajón, el archivo se re-apila ── */
  useIsomorphicLayoutEffect(() => {
    if (estado !== "closing") return;
    const section = sectionRef.current;
    const shell = shellRef.current;
    const items = itemsRef.current.filter((el): el is HTMLLIElement => el !== null);
    const alTerminar = () => {
      reanudarScroll();
      regresoPendienteRef.current = true;
      setActivo(null);
      setEstado("index");
    };
    if (!section || !shell || !items.length) {
      alTerminar();
      return;
    }
    // Pre-paint: el índice recién montado arranca oculto Y la página se
    // alinea con la sección de forma instantánea — todo antes del primer
    // paint, con el telón recién transparentado: el reflow no se ve.
    const introEls = introRef.current ? [introRef.current] : [];
    gsap.set(items, { autoAlpha: 0 });
    if (introEls.length) gsap.set(introEls, { autoAlpha: 0 });
    alinearConSeccion(72);
    transicionCierre({
      registrar,
      shell,
      items,
      introEls,
      lugar: lugarRef.current ?? undefined,
      liDestino: itemsRef.current[ultimaAbiertaRef.current ?? 0] ?? null,
      onFin: alTerminar,
    });

  }, [estado]);

  /* ── Al volver al índice: foco en la carpeta que estaba abierta ───── */
  useIsomorphicLayoutEffect(() => {
    if (activo !== null || estado !== "index" || !regresoPendienteRef.current) return;
    regresoPendienteRef.current = false;
    const ultima = ultimaAbiertaRef.current;
    if (ultima === null) return;
    // Con reduced-motion el focus repone el viewport (el documento se
    // acortó de golpe); con motion el scroll del cierre ya está alineado.
    if (reduced) {
      botonesRef.current[ultima]?.focus();
    } else {
      botonesRef.current[ultima]?.focus({ preventScroll: true });
    }

  }, [activo, estado]);
}
