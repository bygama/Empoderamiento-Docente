"use client";

import { useState } from "react";
import { Boton } from "@/admin/armazon/Boton";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { FilaDeAccion } from "@/admin/armazon/FilaDeAccion";

type Props = { corriendo: boolean; descartando: boolean; alDescartar: () => void };

/**
 * Lo único que deshace un caso (DESIGN.md §11, «Ficha de una entidad»): un
 * caso no se despublica ni se borra, porque son cuatro. Descartar los cambios
 * vuelve a lo publicado y confirma en el lugar. Solo con cambios guardados.
 */
export function DescartarElCaso({ corriendo, descartando, alDescartar }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  return (
    <section aria-labelledby="bloque-salida" className="space-y-2">
      <h2 id="bloque-salida" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Deshacer
      </h2>
      <ul className="divide-y divide-azul-claro/60">
        <FilaDeAccion titulo="Descartar los cambios" consecuencia="Vuelve a lo que está publicado. Lo que se guardó como borrador desde entonces se pierde.">
          {confirmando ? (
            <Confirmacion
              pregunta="¿Descartar los cambios sin publicar? No se puede deshacer."
              confirmar="Sí, descartar"
              corriendo={descartando ? "Descartando…" : null}
              alConfirmar={alDescartar}
              alCancelar={() => setConfirmando(false)}
            />
          ) : (
            <Boton variante="destructivo" disabled={corriendo} onClick={() => setConfirmando(true)}>
              Descartar cambios
            </Boton>
          )}
        </FilaDeAccion>
      </ul>
    </section>
  );
}
