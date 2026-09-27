import type { Prisma } from "@/../prisma/generado/client";
import { PAGINAS } from "@/contenido/paginas";
import { rutasQueMuestran } from "@/lib/contenido/compartido";
import { caminoLegible } from "@/lib/contenido/descripcion";
import { describir } from "@/lib/contenido/describir";
import { comoDocumento, partesDe, type SeccionRegistrada } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type Donde, type Uso, type UsosDeUnModulo } from "./uso";

// Las fotos de las páginas (`work/casos-aliados-fotos/SPEC.md` §3.3): en lo
// publicado, en el borrador y, en cada sección que todavía no está en la
// base, en su contenido inicial del código, que es lo que el sitio muestra.
// Las versiones no son usos (son historia), pero reemplazar las cambia igual:
// restaurar una no puede traer un archivo que ya no está.

const EDITOR = "/admin/contenido/paginas";

/** Los usos de una parte del documento (una sección o el SEO), con su lugar en llano. */
function usosDeLaParte(
  { slug, nombre }: { slug: string; nombre: string },
  [clave, parte]: [string, SeccionRegistrada],
  valor: unknown,
  en: Donde,
): Uso[] {
  const enlace = clave === "seo" ? `${EDITOR}/${slug}/seo` : `${EDITOR}/${slug}#seccion-${clave}`;
  return fotosEn(valor).map(({ camino, src, alt }) => {
    const lugar = caminoLegible(describir(parte.esquema, parte.nombre), camino).filter(Boolean);
    return { src, alt, en, enlace, donde: [nombre, parte.nombre, ...lugar].join(" › ") };
  });
}

/** Una parte está en la base si el documento la tiene y pasa su esquema; si no, el sitio muestra la del código. */
function estaEnLaBase(documento: Record<string, unknown>, [clave, parte]: [string, SeccionRegistrada]): boolean {
  return Object.hasOwn(documento, clave) && parte.esquema.safeParse(documento[clave]).success;
}

export const usosEnPaginas: UsosDeUnModulo = {
  modulo: "Páginas",
  async buscar(base) {
    const filas = await base.pagina.findMany({ select: { slug: true, publicado: true, borrador: true } });
    return Object.entries(PAGINAS).flatMap(([slug, pagina]) => {
      const fila = filas.find((f) => f.slug === slug);
      const publicado = comoDocumento(fila?.publicado);
      const borrador = comoDocumento(fila?.borrador);
      const donde = { slug, nombre: pagina.nombre };
      const partes = partesDe(pagina);
      const enElSitio = partes.flatMap((p) =>
        estaEnLaBase(publicado, p) ? usosDeLaParte(donde, p, publicado[p[0]], "sitio") : usosDeLaParte(donde, p, p[1].inicial, "codigo"),
      );
      const enElBorrador = partes.flatMap((p) => (Object.hasOwn(borrador, p[0]) ? usosDeLaParte(donde, p, borrador[p[0]], "sin-publicar") : []));
      return sinRepetir(enElSitio, enElBorrador);
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const regenerar: string[] = [];
    for (const fila of await tx.pagina.findMany()) {
      const publicado = cambiarFoto(fila.publicado, vieja, nueva);
      const borrador = cambiarFoto(fila.borrador, vieja, nueva);
      if (!publicado.cambio && !borrador.cambio) continue;
      // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
      await tx.pagina.update({
        where: { slug: fila.slug },
        data: {
          ...(publicado.cambio ? { publicado: publicado.valor as Prisma.InputJsonValue } : {}),
          ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
        },
      });
      if (publicado.cambio) regenerar.push(...rutasQueMuestran(PAGINAS, fila.slug));
    }
    for (const version of await tx.versionDePagina.findMany({ select: { id: true, documento: true } })) {
      const documento = cambiarFoto(version.documento, vieja, nueva);
      if (documento.cambio) await tx.versionDePagina.update({ where: { id: version.id }, data: { documento: documento.valor as Prisma.InputJsonValue } });
    }
    return [...new Set(regenerar)].map((ruta) => ({ ruta }));
  },
};
