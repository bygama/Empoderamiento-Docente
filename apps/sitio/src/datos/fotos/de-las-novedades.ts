import type { Prisma } from "@/../prisma/generado/client";
import { tituloDe } from "@/datos/acciones/novedades-en-base";
import { comoDocumento } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type Donde, type Uso, type UsosDeUnModulo } from "./uso";

// Las fotos de las novedades (`work/casos-aliados-fotos/SPEC.md` §3.3): la
// imagen y la imagen para redes, en sus columnas y en el borrador. Una
// despublicada conserva sus columnas para volver al sitio: sus fotos son
// usos sin publicar, no fotos libres.

function usos(valor: unknown, donde: string, enlace: string, en: Donde): Uso[] {
  return fotosEn(valor).map(({ src, alt }) => ({ src, alt, donde, enlace, en }));
}

export const usosEnNovedades: UsosDeUnModulo = {
  modulo: "Novedades",
  async buscar(base) {
    const filas = await base.novedad.findMany({ select: { id: true, titulo: true, imagen: true, imagenParaRedes: true, borrador: true, publicada: true } });
    return filas.flatMap((f) => {
      const nombre = `Novedad «${tituloDe(f)}»`;
      const redes = `${nombre} › Imagen para redes`;
      const enlace = `/admin/novedades/${f.id}`;
      const en: Donde = f.publicada ? "sitio" : "sin-publicar";
      const borrador = comoDocumento(f.borrador);
      return sinRepetir(
        [...usos(f.imagen, nombre, enlace, en), ...usos(f.imagenParaRedes, redes, enlace, en)],
        [...usos(borrador.imagen, nombre, enlace, "sin-publicar"), ...usos(borrador.imagenParaRedes, redes, enlace, "sin-publicar")],
      );
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const filas = await tx.novedad.findMany({ select: { id: true, slug: true, publicada: true, imagen: true, imagenParaRedes: true, borrador: true } });
    const cambios = filas
      .map((f) => ({
        ...f,
        imagen: cambiarFoto(f.imagen, vieja, nueva),
        redes: cambiarFoto(f.imagenParaRedes, vieja, nueva),
        borrador: cambiarFoto(f.borrador, vieja, nueva),
      }))
      .filter((c) => c.imagen.cambio || c.redes.cambio || c.borrador.cambio);
    await Promise.all(
      cambios.map(({ id, imagen, redes, borrador }) =>
        // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
        tx.novedad.update({
          where: { id },
          data: {
            ...(imagen.cambio ? { imagen: imagen.valor as Prisma.InputJsonValue } : {}),
            ...(redes.cambio ? { imagenParaRedes: redes.valor as Prisma.InputJsonValue } : {}),
            ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
          },
        }),
      ),
    );
    // Lo que el sitio muestra de una novedad publicada: el Inicio, el listado y su ficha con su imagen para redes.
    const regenerar = cambios
      .filter((c) => c.publicada && (c.imagen.cambio || c.redes.cambio))
      .flatMap((c) => ["/", "/novedades", `/novedades/${c.slug}`, `/novedades/${c.slug}/imagen-para-redes`]);
    return [...new Set(regenerar)].map((ruta) => ({ ruta }));
  },
};
