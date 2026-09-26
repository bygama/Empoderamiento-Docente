import { base } from "@/datos/cliente";

/** Una sesión abierta, con lo que hace falta para reconocerla y nada más: ni el token ni la IP. */
export type SesionAbierta = {
  id: string;
  userAgent: string | null;
  ciudad: string | null;
  pais: string | null;
  /** ISO. better-auth la mueve cada hora de uso (`updateAge`). */
  ultimaActividad: string;
};

/**
 * Las sesiones que una cuenta tiene abiertas, la más usada primero. Se leen
 * de acá y no de `auth.api.listSessions`, que pide haber entrado hace menos
 * de 10 minutos: Mi cuenta las muestra siempre.
 */
export async function sesionesAbiertas(idDeCuenta: string): Promise<SesionAbierta[]> {
  const filas = await base.session.findMany({
    where: { userId: idDeCuenta, expiresAt: { gt: new Date() } },
    select: { id: true, userAgent: true, ciudad: true, pais: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  return filas.map(({ updatedAt, ...resto }) => ({ ...resto, ultimaActividad: updatedAt.toISOString() }));
}
