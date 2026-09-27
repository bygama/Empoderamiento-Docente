import { BotonEnlace } from "@ed/kit-admin";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDeNovedad, FilaDeLaLista } from "@/datos/consultas/lista-de-novedades";
import { fechaCorta } from "@/features/novedades/contenido/fechas";

// Lo que dice la insignia de cada estado (DESIGN.md §11, «Insignias»). Lo que
// pide atención va fuerte; «Despublicada» ya no está en el sitio y va apagada.
// Una publicada sin cambios no lleva: en Publicadas lo son todas.
const INSIGNIA: Partial<Record<EstadoDeNovedad, { tono: "fuerte" | "apagado"; texto: string }>> = {
  "con-cambios": { tono: "fuerte", texto: "Cambios sin publicar" },
  despublicada: { tono: "apagado", texto: "Despublicada" },
};

const QUE: Record<FilaDeLaLista["ultimo"]["que"], string> = { guardo: "Guardada", publico: "Publicada", creo: "Creada" };

/**
 * Las novedades de una pestaña (`Lista` de DESIGN.md §11): el título, y
 * al lado si es la destacada, y debajo la categoría, la fecha y lo último que
 * le pasó; a la derecha el estado y «Editar», con el título para el lector.
 */
export function ListaDeNovedades({ filas }: { filas: readonly FilaDeLaLista[] }) {
  return (
    <Lista>
      {filas.map((f) => {
        const insignia = INSIGNIA[f.estado];
        const titulo = f.titulo || "Sin título todavía";
        return (
          <Fila
            key={f.id}
            principal={
              <>
                {f.titulo ? f.titulo : <span className="text-gris-texto">{titulo}</span>}
                {/* Al lado, en meta (DESIGN.md §11, «Lista»); la estrella es decorativa y se lee «Destacada». */}
                {f.destacada ? (
                  <span className="ml-2 text-admin-meta font-normal text-gris-texto">
                    <span aria-hidden="true">★</span> Destacada
                  </span>
                ) : null}
              </>
            }
            detalle={
              <span className="flex flex-wrap gap-x-2">
                <span>{f.categoria} ·</span>
                {f.fecha ? <span>{fechaCorta(f.fecha)} ·</span> : null}
                <span>
                  {QUE[f.ultimo.que]} <Momento iso={f.ultimo.en} relativo />
                  {f.ultimo.quien ? ` por ${f.ultimo.quien}` : ""}
                </span>
              </span>
            }
            insignias={insignia ? <Insignia tono={insignia.tono}>{insignia.texto}</Insignia> : null}
            accion={
              <BotonEnlace variante="secundario" href={`/admin/novedades/${f.id}`} aria-label={`Editar «${titulo}»`}>
                Editar
              </BotonEnlace>
            }
          />
        );
      })}
    </Lista>
  );
}
