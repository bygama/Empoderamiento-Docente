import { createElement, useState } from "react";
import { descartarBorrador, publicar } from "@/datos/acciones/paginas";
import { abrirVistaPrevia } from "@/datos/acciones/vista-previa";
import type { EstadoDePagina } from "@/datos/consultas/editor-de-paginas";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import type { EstadoPendiente } from "./EncabezadoDelEditor";
import { VistaPreviaFrenada } from "./VistaPreviaFrenada";

/** Lo que corre antes de publicar o de abrir el borrador: guardar lo que haya en pantalla. Da el `borradorEn` que quedó, o `false` si no se pudo (y ya avisó). */
export type Preparar = () => Promise<string | null | false>;

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

type Opciones = { slug: string; estadoInicial: EstadoDePagina; haySinGuardar?: boolean; soltarSalida?: () => void; despuesDePublicar?: () => void };

/**
 * Ver el borrador, publicar, descartar y recargar una página, con su estado,
 * su aviso y lo que corre (SPEC §7 de `work/paginas-inicio/`). Las usan el
 * editor —que antes guarda con `preparar`— y las otras pestañas. Contestan
 * con un aviso, nunca tiran. Repiten `setPendiente`/try/finally a mano: un
 * `correr(fn)` compartido es lo que react-doctor marca (no-impure-state-updater).
 */
export function useAccionesDePagina({ slug, estadoInicial, haySinGuardar = false, soltarSalida, despuesDePublicar }: Opciones) {
  const [estado, setEstado] = useState(() => estadoInicial); // Perezoso: no es una copia del prop (no-derived-useState).
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<EstadoPendiente>(null);
  const avisarSinRed = () => setAviso({ ok: false, detalle: SIN_RED });

  /** Recargar tira lo que no está guardado: se pregunta antes, y después no pregunta otra vez al salir. */
  const recargar = () => {
    if (haySinGuardar && !window.confirm("Recargar tira lo que escribiste sin guardar. ¿Recargar igual?")) return;
    soltarSalida?.();
    window.location.reload();
  };

  const verBorrador = async (preparar?: Preparar) => {
    // Se abre en el gesto del clic, antes de todo `await` (después el navegador la bloquea). Sin
    // "noopener": con él, `window.open` da `null` siempre y no se distingue un bloqueo de un éxito.
    const pestana = window.open("", "_blank");
    setPendiente("vista-previa");
    try {
      const r = preparar && (await preparar()) === false ? null : await abrirVistaPrevia(slug);
      if (!r?.ok) {
        pestana?.close();
        if (r) setAviso(r);
        return;
      }
      if (pestana) pestana.location.href = r.url;
      setAviso({ ok: true, detalle: pestana ? "La vista previa se abrió en otra pestaña." : createElement(VistaPreviaFrenada, { url: r.url }) });
    } catch {
      pestana?.close();
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  const publicarAhora = async (preparar?: Preparar) => {
    if (!estado.borradorEn && !haySinGuardar) {
      setAviso({ ok: true, detalle: "La página ya está publicada así." });
      return;
    }
    setPendiente("publicar");
    try {
      // Publica lo que esta pantalla vio: lo recién guardado, o el borrador con el que abrió.
      const visto = preparar ? await preparar() : estado.borradorEn;
      if (visto === false) return;
      const r = await publicar({ slug, borradorEnVisto: visto });
      setAviso(r);
      if (!r.ok) return;
      setEstado({ borradorEn: null, borradorPor: null, publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor });
      despuesDePublicar?.();
    } catch {
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  const descartar = async () => {
    if (!window.confirm("¿Descartar los cambios sin publicar? La página vuelve a lo que está publicado.")) return;
    setPendiente("descartar");
    try {
      const r = await descartarBorrador({ slug, borradorEnVisto: estado.borradorEn });
      if (!r.ok) {
        setAviso(r);
        return;
      }
      // Lo más simple para volver a lo publicado: la pantalla se arma de nuevo. Ya se confirmó.
      soltarSalida?.();
      window.location.reload();
    } catch {
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  return { estado, setEstado, aviso, setAviso, pendiente, setPendiente, avisarSinRed, recargar, verBorrador, publicar: publicarAhora, descartar };
}
