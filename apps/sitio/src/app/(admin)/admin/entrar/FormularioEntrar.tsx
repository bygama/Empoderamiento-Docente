"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authCliente } from "@/admin/auth-cliente";
import { CampoContrasena } from "@/admin/armazon/CampoContrasena";
import { Aviso, Boton, Campo, ENLACE_DE_ACCESO } from "@/admin/armazon/Campos";

/**
 * Entra al admin.
 *
 * Va por HTTP contra `/api/auth`, no por una Server Action: el rate limit por
 * IP vive en ese handler y una llamada desde el servidor lo saltearía.
 */
export function FormularioEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  // Solo cuando el problema son los datos: un 429 no dice nada de lo escrito.
  const [datosRechazados, setDatosRechazados] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Los campos rechazados apuntan al aviso: el lector anuncia el porqué al volver a cada uno.
  const idDelError = useId();

  async function entrar(datos: FormData) {
    setEnviando(true);
    setError(null);
    setDatosRechazados(false);
    const { error: fallo } = await authCliente.signIn.email({
      email: String(datos.get("email") ?? ""),
      password: String(datos.get("contrasena") ?? ""),
    });
    if (fallo) {
      // Un solo mensaje para «no existe» y para «contraseña mala»: distinguir
      // los dos le confirma a quien prueba cuáles correos existen. Por lo
      // mismo se marcan los dos campos, no uno.
      const demasiados = fallo.status === 429;
      setError(demasiados ? "Demasiados intentos. Esperá un minuto y probá de nuevo." : "El correo o la contraseña no coinciden.");
      setDatosRechazados(!demasiados);
      setEnviando(false);
      return;
    }
    // Solo rutas del propio admin: un `volver` absoluto sería un redirect
    // abierto, y llega por la URL, así que no se confía en él.
    const volver = parametros.get("volver");
    router.push(volver?.startsWith("/admin") && !volver.startsWith("//") ? volver : "/admin");
    router.refresh();
  }

  return (
    <form action={entrar} className="space-y-4">
      <Campo
        etiqueta="Correo"
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        aria-invalid={datosRechazados ? true : undefined}
        aria-describedby={datosRechazados ? idDelError : undefined}
      />
      <CampoContrasena
        etiqueta="Contraseña"
        name="contrasena"
        autoComplete="current-password"
        invalido={datosRechazados}
        idDelError={idDelError}
      />
      {error ? (
        <Aviso tono="error" id={idDelError}>
          {error}
        </Aviso>
      ) : null}
      <Boton type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Boton>
      <p className="text-center text-sm">
        <Link className={ENLACE_DE_ACCESO} href="/admin/olvide-mi-contrasena">
          Olvidé mi contraseña
        </Link>
      </p>
    </form>
  );
}
