import { BotonEnlace } from "@ed/kit-admin";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import type { FilaDePendiente } from "@/datos/inicio/filas-de-pendientes";

/**
 * «¿Qué tengo que hacer?»: solo las filas con algo pendiente, ya ordenadas
 * por urgencia, cada una con el link a la pantalla que la resuelve. La
 * insignia fuerte con la cuenta es lo único que pide atención en el Inicio;
 * sin pendientes no está, y en su lugar va «Todo al día».
 */
export function Pendientes({ filas }: { filas: readonly FilaDePendiente[] }) {
  return (
    <section aria-labelledby="pendientes" className="space-y-3">
      {/* 40 px de alto, como la fila de «Esta semana» con su link: así los dos títulos quedan a la misma altura. */}
      <h2 id="pendientes" className="flex min-h-10 items-center gap-2 font-display text-admin-seccion font-bold">
        Pendientes
        {filas.length ? <Insignia tono="fuerte">{filas.length}</Insignia> : null}
      </h2>
      {filas.length ? (
        <Lista>
          {filas.map((f) => (
            <Fila
              key={f.clave}
              principal={f.titulo}
              detalle={f.detalle}
              accion={
                <BotonEnlace variante="secundario" href={f.href} aria-label={`${f.accion}: ${f.titulo}`}>
                  {f.accion}
                </BotonEnlace>
              }
            />
          ))}
        </Lista>
      ) : (
        <EstadoVacio titulo="Todo al día" texto="Nada espera por vos. Cuando algo necesite tu atención, aparece acá." />
      )}
    </section>
  );
}
