"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import type { Variante } from "@/admin/armazon/clases";

type Resultado = { ok: boolean; detalle: string };

/**
 * Una acción de un clic sobre una cuenta (suspender, reactivar, cerrar sus
 * sesiones, reenviar, cancelar, borrar), con su aviso arriba del botón. Lo
 * que no se deshace con otro clic pregunta antes, como «Descartar» en el
 * editor de páginas. Si la cuenta deja de existir, lleva a la lista.
 *
 * Quien la usa le pone la misma `key` a las acciones que se reemplazan una a
 * la otra (suspender y reactivar), así el aviso sobrevive al redibujo.
 */
export function BotonDeAccion({
  accion,
  idDeCuenta,
  texto,
  enCurso,
  variante = "secundario",
  confirmar,
  irA,
}: {
  accion: (idDeCuenta: string) => Promise<Resultado>;
  idDeCuenta: string;
  texto: string;
  enCurso: string;
  variante?: Variante;
  /** La pregunta, para lo que no se deshace con un clic. */
  confirmar?: string;
  /** Adónde ir si anduvo: cancelar o borrar dejan sin cuenta que mostrar. */
  irA?: string;
}) {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [corriendo, setCorriendo] = useState(false);

  async function hacer() {
    if (confirmar && !window.confirm(confirmar)) return;
    setCorriendo(true);
    setResultado(null);
    const r = await accion(idDeCuenta);
    setCorriendo(false);
    if (r.ok && irA) {
      router.push(irA);
      return;
    }
    setResultado(r);
    if (r.ok) router.refresh();
  }

  return (
    <div className="max-w-md space-y-3">
      {resultado ? <Aviso tono={resultado.ok ? "bien" : "error"}>{resultado.detalle}</Aviso> : null}
      <Boton variante={variante} onClick={hacer} disabled={corriendo} aria-busy={corriendo || undefined}>
        {corriendo ? enCurso : texto}
      </Boton>
    </div>
  );
}
