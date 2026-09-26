"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CODIGO_NO_SALIO, CUENTA_SUSPENDIDA, quienPuede } from "@ed/auth";
import { authCliente } from "@/admin/auth-cliente";
import { CampoContrasena } from "@/admin/armazon/CampoContrasena";
import { Aviso, Boton, Campo, ENLACE_DE_ACCESO } from "@/admin/armazon/Campos";
import { enmascararCorreo } from "@/lib/correo/enmascarar";
import { destinoSeguro } from "./destino";

/**
 * La URL del paso del código: adónde se mandó (enmascarado), adónde volver y,
 * si el correo no salió, eso, para que la pantalla no diga «te lo mandamos».
 */
function urlDelCodigo(correo: string, destino: string, fallo: { code?: string } | null): string {
  const params = new URLSearchParams({ correo: enmascararCorreo(correo) });
  if (destino !== "/admin") params.set("volver", destino);
  if (fallo) params.set("envio", fallo.code === CODIGO_NO_SALIO ? "no-salio" : "esperar");
  return `/admin/entrar/codigo?${params}`;
}

/**
 * Entra al admin.
 *
 * Va por HTTP contra `/api/auth`, no por una Server Action: el rate limit por
 * IP y el bloqueo por cuenta viven en ese handler, y una llamada desde el
 * servidor los saltearía.
 *
 * Quien llega desde un link de otro sitio con la sesión abierta no pasa por
 * acá: la cookie es `SameSite=Strict` y no viaja en esa primera navegación,
 * así que el proxy la rebota a la misma URL, y la segunda ya la lleva
 * (`lib/seguridad/rebote.ts`).
 */
export function FormularioEntrar() {
  const router = useRouter();
  const destino = destinoSeguro(useSearchParams().get("volver"));
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
    const correo = String(datos.get("email") ?? "");
    const { data, error: fallo } = await authCliente.signIn.email({ email: correo, password: String(datos.get("contrasena") ?? "") });
    if (fallo) {
      // Un solo mensaje para «no existe» y para «contraseña mala»: distinguir
      // los dos le confirma a quien prueba cuáles correos existen. Por lo
      // mismo se marcan los dos campos, no uno. El 429 es el mismo para el
      // límite por IP y para la cuenta frenada (hasta una hora): «unos minutos».
      // La suspendida sí se dice: solo la ve quien puso bien la contraseña.
      const demasiados = fallo.status === 429;
      const suspendida = fallo.code === CUENTA_SUSPENDIDA;
      setError(
        suspendida
          ? `Tu cuenta está suspendida. Si creés que es un error, hablá con ${quienPuede("usarCuentas")}.`
          : demasiados
            ? "Demasiados intentos. Esperá unos minutos y probá de nuevo."
            : "El correo o la contraseña no coinciden.",
      );
      setDatosRechazados(!demasiados && !suspendida);
      setEnviando(false);
      return;
    }
    // Con el segundo factor, la contraseña buena todavía no es una sesión:
    // se pide el código y se sigue en su pantalla, diga lo que diga el envío.
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      const { error: sinCodigo } = await authCliente.twoFactor.sendOtp();
      router.push(urlDelCodigo(correo, destino, sinCodigo));
      return;
    }
    // Antes de seguir, que la sesión haya quedado: si el navegador no guardó
    // la cookie, `volver` mandaría de nuevo acá sin explicar nada.
    const { data: guardada } = await authCliente.getSession();
    if (!guardada?.session) {
      setError("Entraste, pero el navegador no guardó la sesión. Revisá que acepte cookies de este sitio y probá de nuevo.");
      setEnviando(false);
      return;
    }
    router.push(destino);
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
