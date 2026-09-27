import { base } from "@/datos/cliente";
import { firmaDe } from "@/features/biblioteca/contenido/modelo";
import type { DatosDeLaPortada } from "@/features/biblioteca/portada/generar";
import { leerSinRomper } from "./leer-sin-romper";
import { materialesVisibles } from "./materiales";

// Lo que lee la portada tipográfica del sitio (SPEC §13.2 de
// `work/biblioteca/`): los materiales publicados que no tienen portada
// propia. Sin mirar la vista previa: la ruta es estática y la ve cualquiera.

/** Los publicados sin portada propia, con lo que dibuja su portada, por id. */
async function sinPortadaPropia(): Promise<Map<string, DatosDeLaPortada>> {
  const filas = await leerSinRomper("portadasGeneradas", () => base.material.findMany({ where: { publicado: true }, include: { autorias: true } }), []);
  const visibles = materialesVisibles(filas, false).filter((v) => v.material.portada === null);
  return new Map(
    visibles.map(({ id, material: m }) => [
      id,
      { titulo: m.titulo, firma: firmaDe({ autores: m.autores || null, autorias: m.autorias }), tipo: m.tipo, fuente: m.fuente, anio: m.fecha.slice(0, 4) },
    ]),
  );
}

/** Los ids que llevan la portada generada, para prerenderizarlas en el build. */
export async function idsConPortadaGenerada(): Promise<string[]> {
  return [...(await sinPortadaPropia()).keys()];
}

/** Lo que dibuja la portada de ese material, o `null` si no está publicado o tiene una propia. */
export async function datosDeLaPortada(id: string): Promise<DatosDeLaPortada | null> {
  return (await sinPortadaPropia()).get(id) ?? null;
}
