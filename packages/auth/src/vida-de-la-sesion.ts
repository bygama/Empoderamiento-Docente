import type { BetterAuthOptions } from "better-auth";

/**
 * Lo más que dura una sesión desde que se abrió, se use o no: **7 días**. Sin
 * esto, una sesión que se usa al menos una vez cada 12 horas se renovaba para
 * siempre, y una cookie robada servía mientras se la siguiera usando.
 *
 * Se aplica donde better-auth decide si una sesión sirve: su vencimiento
 * (`expiresAt`). Al renovarla (cada hora de uso, `updateAge`), el vencimiento
 * nuevo nunca pasa del tope. Así lo cumple todo lo que lee la sesión —las
 * páginas del admin (`sesionActual`), cada Server Action, las rutas y el
 * middleware de better-auth—, sin que cada uno se tenga que acordar.
 *
 * Una sesión que se vuelve a crear con la contraseña (cambiarla, prender o
 * apagar el segundo factor) cuenta desde ahí: es como volver a entrar.
 */
export const VIDA_MAXIMA_DE_LA_SESION = 7 * 24 * 60 * 60 * 1000;

/** El vencimiento, sin pasarse de 7 días desde que se abrió. */
export function conTope(vence: Date, abierta: Date): Date {
  const tope = abierta.getTime() + VIDA_MAXIMA_DE_LA_SESION;
  return vence.getTime() > tope ? new Date(tope) : vence;
}

type AntesDeRenovar = NonNullable<NonNullable<NonNullable<BetterAuthOptions["databaseHooks"]>["session"]>["update"]>["before"];

/**
 * El gancho de la base que topa la renovación. La única escritura de
 * `expiresAt` después de crearla es la de `getSession`, que antes deja la
 * sesión que renueva en el contexto del pedido: de ahí sale cuándo se abrió.
 * Si una versión de better-auth cambia eso, `vida-de-la-sesion.test.ts` se
 * entera.
 */
export const toparLaRenovacion: AntesDeRenovar = async (cambio, ctx) => {
  const abierta = ctx?.context.session?.session.createdAt;
  if (!(cambio.expiresAt instanceof Date) || !abierta) return;
  return { data: { ...cambio, expiresAt: conTope(cambio.expiresAt, new Date(abierta)) } };
};
