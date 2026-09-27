import { BotonEnlace } from "@/admin/armazon/Boton";
import { Buscador } from "@/admin/armazon/Buscador";
import { Aviso } from "@/admin/armazon/Campos";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Filtro } from "@/admin/armazon/Filtro";
import { Paginado } from "@/admin/armazon/Paginado";
import { listaDeMateriales } from "@/datos/consultas/lista-de-materiales";
import { TIPOS } from "@/features/biblioteca/contenido/modelo";
import { conservados, ESTADOS, SALUDES, urlDeBiblioteca, type Filtros } from "./filtros";
import { ListaDeMateriales } from "./ListaDeMateriales";

/** Cuántos por página: de a 50, como la actividad. */
const POR_PAGINA = 50;

type Clave = "tipo" | "estado" | "salud";

/** Las opciones de un filtro: la de «todos», que lo saca, y una por valor; cada una conserva lo demás. */
function opcionesDe(filtros: Filtros, clave: Clave, todos: string, valores: ReadonlyArray<readonly [string, string]>) {
  return [[undefined, todos] as const, ...valores].map(([valor, etiqueta]) => ({ href: urlDeBiblioteca({ ...filtros, [clave]: valor }), etiqueta }));
}

/** Qué dice la pantalla cuando no hay filas: sin ningún material, o sin resultados con esos filtros. */
function vacioDe(filtros: Filtros, hayMateriales: boolean) {
  if (!hayMateriales) return { titulo: "Todavía no hay materiales.", texto: "Un material es una publicación que lleva a la revista o a la editorial: se agrega pegando su DOI, su ISBN o su link." };
  if (filtros.q) return { titulo: `Nada coincide con «${filtros.q}»`, texto: "Probá con otra palabra, con otros filtros, o borrá la búsqueda." };
  return { titulo: "No hay materiales con esos filtros.", texto: "Probá sacando alguno." };
}

/**
 * La lista de la Biblioteca (SPEC §9.1 de `work/biblioteca/`): «Biblioteca»
 * con «Agregar material», los filtros de tipo, estado y salud (apilados, cada
 * uno con su «todos» y conservando los otros), el buscador y la lista,
 * paginada de a 50. Sin ningún material, «Agregar material» va en el estado
 * vacío y no en el encabezado: un solo primario por pantalla.
 */
export async function PantallaDeBiblioteca({ filtros, borrado }: { filtros: Filtros; borrado: boolean }) {
  const { filas, hayMateriales, rotos } = await listaDeMateriales(filtros);
  const paginas = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const pagina = Math.min(filtros.pagina, paginas);
  const agregar = (
    <BotonEnlace variante="primario" href="/admin/biblioteca/nuevo">
      Agregar material
    </BotonEnlace>
  );
  const activa = urlDeBiblioteca(filtros);
  const salud = opcionesDe(filtros, "salud", "Toda la salud", Object.entries(SALUDES)).map((o) =>
    o.href === urlDeBiblioteca({ ...filtros, salud: "link-roto" }) ? { ...o, numero: { cuantos: rotos, que: "con el link roto" } } : o,
  );
  const vacio = vacioDe(filtros, hayMateriales);
  return (
    <div className="space-y-6">
      <Encabezado
        titulo="Biblioteca"
        detalle="Los materiales que llevan a la revista o a la editorial."
        acciones={hayMateriales ? agregar : undefined}
        avisos={borrado ? <Aviso tono="bien">Se borró el material.</Aviso> : undefined}
      />
      {hayMateriales ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Filtro etiqueta="Estado de los materiales" activa={activa} opciones={opcionesDe(filtros, "estado", "Todos", Object.entries(ESTADOS))} />
            <Buscador etiqueta="Buscar en la Biblioteca" accion="/admin/biblioteca" q={filtros.q} ayuda="Título, autores o fuente" conservar={conservados(filtros)} />
          </div>
          <Filtro etiqueta="Tipo de material" activa={activa} opciones={opcionesDe(filtros, "tipo", "Todos los tipos", TIPOS.map((t) => [t, t] as const))} />
          <Filtro etiqueta="Salud de los materiales" activa={activa} opciones={salud} />
        </div>
      ) : null}
      {filas.length ? (
        <ListaDeMateriales filas={filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)} />
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} accion={hayMateriales ? undefined : agregar} />
      )}
      <Paginado etiqueta="Páginas de la Biblioteca" pagina={pagina} paginas={paginas} hrefDe={(n) => urlDeBiblioteca(filtros, n)} />
    </div>
  );
}
