import { createElement } from "react";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { VistaPreviaFrenada } from "@/admin/armazon/VistaPreviaFrenada";
import { publicarPersona } from "@/datos/acciones/ciclo-de-equipo";
import { abrirVistaPreviaDePersona } from "@/datos/acciones/vista-previa";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-persona";
import type { ErrorDeCampo } from "@/lib/contenido/errores";
import { SIN_RED, type Pendiente } from "./useGuardarPerfil";

/** Lo que corre antes de publicar o de ver el borrador: guardar lo que haya en pantalla. Da el id y el `borradorEn`, o `false` (y ya avisó). */
type Preparar = () => Promise<{ id: string; borradorEn: string | null } | false>;

type Opciones = {
  setEstado: (cambio: (e: EstadoDeLaFicha) => EstadoDeLaFicha) => void;
  setAviso: (aviso: AvisoDelEditor | null) => void;
  setPendiente: (p: Pendiente) => void;
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
  preparar: Preparar;
  /** Si está publicado así y no hay nada nuevo: publicar solo lo dice. */
  nadaParaPublicar: boolean;
  /** Lo que la ficha hace al publicarse: lo publicado pasa a ser lo de pantalla. */
  alPublicarse: () => void;
};

/**
 * Ver el borrador y publicar desde la ficha de un perfil (SPEC §6.1 de
 * `work/equipo/`); despublicar, descartar y borrar están en
 * useSalidaDelPerfil.ts. Contestan con un aviso, nunca tiran, y guardan antes
 * lo que hay en pantalla: nadie publica algo distinto de lo que ve.
 */
export function usePublicarPerfil(o: Opciones) {
  const sinRed = () => o.setAviso({ ok: false, detalle: SIN_RED });

  const verBorrador = async () => {
    // Se abre en el gesto del clic, antes de todo `await` (después el navegador la bloquea).
    const pestana = window.open("", "_blank");
    o.setPendiente("vista-previa");
    try {
      const listo = await o.preparar();
      const r = listo ? await abrirVistaPreviaDePersona(listo.id) : null;
      if (!r?.ok) {
        pestana?.close();
        if (r) o.setAviso(r);
        return;
      }
      if (pestana) pestana.location.href = r.url;
      o.setAviso({ ok: true, detalle: pestana ? "La vista previa se abrió en otra pestaña." : createElement(VistaPreviaFrenada, { url: r.url }) });
    } catch {
      pestana?.close();
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  const publicar = async () => {
    if (o.nadaParaPublicar) return o.setAviso({ ok: true, detalle: "El perfil ya está publicado así." });
    o.setPendiente("publicar");
    try {
      const listo = await o.preparar();
      if (!listo) return;
      const r = await publicarPersona({ id: listo.id, borradorEnVisto: listo.borradorEn });
      if (!r.ok && r.errores?.length) o.mostrarErrores(r.errores);
      o.setAviso(r);
      if (!r.ok) return;
      o.setEstado(() => ({ publicado: true, publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor, borradorEn: null, borradorPor: null }));
      o.alPublicarse();
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  return { verBorrador, publicar };
}
