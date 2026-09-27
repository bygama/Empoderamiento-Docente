import { etapaVacia, recorridoVacio } from "@/features/quienes-somos/contenido/persona-vacia";
import type { EtapaEnElFormulario, HitoEnElFormulario, PublicacionEnElFormulario, RamaEnElFormulario, RecorridoEnElFormulario } from "./formulario";

// Lo que nace vacío en el formulario de un perfil, con la forma del
// formulario. Solo se crea con un clic, en el navegador: cada clave puede ser
// al azar.

type Categoria = RecorridoEnElFormulario["categorias"][number];

export function recorridoVacioEnElFormulario(): RecorridoEnElFormulario {
  return { ...recorridoVacio(), formacion: "", etapas: [] };
}

export function categoriaVacia(): Categoria {
  return { clave: crypto.randomUUID(), etiqueta: "", color: "" };
}

export function etapaVaciaEnElFormulario(): EtapaEnElFormulario {
  return { ...etapaVacia(crypto.randomUUID()), hitos: [], ramas: [], territorios: "", publicaciones: [] };
}

export function hitoVacio(): HitoEnElFormulario {
  return { clave: crypto.randomUUID(), periodo: "", titulo: "", detalle: "", principal: false };
}

export function ramaVacia(): RamaEnElFormulario {
  return { clave: crypto.randomUUID(), periodo: "", lugar: "", detalle: "" };
}

/** Una publicación nueva de la Biblioteca, sin material elegido: la de todos los días. */
export function publicacionVacia(): PublicacionEnElFormulario {
  return { clave: crypto.randomUUID(), origen: "biblioteca", material: "", detalle: "", conceptos: "", destacada: false };
}
