import { useRouter } from "next/navigation";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { borrarAliado } from "@/datos/acciones/aliados";
import { descartarCambiosDeAliado, despublicarAliado } from "@/datos/acciones/ciclo-de-aliados";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";
import { SIN_RED, type PendienteDelAliado } from "./useGuardarAliado";

type Opciones = {
  estado: EstadoDelAliado;
  setEstado: (cambio: (e: EstadoDelAliado) => EstadoDelAliado) => void;
  setAviso: (aviso: AvisoDelEditor | null) => void;
  setPendiente: (p: PendienteDelAliado) => void;
  /** Lo que la ficha hace al descartar: vuelve a lo publicado. */
  alDescartarse: () => void;
  soltarSalida: () => void;
};

/**
 * Lo que saca un aliado de la tira o deshace sus cambios (SPEC §6 de
 * `work/casos-aliados-fotos/`): despublicar, descartar y borrar. Contestan
 * con un aviso, nunca tiran; borrar, hecho, vuelve a la lista.
 */
export function useSalidaDelAliado(o: Opciones) {
  const router = useRouter();

  const despublicar = async (id: string) => {
    o.setPendiente("despublicar");
    try {
      const r = await despublicarAliado({ id, borradorEnVisto: o.estado.borradorEn });
      o.setAviso(r);
      if (r.ok) o.setEstado((e) => ({ ...e, publicado: false }));
    } catch {
      o.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      o.setPendiente(null);
    }
  };

  const descartar = async (id: string) => {
    o.setPendiente("descartar");
    try {
      const r = await descartarCambiosDeAliado({ id, borradorEnVisto: o.estado.borradorEn });
      o.setAviso(r);
      if (!r.ok) return;
      o.setEstado((e) => ({ ...e, borradorEn: null, borradorPor: null }));
      o.alDescartarse();
    } catch {
      o.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      o.setPendiente(null);
    }
  };

  const borrar = async (id: string) => {
    o.setPendiente("borrar");
    try {
      const r = await borrarAliado({ id, borradorEnVisto: o.estado.borradorEn });
      if (!r.ok) return o.setAviso(r);
      // Se va a propósito: sin esto, la ficha preguntaría por lo que no se guardó de algo que ya no existe.
      o.soltarSalida();
      router.push("/admin/contenido/aliados?borrado=1");
    } catch {
      o.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      o.setPendiente(null);
    }
  };

  return { despublicar, descartar, borrar };
}
