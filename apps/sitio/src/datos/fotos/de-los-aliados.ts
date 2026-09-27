import type { Prisma } from "@/../prisma/generado/client";
import { comoDocumento } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type Donde, type UsosDeUnModulo } from "./uso";

// Los logos de los aliados (`work/casos-aliados-fotos/SPEC.md` §3.3): en su
// columna y en el borrador. En el sitio está solo el publicado y autorizado;
// el otro se guarda para cuando se publique.

export const usosEnAliados: UsosDeUnModulo = {
  modulo: "Aliados",
  async buscar(base) {
    const filas = await base.aliado.findMany({ select: { id: true, nombre: true, logo: true, borrador: true, publicado: true, autorizado: true } });
    return filas.flatMap((f) => {
      const borrador = comoDocumento(f.borrador);
      const nombre = f.nombre || (typeof borrador.nombre === "string" && borrador.nombre.trim()) || "sin nombre";
      const donde = `Aliado ${nombre} › Logo`;
      const enlace = `/admin/contenido/aliados/${f.id}`;
      const en: Donde = f.publicado && f.autorizado ? "sitio" : "sin-publicar";
      return sinRepetir(
        fotosEn(f.logo).map(({ src, alt }) => ({ src, alt, donde, enlace, en })),
        fotosEn(borrador.logo).map(({ src, alt }) => ({ src, alt, donde, enlace, en: "sin-publicar" as const })),
      );
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const filas = await tx.aliado.findMany({ select: { id: true, logo: true, borrador: true, publicado: true, autorizado: true } });
    const cambios = filas
      .map((f) => ({ id: f.id, enElSitio: f.publicado && f.autorizado, logo: cambiarFoto(f.logo, vieja, nueva), borrador: cambiarFoto(f.borrador, vieja, nueva) }))
      .filter((c) => c.logo.cambio || c.borrador.cambio);
    await Promise.all(
      cambios.map(({ id, logo, borrador }) =>
        // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
        tx.aliado.update({
          where: { id },
          data: {
            ...(logo.cambio ? { logo: logo.valor as Prisma.InputJsonValue } : {}),
            ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
          },
        }),
      ),
    );
    // La tira va en el pie de todas las páginas: el layout entero.
    return cambios.some((c) => c.logo.cambio && c.enElSitio) ? [{ ruta: "/", layout: true }] : [];
  },
};
