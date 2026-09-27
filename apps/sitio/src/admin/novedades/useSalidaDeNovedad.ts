import { useRouter } from "next/navigation";
import type { AvisoDelEditor } from "@ed/kit-admin";
import { descartarCambiosDeNovedad, despublicarNovedad } from "@/datos/acciones/ciclo-de-novedades";
import { borrarNovedad } from "@/datos/acciones/novedades";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-novedad";
import { SIN_RED, type Pendiente } from "./useGuardarNovedad";

type Opciones = {
  estado: EstadoDeLaFicha;
  setEstado: (cambio: (e: EstadoDeLaFicha) => EstadoDeLaFicha) => void;
  setAviso: (aviso: AvisoDelEditor | null) => void;
  setPendiente: (p: Pendiente) => void;
  /** Lo que la ficha hace al descartar: vuelve a lo publicado. */
  alDescartarse: () => void;
  soltarSalida: () => void;
};

/**
 * Lo que saca una novedad del sitio o deshace sus cambios (SPEC §5.3 de
 * `work/novedades-y-kit/`): despublicar, descartar los cambios y borrar.
 * Contestan con un aviso, nunca tiran; borrar, hecho, vuelve a la lista.
 */
export function useSalidaDeNovedad(o: Opciones) {
  const router = useRouter();
  const sinRed = () => o.setAviso({ ok: false, detalle: SIN_RED });

  const despublicar = async (id: string) => {
    o.setPendiente("despublicar");
    try {
      const r = await despublicarNovedad({ id, borradorEnVisto: o.estado.borradorEn });
      o.setAviso(r);
      if (r.ok) o.setEstado((e) => ({ ...e, publicada: false }));
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  const descartar = async (id: string) => {
    o.setPendiente("descartar");
    try {
      const r = await descartarCambiosDeNovedad({ id, borradorEnVisto: o.estado.borradorEn });
      o.setAviso(r);
      if (!r.ok) return;
      o.setEstado((e) => ({ ...e, borradorEn: null, borradorPor: null }));
      o.alDescartarse();
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  const borrar = async (id: string) => {
    o.setPendiente("borrar");
    try {
      const r = await borrarNovedad({ id, borradorEnVisto: o.estado.borradorEn });
      if (!r.ok) return o.setAviso(r);
      // Se va a propósito: sin esto, la ficha preguntaría por lo que no se guardó de algo que ya no existe.
      o.soltarSalida();
      router.push(`${o.estado.publicada ? "/admin/novedades" : "/admin/novedades/borradores"}?borrada=1`);
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  return { despublicar, descartar, borrar };
}
