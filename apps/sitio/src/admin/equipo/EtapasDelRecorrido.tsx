"use client";

import { Bloque, ListaVariable } from "@ed/kit-admin";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { PropsDelRecorrido } from "./bloques";
import { EtapaDelRecorrido } from "./EtapaDelRecorrido";
import type { EtapaEnElFormulario } from "./formulario";
import { etapaVaciaEnElFormulario } from "./vacios";

/**
 * Las etapas del recorrido (SPEC §4.1.1 de `work/equipo/`), en el orden en
 * que se leen: se agregan, se quitan y se mueven, hasta ocho. El número de
 * cada una es su lugar.
 */
export function EtapasDelRecorrido({ recorrido, cambiar, errores, firmados }: PropsDelRecorrido & { firmados: readonly Firmado[] }) {
  return (
    <Bloque id="bloque-etapas" titulo="Las etapas">
      <ListaVariable<EtapaEnElFormulario>
        nombre="recorrido.etapas"
        etiqueta="Etapas"
        etiquetaItem="Etapa"
        maximo={TOPES.etapas}
        ayuda="La historia de la persona, de a una etapa: cada una con su composición y lo que esa composición muestra."
        vacia="Sin etapas no se puede publicar el recorrido: hace falta al menos una."
        valor={recorrido.etapas}
        alCambiar={(v) => cambiar("etapas", v)}
        itemVacio={etapaVaciaEnElFormulario}
        claveDe={(e) => e.clave}
        resumenDe={(e) => e.titulo.trim()}
        porItem={(i, e, cambiarEtapa) => <EtapaDelRecorrido i={i} etapa={e} cambiar={cambiarEtapa} categorias={recorrido.categorias} firmados={firmados} errores={errores} />}
      />
    </Bloque>
  );
}
