"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CODIGO_NO_SALIO, CUENTA_SUSPENDIDA, quienPuede } from "@ed/auth";
import { authCliente } from "@/admin/auth-cliente";
import { Boton as BotonDelAdmin } from "@/admin/armazon/Boton";
import { Aviso, Boton, Campo, ENLACE_DE_ACCESO } from "@/admin/armazon/Campos";
import { destinoSeguro } from "../destino";

/**
 * Si el último código salió, si el correo no salió, si hay que esperar para
 * pedir otro (429), o si el pedido falló por otra cosa (un 500, la cookie del
 * paso vencida).
 */
type Envio = "salio" | "no-salio" | "esperar" | "fallo";

const PEDISTE_MUCHOS = "Pediste muchos códigos seguidos. Esperá unos minutos y pedí otro.";
const NO_SE_PUDO_PEDIR = "No pudimos mandarte el código. Probá entrar de nuevo.";
const VOLVE_A_ENTRAR = "Pasó mucho tiempo desde que pusiste la contraseña. Volvé a entrar.";

/** Lo que se le dice a quien probó un código que no anduvo, por el código de error. */
const POR_ERROR: Record<string, string> = {
  INVALID_CODE: "Ese código no es. Revisalo y probá de nuevo.",
  OTP_HAS_EXPIRED: "El código venció. Pedí otro.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Demasiados intentos con este código. Pedí otro.",
  INVALID_TWO_FACTOR_COOKIE: VOLVE_A_ENTRAR,
  [CUENTA_SUSPENDIDA]: `Tu cuenta está suspendida. Si creés que es un error, hablá con ${quienPuede("usarCuentas")}.`,
};

function envioDe(valor: string | null): Envio {
  return valor === "no-salio" || valor === "esperar" || valor === "fallo" ? valor : "salio";
}

/**
 * El código del segundo factor. **Nunca finge** (DECISIONS de work/cuentas):
 * si el correo no salió, no dice «te mandamos un código» sino que no se pudo,
 * y a quién avisar. Va por el cliente de better-auth, no por una acción: el
 * rate limit y la cookie de la sesión nueva viven en su handler.
 */
export function FormularioCodigo({ minutosDeVigencia }: { minutosDeVigencia: number }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const destino = destinoSeguro(parametros.get("volver"));
  const correo = parametros.get("correo") ?? "tu correo";
  const [envio, setEnvio] = useState<Envio>(() => envioDe(parametros.get("envio")));
  const [error, setError] = useState<string | null>(null);
  const [otroListo, setOtroListo] = useState(false);
  const [rechazado, setRechazado] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [mandando, setMandando] = useState(false);
  const idDelError = useId();

  async function mandarOtro() {
    setMandando(true);
    setError(null);
    setOtroListo(false);
    const { error: fallo } = await authCliente.twoFactor.sendOtp();
    setMandando(false);
    if (!fallo) {
      setEnvio("salio");
      setOtroListo(true);
      return;
    }
    if (fallo.code === CODIGO_NO_SALIO) setEnvio("no-salio");
    else setError(fallo.status === 429 ? PEDISTE_MUCHOS : (POR_ERROR[fallo.code ?? ""] ?? NO_SE_PUDO_PEDIR));
  }

  async function entrar(datos: FormData) {
    setEntrando(true);
    setError(null);
    setOtroListo(false);
    const { error: fallo } = await authCliente.twoFactor.verifyOtp({
      code: String(datos.get("codigo") ?? "").replace(/\s/g, ""),
      trustDevice: datos.get("recordar") === "on",
    });
    if (fallo) {
      setError(fallo.status === 429 ? "Demasiados intentos. Esperá unos minutos y probá de nuevo." : (POR_ERROR[fallo.code ?? ""] ?? "No se pudo entrar. Probá de nuevo."));
      setRechazado(fallo.code === "INVALID_CODE");
      setEntrando(false);
      return;
    }
    // Como al entrar con la contraseña: que la sesión haya quedado antes de seguir.
    const { data } = await authCliente.getSession();
    if (!data?.session) {
      setError("Entraste, pero el navegador no guardó la sesión. Revisá que acepte cookies de este sitio y probá de nuevo.");
      setEntrando(false);
      return;
    }
    router.push(destino);
    router.refresh();
  }

  const volver = (
    <Link className={ENLACE_DE_ACCESO} href="/admin/entrar">
      Volver a entrar
    </Link>
  );

  if (envio === "no-salio") {
    return (
      <div className="space-y-4">
        <Aviso tono="error">
          No pudimos mandarte el código, y sin él no se puede entrar con este rol. Avisale a quien se ocupa del sitio: el envío de correos no
          está andando.
        </Aviso>
        <Boton type="button" onClick={mandarOtro} disabled={mandando} aria-busy={mandando || undefined}>
          {mandando ? "Mandando…" : "Probar de nuevo"}
        </Boton>
        <p className="text-center text-admin-meta">{volver}</p>
      </div>
    );
  }

  if (envio === "fallo") {
    return (
      <div className="space-y-4">
        <Aviso tono="error">{NO_SE_PUDO_PEDIR}</Aviso>
        <p className="text-center text-admin-meta">{volver}</p>
      </div>
    );
  }

  return (
    <form action={entrar} className="space-y-4">
      <p className="text-admin-meta text-gris-texto">
        {envio === "salio" ? (
          <>
            Te mandamos un código a <span className="font-medium text-azul-principal">{correo}</span>. Vence en {minutosDeVigencia} minutos.
          </>
        ) : (
          PEDISTE_MUCHOS
        )}
      </p>
      <Campo
        etiqueta="Código"
        name="codigo"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]{6,7}"
        maxLength={7}
        autoFocus
        aria-invalid={rechazado ? true : undefined}
        aria-describedby={rechazado ? idDelError : undefined}
      />
      <label className="flex min-h-11 items-center gap-3 text-admin-meta text-azul-principal">
        <input
          type="checkbox"
          name="recordar"
          className="size-4 accent-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
        />
        Recordar este dispositivo 30 días
      </label>
      {error ? (
        <Aviso tono="error" id={idDelError}>
          {error}
        </Aviso>
      ) : null}
      {otroListo ? <Aviso tono="bien">Te mandamos otro código.</Aviso> : null}
      <Boton type="submit" disabled={entrando} aria-busy={entrando || undefined}>
        {entrando ? "Entrando…" : "Entrar"}
      </Boton>
      <div className="flex flex-wrap items-center justify-between gap-3 text-admin-meta">
        <BotonDelAdmin variante="terciario" onClick={mandarOtro} disabled={mandando} aria-busy={mandando || undefined} className="-ml-4">
          {mandando ? "Mandando…" : "Mandar otro"}
        </BotonDelAdmin>
        {volver}
      </div>
    </form>
  );
}
