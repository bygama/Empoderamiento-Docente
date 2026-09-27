"use client";

import { Bloque, Casilla, ListaVariable, Seleccion, TextoCorto } from "@ed/kit-admin";
import { RUTAS_INTERNAS } from "@/config/nav";
import { TOPES } from "@/features/investigacion/contenido/modelo-de-casos";
import { evidenciaVacia, produccionVacia, type EvidenciaEnElFormulario, type ProduccionEnElFormulario } from "../formulario";
import type { PropsDeBloque } from "./tipos";

const RUTAS = RUTAS_INTERNAS.map((r) => ({ valor: r, etiqueta: r }));

/**
 * Las evidencias del expediente y la producción relacionada: listas que se
 * agregan, se quitan y se mueven (`ListaVariable`). El rótulo de cada
 * evidencia («EVIDENCIA 01») sale de su lugar en la lista.
 */
export function LasListas({ form, cambiar, error }: PropsDeBloque) {
  return (
    <>
      <Bloque id="bloque-evidencias" titulo="Evidencias">
        <ListaVariable<EvidenciaEnElFormulario>
          nombre="evidencias"
          etiqueta="Evidencias"
          etiquetaItem="Evidencia"
          maximo={TOPES.evidencias}
          ayuda="Los documentos sobre la mesa del expediente, en este orden. El rótulo («EVIDENCIA 01») sale del lugar."
          vacia="Sin evidencias no se publica: el expediente necesita al menos una."
          valor={form.evidencias}
          alCambiar={(v) => cambiar("evidencias", v)}
          itemVacio={evidenciaVacia}
          claveDe={(e) => e.clave}
          resumenDe={(e) => e.titulo.trim()}
          porItem={(i, e, cambiarItem) => (
            <div className="space-y-5">
              <TextoCorto
                nombre={`evidencias.${i}.titulo`}
                etiqueta="Título"
                ayuda="Como el rótulo de un archivo: se guarda en mayúsculas."
                maximo={TOPES.tituloDeEvidencia}
                valor={e.titulo}
                alCambiar={(titulo) => cambiarItem((actual) => ({ ...actual, titulo }))}
                error={error(`evidencias.${i}.titulo`)}
              />
              <TextoCorto
                nombre={`evidencias.${i}.descripcion`}
                etiqueta="Descripción"
                maximo={TOPES.descripcionDeEvidencia}
                valor={e.descripcion}
                alCambiar={(descripcion) => cambiarItem((actual) => ({ ...actual, descripcion }))}
                error={error(`evidencias.${i}.descripcion`)}
              />
              <Casilla
                nombre={`evidencias.${i}.movible`}
                etiqueta="Se puede arrastrar"
                ayuda="En la computadora, se mueve con el mouse. Dejá fija la que no puede quedar tapada."
                valor={e.movible}
                alCambiar={(movible) => cambiarItem((actual) => ({ ...actual, movible }))}
              />
            </div>
          )}
        />
      </Bloque>
      <Bloque id="bloque-produccion" titulo="Producción relacionada">
        <ListaVariable<ProduccionEnElFormulario>
          nombre="produccionRelacionada"
          etiqueta="Producción"
          etiquetaItem="Producción"
          maximo={TOPES.producciones}
          ayuda="Lo publicado sobre el caso, al pie del cartón: el título y a qué página del sitio lleva."
          vacia="Sin producción relacionada, el cartón no la lista."
          valor={form.produccionRelacionada}
          alCambiar={(v) => cambiar("produccionRelacionada", v)}
          itemVacio={produccionVacia}
          claveDe={(p) => p.clave}
          resumenDe={(p) => p.titulo.trim()}
          porItem={(i, p, cambiarItem) => (
            <div className="space-y-5">
              <TextoCorto
                nombre={`produccionRelacionada.${i}.titulo`}
                etiqueta="Título"
                maximo={TOPES.tituloDeProduccion}
                valor={p.titulo}
                alCambiar={(titulo) => cambiarItem((actual) => ({ ...actual, titulo }))}
                error={error(`produccionRelacionada.${i}.titulo`)}
              />
              <Seleccion
                nombre={`produccionRelacionada.${i}.href`}
                etiqueta="Lleva a"
                opciones={RUTAS}
                sinElegir="Elegí una página"
                valor={p.href}
                alCambiar={(v) => {
                  const href = RUTAS_INTERNAS.find((r) => r === v);
                  if (href) cambiarItem((actual) => ({ ...actual, href }));
                }}
                error={error(`produccionRelacionada.${i}.href`)}
              />
            </div>
          )}
        />
      </Bloque>
    </>
  );
}
