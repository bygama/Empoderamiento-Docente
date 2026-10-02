import { BotonEnlace, Fila, Insignia, Lista } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import type { FilaDeCaso } from "@/datos/consultas/casos-del-admin";

/** Lo último que le pasó: el borrador guardado, la última publicación o que llegó con el sitio. */
function Ultimo({ estado }: { estado: FilaDeCaso["estado"] }) {
  if (estado.borradorEn) {
    return (
      <span>
        Guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}
      </span>
    );
  }
  if (estado.publicadoEn && estado.publicadoPor) {
    return (
      <span>
        Publicado <Momento iso={estado.publicadoEn} relativo /> por {estado.publicadoPor}
      </span>
    );
  }
  return <span>Llegó con el sitio</span>;
}

/**
 * Los casos fijos (SPEC §7.1 de `work/casos-aliados-fotos/`), una `Lista` en
 * el orden de la pila: «Caso 01» y la pregunta; debajo el eje y lo último que
 * le pasó; a la derecha, si tiene cambios sin publicar, y «Editar». Sin
 * primario: los casos no se crean.
 */
export function ListaDeCasos({ filas }: { filas: readonly FilaDeCaso[] }) {
  return (
    <Lista>
      {filas.map((f) => (
        <Fila
          key={f.id}
          principal={
            <>
              <span className="text-admin-meta font-medium text-gris-texto">Caso {f.numero}</span> {f.pregunta}
            </>
          }
          detalle={
            <span className="flex flex-wrap gap-x-2">
              <span>{f.eje} ·</span>
              <Ultimo estado={f.estado} />
            </span>
          }
          insignias={f.estado.borradorEn ? <Insignia tono="fuerte">Cambios sin publicar</Insignia> : null}
          accion={
            <BotonEnlace variante="secundario" href={`/admin/contenido/casos/${f.id}`} aria-label={`Editar el caso ${f.numero}`}>
              Editar
            </BotonEnlace>
          }
        />
      ))}
    </Lista>
  );
}
