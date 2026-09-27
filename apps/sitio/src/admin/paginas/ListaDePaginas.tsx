import Link from "next/link";
import { BotonEnlace, Fila, Insignia, Lista } from "@ed/kit-admin";
import type { FilaDeLista } from "@/datos/consultas/editor-de-paginas";
import { Cuando } from "./Cuando";
import { insigniaDelEstado } from "./estado";

const EDITOR = "/admin/contenido/paginas";

/** Los links a cada sección, directo a su bloque del editor (`#seccion-<clave>`). */
function Secciones({ slug, secciones }: Pick<FilaDeLista, "slug" | "secciones">) {
  return (
    <ul className="space-y-1">
      {secciones.map((s) => (
        <li key={s.clave}>
          <Link
            href={`${EDITOR}/${slug}#seccion-${s.clave}`}
            className="inline-flex min-h-8 items-center rounded-sm text-admin-meta text-azul-medio underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
          >
            {s.nombre}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Las siete páginas en el orden del menú del sitio (SPEC padre §5.3), con la
 * misma insignia y el mismo «quién y cuándo» que el editor, y sus secciones
 * desplegables. La que no tiene secciones va atenuada: sin estado, porque
 * nunca se editó, y con la nota en el lugar de «Editar».
 */
export function ListaDePaginas({ filas }: { filas: FilaDeLista[] }) {
  return (
    <Lista>
      {filas.map((f) => {
        const principal = (
          <>
            {f.nombre} <span className="text-admin-meta font-normal text-gris-texto">{f.ruta}</span>
          </>
        );
        if (!f.editable) return <Fila key={f.slug} principal={principal} atenuada="Todavía no se edita desde acá" />;
        const insignia = insigniaDelEstado(f.estado);
        const cuantas = f.secciones.length === 1 ? "1 sección" : `${f.secciones.length} secciones`;
        return (
          <Fila
            key={f.slug}
            principal={principal}
            detalle={<Cuando estado={f.estado} />}
            insignias={<Insignia tono={insignia.tono}>{insignia.etiqueta}</Insignia>}
            accion={
              <BotonEnlace variante="secundario" href={`${EDITOR}/${f.slug}`}>
                Editar<span className="sr-only"> {f.nombre}</span>
              </BotonEnlace>
            }
            desplegable={f.secciones.length > 0 ? { resumen: cuantas, contenido: <Secciones slug={f.slug} secciones={f.secciones} /> } : undefined}
          />
        );
      })}
    </Lista>
  );
}
