import { useState } from "react";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { crearNovedad, guardarNovedad } from "@/datos/acciones/novedades";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-novedad";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import type { ErrorDeCampo } from "@/lib/contenido/errores";

/** Lo que corre en la ficha, o nada: la que corre muestra su progreso y las demás esperan. */
export type Pendiente = "guardar" | "vista-previa" | "publicar" | "despublicar" | "descartar" | "borrar" | null;

export const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

type Opciones = {
  idInicial: string | null;
  estadoInicial: EstadoDeLaFicha;
  /** Marca cada campo que no pasa y lleva el foco al primero. */
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
};

/**
 * Guardar una novedad y lo que la ficha sabe de ella: su id (no hay hasta el
 * primer guardado), su estado, el aviso de la última acción y lo que corre.
 * El primer guardado de `/nueva` crea la fila y la dirección pasa a
 * `/admin/novedades/[id]` sin recargar, con lo escrito en pantalla. Cada
 * guardado lleva el `borradorEn` que vio (el aviso de choque).
 */
export function useGuardarNovedad({ idInicial, estadoInicial, mostrarErrores }: Opciones) {
  const [id, setId] = useState(idInicial);
  const [estado, setEstado] = useState(() => estadoInicial); // Perezoso: no es una copia del prop (no-derived-useState).
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<Pendiente>(null);

  /** Guarda el documento. Da el id y el `borradorEn` que quedaron, o `false` si no se pudo (y ya avisó). */
  async function guardarDocumento(documento: BorradorDeNovedad): Promise<{ id: string; borradorEn: string } | false> {
    const r = id ? await guardarNovedad({ id, contenido: documento, borradorEnVisto: estado.borradorEn }) : await crearNovedad({ contenido: documento });
    if (!r.ok) {
      if (r.errores?.length) mostrarErrores(r.errores);
      setAviso(r);
      return false;
    }
    setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    if (!id) {
      setId(r.id);
      // La URL de la novedad, sin recargar ni perder lo que hay en pantalla: el router de Next la sigue.
      window.history.replaceState(null, "", `/admin/novedades/${r.id}`);
    }
    return { id: r.id, borradorEn: r.borradorEn };
  }

  return { id, estado, setEstado, aviso, setAviso, pendiente, setPendiente, guardarDocumento };
}
