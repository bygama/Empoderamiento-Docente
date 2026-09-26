"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";

/**
 * Cierra todas las sesiones de la cuenta menos esta, por el cliente de
 * better-auth. Al terminar, la lista se redibuja y en lugar del botón queda
 * «No tenés el admin abierto en ningún otro lado» (Sesiones.tsx).
 */
export function CerrarLasDemas({ cuantas }: { cuantas: number }) {
  const router = useRouter();
  const [cerrando, setCerrando] = useState(false);
  const [fallo, setFallo] = useState(false);

  async function cerrar() {
    setCerrando(true);
    setFallo(false);
    const { error } = await authCliente.revokeOtherSessions();
    setCerrando(false);
    if (error) {
      setFallo(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {fallo ? <Aviso tono="error">No se pudieron cerrar; probá de nuevo en un rato.</Aviso> : null}
      <Boton variante="secundario" onClick={cerrar} disabled={cerrando} aria-busy={cerrando || undefined}>
        {cerrando ? "Cerrando…" : cuantas === 1 ? "Cerrar la otra" : "Cerrar las demás"}
      </Boton>
    </div>
  );
}
