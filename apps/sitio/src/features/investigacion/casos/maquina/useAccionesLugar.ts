import gsap from "gsap";
import { CASOS } from "../data";
import { switchSalida } from "../coreografia";
import type { Maquina } from "./useLugarExpediente";

/** Las acciones del archivo: abrir, cerrar (y pedir el cierre) e ir a otro caso. */
export function useAccionesLugar(m: Maquina) {
  // Desestructurado: el compilador de React trata a `m` como valor congelado
  // (llamar `m.x()` o escribir `m.xRef.current` sería «modificarlo»).
  const { activo, reduced, setEstado, setActivo, setAnuncio, setIntroRevelado } = m;
  const { estadoRef, itemsRef, shellRef, lugarRef, ghostRef } = m;
  const { ultimaAbiertaRef, entradaHechaRef, regresoPendienteRef, historialRef } = m;
  const { registrar, detenerScroll, reanudarScroll } = m;

  const abrir = (i: number, desdeUrl = false) => {
    if (estadoRef.current !== "index") return;
    ultimaAbiertaRef.current = i;
    entradaHechaRef.current = true;
    setIntroRevelado(true);
    setEstado("opening");
    setAnuncio(`Expediente abierto. Caso ${CASOS[i].numero}: ${CASOS[i].pregunta}`);
    // Entrada en el historial: el lugar se comporta como página nueva y el
    // botón «atrás» del navegador lo cierra (popstate → cerrar). Si se llegó
    // por link directo, la URL ya trae el hash: no se suma otra entrada.
    if (desdeUrl) {
      historialRef.current = false;
    } else {
      try {
        window.history.pushState({ edExpediente: CASOS[i].id }, "", `#${CASOS[i].slug}`);
        historialRef.current = true;
      } catch {
        historialRef.current = false;
      }
    }
    const li = itemsRef.current[i];
    if (reduced || !li) {
      setActivo(i);
      return;
    }
    detenerScroll();
    // Si la entrada del índice sigue en vuelo (click muy temprano), no
    // puede quedar peleándole las mismas propiedades a la apertura.
    itemsRef.current.forEach((el) => el && gsap.killTweensOf(el));
    // El expediente monta YA (oculto por piezas): la apertura es UNA sola
    // timeline y el lugar nace mientras la carpeta viaja (aperturaLugar,
    // disparada por el efecto de entrada con estado "opening").
    setActivo(i);
  };

  // Plain, como abrir e irA: nadie depende de su identidad (los listeners de
  // Escape y popstate son effect events).
  const cerrar = () => {
    if (estadoRef.current !== "open") return;
    setAnuncio("Expediente cerrado. Índice de casos de investigación.");
    // Si el hash quedó en la URL (llegada por link directo, sin entrada
    // propia en el historial), se saca para que la dirección vuelva a ser
    // la de la página.
    if (!historialRef.current && window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
    if (reduced) {
      regresoPendienteRef.current = true;
      reanudarScroll();
      setActivo(null);
      setEstado("index");
      return;
    }
    detenerScroll();
    setEstado("closing");
  };

  /** Cierre pedido por la UI (botones, banda, Escape): si la apertura
   *  registró historial, se cierra consumiéndolo — history.back() dispara
   *  popstate → cerrar(). Así el estado del navegador nunca se desfasa. */
  const solicitarCierre = () => {
    if (historialRef.current) {
      window.history.back();
      return;
    }
    cerrar();
  };

  const irA = (j: number, desdeBanda = false) => {
    if (estadoRef.current !== "open" || j === activo) return;
    ultimaAbiertaRef.current = j;
    setEstado("switching");
    setAnuncio(`Expediente abierto. Caso ${CASOS[j].numero}: ${CASOS[j].pregunta}`);
    if (historialRef.current) {
      try {
        window.history.replaceState(
          { edExpediente: CASOS[j].id },
          "",
          `#${CASOS[j].slug}`,
        );
      } catch {
        /* sin historial no hay nada que sincronizar */
      }
    }
    const shell = shellRef.current;
    const lugar = lugarRef.current;
    if (reduced || !shell || !lugar) {
      setActivo(j);
      return;
    }
    // Desde la banda «siguiente», la banda misma sube como ghost y se
    // convierte en la carcasa nueva (aterriza en switchEntrada).
    ghostRef.current?.remove();
    ghostRef.current = switchSalida({
      registrar,
      lugar,
      shell,
      desdeBanda,
      onListo: () => setActivo(j),
    });
  };

  return { abrir, cerrar, solicitarCierre, irA };
}
