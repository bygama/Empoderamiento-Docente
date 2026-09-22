"use client";

import { useState, useTransition } from "react";
import { Aviso } from "@/admin/armazon/Campos";
import { actualizarMetricasAhora } from "@/datos/acciones/actualizar-metricas";

export function ActualizarAhora() {
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => empezar(async () => setAviso(await actualizarMetricasAhora()))}
        className="rounded-lg border border-azul-claro px-3 py-1.5 text-admin-meta text-azul-medio transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pendiente ? "Actualizando…" : "Actualizar ahora"}
      </button>
      {aviso ? <Aviso tono={aviso.ok ? "bien" : "error"}>{aviso.detalle}</Aviso> : null}
    </div>
  );
}
