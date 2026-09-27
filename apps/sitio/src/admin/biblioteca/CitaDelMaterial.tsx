"use client";

import { Boton, Parrafo } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { citaGenerada } from "@/features/biblioteca/contenido/del-sitio";
import { TOPES } from "@/features/biblioteca/contenido/modelo";
import { Bloque, type PropsDeBloque } from "./Bloque";
import { conOrigen } from "./formulario";

/**
 * La cita APA (SPEC §8.4 de `work/biblioteca/`): vacía, va la generada con los
 * datos de hoy, que se ve acá y sigue a lo que se corrige (DECISIONS, la cita
 * vacía es la generada). «Escribirla a mano» la copia al campo para
 * ajustarla; «Volver a la generada» la vacía. Es la que copia «Copiar cita
 * APA» en la tarjeta del sitio.
 */
export function CitaDelMaterial({ form, cambiar, errores, origen }: PropsDeBloque) {
  const generada = citaGenerada(form);
  const escrita = form.cita !== "";
  return (
    <Bloque id="bloque-cita" titulo="Cita APA">
      {escrita ? (
        <Parrafo
          nombre="cita"
          etiqueta="Cita APA"
          ayuda={conOrigen("La que copia «Copiar cita APA» en la tarjeta del sitio. Escrita a mano, ya no sigue a los datos.", origen.cita)}
          maximo={TOPES.cita}
          valor={form.cita}
          alCambiar={(v) => cambiar("cita", v)}
          error={errorDe(errores, "cita")}
        />
      ) : (
        <div className="space-y-1">
          <p className="text-admin-meta font-medium">La generada</p>
          <p className="max-w-prose rounded-lg border border-azul-claro/60 px-4 py-3">{generada}</p>
          <p className="text-admin-meta text-gris-texto">Sigue a los datos del material: si corregís el título o los autores, cambia sola.</p>
        </div>
      )}
      <Boton variante="terciario" className="-ml-4" onClick={() => cambiar("cita", escrita ? "" : generada)}>
        {escrita ? "Volver a la generada" : "Escribirla a mano"}
      </Boton>
    </Bloque>
  );
}
