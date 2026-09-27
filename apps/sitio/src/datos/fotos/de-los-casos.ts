import type { Prisma } from "@/../prisma/generado/client";
import { esIdDeCaso, nombreDelCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import { comoDocumento } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type UsosDeUnModulo } from "./uso";

// Las fotos de los casos (`work/casos-aliados-fotos/SPEC.md` §3.3): la
// lámina de cada uno, en su columna (siempre en el sitio: un caso no se
// despublica) y en el borrador.

export const usosEnCasos: UsosDeUnModulo = {
  modulo: "Casos",
  async buscar(base) {
    const filas = await base.caso.findMany({ select: { id: true, lamina: true, borrador: true } });
    return filas.flatMap((f) => {
      const donde = `${esIdDeCaso(f.id) ? nombreDelCaso(f.id) : f.id} › Lámina`;
      const enlace = `/admin/contenido/casos/${f.id}`;
      return sinRepetir(
        fotosEn(f.lamina).map(({ src, alt }) => ({ src, alt, donde, enlace, en: "sitio" as const })),
        fotosEn(comoDocumento(f.borrador).lamina).map(({ src, alt }) => ({ src, alt, donde, enlace, en: "sin-publicar" as const })),
      );
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const filas = await tx.caso.findMany({ select: { id: true, lamina: true, borrador: true } });
    const cambios = filas
      .map((f) => ({ id: f.id, lamina: cambiarFoto(f.lamina, vieja, nueva), borrador: cambiarFoto(f.borrador, vieja, nueva) }))
      .filter((c) => c.lamina.cambio || c.borrador.cambio);
    await Promise.all(
      cambios.map(({ id, lamina, borrador }) =>
        // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
        tx.caso.update({
          where: { id },
          data: {
            ...(lamina.cambio ? { lamina: lamina.valor as Prisma.InputJsonValue } : {}),
            ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
          },
        }),
      ),
    );
    return cambios.some((c) => c.lamina.cambio) ? [{ ruta: "/investigacion" }] : [];
  },
};
