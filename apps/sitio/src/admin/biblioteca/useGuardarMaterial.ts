import { useState } from "react";
import type { AvisoDelEditor } from "@ed/kit-admin";
import { crearMaterial, guardarMaterial } from "@/datos/acciones/materiales";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-material";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import type { ErrorDeCampo } from "@/lib/contenido/errores";

/** Lo que corre en la ficha, o nada: la que corre muestra su progreso y las demás esperan. */
export type Pendiente = "guardar" | "vista-previa" | "publicar" | "ocultar" | "descartar" | "borrar" | null;

export const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

type Opciones = {
  idInicial: string | null;
  estadoInicial: EstadoDeLaFicha;
  /** El aviso con que abre la ficha, si trae uno. */
  avisoInicial?: AvisoDelEditor;
  /** Marca cada campo que no pasa y lleva el foco al primero. */
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
};

/**
 * Guardar un material y lo que la ficha sabe de él: su id (no hay hasta el
 * primer guardado), su estado, el aviso de la última acción y lo que corre.
 * El primer guardado de `/nuevo` crea la fila y la dirección pasa a
 * `/admin/biblioteca/[id]` sin recargar, con lo escrito en pantalla. Cada
 * guardado lleva el `borradorEn` que vio (el aviso de choque).
 */
export function useGuardarMaterial({ idInicial, estadoInicial, avisoInicial, mostrarErrores }: Opciones) {
  const [id, setId] = useState(idInicial);
  const [estado, setEstado] = useState(() => estadoInicial); // Perezoso: no es una copia del prop (no-derived-useState).
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(() => avisoInicial ?? null);
  const [pendiente, setPendiente] = useState<Pendiente>(null);

  /** Guarda el documento. Da el id y el `borradorEn` que quedaron, o `false` si no se pudo (y ya avisó). */
  async function guardarDocumento(documento: BorradorDeMaterial): Promise<{ id: string; borradorEn: string } | false> {
    const r = id ? await guardarMaterial({ id, contenido: documento, borradorEnVisto: estado.borradorEn }) : await crearMaterial({ contenido: documento });
    if (!r.ok) {
      if (r.errores?.length) mostrarErrores(r.errores);
      setAviso(r);
      return false;
    }
    setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    if (!id) {
      setId(r.id);
      // La URL del material, sin recargar ni perder lo que hay en pantalla: el router de Next la sigue.
      window.history.replaceState(null, "", `/admin/biblioteca/${r.id}`);
    }
    return { id: r.id, borradorEn: r.borradorEn };
  }

  return { id, estado, setEstado, aviso, setAviso, pendiente, setPendiente, guardarDocumento };
}
