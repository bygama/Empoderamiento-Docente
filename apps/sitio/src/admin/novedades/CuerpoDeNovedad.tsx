"use client";

import { ListaVariable, Parrafo, TextoCorto, type Cambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { TOPES } from "@/features/novedades/contenido/modelo";
import { seccionVacia, type SeccionEnElFormulario } from "./formulario";

type Props = {
  cuerpo: readonly SeccionEnElFormulario[];
  alCambiar: (cambio: Cambio<SeccionEnElFormulario[]>) => void;
  errores: Readonly<Record<string, string>>;
};

/**
 * El cuerpo de la ficha: las secciones con su título y su texto, que se
 * agregan, se quitan y se mueven (`ListaVariable`). Sin secciones la novedad
 * no tiene ficha propia, y lo dice. El texto de cada una va entero en un
 * campo: cada renglón es un párrafo. Sus controles se llaman como en el
 * esquema (`cuerpo.1.parrafos`), así el error del guardado cae en su lugar.
 */
export function CuerpoDeNovedad({ cuerpo, alCambiar, errores }: Props) {
  return (
    <section aria-labelledby="bloque-cuerpo" className="space-y-5">
      <h2 id="bloque-cuerpo" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Cuerpo
      </h2>
      <ListaVariable<SeccionEnElFormulario>
        nombre="cuerpo"
        etiqueta="Secciones"
        etiquetaItem="Sección"
        maximo={TOPES.secciones}
        ayuda="Cada sección lleva un título, que arma la guía de la nota, y su texto."
        vacia="Sin secciones, la novedad no tiene ficha propia: la tarjeta no lleva a ningún lado."
        valor={cuerpo}
        alCambiar={alCambiar}
        itemVacio={seccionVacia}
        claveDe={(s) => s.clave}
        resumenDe={(s) => s.titulo.trim()}
        porItem={(i, s, cambiar) => (
          <div className="space-y-5">
            <TextoCorto
              nombre={`cuerpo.${i}.titulo`}
              etiqueta="Título"
              maximo={TOPES.tituloDeSeccion}
              valor={s.titulo}
              alCambiar={(titulo) => cambiar((actual) => ({ ...actual, titulo }))}
              error={errorDe(errores, `cuerpo.${i}.titulo`)}
            />
            <Parrafo
              nombre={`cuerpo.${i}.parrafos`}
              etiqueta="Texto"
              ayuda="Cada renglón es un párrafo."
              maximo={TOPES.textoDeSeccion}
              valor={s.texto}
              alCambiar={(texto) => cambiar((actual) => ({ ...actual, texto }))}
              error={errorDe(errores, `cuerpo.${i}.parrafos`)}
            />
          </div>
        )}
      />
    </section>
  );
}
