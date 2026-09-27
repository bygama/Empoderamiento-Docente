import type { Prisma } from "@/../prisma/generado/client";
import { tituloDe } from "@/datos/acciones/materiales-en-base";
import { comoDocumento } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type Donde, type Uso, type UsosDeUnModulo } from "./uso";

// Las fotos de la Biblioteca (`work/biblioteca/`): la portada propia de un
// material, en su columna y en el borrador. Sin portada propia, el sitio
// muestra la tipográfica generada, que no es una foto de la biblioteca. Uno
// oculto conserva sus columnas para volver al sitio: su portada es un uso sin
// publicar, no una foto libre.

function usos(valor: unknown, donde: string, enlace: string, en: Donde): Uso[] {
  return fotosEn(valor).map(({ src, alt }) => ({ src, alt, donde, enlace, en }));
}

export const usosEnMateriales: UsosDeUnModulo = {
  modulo: "Biblioteca",
  async buscar(base) {
    const filas = await base.material.findMany({ select: { id: true, titulo: true, portada: true, borrador: true, publicado: true } });
    return filas.flatMap((f) => {
      const donde = `Material «${tituloDe(f)}» › Portada`;
      const enlace = `/admin/biblioteca/${f.id}`;
      const en: Donde = f.publicado ? "sitio" : "sin-publicar";
      return sinRepetir(usos(f.portada, donde, enlace, en), usos(comoDocumento(f.borrador).portada, donde, enlace, "sin-publicar"));
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const filas = await tx.material.findMany({ select: { id: true, publicado: true, portada: true, borrador: true } });
    const cambios = filas
      .map((f) => ({ ...f, portada: cambiarFoto(f.portada, vieja, nueva), borrador: cambiarFoto(f.borrador, vieja, nueva) }))
      .filter((c) => c.portada.cambio || c.borrador.cambio);
    await Promise.all(
      cambios.map(({ id, portada, borrador }) =>
        // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
        tx.material.update({
          where: { id },
          data: {
            ...(portada.cambio ? { portada: portada.valor as Prisma.InputJsonValue } : {}),
            ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
          },
        }),
      ),
    );
    // Lo que el sitio muestra de un material publicado, como `revalidarSitio`: el Inicio, la Biblioteca y su portada.
    const regenerar = cambios.filter((c) => c.publicado && c.portada.cambio).flatMap((c) => ["/", "/biblioteca", `/biblioteca/portada/${c.id}`]);
    return [...new Set(regenerar)].map((ruta) => ({ ruta }));
  },
};
