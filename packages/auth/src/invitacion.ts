import { randomBytes } from "node:crypto";

/**
 * El enlace de una invitación: el mismo «Elegí tu contraseña» del reset, que
 * vence a las horas que diga quien invita (72 en Cuentas) y no a la hora del
 * reset de better-auth, que tiene una sola vigencia para todos.
 *
 * Se arma con **el formato del reset de better-auth** (`requestPasswordReset`
 * en su `api/routes/password`): un valor de `verification` con identificador
 * `reset-password:<token>` y el id de la cuenta, que `resetPassword` consume y
 * que se guarda hasheado como los demás (`storeIdentifier`). Es un detalle
 * interno de la librería: si una versión nueva lo cambia, se entera
 * `invitacion.test.ts`, que prueba el enlace contra better-auth de verdad.
 */

/** Lo que de una instancia de better-auth hace falta para esto: su contexto. */
type ConContexto = {
  $context: Promise<{
    baseURL: string;
    internalAdapter: { createVerificationValue: (datos: { value: string; identifier: string; expiresAt: Date }) => Promise<unknown> };
  }>;
};

export async function crearEnlaceDeInvitacion(
  auth: ConContexto,
  { idDeCuenta, horas, volverA }: { idDeCuenta: string; horas: number; volverA: string },
): Promise<{ enlace: string; vence: Date }> {
  const ctx = await auth.$context;
  // 24 caracteres, como los de better-auth, y seguros en una URL.
  const token = randomBytes(18).toString("base64url");
  const vence = new Date(Date.now() + horas * 60 * 60 * 1000);
  await ctx.internalAdapter.createVerificationValue({ value: idDeCuenta, identifier: `reset-password:${token}`, expiresAt: vence });
  // La ruta de better-auth que valida el token y lleva a `volverA` con él, igual que el enlace de «olvidé».
  return { enlace: `${ctx.baseURL}/reset-password/${token}?callbackURL=${encodeURIComponent(volverA)}`, vence };
}
