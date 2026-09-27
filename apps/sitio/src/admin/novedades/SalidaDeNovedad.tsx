"use client";

import { useState } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-novedad";
import type { Pendiente } from "./useGuardarNovedad";

type Props = {
  titulo: string;
  estado: EstadoDeLaFicha;
  pendiente: Pendiente;
  alDescartar: () => void;
  alDespublicar: () => void;
  alBorrar: () => void;
};

/** Una acción con lo que pasa si se toca, a la izquierda, y su botón a la derecha. */
function Accion({ titulo, consecuencia, children }: { titulo: string; consecuencia: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0 max-w-prose">
        <p className="font-medium">{titulo}</p>
        <p className="mt-0.5 text-admin-meta text-gris-texto">{consecuencia}</p>
      </div>
      {children}
    </li>
  );
}

/**
 * Lo que deshace una novedad o la saca del sitio (SPEC §5.3 de
 * `work/novedades-y-kit/`), al pie de la ficha y no en el encabezado: se usa
 * poco, y cada una dice qué pasa antes de tocarla. Lo que no se deshace
 * —descartar los cambios, borrar— pide confirmación en el lugar
 * (`Confirmacion`); despublicar no, porque volver a publicar es un clic.
 */
export function SalidaDeNovedad({ titulo, estado, pendiente, alDescartar, alDespublicar, alBorrar }: Props) {
  const [confirmando, setConfirmando] = useState<"descartar" | "borrar" | null>(null);
  const corriendo = pendiente !== null;
  return (
    <section aria-labelledby="bloque-salida" className="space-y-2">
      <h2 id="bloque-salida" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Deshacer o sacar del sitio
      </h2>
      <ul className="divide-y divide-azul-claro/60">
        {estado.publicada && estado.borradorEn ? (
          <Accion titulo="Descartar los cambios" consecuencia="Vuelve a lo que está publicado. Lo que se guardó como borrador desde entonces se pierde.">
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
          </Accion>
        ) : null}
        {estado.publicada ? (
          <Accion titulo="Despublicar" consecuencia="Deja de verse en el sitio y pasa a Borradores. Volver a publicarla es un clic; si era la destacada, deja de serlo.">
            <Boton variante="secundario" disabled={corriendo} aria-busy={pendiente === "despublicar" || undefined} onClick={alDespublicar}>
              {pendiente === "despublicar" ? "Despublicando…" : "Despublicar"}
            </Boton>
          </Accion>
        ) : null}
        <Accion titulo="Borrar" consecuencia="Se borra para siempre: si estaba en el sitio, deja de verse, y su dirección da error.">
          {confirmando === "borrar" ? (
            <Confirmacion
              pregunta={`¿Borrar «${titulo}» para siempre? No se puede deshacer.`}
              confirmar="Sí, borrar"
              corriendo={pendiente === "borrar" ? "Borrando…" : null}
              alConfirmar={alBorrar}
              alCancelar={() => setConfirmando(null)}
            />
          ) : (
            <Boton variante="destructivo" disabled={corriendo} onClick={() => setConfirmando("borrar")}>
              Borrar la novedad
            </Boton>
          )}
        </Accion>
      </ul>
    </section>
  );
}
