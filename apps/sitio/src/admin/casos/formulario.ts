import type { BorradorDeCaso } from "@/features/investigacion/contenido/caso";

// Un caso como lo edita su formulario, y de vuelta a documento. La diferencia
// son las dos listas: cada evidencia y cada producción llevan una clave
// estable (para mover y quitar sin que el contenido salte de lugar), que no
// se guarda. Y el título de una evidencia vuelve en mayúsculas: es el rótulo
// de un archivo, y el esquema lo pide así.

type Evidencia = BorradorDeCaso["evidencias"][number];
type Produccion = BorradorDeCaso["produccionRelacionada"][number];

export type EvidenciaEnElFormulario = Evidencia & { clave: string };
export type ProduccionEnElFormulario = Produccion & { clave: string };
export type CasoEnElFormulario = Omit<BorradorDeCaso, "evidencias" | "produccionRelacionada"> & {
  evidencias: EvidenciaEnElFormulario[];
  produccionRelacionada: ProduccionEnElFormulario[];
};

/** Las claves de lo que ya estaba son su posición: así el servidor y el navegador dibujan lo mismo. */
export function aFormulario(d: BorradorDeCaso): CasoEnElFormulario {
  return {
    ...d,
    evidencias: d.evidencias.map((e, i) => ({ ...e, clave: `e${i}` })),
    produccionRelacionada: d.produccionRelacionada.map((p, i) => ({ ...p, clave: `p${i}` })),
  };
}

export function aDocumento({ evidencias, produccionRelacionada, ...resto }: CasoEnElFormulario): BorradorDeCaso {
  return {
    ...resto,
    evidencias: evidencias.map(({ titulo, descripcion, movible }) => ({ titulo: titulo.toLocaleUpperCase("es"), descripcion, movible })),
    produccionRelacionada: produccionRelacionada.map(({ titulo, href }) => ({ titulo, href })),
  };
}

/** Una evidencia nueva, vacía. Solo se crea con un clic, en el navegador: su clave puede ser al azar. */
export function evidenciaVacia(): EvidenciaEnElFormulario {
  return { clave: crypto.randomUUID(), titulo: "", descripcion: "", movible: true };
}

export function produccionVacia(): ProduccionEnElFormulario {
  return { clave: crypto.randomUUID(), titulo: "", href: "/biblioteca" };
}
