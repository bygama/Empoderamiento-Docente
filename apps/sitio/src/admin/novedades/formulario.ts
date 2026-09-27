import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";

// Una novedad como la edita su formulario, y de vuelta a documento. La única
// diferencia es el cuerpo: cada sección lleva una clave estable (para mover y
// quitar sin que el contenido salte de lugar) y su texto en un solo campo, un
// renglón por párrafo; al guardar vuelve a ser una lista de párrafos.

export type SeccionEnElFormulario = { clave: string; titulo: string; texto: string };
export type NovedadEnElFormulario = Omit<BorradorDeNovedad, "cuerpo"> & { cuerpo: SeccionEnElFormulario[] };

/** Las claves de lo que ya estaba son su posición: así el servidor y el navegador dibujan lo mismo. */
export function aFormulario(documento: BorradorDeNovedad): NovedadEnElFormulario {
  return { ...documento, cuerpo: documento.cuerpo.map((s, i) => ({ clave: `s${i}`, titulo: s.titulo, texto: s.parrafos.join("\n") })) };
}

/** El documento que se guarda: los párrafos son los renglones con texto, sin los vacíos. */
export function aDocumento({ cuerpo, ...resto }: NovedadEnElFormulario): BorradorDeNovedad {
  return {
    ...resto,
    cuerpo: cuerpo.map((s) => ({
      titulo: s.titulo,
      parrafos: s.texto
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    })),
  };
}

/** Una sección nueva, vacía. Solo se crea con un clic, en el navegador: su clave puede ser al azar. */
export function seccionVacia(): SeccionEnElFormulario {
  return { clave: crypto.randomUUID(), titulo: "", texto: "" };
}

/** El valor con las claves de cada objeto en orden alfabético: dos documentos iguales dan el mismo texto. */
function ordenado(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(ordenado);
  if (valor === null || typeof valor !== "object") return valor;
  return Object.fromEntries(
    Object.entries(valor)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([clave, v]) => [clave, ordenado(v)]),
  );
}

/**
 * Si dos documentos dicen lo mismo: lo que decide «Cambios sin guardar». Sin
 * mirar el orden de las claves, que no es contenido: el `jsonb` de la base
 * las guarda en el suyo, y el formulario arma el cuerpo al final.
 */
export function mismoDocumento(a: BorradorDeNovedad, b: BorradorDeNovedad): boolean {
  return JSON.stringify(ordenado(a)) === JSON.stringify(ordenado(b));
}
