import type { Prisma } from "@/../prisma/generado/client";
import { nombreDe } from "@/datos/acciones/equipo-en-base";
import { comoDocumento } from "@/lib/contenido/documento";
import { cambiarFoto, fotosEn } from "@/lib/contenido/fotos-en";
import { sinRepetir, type Donde, type Uso, type UsosDeUnModulo } from "./uso";

// Las fotos de los perfiles del Equipo (`work/equipo/SPEC.md` §9): la de la
// tarjeta (columna `foto`) y la de la figura del recorrido (columna `figura`),
// en lo publicado y en el borrador. En el sitio está solo lo publicado, y la
// foto de la tarjeta, si el perfil no pidió ir «Sin foto».

type Lugar = { bloque: "tarjeta" | "figura"; nombre: string };
const TARJETA: Lugar = { bloque: "tarjeta", nombre: "Tarjeta" };
const FIGURA: Lugar = { bloque: "figura", nombre: "Figura" };

/** Los usos de un valor que tiene fotos adentro, en un lugar del perfil. */
function usosDe(valor: unknown, lugar: Lugar, persona: { id: string; nombre: string }, en: Donde): Uso[] {
  const donde = `Perfil de ${persona.nombre} › ${lugar.nombre}`;
  const enlace = `/admin/contenido/equipo/${persona.id}#bloque-${lugar.bloque}`;
  return fotosEn(valor).map(({ src, alt }) => ({ src, alt, donde, enlace, en }));
}

export const usosEnEquipo: UsosDeUnModulo = {
  modulo: "Equipo",
  async buscar(base) {
    const filas = await base.persona.findMany({ select: { id: true, nombre: true, foto: true, sinFoto: true, figura: true, borrador: true, publicado: true } });
    return filas.flatMap((f) => {
      const persona = { id: f.id, nombre: nombreDe(f) };
      const borrador = comoDocumento(f.borrador);
      const publicados = [
        ...usosDe(f.foto, TARJETA, persona, f.publicado && !f.sinFoto ? "sitio" : "sin-publicar"),
        ...usosDe(f.figura, FIGURA, persona, f.publicado ? "sitio" : "sin-publicar"),
      ];
      const delBorrador = [...usosDe(borrador.foto, TARJETA, persona, "sin-publicar"), ...usosDe(comoDocumento(borrador.recorrido).figura, FIGURA, persona, "sin-publicar")];
      return sinRepetir(publicados, delBorrador);
    });
  },
  async reemplazar(tx, vieja, nueva) {
    const filas = await tx.persona.findMany({ select: { id: true, foto: true, figura: true, borrador: true, publicado: true } });
    const cambios = filas
      .map((f) => ({ id: f.id, publicado: f.publicado, foto: cambiarFoto(f.foto, vieja, nueva), figura: cambiarFoto(f.figura, vieja, nueva), borrador: cambiarFoto(f.borrador, vieja, nueva) }))
      .filter((c) => c.foto.cambio || c.figura.cambio || c.borrador.cambio);
    await Promise.all(
      cambios.map(({ id, foto, figura, borrador }) =>
        // Los `as`: salieron de una columna Json y solo cambió un texto adentro, así que siguen siendo JSON.
        tx.persona.update({
          where: { id },
          data: {
            ...(foto.cambio ? { foto: foto.valor as Prisma.InputJsonValue } : {}),
            ...(figura.cambio ? { figura: figura.valor as Prisma.InputJsonValue } : {}),
            ...(borrador.cambio ? { borrador: borrador.valor as Prisma.InputJsonValue } : {}),
          },
        }),
      ),
    );
    // Los perfiles se ven solo en Quiénes somos.
    return cambios.some((c) => c.publicado && (c.foto.cambio || c.figura.cambio)) ? [{ ruta: "/quienes-somos" }] : [];
  },
};
