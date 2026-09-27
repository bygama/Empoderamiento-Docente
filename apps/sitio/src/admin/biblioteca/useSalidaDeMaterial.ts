import { useRouter } from "next/navigation";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { descartarCambiosDeMaterial, ocultarMaterial } from "@/datos/acciones/ciclo-de-materiales";
import { borrarMaterial } from "@/datos/acciones/materiales";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-material";
import { SIN_RED, type Pendiente } from "./useGuardarMaterial";

type Opciones = {
  estado: EstadoDeLaFicha;
  setEstado: (cambio: (e: EstadoDeLaFicha) => EstadoDeLaFicha) => void;
  setAviso: (aviso: AvisoDelEditor | null) => void;
  setPendiente: (p: Pendiente) => void;
  /** Lo que la ficha hace al descartar: vuelve a lo publicado. */
  alDescartarse: () => void;
  /** Lo que la ficha hace al ocultarse: si era destacado, deja su lugar. */
  alOcultarse: () => void;
  soltarSalida: () => void;
};

/**
 * Lo que saca un material del sitio o deshace sus cambios (SPEC §7 de
 * `work/biblioteca/`): ocultar, descartar los cambios y borrar. Contestan con
 * un aviso, nunca tiran; borrar, hecho, vuelve a la lista.
 */
export function useSalidaDeMaterial(o: Opciones) {
  const router = useRouter();
  const sinRed = () => o.setAviso({ ok: false, detalle: SIN_RED });

  const ocultar = async (id: string) => {
    o.setPendiente("ocultar");
    try {
      const r = await ocultarMaterial({ id, borradorEnVisto: o.estado.borradorEn });
      o.setAviso(r);
      if (!r.ok) return;
      o.setEstado((e) => ({ ...e, publicado: false }));
      o.alOcultarse();
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  const descartar = async (id: string) => {
    o.setPendiente("descartar");
    try {
      const r = await descartarCambiosDeMaterial({ id, borradorEnVisto: o.estado.borradorEn });
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
      const r = await borrarMaterial({ id, borradorEnVisto: o.estado.borradorEn });
      if (!r.ok) return o.setAviso(r);
      // Se va a propósito: sin esto, la ficha preguntaría por lo que no se guardó de algo que ya no existe.
      o.soltarSalida();
      router.push("/admin/biblioteca?borrado=1");
    } catch {
      sinRed();
    } finally {
      o.setPendiente(null);
    }
  };

  return { ocultar, descartar, borrar };
}
