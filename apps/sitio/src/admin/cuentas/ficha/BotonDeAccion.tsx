"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Boton, type Variante } from "@ed/kit-admin";
import { Confirmacion } from "@/admin/armazon/Confirmacion";

type Resultado = { ok: boolean; detalle: string };

/**
 * Una acción de un clic sobre una cuenta (suspender, reactivar, cerrar sus
 * sesiones, reenviar, cancelar, borrar), con su aviso arriba del botón. Lo
 * que no se deshace pregunta antes, en el lugar del botón (`Confirmacion`,
 * DESIGN.md §11). Si la cuenta deja de existir, lleva a la lista.
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
  /** Para lo que no se deshace: la pregunta y el botón que lo hace («Sí, borrar»). */
  confirmar?: { pregunta: string; boton: string };
  /** Adónde ir si anduvo: cancelar o borrar dejan sin cuenta que mostrar. */
  irA?: string;
}) {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [corriendo, setCorriendo] = useState(false);
  const [preguntando, setPreguntando] = useState(false);

  async function hacer() {
    setCorriendo(true);
    setResultado(null);
    const r = await accion(idDeCuenta);
    setCorriendo(false);
    setPreguntando(false);
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
      {preguntando && confirmar ? (
        <Confirmacion
          pregunta={confirmar.pregunta}
          confirmar={confirmar.boton}
          corriendo={corriendo ? enCurso : null}
          alConfirmar={hacer}
          alCancelar={() => setPreguntando(false)}
        />
      ) : (
        <Boton
          variante={variante}
          onClick={confirmar ? () => setPreguntando(true) : hacer}
          disabled={corriendo}
          aria-busy={corriendo || undefined}
        >
          {corriendo ? enCurso : texto}
        </Boton>
      )}
    </div>
  );
}
