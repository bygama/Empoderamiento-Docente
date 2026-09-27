"use client";

import { CampoFoto, Casilla, Fecha, Seleccion, TextoCorto, type Cambio, type Opcion } from "@ed/kit-admin";
import { LARGO_MAXIMO } from "@ed/db/slug";
import { errorDe } from "@/admin/campos/errores";
import { fotosParaElegir, subirFoto } from "@/datos/acciones/fotos";
import { CATEGORIAS, TOPES } from "@/features/novedades/contenido/modelo";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import { CuerpoDeNovedad } from "./CuerpoDeNovedad";
import type { NovedadEnElFormulario } from "./formulario";

const OPCIONES_DE_CATEGORIA: Opcion[] = CATEGORIAS.map((c) => ({ valor: c.clave, etiqueta: c.etiqueta }));

type Props = {
  form: NovedadEnElFormulario;
  cambiar: <K extends keyof NovedadEnElFormulario>(campo: K, cambio: Cambio<NovedadEnElFormulario[K]>) => void;
  /** Los errores del último guardado, por camino del campo. */
  errores: Readonly<Record<string, string>>;
  /** Los materiales de la Biblioteca, para el que abre la ficha: el id y cómo se lee. */
  materiales: readonly Opcion[];
  /** Lo que dice la casilla de la destacada: quién lo es hoy. */
  ayudaDeLaDestacada: string;
  /** Lo que dice la URL: cómo queda y qué pasa si cambia. */
  ayudaDeLaUrl: string;
};

/** Un bloque del formulario: su título con el divisor de las secciones del editor, y los campos debajo. */
function Bloque({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-5">
      <h2 id={id} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/**
 * El formulario de una novedad (SPEC §6.2 de `work/novedades-y-kit/`), escrito
 * a mano con los controles del kit: una entidad no sale de un esquema como
 * las páginas (AGENTS.md §12). Cada control se llama con el camino del campo
 * en el esquema, así los errores del guardado caen en su lugar y el foco
 * encuentra el primero.
 */
export function FormularioDeNovedad({ form, cambiar, errores, materiales, ayudaDeLaDestacada, ayudaDeLaUrl }: Props) {
  const error = (camino: string) => errorDe(errores, camino);
  return (
    <div className="space-y-10">
      <Bloque id="bloque-novedad" titulo="La novedad">
        <TextoCorto nombre="titulo" etiqueta="Título" maximo={TOPES.titulo} valor={form.titulo} alCambiar={(v) => cambiar("titulo", v)} error={error("titulo")} />
        <TextoCorto
          nombre="bajada"
          etiqueta="Bajada"
          ayuda="Lo que se lee debajo del título en la tarjeta, en la ficha y al compartir el link."
          maximo={TOPES.bajada}
          valor={form.bajada}
          alCambiar={(v) => cambiar("bajada", v)}
          error={error("bajada")}
        />
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            <Fecha nombre="fecha" etiqueta="Fecha" ayuda="La que da la fuente: con el mes y el día si se saben." valor={form.fecha} alCambiar={(v) => cambiar("fecha", v)} error={error("fecha")} />
            <Seleccion
              nombre="categoria"
              etiqueta="Categoría"
              opciones={OPCIONES_DE_CATEGORIA}
              sinElegir="Elegí una categoría"
              valor={form.categoria}
              alCambiar={(v) => {
                // Sale de las opciones, que son las categorías; buscarla le devuelve su tipo sin un `as`.
                const categoria = CATEGORIAS.find((c) => c.clave === v);
                if (categoria) cambiar("categoria", categoria.clave);
              }}
              error={error("categoria")}
            />
          </div>
        </div>
        <Casilla nombre="destacada" etiqueta="Es la destacada" ayuda={ayudaDeLaDestacada} valor={form.destacada} alCambiar={(v) => cambiar("destacada", v)} error={error("destacada")} />
      </Bloque>
      <Bloque id="bloque-imagen" titulo="Imagen">
        <CampoFoto
          nombre="imagen"
          etiqueta="Foto de la novedad"
          ayuda="Va en la tarjeta, en la tapa si es la destacada y en la ficha. El sitio la muestra como decoración: el título dice qué es."
          valor={form.imagen}
          alCambiar={(v) => cambiar("imagen", v)}
          subir={subirFoto}
          elegir={fotosParaElegir}
          maximoBytes={MAXIMO_BYTES}
          error={error("imagen")}
        />
      </Bloque>
      <CuerpoDeNovedad cuerpo={form.cuerpo} alCambiar={(v) => cambiar("cuerpo", v)} errores={errores} />
      <Bloque id="bloque-enlaces" titulo="Enlaces">
        <Seleccion
          nombre="material"
          etiqueta="Material de la Biblioteca"
          ayuda="Si la novedad habla de un material del catálogo, la ficha termina con el botón que lo abre, mientras el material esté en el sitio."
          opciones={[{ valor: "", etiqueta: "Ninguno" }, ...materiales]}
          sinElegir="Elegí un material"
          valor={form.material ?? ""}
          alCambiar={(v) => cambiar("material", v || null)}
          error={error("material")}
        />
        <TextoCorto nombre="slug" etiqueta="URL" ayuda={ayudaDeLaUrl} maximo={LARGO_MAXIMO} valor={form.slug} alCambiar={(v) => cambiar("slug", v)} error={error("slug")} />
      </Bloque>
    </div>
  );
}
