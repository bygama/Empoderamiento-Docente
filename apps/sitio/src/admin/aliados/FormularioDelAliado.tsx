"use client";

import { CampoFoto, resolverCambio, Seleccion, TextoCorto, type Cambio } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import { fotosParaElegir, subirFoto } from "@/datos/acciones/fotos";
import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { TAMANOS, TOPES } from "@/features/aliados/contenido/modelo";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";

type Props = {
  form: BorradorDeAliado;
  cambiar: <K extends keyof BorradorDeAliado>(campo: K, cambio: Cambio<BorradorDeAliado[K]>) => void;
  error: (camino: string) => string | undefined;
};

const OPCIONES = TAMANOS.map((t) => ({ valor: t.valor, etiqueta: `${t.etiqueta}: ${t.ayuda}` }));

/**
 * El formulario de un aliado (SPEC §7.2 de `work/casos-aliados-fotos/`),
 * escrito a mano con los controles del kit: el nombre, el logo (una foto de
 * Fotos, entera, que se elige o se sube), su tamaño en la tira y su sitio.
 * La autorización no está acá: va aparte, porque no es contenido.
 */
export function FormularioDelAliado({ form, cambiar, error }: Props) {
  return (
    <Bloque id="bloque-aliado" titulo="En la tira">
      <TextoCorto
        nombre="nombre"
        etiqueta="Nombre"
        ayuda="Cómo lo llaman el admin y la actividad: corto, como «UCSH»."
        maximo={TOPES.nombre}
        valor={form.nombre}
        alCambiar={(v) => cambiar("nombre", v)}
        error={error("nombre")}
      />
      <CampoFoto
        nombre="logo"
        etiqueta="Logo"
        ayuda="Con fondo transparente y recortado al dibujo, sin aire: la tira lo pinta de blanco, así que el color no importa. El texto alternativo es lo que lee un lector de pantalla: el nombre completo de la organización."
        valor={form.logo}
        alCambiar={(v) => cambiar("logo", (actual) => resolverCambio(v, actual))}
        subir={subirFoto}
        elegir={fotosParaElegir}
        conFoco={false}
        maximoBytes={MAXIMO_BYTES}
        error={error("logo")}
      />
      <Seleccion
        nombre="tamano"
        etiqueta="Tamaño en la tira"
        ayuda="Para que pese lo mismo que los demás: una marca vertical o con texto chico necesita más alto que un nombre de una línea."
        opciones={OPCIONES}
        sinElegir="Elegí un tamaño"
        valor={form.tamano}
        alCambiar={(v) => {
          const tamano = TAMANOS.find((t) => t.valor === v);
          if (tamano) cambiar("tamano", tamano.valor);
        }}
        error={error("tamano")}
      />
      <TextoCorto
        nombre="url"
        etiqueta="Su sitio"
        ayuda="Con https://. Con sitio, el logo de la tira es un link que abre en otra pestaña; sin sitio, es solo el logo."
        maximo={TOPES.url}
        valor={form.url}
        alCambiar={(v) => cambiar("url", v)}
        error={error("url")}
      />
    </Bloque>
  );
}
