"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Boton, TextoCorto } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import { Momento } from "@/admin/armazon/Momento";
import { autorizarAliado } from "@/datos/acciones/ciclo-de-aliados";
import type { Autorizacion } from "@/datos/consultas/aliados-del-admin";
import { TOPES } from "@/features/aliados/contenido/modelo";

type Props = {
  /** `null` mientras el aliado no se guardó nunca. */
  id: string | null;
  autorizacion: Autorizacion;
  /** Si quien mira puede poner la marca (`autorizarAliados`). */
  puedeAutorizar: boolean;
  /** «quien dirige o administra», de la tabla de permisos. */
  quienPuede: string;
};

/** Quién la cambió y cuándo, o que llegó así con el sitio. */
function Cuando({ a }: { a: Autorizacion }) {
  if (!a.en) return null;
  if (!a.por) return <p className="text-admin-meta text-gris-texto">Llegó autorizado con el sitio.</p>;
  return (
    <p className="text-admin-meta text-gris-texto">
      {a.autorizado ? "Marcado" : "Quitado"} por {a.por}, <Momento iso={a.en} relativo />.
    </p>
  );
}

/**
 * La marca «Autorizado» (SPEC §5.1 de `work/casos-aliados-fotos/`): sin ella
 * el logo no se publica nunca (AGENTS.md §5.4). No es parte del borrador: se
 * guarda aparte y rige ya. Quien no puede ponerla la ve bloqueada, con quién
 * sí y por qué; el servidor la rechaza igual.
 */
export function AutorizacionDelAliado({ id, autorizacion, puedeAutorizar, quienPuede }: Props) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(() => autorizacion.autorizado);
  const [nota, setNota] = useState(() => autorizacion.nota);
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [pendiente, empezar] = useTransition();
  const bloqueada = !puedeAutorizar || !id;

  const guardar = () =>
    empezar(async () => {
      if (!id) return;
      try {
        const r = await autorizarAliado({ id, autorizado, nota });
        setAviso(r);
        if (r.ok) router.refresh();
      } catch {
        setAviso({ ok: false, detalle: "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo." });
      }
    });

  let explicacion = "Sin esta marca el logo no se publica nunca. Ponela solo si la organización autorizó el uso de su logo, y anotá dónde consta.";
  if (!puedeAutorizar) explicacion = `La marca la pone ${quienPuede}, con la nota de dónde consta la autorización: sin ella el logo no se publica nunca.`;
  else if (!id) explicacion = "Guardá el aliado primero: después se marca la autorización.";

  return (
    <Bloque id="bloque-autorizacion" titulo="Autorización">
      <p id="autorizacion-explicacion" className="text-admin-meta text-gris-texto">
        {explicacion}
      </p>
      <label className={`flex min-h-10 items-center gap-3 text-admin-meta font-medium ${bloqueada ? "text-gris-texto" : ""}`}>
        <input
          type="checkbox"
          checked={autorizado}
          disabled={bloqueada || pendiente}
          aria-describedby="autorizacion-explicacion"
          onChange={(e) => setAutorizado(e.target.checked)}
          className="size-4 accent-azul-principal"
        />
        Autorizado
      </label>
      {bloqueada ? (
        autorizacion.nota ? <p className="text-admin-cuerpo">Consta en: {autorizacion.nota}</p> : null
      ) : (
        <TextoCorto
          nombre="autorizacion"
          etiqueta="Dónde consta la autorización"
          ayuda="La carta, el mail o la carpeta de Drive. Obligatorio para marcarlo."
          maximo={TOPES.autorizacion}
          valor={nota}
          alCambiar={setNota}
        />
      )}
      <Cuando a={autorizacion} />
      {aviso ? (
        <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={() => setAviso(null)}>
          {aviso.detalle}
        </Aviso>
      ) : null}
      {bloqueada ? null : (
        <Boton variante="secundario" disabled={pendiente} aria-busy={pendiente || undefined} onClick={guardar}>
          {pendiente ? "Guardando…" : "Guardar la autorización"}
        </Boton>
      )}
    </Bloque>
  );
}
