"use client";

import { CampoFoto, Casilla, resolverCambio, Seleccion } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import { errorDe } from "@/admin/campos/errores";
import { subirFoto } from "@/datos/acciones/fotos";
import { FIGURAS } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import type { PropsDelRecorrido } from "./bloques";

const OPCIONES = [
  { valor: "marco", etiqueta: "En un marco: la foto tal cual" },
  { valor: "recorte", etiqueta: "Recortada, sin fondo: pide un PNG recortado a mano" },
  { valor: "sin", etiqueta: "Sin foto: la persona no quiere" },
] as const;

const SIN_ARCHIVO = { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };

/**
 * La foto del recorrido (SPEC §4.1 de `work/equipo/`): cómo va —en un marco,
 * recortada o ninguna— y cuál. Suele ser la misma de la tarjeta, con su foco
 * propio, porque el marco la recorta distinto.
 */
export function BloqueDeLaFigura({ recorrido, cambiar, errores }: PropsDelRecorrido) {
  const figura = recorrido.figura;
  const cambiarFigura = (cambio: Partial<typeof figura>) => cambiar("figura", (actual) => ({ ...actual, ...cambio }));
  return (
    <Bloque id="bloque-figura" titulo="La figura">
      <Seleccion
        nombre="recorrido.figura.tipo"
        etiqueta="Cómo va la foto"
        ayuda="La foto que acompaña el recorrido, al lado del texto y al cierre."
        opciones={OPCIONES}
        sinElegir="Elegí cómo va"
        valor={figura.tipo}
        alCambiar={(v) => {
          const tipo = FIGURAS.find((f) => f === v);
          if (tipo) cambiarFigura(tipo === "sin" ? { tipo, foto: null } : { tipo });
        }}
        error={errorDe(errores, "recorrido.figura.tipo")}
      />
      {figura.tipo === "sin" ? null : (
        <>
          <CampoFoto
            nombre="recorrido.figura.foto"
            etiqueta="Foto del recorrido"
            ayuda="Suele ser la de la tarjeta: el punto de foco es propio, porque el marco la recorta distinto."
            valor={figura.foto ?? SIN_ARCHIVO}
            alCambiar={(cambio) => cambiar("figura", (actual) => ({ ...actual, foto: resolverCambio(cambio, actual.foto ?? SIN_ARCHIVO) }))}
            subir={subirFoto}
            maximoBytes={MAXIMO_BYTES}
            error={errorDe(errores, "recorrido.figura.foto")}
          />
          {figura.tipo === "marco" ? (
            <Casilla
              nombre="recorrido.figura.apaisado"
              etiqueta="Es una lámina apaisada"
              ayuda="El marco toma la proporción de la foto, más ancha que alta, en vez de la de un retrato."
              valor={figura.apaisado}
              alCambiar={(apaisado) => cambiarFigura({ apaisado })}
              error={errorDe(errores, "recorrido.figura.apaisado")}
            />
          ) : null}
        </>
      )}
    </Bloque>
  );
}
