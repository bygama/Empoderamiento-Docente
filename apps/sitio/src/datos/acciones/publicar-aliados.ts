import { Prisma, type PrismaClient } from "@/../prisma/generado/client";
import { publicadoDeAliado } from "@/datos/consultas/aliados";
import { esquemaAliado } from "@/features/aliados/contenido/aliado";
import { CAMBIO_DESDE_LA_AUTORIZACION, estaAutorizado } from "@/features/aliados/contenido/autorizacion";
import { columnasDelAliado, falloEnCampoDelAliado, NO_EXISTE, nombreDelAliado, problemasDeAliado } from "./aliados-en-base";
import { choqueCon, vioLaFila, type Fallo } from "./choque";

// Publicar y despublicar un aliado (`work/casos-aliados-fotos/SPEC.md` §5.1 y
// §6), con el cliente inyectado. **Publicar exige la marca `autorizado`**
// (AGENTS.md §5.4), **y para ese logo y ese nombre**: si cambiaron desde que se
// autorizó, se niega, a cualquiera; publicar no reautoriza a nadie. Aunque se
// colara, la consulta del sitio no lo mostraría. El logo tiene que estar en
// Fotos: de ahí salen sus medidas.

export type ResultadoDePublicarAliado = { ok: true; detalle: string; publicadoEn: string; publicadoPor: string; nombre: string } | Fallo;

export async function publicarAliadoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto, quien }: { id: string; borradorEnVisto: string | null; quien: string },
): Promise<ResultadoDePublicarAliado> {
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el aliado");
  if (!fila.autorizado) {
    return { ok: false, detalle: "Sin la autorización, el logo no se publica (AGENTS.md §5.4): la marca la pone quien dirige o administra, con la nota de dónde consta." };
  }
  if (fila.publicado && !fila.borrador) return { ok: false, detalle: "El aliado ya está publicado así." };
  const valido = esquemaAliado.safeParse(fila.borrador ?? publicadoDeAliado(fila));
  if (!valido.success) return problemasDeAliado(valido.error);
  if (!estaAutorizado(valido.data, fila)) return { ok: false, detalle: CAMBIO_DESDE_LA_AUTORIZACION };
  if (!(await base.foto.findUnique({ where: { url: valido.data.logo.src } }))) {
    return falloEnCampoDelAliado("logo.src", "Ese logo no está en Fotos: elegilo de las ya subidas o subilo de nuevo.");
  }
  const ahora = new Date();
  // La condición sobre `borradorEn` hace que un guardado que se cuele en el medio no se publique sin haberse visto.
  const { count } = await base.aliado.updateMany({
    where: { id, borradorEn: fila.borradorEn, autorizado: true, autorizadoLogo: valido.data.logo.src, autorizadoNombre: valido.data.nombre },
    data: { ...columnasDelAliado(valido.data), publicado: true, publicadoEn: ahora, publicadoPor: quien, borrador: Prisma.DbNull, borradorEn: null, borradorPor: null },
  });
  if (count === 0) return choqueCon(await base.aliado.findUnique({ where: { id } }), "el aliado");
  return { ok: true, detalle: "Publicado: el logo ya está en la tira.", publicadoEn: ahora.toISOString(), publicadoPor: quien, nombre: valido.data.nombre };
}

/** Lo saca de la tira y conserva sus columnas: volver a publicarlo es un clic. */
export async function despublicarAliadoEnBase(
  base: PrismaClient,
  { id, borradorEnVisto }: { id: string; borradorEnVisto: string | null },
): Promise<{ ok: true; detalle: string; nombre: string } | Fallo> {
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  if (!vioLaFila(fila, borradorEnVisto)) return choqueCon(fila, "el aliado");
  if (!fila.publicado) return { ok: false, detalle: "El aliado no está publicado." };
  const { count } = await base.aliado.updateMany({ where: { id, publicado: true, borradorEn: fila.borradorEn }, data: { publicado: false } });
  if (count === 0) return choqueCon(await base.aliado.findUnique({ where: { id } }), "el aliado");
  return { ok: true, detalle: "Despublicado: ya no está en la tira.", nombre: nombreDelAliado(fila) };
}
