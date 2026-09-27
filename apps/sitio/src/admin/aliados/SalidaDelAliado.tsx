"use client";

import { useState } from "react";
import { Boton } from "@ed/kit-admin";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { FilaDeAccion } from "@/admin/armazon/FilaDeAccion";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";
import type { PendienteDelAliado } from "./useGuardarAliado";

type Props = {
  nombre: string;
  estado: EstadoDelAliado;
  pendiente: PendienteDelAliado;
  alDescartar: () => void;
  alDespublicar: () => void;
  alBorrar: () => void;
};

/**
 * Lo que deshace un aliado o lo saca de la tira (DESIGN.md §11, «Ficha de una
 * entidad»), al pie: descartar los cambios y borrar confirman en el lugar;
 * despublicar no, porque volver a publicar es un clic.
 */
export function SalidaDelAliado({ nombre, estado, pendiente, alDescartar, alDespublicar, alBorrar }: Props) {
  const [confirmando, setConfirmando] = useState<"descartar" | "borrar" | null>(null);
  const corriendo = pendiente !== null;
  return (
    <section aria-labelledby="bloque-salida" className="space-y-2">
      <h2 id="bloque-salida" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Deshacer o sacar del sitio
      </h2>
      <ul className="divide-y divide-azul-claro/60">
        {estado.publicadoEn && estado.borradorEn ? (
          <FilaDeAccion titulo="Descartar los cambios" consecuencia="Vuelve a lo que está publicado. Lo que se guardó como borrador desde entonces se pierde.">
            {confirmando === "descartar" ? (
              <Confirmacion
                pregunta="¿Descartar los cambios sin publicar? No se puede deshacer."
                confirmar="Sí, descartar"
                corriendo={pendiente === "descartar" ? "Descartando…" : null}
                alConfirmar={alDescartar}
                alCancelar={() => setConfirmando(null)}
              />
            ) : (
              <Boton variante="destructivo" disabled={corriendo} onClick={() => setConfirmando("descartar")}>
                Descartar cambios
              </Boton>
            )}
          </FilaDeAccion>
        ) : null}
        {estado.publicado ? (
          <FilaDeAccion titulo="Despublicar" consecuencia="El logo deja de estar en la tira. Volver a publicarlo es un clic.">
            <Boton variante="secundario" disabled={corriendo} aria-busy={pendiente === "despublicar" || undefined} onClick={alDespublicar}>
              {pendiente === "despublicar" ? "Despublicando…" : "Despublicar"}
            </Boton>
          </FilaDeAccion>
        ) : null}
        <FilaDeAccion titulo="Borrar" consecuencia="Se borra para siempre: si estaba en la tira, deja de verse. El logo queda en Fotos.">
          {confirmando === "borrar" ? (
            <Confirmacion
              pregunta={`¿Borrar a «${nombre}» para siempre? No se puede deshacer.`}
              confirmar="Sí, borrar"
              corriendo={pendiente === "borrar" ? "Borrando…" : null}
              alConfirmar={alBorrar}
              alCancelar={() => setConfirmando(null)}
            />
          ) : (
            <Boton variante="destructivo" disabled={corriendo} onClick={() => setConfirmando("borrar")}>
              Borrar el aliado
            </Boton>
          )}
        </FilaDeAccion>
      </ul>
    </section>
  );
}
