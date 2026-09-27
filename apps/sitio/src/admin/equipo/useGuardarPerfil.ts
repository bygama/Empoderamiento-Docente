import { useState } from "react";
import type { AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { crearPersona, guardarPersona } from "@/datos/acciones/equipo";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-persona";
import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
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
 * Guardar un perfil y lo que la ficha sabe de él: su id (no hay hasta el
 * primer guardado), su estado, el aviso de la última acción y lo que corre,
 * como la ficha de un material. El primer guardado de `/nuevo` crea la fila y
 * la dirección pasa a `/admin/contenido/equipo/[id]` sin recargar. Cada
 * guardado lleva el `borradorEn` que vio (el aviso de choque).
 */
export function useGuardarPerfil({ idInicial, estadoInicial, mostrarErrores }: Opciones) {
  const [id, setId] = useState(idInicial);
  const [estado, setEstado] = useState(() => estadoInicial); // Perezoso: no es una copia del prop (no-derived-useState).
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<Pendiente>(null);

  /** Guarda el documento. Da el id y el `borradorEn` que quedaron, o `false` si no se pudo (y ya avisó). */
  async function guardarDocumento(documento: BorradorDePersona): Promise<{ id: string; borradorEn: string } | false> {
    const r = id ? await guardarPersona({ id, contenido: documento, borradorEnVisto: estado.borradorEn }) : await crearPersona({ contenido: documento });
    if (!r.ok) {
      if (r.errores?.length) mostrarErrores(r.errores);
      setAviso(r);
      return false;
    }
    setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    if (!id) {
      setId(r.id);
      // La URL del perfil, sin recargar ni perder lo que hay en pantalla: el router de Next la sigue.
      window.history.replaceState(null, "", `/admin/contenido/equipo/${r.id}`);
    }
    return { id: r.id, borradorEn: r.borradorEn };
  }

  return { id, estado, setEstado, aviso, setAviso, pendiente, setPendiente, guardarDocumento };
}
