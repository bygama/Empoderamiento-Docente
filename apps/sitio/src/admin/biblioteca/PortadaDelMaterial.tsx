"use client";

import Image from "next/image";
import { Boton, CampoFoto, resolverCambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { fotosParaElegir, subirFoto } from "@/datos/acciones/fotos";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import { Bloque, type PropsDeBloque } from "./Bloque";

const SIN_ARCHIVO = { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };

/**
 * La portada (SPEC §13.2 de `work/biblioteca/`): sin una propia, el sitio
 * muestra la tipográfica generada con los datos del material, que se ve acá en
 * vivo. «Usar otra» abre el campo de la foto y pasa a «Volver a la generada»:
 * un solo botón que cambia de nombre, así el foco no se pierde (el patrón de
 * la imagen para redes de una novedad, DESIGN.md §11).
 */
export function PortadaDelMaterial({ form, cambiar, errores, generada }: PropsDeBloque & { generada: string }) {
  const propia = form.portada;
  return (
    <Bloque id="bloque-portada" titulo="Portada">
      {propia ? (
        <CampoFoto
          nombre="portada"
          etiqueta="Portada propia"
          ayuda="La tapa del libro o de la revista. El sitio la muestra como decoración: el título al lado dice qué es."
          valor={propia}
          alCambiar={(v) => cambiar("portada", (actual) => resolverCambio(v, actual ?? SIN_ARCHIVO))}
          subir={subirFoto}
          elegir={fotosParaElegir}
          maximoBytes={MAXIMO_BYTES}
          error={errorDe(errores, "portada")}
        />
      ) : (
        <figure className="space-y-2">
          <Image src={generada} alt="" width={240} height={240} unoptimized className="size-60 rounded-lg border border-azul-claro/60" />
          <figcaption className="max-w-md text-admin-meta text-gris-texto">
            Sin portada propia, el sitio muestra esta: la tipográfica, con el tipo, dónde se lee, el año, el título y quién firma. La lista la marca «Sin portada».
          </figcaption>
        </figure>
      )}
      {/* El `-ml-4` alinea el texto del botón con el borde de lo de arriba. */}
      <Boton variante="terciario" className="-ml-4" onClick={() => cambiar("portada", propia ? null : SIN_ARCHIVO)}>
        {propia ? "Volver a la generada" : "Usar otra"}
      </Boton>
    </Bloque>
  );
}
