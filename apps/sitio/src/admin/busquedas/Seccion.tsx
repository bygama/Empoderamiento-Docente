import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Fila, Lista } from "@/admin/armazon/Lista";

export type FilaDeSeccion = { clave: string; principal: string; detalle: string };

/**
 * Una sección de Búsquedas: el título, qué muestra en una línea y la lista.
 * Sin filas, el estado vacío de esa sección: nunca una lista vacía muda.
 */
export function Seccion({
  id,
  titulo,
  explicacion,
  filas,
  vacio,
}: {
  id: string;
  titulo: string;
  explicacion: string;
  filas: readonly FilaDeSeccion[];
  vacio: { titulo: string; texto: string };
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div>
        <h2 id={id} className="font-display text-admin-seccion font-bold">
          {titulo}
        </h2>
        <p className="max-w-prose text-admin-meta text-gris-texto">{explicacion}</p>
      </div>
      {filas.length ? (
        <Lista>
          {filas.map((f) => (
            <Fila key={f.clave} principal={<span className="break-words">{f.principal}</span>} detalle={f.detalle} />
          ))}
        </Lista>
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      )}
    </section>
  );
}
