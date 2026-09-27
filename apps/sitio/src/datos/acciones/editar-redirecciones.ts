import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { validarRedireccion, type Redireccion } from "@/lib/seo/redirecciones";

// Lo que hacen en la base las acciones de las redirecciones a mano (Ajustes ›
// SEO, work/ajustes/SPEC.md §5.1). Con el cliente inyectado, como
// editar-paginas.ts, para probarlo contra el Postgres local. La sesión y el
// permiso los chequea la acción que llama.

/** Lo que no se redirige nunca: el admin, la API y lo de Next. */
export const RESERVADAS = ["/admin", "/api", "/_next"] as const;

export type ResultadoDeAgregar = { ok: true; redireccion: Redireccion } | { ok: false; campo?: "desde" | "hacia"; detalle: string };

/** Agrega una redirección a mano, validada contra las rutas del sitio (`rutas`) y las que ya hay. */
export async function agregarRedireccionEnBase(base: PrismaClient, pedida: Redireccion, rutas: readonly string[]): Promise<ResultadoDeAgregar> {
  const existentes = await base.redireccion.findMany({ select: { desde: true, hacia: true } });
  const validada = validarRedireccion(pedida, { rutas, existentes, reservadas: RESERVADAS });
  if (!validada.ok) return validada;
  try {
    await base.redireccion.create({ data: { ...validada.redireccion, aMano: true } });
    return validada;
  } catch (e) {
    // Otra persona agregó la misma a la vez: la tabla no deja dos desde la misma ruta.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, campo: "desde", detalle: `Ya hay una redirección desde «${validada.redireccion.desde}».` };
    }
    throw e;
  }
}

export type ResultadoDeBorrar = { ok: true; redireccion: Redireccion } | { ok: false; detalle: string };

/** Borra una redirección a mano. Las automáticas no se borran desde acá: romperían los links viejos. */
export async function borrarRedireccionEnBase(base: PrismaClient, id: string): Promise<ResultadoDeBorrar> {
  const fila = await base.redireccion.findUnique({ where: { id }, select: { desde: true, hacia: true, aMano: true } });
  if (!fila) return { ok: false, detalle: "Esa redirección ya no está." };
  if (!fila.aMano) return { ok: false, detalle: "Esa redirección la escribió el sitio al cambiar una URL: borrarla rompería los links viejos." };
  await base.redireccion.deleteMany({ where: { id, aMano: true } });
  return { ok: true, redireccion: { desde: fila.desde, hacia: fila.hacia } };
}
