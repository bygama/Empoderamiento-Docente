"use client";

import Link from "next/link";
import { useState } from "react";
import { Aviso, Boton, TextoCorto } from "@ed/kit-admin";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { buscarDatosDeMaterial } from "@/datos/acciones/buscar-datos";
import type { Vecino } from "@/datos/biblioteca/contra-la-biblioteca";
import type { Vecinos } from "@/datos/consultas/ficha-de-material";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";
import { FichaDeMaterial } from "./FichaDeMaterial";
import type { Origen } from "./formulario";

const ESTADO_NUEVO = { publicado: false, publicadoEn: null, publicadoPor: null, borradorEn: null, borradorPor: null };

type Encontrado = { documento: BorradorDeMaterial; origen: Origen; parecidos: readonly Vecino[] };
type Problema = { tipo: "error"; texto: string } | { tipo: "repetido"; material: Vecino };

/**
 * «Agregar material» en dos pasos (SPEC §8.1 de `work/biblioteca/`): se pega
 * un DOI, un ISBN o un link y «Buscar datos» llena la ficha con lo que dicen
 * Crossref, OpenAlex y la página, cada dato con su origen; o «Cargar a mano»
 * abre la ficha vacía. Buscar no guarda nada: la ficha es la de siempre, y el
 * material nace recién cuando alguien toca Guardar o Publicar. Un DOI que ya
 * está no pasa al segundo paso: se ofrece abrir el que existe.
 */
export function AgregarMaterial({ vecinos }: { vecinos: Vecinos }) {
  const [entrada, setEntrada] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<Problema | null>(null);
  const [encontrado, setEncontrado] = useState<Encontrado | null>(null);

  if (encontrado) {
    return (
      <FichaDeMaterial
        ficha={{ id: null, documento: encontrado.documento, publicado: null, estado: ESTADO_NUEVO, chequeo: null, novedades: [] }}
        vecinos={vecinos}
        origenInicial={encontrado.origen}
        parecidosIniciales={encontrado.parecidos}
      />
    );
  }

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setAviso(null);
    try {
      const r = await buscarDatosDeMaterial({ entrada });
      if (!r.ok) return setAviso({ tipo: "error", texto: r.detalle });
      if (r.repetido) return setAviso({ tipo: "repetido", material: r.repetido });
      setEncontrado({ documento: { ...borradorVacio(), ...r.datos }, origen: r.origen, parecidos: r.parecidos });
    } catch {
      setAviso({ tipo: "error", texto: "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo, o cargalo a mano." });
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-8">
      <Encabezado volver={{ href: "/admin/biblioteca", etiqueta: "Biblioteca" }} titulo="Agregar material" detalle="Con el DOI, el ISBN o el link, la ficha se llena sola. Nada se guarda hasta que lo guardes." />
      <form onSubmit={buscar} className="max-w-xl space-y-4" aria-describedby="agregar-como">
        <TextoCorto
          nombre="entrada"
          etiqueta="DOI, ISBN o link"
          ayuda="Por ejemplo 10.12802/relime.2025.28.e805, 978-84-16919-43-7 o el link de la revista."
          maximo={500}
          valor={entrada}
          alCambiar={setEntrada}
        />
        {aviso?.tipo === "error" ? <Aviso tono="error">{aviso.texto}</Aviso> : null}
        {aviso?.tipo === "repetido" ? (
          <Aviso tono="error">
            Ese DOI ya está en la Biblioteca: «{aviso.material.titulo}».{" "}
            <Link href={`/admin/biblioteca/${aviso.material.id}`} className="font-medium underline underline-offset-2">
              Abrirlo
            </Link>
          </Aviso>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Boton variante="primario" type="submit" disabled={buscando} aria-busy={buscando || undefined}>
            {buscando ? "Buscando…" : "Buscar datos"}
          </Boton>
          <Boton variante="terciario" type="button" disabled={buscando} onClick={() => setEncontrado({ documento: borradorVacio(), origen: {}, parecidos: [] })}>
            Cargar a mano
          </Boton>
        </div>
        <p id="agregar-como" className="text-admin-meta text-gris-texto">
          Se busca en Crossref y en OpenAlex, y si es un link, en la página misma. Si no aparece nada, se carga a mano.
        </p>
      </form>
    </div>
  );
}
