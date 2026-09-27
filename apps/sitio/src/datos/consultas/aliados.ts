import { draftMode } from "next/headers";
import { cache } from "react";
import type { Aliado as Fila, Foto } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { esquemaAliado, type Aliado } from "@/features/aliados/contenido/aliado";
import type { AliadoDelSitio } from "@/features/aliados/contenido/modelo";
import { fotosEn } from "@/lib/contenido/fotos-en";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que leen el sitio y el admin de los aliados (`work/casos-aliados-fotos/SPEC.md`
// §5 y §8). **Sin la marca `autorizado`, un logo no sale nunca** (AGENTS.md
// §5.4): lo filtra la consulta a la base y otra vez `aliadosVisibles`, también
// en la vista previa, y un test lo prueba.

/** Las columnas de lo publicado, como documento. Sin URL, un texto vacío. */
export function publicadoDeAliado(fila: Fila): unknown {
  return { nombre: fila.nombre, logo: fila.logo, tamano: fila.tamano, url: fila.url ?? "" };
}

type FotoDelLogo = Pick<Foto, "url" | "ancho" | "alto" | "tipo">;

/** Lo que muestra el sitio de una fila: nada sin la marca; en la vista previa, su borrador si se puede publicar; si no, lo publicado. */
function documentoVisible(fila: Fila, enVistaPrevia: boolean): Aliado | null {
  if (!fila.autorizado) return null;
  const borrador = enVistaPrevia && fila.borrador !== null ? esquemaAliado.safeParse(fila.borrador) : null;
  if (borrador?.success) return borrador.data;
  if (!fila.publicado) return null;
  const publicado = esquemaAliado.safeParse(publicadoDeAliado(fila));
  if (!publicado.success) console.warn(`El aliado ${fila.id} no pasa su esquema; no se muestra.`);
  return publicado.success ? publicado.data : null;
}

/** Los aliados de la tira, en orden, con las medidas de su logo. Pura: se prueba sin base. */
export function aliadosVisibles(filas: readonly Fila[], fotos: readonly FotoDelLogo[], enVistaPrevia: boolean): AliadoDelSitio[] {
  const porUrl = new Map(fotos.map((f) => [f.url, f]));
  return [...filas]
    .sort((a, b) => a.orden - b.orden)
    .flatMap((fila) => {
      const d = documentoVisible(fila, enVistaPrevia);
      const foto = d ? porUrl.get(d.logo.src) : undefined;
      if (d && !foto) console.warn(`El logo del aliado ${fila.id} no está en Fotos; no se muestra.`);
      if (!d || !foto) return [];
      return [{ id: fila.id, src: foto.url, alt: d.logo.alt, ancho: foto.ancho, alto: foto.alto, vectorial: foto.tipo === "image/svg+xml", tamano: d.tamano, url: d.url || null }];
    });
}

/**
 * La tira de aliados: el pie de todas las páginas, el Inicio y Qué hacemos.
 * Con `cache` de React: el layout y la página la piden en el mismo pedido.
 * Sin base, ninguno: la tira queda vacía y el sitio compila.
 */
export const aliadosDelSitio = cache(async (): Promise<AliadoDelSitio[]> => {
  const leidos = await leerSinRomper(
    "aliadosDelSitio",
    async () => {
      const filas = await base.aliado.findMany({ where: { autorizado: true } });
      // Los logos de lo publicado y de los borradores: la vista previa puede mostrar uno nuevo.
      const urls = filas.flatMap((f) => fotosEn([f.logo, f.borrador]).map((foto) => foto.src));
      const fotos = await base.foto.findMany({ where: { url: { in: urls } }, select: { url: true, ancho: true, alto: true, tipo: true } });
      return { filas, fotos };
    },
    { filas: [], fotos: [] },
  );
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  return aliadosVisibles(leidos.filas, leidos.fotos, isEnabled);
});
