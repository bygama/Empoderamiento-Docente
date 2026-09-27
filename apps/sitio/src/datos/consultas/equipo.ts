import { draftMode } from "next/headers";
import { cache } from "react";
import type { Persona as Fila } from "@/../prisma/generado/client";
import { base } from "@/datos/cliente";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { personaDelSitio } from "@/features/quienes-somos/contenido/del-sitio";
import { esquemaPersona, type Persona } from "@/features/quienes-somos/contenido/persona";
import type { PersonaDelSitio } from "@/features/quienes-somos/contenido/perfil-del-sitio";
import { leerSinRomper } from "./leer-sin-romper";
import { materialesDelSitio } from "./materiales";

// Lo que lee el sitio del Equipo (SPEC §8 de `work/equipo/`): las personas
// publicadas o, en vista previa, cada una como quedaría al publicarla, en el
// orden de su nivel. Todo pasa por `esquemaPersona` al leer: una fila que no
// pasa no llega a la pantalla. Las publicaciones de la Biblioteca se
// resuelven contra lo que el sitio muestra y cada persona firma.

/** Las columnas de lo publicado, como documento: lo que `esquemaPersona` valida. Las del recorrido, nulas juntas, son «sin recorrido». */
export function publicadoDe(fila: Fila): unknown {
  return {
    slug: fila.slug,
    nombre: fila.nombre,
    rol: fila.rol,
    pais: fila.pais,
    nivel: fila.nivel,
    foto: fila.foto,
    sinFoto: fila.sinFoto,
    acercamiento: fila.acercamiento,
    recorrido:
      fila.titular === null
        ? null
        : {
            nombreCompleto: fila.nombreCompleto,
            rolCompleto: fila.rolCompleto,
            lugar: fila.lugar,
            origen: fila.origen ?? "",
            titular: fila.titular,
            intro: fila.intro,
            formacion: fila.formacion,
            categorias: fila.categorias,
            figura: fila.figura,
            etapas: fila.etapas,
            cierre: { titulo: fila.cierreTitulo, texto: fila.cierreTexto, textoDos: fila.cierreTexto2 ?? "" },
          },
  };
}

type Visible = { id: string; orden: number; persona: Persona };

/**
 * Qué ve el sitio de cada fila: lo publicado; en vista previa, el borrador si
 * se puede publicar, y si no lo publicado. Por nivel (el del documento que se
 * ve) y, dentro de un nivel, por `orden`. Pura: se prueba sin base.
 */
export function personasVisibles(filas: readonly Fila[], enVistaPrevia: boolean): Visible[] {
  return filas
    .flatMap((fila) => {
      const borrador = enVistaPrevia && fila.borrador !== null ? esquemaPersona.safeParse(fila.borrador) : null;
      if (borrador?.success) return [{ id: fila.id, orden: fila.orden, persona: borrador.data }];
      if (!fila.publicado) return [];
      const publicado = esquemaPersona.safeParse(publicadoDe(fila));
      if (publicado.success) return [{ id: fila.id, orden: fila.orden, persona: publicado.data }];
      console.warn(`La persona ${fila.id} no pasa su esquema; no se muestra.`);
      return [];
    })
    .sort((a, b) => a.persona.nivel - b.persona.nivel || a.orden - b.orden);
}

/** Lo que cada persona firma entre lo que el sitio muestra de la Biblioteca. Pura. */
export function firmadosPorPersona(materiales: readonly MaterialDelSitio[], autorias: ReadonlyArray<{ materialId: string; personaId: string | null }>) {
  const porId = new Map(materiales.map((m) => [m.id, m]));
  const firmados = new Map<string, Map<string, MaterialDelSitio>>();
  for (const { materialId, personaId } of autorias) {
    const material = porId.get(materialId);
    if (!personaId || !material) continue;
    if (!firmados.has(personaId)) firmados.set(personaId, new Map());
    firmados.get(personaId)?.set(materialId, material);
  }
  return firmados;
}

/** El equipo que muestra Quiénes somos, en orden. Sin base, nadie: la sección muestra sus textos. */
export const equipoDelSitio = cache(async (): Promise<PersonaDelSitio[]> => {
  const [filas, autorias] = await leerSinRomper(
    "equipoDelSitio",
    () => Promise.all([base.persona.findMany(), base.autoria.findMany({ where: { personaId: { not: null } }, select: { materialId: true, personaId: true } })]),
    [[], []],
  );
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled } = await draftMode();
  const firmados = firmadosPorPersona(await materialesDelSitio(), autorias);
  return personasVisibles(filas, isEnabled).map(({ id, persona }) => personaDelSitio(persona, firmados.get(id) ?? new Map()));
});
