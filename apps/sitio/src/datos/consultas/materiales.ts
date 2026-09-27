import { draftMode } from "next/headers";
import { cache } from "react";
import type { Autoria, Material as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import { destacadosDe, materialDelSitio } from "@/features/biblioteca/contenido/del-sitio";
import { esquemaMaterial, type DestacadoDelSitio, type Material, type MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { anioDe } from "@/features/biblioteca/contenido/modelo";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que lee el sitio de la Biblioteca (SPEC §13 de `work/biblioteca/`): los
// materiales publicados o, en vista previa, cada uno como quedaría al
// publicarlo. Todo pasa por `esquemaMaterial` al leer: una fila que no pasa no
// llega a la pantalla. Son decenas de filas: se leen todas y se ordenan acá.

export type FilaConAutorias = Fila & { autorias: Autoria[] };

/** Las columnas de lo publicado, con sus autorías, como documento: lo que `esquemaMaterial` valida. */
export function publicadoDe(fila: FilaConAutorias): unknown {
  return {
    titulo: fila.titulo,
    autorias: [...fila.autorias].sort((a, b) => a.orden - b.orden).map(({ nombre, persona }) => ({ nombre, persona })),
    autores: fila.autores ?? "",
    descripcion: fila.descripcion ?? "",
    tipo: fila.tipo,
    tema: fila.tema,
    publico: fila.publico,
    fecha: fila.fecha,
    formato: fila.formato,
    paginas: fila.paginas,
    portada: fila.portada,
    url: fila.url,
    fuente: fila.fuente,
    doi: fila.doi ?? "",
    cita: fila.cita ?? "",
    destacado: fila.destacado,
    rotulo: fila.rotulo ?? "",
    frase: fila.frase ?? "",
    detalle: fila.detalle ?? "",
  };
}

type Visible = { id: string; creadoEn: Date; material: Material };

/** El material válido, o `null` si el documento no pasa (y se avisa). */
function valido(documento: unknown, id: string): Material | null {
  const v = esquemaMaterial.safeParse(documento);
  if (v.success) return v.data;
  console.warn(`El material ${id} no pasa su esquema; no se muestra.`);
  return null;
}

/**
 * Qué ve el sitio de cada fila: lo publicado; en vista previa, el borrador si
 * se puede publicar, y si no lo publicado. Uno que no está en el sitio se ve
 * en la vista previa solo si su borrador se puede publicar.
 */
function visible(fila: FilaConAutorias, enVistaPrevia: boolean): Material | null {
  if (enVistaPrevia && fila.borrador !== null) {
    const borrador = esquemaMaterial.safeParse(fila.borrador);
    if (borrador.success) return borrador.data;
  }
  return fila.publicado ? valido(publicadoDe(fila), fila.id) : null;
}

/** Los materiales que ve el sitio, por año (el más nuevo primero) y, dentro de un año, en el orden de carga. Pura: se prueba sin base. */
export function materialesVisibles(filas: readonly FilaConAutorias[], enVistaPrevia: boolean): Visible[] {
  return filas
    .flatMap((fila) => {
      const material = visible(fila, enVistaPrevia);
      return material ? [{ id: fila.id, creadoEn: fila.creadoEn, material }] : [];
    })
    .sort((a, b) => anioDe(b.material.fecha) - anioDe(a.material.fecha) || a.creadoEn.getTime() - b.creadoEn.getTime());
}

/**
 * Lo que ve el sitio, una vez por pedido (`cache` de React: la página y el
 * Inicio lo piden juntos). Sin base, nada: el catálogo muestra su estado vacío.
 */
const visiblesDelSitio = cache(async (): Promise<Visible[]> => {
  const filas = await leerSinRomper("materialesDelSitio", () => base.material.findMany({ include: { autorias: true } }), []);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  return materialesVisibles(filas, isEnabled);
});

/** El catálogo de la Biblioteca, en orden. */
export async function materialesDelSitio(): Promise<MaterialDelSitio[]> {
  return (await visiblesDelSitio()).map(({ id, material }) => materialDelSitio(material, id));
}

/** Los destacados, en su lugar: los de «Material destacado» y los del Inicio. */
export async function destacadosDelSitio(): Promise<DestacadoDelSitio[]> {
  return destacadosDe(await visiblesDelSitio());
}
