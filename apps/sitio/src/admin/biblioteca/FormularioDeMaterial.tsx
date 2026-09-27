"use client";

import { Fecha, Parrafo, Seleccion, TextoCorto, type Opcion } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { FORMATOS, PUBLICOS, TEMAS, TIPOS, TOPES } from "@/features/biblioteca/contenido/modelo";
import { AutoresDelMaterial } from "./AutoresDelMaterial";
import { Bloque, type PropsDeBloque } from "./Bloque";
import { CitaDelMaterial } from "./CitaDelMaterial";
import { DestacadoDelMaterial } from "./DestacadoDelMaterial";
import { conOrigen } from "./formulario";
import { PortadaDelMaterial } from "./PortadaDelMaterial";

const opciones = (lista: readonly string[]): Opcion[] => lista.map((valor) => ({ valor, etiqueta: valor }));

type Props = PropsDeBloque & {
  personas: readonly Opcion[];
  lugares: readonly Opcion[];
  ayudaDelLugar: string;
  portadaGenerada: string;
};

/**
 * El formulario de un material (SPEC §9.2 de `work/biblioteca/`), escrito a
 * mano con los controles del kit, como el de una novedad (AGENTS.md §12). Cada
 * control se llama con el camino del campo en el esquema, así los errores del
 * guardado caen en su lugar; los datos que vinieron de afuera dicen de dónde
 * en su ayuda, hasta que se editan.
 */
export function FormularioDeMaterial({ personas, lugares, ayudaDelLugar, portadaGenerada, ...bloque }: Props) {
  const { form, cambiar, errores, origen } = bloque;
  const error = (camino: string) => errorDe(errores, camino);
  const lista = (campo: "tipo" | "tema" | "publico" | "formato", etiqueta: string, valores: readonly string[], sinElegir: string, alCambiar: (v: string) => void, ayuda?: string) => (
    <Seleccion
      nombre={campo}
      etiqueta={etiqueta}
      ayuda={conOrigen(ayuda, origen[campo])}
      opciones={opciones(valores)}
      sinElegir={sinElegir}
      valor={form[campo]}
      alCambiar={alCambiar}
      error={error(campo)}
    />
  );
  return (
    <div className="space-y-10">
      <Bloque id="bloque-material" titulo="El material">
        <TextoCorto nombre="titulo" etiqueta="Título" ayuda={conOrigen(undefined, origen.titulo)} maximo={TOPES.titulo} valor={form.titulo} alCambiar={(v) => cambiar("titulo", v)} error={error("titulo")} />
        <Parrafo
          nombre="descripcion"
          etiqueta="Descripción"
          ayuda={conOrigen("Qué trae el material, en una o dos frases: se lee en la tarjeta del catálogo. Sin descripción, la tarjeta va sin ella y la lista lo marca.", origen.descripcion)}
          maximo={TOPES.descripcion}
          valor={form.descripcion}
          alCambiar={(v) => cambiar("descripcion", v)}
          error={error("descripcion")}
        />
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            {lista("tipo", "Tipo", TIPOS, "Elegí un tipo", (v) => cambiar("tipo", TIPOS.find((t) => t === v) ?? ""), "El filtro y el menú de la Biblioteca.")}
            {lista("tema", "Tema", TEMAS, "Elegí un tema", (v) => cambiar("tema", TEMAS.find((t) => t === v) ?? ""))}
            {lista("publico", "Público", PUBLICOS, "Elegí un público", (v) => cambiar("publico", PUBLICOS.find((p) => p === v) ?? ""))}
            <Fecha nombre="fecha" etiqueta="Fecha" conDia={false} ayuda={conOrigen("El año y, si se sabe, el mes.", origen.fecha)} valor={form.fecha} alCambiar={(v) => cambiar("fecha", v)} error={error("fecha")} />
            {lista("formato", "Formato", FORMATOS, "Elegí un formato", (v) => cambiar("formato", FORMATOS.find((f) => f === v) ?? ""), "«Web» es una página sin archivo: una nota, la ficha de una librería.")}
            <TextoCorto
              nombre="paginas"
              etiqueta="Páginas"
              ayuda={conOrigen("Solo si es un texto paginado. Vacío, la tarjeta dice el formato.", origen.paginas)}
              maximo={4}
              valor={form.paginas}
              alCambiar={(v) => cambiar("paginas", v.replace(/\D/g, ""))}
              error={error("paginas")}
            />
          </div>
        </div>
      </Bloque>
      <AutoresDelMaterial {...bloque} personas={personas} />
      <Bloque id="bloque-donde" titulo="Dónde se lee">
        <TextoCorto
          nombre="url"
          etiqueta="Link"
          ayuda={conOrigen("Adónde lleva la acción de la tarjeta: la revista, la editorial o el DOI. Un PDF del sitio empieza con /.", origen.url)}
          maximo={TOPES.url}
          valor={form.url}
          alCambiar={(v) => cambiar("url", v)}
          error={error("url")}
        />
        <TextoCorto
          nombre="fuente"
          etiqueta="Dónde se lee"
          ayuda={conOrigen("Corto, para el botón: «Leer en RELIME».", origen.fuente)}
          maximo={TOPES.fuente}
          valor={form.fuente}
          alCambiar={(v) => cambiar("fuente", v)}
          error={error("fuente")}
        />
        <TextoCorto nombre="doi" etiqueta="DOI" ayuda={conOrigen("Si tiene. Con él, el link se chequea en doi.org.", origen.doi)} maximo={200} valor={form.doi} alCambiar={(v) => cambiar("doi", v)} error={error("doi")} />
      </Bloque>
      <PortadaDelMaterial {...bloque} generada={portadaGenerada} />
      <CitaDelMaterial {...bloque} />
      <DestacadoDelMaterial {...bloque} lugares={lugares} ayudaDelLugar={ayudaDelLugar} />
    </div>
  );
}
