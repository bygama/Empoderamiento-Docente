"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Seleccion, TextoCorto, type Opcion } from "@ed/kit-admin";
import { Boton } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { CANALES_DE_ENLACE } from "@/config/metricas";
import { crearEnlaceDesdeElAdmin, type ResultadoDeEnlace } from "@/datos/acciones/enlaces";
import { codigoDesde } from "@/lib/metricas/codigo";
import { Copiar } from "./Copiar";

const CANALES: Opcion[] = Object.entries(CANALES_DE_ENLACE).map(([valor, etiqueta]) => ({ valor, etiqueta }));

/**
 * Crear un link (SPEC de work/metricas-completas/ §6.4): la página, dónde se
 * comparte y un nombre, y el primario de la pantalla. Mientras se escribe el
 * nombre se ve cómo va a quedar el link; creado, el aviso lo trae con
 * «Copiar», y el formulario queda listo para otro.
 */
export function CrearEnlace({ destinos, base }: { destinos: readonly Opcion[]; base: string }) {
  const [destino, setDestino] = useState("");
  const [canal, setCanal] = useState("");
  const [nombre, setNombre] = useState("");
  const [resultado, setResultado] = useState<ResultadoDeEnlace | null>(null);
  const [creando, empezar] = useTransition();

  function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    empezar(async () => {
      const r = await crearEnlaceDesdeElAdmin({ nombre, destino, canal });
      setResultado(r);
      if (r.ok) setNombre("");
    });
  }

  return (
    <form onSubmit={crear} aria-label="Crear un link" className="max-w-md space-y-4">
      <Seleccion nombre="enlace-destino" etiqueta="Página" sinElegir="Elegí una página" opciones={destinos} valor={destino} alCambiar={setDestino} />
      <Seleccion nombre="enlace-canal" etiqueta="Dónde lo compartís" sinElegir="Elegí dónde" opciones={CANALES} valor={canal} alCambiar={setCanal} />
      <div>
        <TextoCorto nombre="enlace-nombre" etiqueta="Nombre" ayuda="Para reconocerlo en la lista: «Taller en Monterrey»." maximo={60} valor={nombre} alCambiar={setNombre} />
        {nombre.trim() ? (
          <p className="mt-1 text-admin-meta break-all text-gris-texto">
            Va a quedar {base}
            {codigoDesde(nombre)} (con un número al final si ya hay uno igual).
          </p>
        ) : null}
      </div>
      {resultado ? (
        <div className="space-y-2">
          <Aviso tono={resultado.ok ? "bien" : "error"} alCerrar={() => setResultado(null)}>
            {resultado.detalle}
          </Aviso>
          {resultado.ok ? <Copiar texto={resultado.link} que="nuevo" /> : null}
        </div>
      ) : null}
      <Boton variante="primario" type="submit" disabled={creando} aria-busy={creando || undefined}>
        {creando ? "Creando…" : "Crear link"}
      </Boton>
    </form>
  );
}
