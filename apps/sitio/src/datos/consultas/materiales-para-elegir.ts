import { base } from "@/datos/cliente";
import { comoDocumento } from "@/lib/contenido/documento";

// Los materiales que una novedad puede abrir al final de su ficha (work/
// biblioteca/SPEC.md §4.2): todos, con el título de lo que se edita y el año,
// y los que el sitio no muestra, marcados, porque su botón no va a salir.

export type MaterialParaElegir = { id: string; etiqueta: string };

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function materialesParaElegir(): Promise<MaterialParaElegir[]> {
  const filas = await base.material.findMany({ select: { id: true, titulo: true, fecha: true, publicado: true, borrador: true } });
  return filas
    .map((f) => {
      const d = comoDocumento(f.borrador);
      const titulo = f.titulo ?? (texto(d.titulo) || "Sin título");
      const anio = (f.fecha ?? texto(d.fecha)).slice(0, 4);
      const etiqueta = `${titulo}${anio ? ` (${anio})` : ""}${f.publicado ? "" : " · no está en el sitio"}`;
      return { id: f.id, etiqueta };
    })
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
}
