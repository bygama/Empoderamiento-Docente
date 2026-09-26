import Image from "next/image";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import type { CambiosDeUnaParte } from "@/datos/consultas/historial-de-paginas";
import type { Diferencia, Legible } from "@/lib/contenido/comparar";

/**
 * Un valor, como estaba o como queda. Antes va en `gris-texto` (4,83:1) y
 * ahora en `azul-principal`: la jerarquía sale del contraste, sin rojo ni
 * verde (DESIGN.md §11), porque cambiar no es un error ni un concepto.
 */
function Valor({ etiqueta, valor, antes }: { etiqueta: string; valor: Legible; antes?: boolean }) {
  const color = antes ? "text-gris-texto" : "";
  return (
    <div className="min-w-0">
      <p className="text-admin-meta text-gris-texto">{etiqueta}</p>
      {valor.tipo === "texto" ? <p className={`mt-1 whitespace-pre-line ${color}`}>{valor.texto}</p> : null}
      {valor.tipo === "foto" ? (
        <figure className="mt-1">
          {/* La miniatura en 4/3 con su foco, como en el formulario; lo que dice va en el alt de abajo. */}
          <span className="relative block aspect-4/3 w-40 overflow-hidden rounded-lg bg-gris-fondo">
            <Image src={valor.src} alt="" fill sizes="160px" className="object-cover" style={{ objectPosition: valor.foco }} />
          </span>
          <figcaption className={`mt-1 text-admin-meta ${color}`}>{valor.alt || "Sin texto alternativo"}</figcaption>
        </figure>
      ) : null}
      {valor.tipo === "nada" ? <p className="mt-1 text-gris-texto">Nada</p> : null}
    </div>
  );
}

/** Un campo que cambió: dónde, en etiquetas, y antes y ahora, uno al lado del otro cuando hay lugar. */
function Cambio({ diferencia: { donde, antes, despues } }: { diferencia: Diferencia }) {
  return (
    <li className="grid gap-x-6 gap-y-3 py-4 md:grid-cols-2">
      <p className="text-admin-meta font-medium md:col-span-2">{donde.length > 0 ? donde.join(" › ") : "Toda la sección"}</p>
      <Valor etiqueta="Antes" valor={antes} antes />
      <Valor etiqueta="Ahora" valor={despues} />
    </li>
  );
}

/**
 * «Qué cambió» (SPEC §4 de `work/paginas-inicio/`): el borrador contra lo
 * publicado, por parte y campo por campo. Sin diferencias, el estado vacío
 * dice por qué: no hay borrador, o el borrador es igual a lo publicado.
 */
export function ListaDeCambios({ cambios, hayBorrador }: { cambios: readonly CambiosDeUnaParte[]; hayBorrador: boolean }) {
  if (cambios.length === 0) {
    return hayBorrador ? (
      <EstadoVacio titulo="El borrador es igual a lo publicado" texto="Se guardó sin cambiar nada: publicarlo deja el sitio como está." />
    ) : (
      <EstadoVacio titulo="No hay cambios sin publicar" texto="Lo que guardes como borrador se compara acá con lo publicado, campo por campo." />
    );
  }
  return (
    <div className="space-y-8">
      {cambios.map((parte) => (
        <section key={parte.clave} aria-labelledby={`cambios-${parte.clave}`}>
          <h2 id={`cambios-${parte.clave}`} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
            {parte.nombre}
          </h2>
          <ul className="divide-y divide-azul-claro/60">
            {parte.diferencias.map((d) => (
              <Cambio key={d.donde.join(" › ")} diferencia={d} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
