"use client";

import { useState, useTransition } from "react";
import { Aviso, Boton } from "@ed/kit-admin";

type Resultado = { ok: boolean; detalle: string };

/**
 * «Actualizar ahora» de una copia diaria: el Resumen le pasa la de Vercel y
 * Búsquedas la de Search Console. Recibe la Server Action por prop, así cada
 * pantalla corre su tarea y el freno de una no toca a la otra. Es el botón
 * secundario del kit (DESIGN.md §11): su borde de antes, `azul-claro`,
 * daba 1,77:1 y un control pide 3:1.
 */
export function ActualizarAhora({ accion }: { accion: () => Promise<Resultado> }) {
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState<Resultado | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <Boton variante="secundario" disabled={pendiente} aria-busy={pendiente} onClick={() => empezar(async () => setAviso(await accion()))}>
        {pendiente ? "Actualizando…" : "Actualizar ahora"}
      </Boton>
      {aviso ? <Aviso tono={aviso.ok ? "bien" : "error"}>{aviso.detalle}</Aviso> : null}
    </div>
  );
}
