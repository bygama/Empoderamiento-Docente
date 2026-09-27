import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Fila, Lista } from "@/admin/armazon/Lista";

export type FilaDeSeccion = { clave: string; principal: string; detalle: string };

/**
 * Un bloque de una pantalla de Métricas: el título, qué muestra en una línea
 * y lo suyo abajo. El `id` va en el título: es el ancla del bloque
 * (`/admin/metricas/origen#paises`) y lo que lo nombra para el lector.
 */
export function Bloque({ id, titulo, explicacion, children }: { id: string; titulo: string; explicacion?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <div>
        <h2 id={id} className="scroll-mt-6 font-display text-admin-seccion font-bold">
          {titulo}
        </h2>
        {explicacion ? <p className="max-w-prose text-admin-meta text-gris-texto">{explicacion}</p> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Un bloque que es una lista (Búsquedas, y las listas de Resumen y Origen).
 * Sin filas, el estado vacío de ese bloque: nunca una lista vacía muda.
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
    <Bloque id={id} titulo={titulo} explicacion={explicacion}>
      {filas.length ? (
        <Lista>
          {filas.map((f) => (
            <Fila key={f.clave} principal={<span className="break-words">{f.principal}</span>} detalle={f.detalle} />
          ))}
        </Lista>
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      )}
    </Bloque>
  );
}
