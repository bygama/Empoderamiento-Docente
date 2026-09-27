import { Aviso, BotonEnlace, Buscador, Encabezado, EstadoVacio, Pestanas } from "@ed/kit-admin";
import { listaDeNovedades, type PestanaDeNovedades } from "@/datos/consultas/lista-de-novedades";
import { ListaDeNovedades } from "./ListaDeNovedades";

/** Las dos pantallas del módulo, en pestañas. Publicadas es la puerta: después de la carga inicial, ahí está todo (DECISIONS, D). */
const PESTANAS: Record<PestanaDeNovedades, { href: string; etiqueta: string }> = {
  publicadas: { href: "/admin/novedades", etiqueta: "Publicadas" },
  borradores: { href: "/admin/novedades/borradores", etiqueta: "Borradores" },
};

/** Qué dice la pantalla cuando no hay filas: sin ninguna novedad, sin resultados, o con la otra pestaña llena. */
function vacioDe(pestana: PestanaDeNovedades, q: string | undefined, hayNovedades: boolean) {
  if (!hayNovedades) return { titulo: "Todavía no hay novedades.", texto: "Una novedad es lo que ED publica con fecha: una publicación, un encuentro, una convocatoria, prensa o una alianza." };
  if (q) return { titulo: `Nada coincide con «${q}» en ${PESTANAS[pestana].etiqueta}`, texto: "Probá con otra palabra, en la otra pestaña, o borrá la búsqueda." };
  if (pestana === "borradores") return { titulo: "No hay borradores.", texto: "Todas las novedades están publicadas. Una novedad nueva queda acá hasta que se publica." };
  return { titulo: "No hay novedades publicadas.", texto: "Las de Borradores aparecen acá cuando se publican." };
}

/**
 * La lista de Novedades (SPEC §6.1 de `work/novedades-y-kit/`): el módulo en
 * el `h1` con «Nueva novedad», sus dos pestañas, el buscador y la lista, o qué
 * pasa si no hay nada. Sin ninguna novedad, «Nueva novedad» va en el estado
 * vacío y no en el encabezado: un solo primario por pantalla. `borrada` es la
 * confirmación de volver de «Borrar».
 */
export async function PantallaDeNovedades({ pestana, q, borrada = false }: { pestana: PestanaDeNovedades; q?: string; borrada?: boolean }) {
  const { filas, hayNovedades } = await listaDeNovedades(pestana, q);
  const nueva = (
    <BotonEnlace variante="primario" href="/admin/novedades/nueva">
      Nueva novedad
    </BotonEnlace>
  );
  const vacio = vacioDe(pestana, q, hayNovedades);
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Novedades"
        detalle="Lo que se publica con fecha: las noticias de ED."
        acciones={hayNovedades ? nueva : undefined}
        avisos={borrada ? <Aviso tono="bien">Se borró la novedad.</Aviso> : undefined}
        pestanas={<Pestanas etiqueta="Novedades" pestanas={Object.values(PESTANAS)} />}
      />
      {hayNovedades ? (
        <div className="flex justify-end">
          <Buscador etiqueta={`Buscar en ${PESTANAS[pestana].etiqueta}`} accion={PESTANAS[pestana].href} q={q} ayuda="Título" />
        </div>
      ) : null}
      {filas.length ? <ListaDeNovedades filas={filas} /> : <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} accion={hayNovedades ? undefined : nueva} />}
    </div>
  );
}
