import { createElement } from "react";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { VistaPreviaFrenada } from "@/admin/armazon/VistaPreviaFrenada";
import { publicarAliado } from "@/datos/acciones/ciclo-de-aliados";
import { abrirVistaPreviaDeAliado } from "@/datos/acciones/vista-previa-de-contenido";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";
import type { ErrorDeCampo } from "@/lib/contenido/errores";
import { SIN_RED, type PendienteDelAliado } from "./useGuardarAliado";

type Opciones = {
  setEstado: (cambio: (e: EstadoDelAliado) => EstadoDelAliado) => void;
  setAviso: (aviso: AvisoDelEditor | null) => void;
  setPendiente: (p: PendienteDelAliado) => void;
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
  /** Guarda lo que haya en pantalla (o crea la fila). Da el id y el `borradorEn`, o `false` (y ya avisó). */
  preparar: () => Promise<{ id: string; borradorEn: string | null } | false>;
  alPublicarse: () => void;
};

/**
 * Ver el borrador y publicar desde la ficha de un aliado (SPEC §6 de
 * `work/casos-aliados-fotos/`); despublicar, descartar y borrar están en
 * useSalidaDelAliado.ts. Contestan con un aviso, nunca tiran, y guardan antes
 * lo que hay en pantalla: nadie publica algo distinto de lo que ve. Repiten el
 * `try` a mano, como las de Novedades.
 */
export function usePublicarAliado(o: Opciones) {
  const verBorrador = async () => {
    // Se abre en el gesto del clic, antes de todo `await` (después el navegador la bloquea).
    const pestana = window.open("", "_blank");
    o.setPendiente("vista-previa");
    try {
      const listo = await o.preparar();
      const r = listo ? await abrirVistaPreviaDeAliado(listo.id) : null;
      if (!r?.ok) {
        pestana?.close();
        if (r) o.setAviso(r);
        return;
      }
      if (pestana) pestana.location.href = r.url;
      o.setAviso({ ok: true, detalle: pestana ? "La vista previa se abrió en otra pestaña: la tira está al pie." : createElement(VistaPreviaFrenada, { url: r.url }) });
    } catch {
      pestana?.close();
      o.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      o.setPendiente(null);
    }
  };

  const publicar = async () => {
    o.setPendiente("publicar");
    try {
      const listo = await o.preparar();
      if (!listo) return;
      const r = await publicarAliado({ id: listo.id, borradorEnVisto: listo.borradorEn });
      if (!r.ok && r.errores?.length) o.mostrarErrores(r.errores);
      o.setAviso(r);
      if (!r.ok) return;
      o.setEstado(() => ({ publicado: true, publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor, borradorEn: null, borradorPor: null }));
      o.alPublicarse();
    } catch {
      o.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      o.setPendiente(null);
    }
  };

  return { verBorrador, publicar };
}
