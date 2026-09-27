"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso, Boton, CampoContrasena } from "@ed/kit-admin";
import { authCliente } from "@/admin/auth-cliente";

type Resultado = { tono: "bien" | "error"; texto: string; contrasenaMala: boolean };

function porQueNo(error: { status: number; code?: string }): Resultado {
  if (error.code === "INVALID_PASSWORD") return { tono: "error", texto: "La contraseña no es esa.", contrasenaMala: true };
  if (error.status === 429) return { tono: "error", texto: "Probaste varias veces seguidas. Esperá unos minutos y volvé a intentar.", contrasenaMala: false };
  return { tono: "error", texto: "No se pudo cambiar; probá de nuevo en un rato.", contrasenaMala: false };
}

/**
 * Prender o apagar el segundo factor, para el rol que lo tiene optativo.
 * Pide la contraseña, y va por el cliente de better-auth y no por una acción:
 * pasa por el rate limit, y better-auth pone la cookie de la sesión nueva que
 * abre al cambiarlo. El registro en la actividad sale del servidor.
 */
export function FormularioDelSegundoFactor({ activo, correo }: { activo: boolean; correo: string }) {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const idDelAviso = useId();

  async function cambiar(datos: FormData) {
    const password = String(datos.get("contrasena") ?? "");
    setEnviando(true);
    setResultado(null);
    const { error } = activo ? await authCliente.twoFactor.disable({ password }) : await authCliente.twoFactor.enable({ password, method: "otp" });
    setEnviando(false);
    if (error) {
      setResultado(porQueNo(error));
      return;
    }
    setResultado({
      tono: "bien",
      texto: activo ? "Listo: ya no te pedimos un código al entrar." : "Listo: desde la próxima vez que entres, te pedimos también un código por correo.",
      contrasenaMala: false,
    });
    router.refresh();
  }

  return (
    <form action={cambiar} className="max-w-md space-y-4">
      <input type="text" name="usuario" autoComplete="username" value={correo} readOnly hidden />
      <CampoContrasena
        etiqueta="Tu contraseña"
        name="contrasena"
        autoComplete="current-password"
        invalido={resultado?.contrasenaMala ?? false}
        idDelError={idDelAviso}
      />
      {resultado ? (
        <Aviso tono={resultado.tono} id={idDelAviso}>
          {resultado.texto}
        </Aviso>
      ) : null}
      <Boton variante="secundario" type="submit" disabled={enviando} aria-busy={enviando || undefined}>
        {enviando ? "Guardando…" : activo ? "Desactivarlo" : "Activar el segundo factor"}
      </Boton>
    </form>
  );
}
