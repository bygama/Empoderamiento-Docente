"use client";

import { useState } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-persona";
import type { Pendiente } from "./useGuardarPerfil";

type Props = {
  nombre: string;
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
 * Lo que deshace un perfil o lo saca del sitio (SPEC §6.1 de `work/equipo/`),
 * al pie de la ficha, como en una novedad: descartar los cambios y borrar
 * confirman en el lugar; despublicar no, porque volver a publicarlo es un
 * clic.
 */
export function SalidaDelPerfil({ nombre, estado, pendiente, alDescartar, alDespublicar, alBorrar }: Props) {
  const [confirmando, setConfirmando] = useState<"descartar" | "borrar" | null>(null);
  const corriendo = pendiente !== null;
  return (
    <section aria-labelledby="bloque-salida" className="space-y-2">
      <h2 id="bloque-salida" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Deshacer o sacar del sitio
      </h2>
      <ul className="divide-y divide-azul-claro/60">
        {estado.publicado && estado.borradorEn ? (
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
        {estado.publicado ? (
          <Accion titulo="Despublicar" consecuencia="Su tarjeta y su perfil dejan de verse en Quiénes somos, y se conserva todo: volver a publicarlo es un clic.">
            <Boton variante="secundario" disabled={corriendo} aria-busy={pendiente === "despublicar" || undefined} onClick={alDespublicar}>
              {pendiente === "despublicar" ? "Despublicando…" : "Despublicar"}
            </Boton>
          </Accion>
        ) : null}
        <Accion titulo="Borrar" consecuencia="Se borra para siempre. Sus publicaciones siguen en la Biblioteca, con su nombre, como de alguien de afuera del equipo.">
          {confirmando === "borrar" ? (
            <Confirmacion
              pregunta={`¿Borrar el perfil de ${nombre} para siempre? No se puede deshacer.`}
              confirmar="Sí, borrar"
              corriendo={pendiente === "borrar" ? "Borrando…" : null}
              alConfirmar={alBorrar}
              alCancelar={() => setConfirmando(null)}
            />
          ) : (
            <Boton variante="destructivo" disabled={corriendo} onClick={() => setConfirmando("borrar")}>
              Borrar el perfil
            </Boton>
          )}
        </Accion>
      </ul>
    </section>
  );
}
