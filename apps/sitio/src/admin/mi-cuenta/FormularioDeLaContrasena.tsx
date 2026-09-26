"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { LARGO_MINIMO_CONTRASENA } from "@ed/auth";
import { authCliente } from "@/admin/auth-cliente";
import { Boton } from "@/admin/armazon/Boton";
import { CampoContrasena } from "@/admin/armazon/CampoContrasena";
import { Aviso } from "@/admin/armazon/Campos";

type Rechazado = "actual" | "nueva" | null;
type Resultado = { tono: "bien" | "error"; texto: string; rechazado: Rechazado };

/** Lo que contesta better-auth, dicho para quien lo lee. */
function porQueNo(error: { status: number; code?: string }): Resultado {
  if (error.code === "INVALID_PASSWORD") return { tono: "error", texto: "La contraseña actual no es esa.", rechazado: "actual" };
  if (error.status === 429) return { tono: "error", texto: "Probaste varias veces seguidas. Esperá unos minutos y volvé a intentar.", rechazado: null };
  return { tono: "error", texto: "No se pudo cambiar la contraseña; probá de nuevo en un rato.", rechazado: null };
}

/**
 * Cambiar la contraseña pidiendo la actual. Va por el cliente de better-auth
 * y no por una acción: pasa por el rate limit por IP, y better-auth pone la
 * cookie de la sesión nueva que abre al cerrar las demás. El correo de «Tu
 * contraseña cambió» y el registro en la actividad salen del servidor.
 */
export function FormularioDeLaContrasena({ correo }: { correo: string }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const idDelAviso = useId();

  async function cambiar(datos: FormData) {
    const actual = String(datos.get("actual") ?? "");
    const nueva = String(datos.get("nueva") ?? "");
    // `minLength` ya lo frena en el navegador; esto cubre al que lo saltea.
    if (nueva.length < LARGO_MINIMO_CONTRASENA) {
      setResultado({ tono: "error", texto: `La nueva tiene que tener ${LARGO_MINIMO_CONTRASENA} caracteres o más.`, rechazado: "nueva" });
      return;
    }
    if (nueva === actual) {
      setResultado({ tono: "error", texto: "La nueva tiene que ser distinta de la actual.", rechazado: "nueva" });
      return;
    }
    setEnviando(true);
    setResultado(null);
    const { error } = await authCliente.changePassword({ currentPassword: actual, newPassword: nueva, revokeOtherSessions: true });
    setEnviando(false);
    if (error) {
      setResultado(porQueNo(error));
      return;
    }
    setResultado({ tono: "bien", texto: "Listo: tu contraseña cambió. Cerramos tus otras sesiones y te mandamos un correo que lo avisa.", rechazado: null });
    // Las otras sesiones ya no existen: la lista de abajo se redibuja.
    router.refresh();
  }

  const rechazado = resultado?.rechazado ?? null;
  return (
    <form action={cambiar} className="max-w-md space-y-4">
      {/* Para que el gestor de contraseñas guarde la nueva con la cuenta que corresponde. */}
      <input type="text" name="usuario" autoComplete="username" value={correo} readOnly hidden />
      <CampoContrasena etiqueta="Contraseña actual" name="actual" autoComplete="current-password" invalido={rechazado === "actual"} idDelError={idDelAviso} />
      <CampoContrasena
        etiqueta="Contraseña nueva"
        name="nueva"
        autoComplete="new-password"
        minLength={LARGO_MINIMO_CONTRASENA}
        ayuda="Doce caracteres o más."
        invalido={rechazado === "nueva"}
        idDelError={idDelAviso}
      />
      {resultado ? (
        <Aviso tono={resultado.tono} id={idDelAviso}>
          {resultado.texto}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={enviando} aria-busy={enviando || undefined}>
        {enviando ? "Cambiando…" : "Cambiar la contraseña"}
      </Boton>
    </form>
  );
}
