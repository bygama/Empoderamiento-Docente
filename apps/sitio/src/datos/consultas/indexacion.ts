import { puede } from "@ed/auth";
import { base } from "@/datos/cliente";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";
import { ultimaCorrida, type UltimaCorrida } from "@/datos/tareas/corridas";
import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";

// Lo que Ajustes › SEO muestra de la indexación (work/ajustes/SPEC.md §5.3):
// una fila por ruta del sitemap, con lo último que dijo Google, y cómo salió
// la última revisión. De la copia; nunca de la API en el render.

export type FilaDeIndexacion = {
  ruta: string;
  /** null: todavía no se revisó. */
  veredicto: string | null;
  cobertura: string | null;
  ultimoRastreo: Date | null;
  revisadaEn: Date | null;
};

export type Indexacion = { conectado: boolean; filas: FilaDeIndexacion[]; ultima: UltimaCorrida | null };

/** Sin `usarAjustes`, `null`. */
export async function leerIndexacion(rol: unknown): Promise<Indexacion | null> {
  if (!puede(rol, "usarAjustes")) return null;
  const [rutas, revisadas, ultima] = await Promise.all([rutasDelSitio(), base.indexacionDeUrl.findMany(), ultimaCorrida("indexacion-de-google")]);
  const deLaRuta = new Map(revisadas.map((r) => [r.ruta, r]));
  const filas = rutas.map((ruta) => {
    const r = deLaRuta.get(ruta);
    return { ruta, veredicto: r?.veredicto ?? null, cobertura: r?.cobertura ?? null, ultimoRastreo: r?.ultimoRastreo ?? null, revisadaEn: r?.revisadaEn ?? null };
  });
  return { conectado: hayVariablesDeBusquedas(), filas, ultima };
}
