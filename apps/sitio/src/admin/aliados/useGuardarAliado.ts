import { useState } from "react";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { crearAliado, guardarAliado } from "@/datos/acciones/aliados";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";
import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import type { ErrorDeCampo } from "@/lib/contenido/errores";

/** Lo que corre en la ficha, o nada: la que corre muestra su progreso y las demás esperan. */
export type PendienteDelAliado = "guardar" | "vista-previa" | "publicar" | "despublicar" | "descartar" | "borrar" | null;

export const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

type Opciones = {
  idInicial: string | null;
  estadoInicial: EstadoDelAliado;
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
};

/**
 * Guardar un aliado y lo que la ficha sabe de él: su id (no hay hasta el
 * primer guardado), su estado, el aviso de la última acción y lo que corre,
 * como en una novedad. El primer guardado de `/nuevo` crea la fila y la
 * dirección pasa a `/admin/contenido/aliados/[id]` sin recargar.
 */
export function useGuardarAliado({ idInicial, estadoInicial, mostrarErrores }: Opciones) {
  const [id, setId] = useState(idInicial);
  const [estado, setEstado] = useState(() => estadoInicial); // Perezoso: no es una copia del prop.
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<PendienteDelAliado>(null);

  /** Guarda el documento. Da el id y el `borradorEn` que quedaron, o `false` si no se pudo (y ya avisó). */
  async function guardarDocumento(documento: BorradorDeAliado): Promise<{ id: string; borradorEn: string } | false> {
    const r = id ? await guardarAliado({ id, contenido: documento, borradorEnVisto: estado.borradorEn }) : await crearAliado({ contenido: documento });
    if (!r.ok) {
      if (r.errores?.length) mostrarErrores(r.errores);
      setAviso(r);
      return false;
    }
    setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    if (!id) {
      setId(r.id);
      // La URL del aliado, sin recargar ni perder lo que hay en pantalla: el router de Next la sigue.
      window.history.replaceState(null, "", `/admin/contenido/aliados/${r.id}`);
    }
    return { id: r.id, borradorEn: r.borradorEn };
  }

  return { id, estado, setEstado, aviso, setAviso, pendiente, setPendiente, guardarDocumento };
}
