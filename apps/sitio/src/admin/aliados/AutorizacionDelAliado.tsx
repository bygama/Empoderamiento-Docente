"use client";

import { Aviso } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import type { Autorizacion } from "@/datos/consultas/aliados-del-admin";
import type { Aliado } from "@/features/aliados/contenido/aliado";
import { CAMBIO_DESDE_LA_AUTORIZACION } from "@/features/aliados/contenido/autorizacion";
import { CamposDeLaMarca } from "./autorizacion-del-aliado/CamposDeLaMarca";
import { CasillaDeLaMarca, PieDeLaMarca } from "./autorizacion-del-aliado/ControlesDeLaMarca";
import { Cuando, LoQueSeAutorizo } from "./autorizacion-del-aliado/EstadoDeLaMarca";
import { accionDe, explicacionDe, faltaPara } from "./autorizacion-del-aliado/textos";
import { useAutorizar } from "./autorizacion-del-aliado/useAutorizar";

type Props = {
  /** `null` mientras el aliado no se guardó nunca. */
  id: string | null;
  autorizacion: Autorizacion;
  /** Lo que se autorizaría ahora: lo guardado si se puede publicar; si no, lo publicado. */
  aAutorizar: Aliado | null;
  /** Si la marca vale para eso: está puesta, con ese logo y ese nombre. */
  alDia: boolean;
  haySinGuardar: boolean;
  /** Si quien mira puede poner la marca (`autorizarAliados`). */
  puedeAutorizar: boolean;
  /** «quien dirige o administra», de la tabla de permisos. */
  quienPuede: string;
};

/**
 * La marca «Autorizado» (SPEC §5.1 de `work/casos-aliados-fotos/`): sin ella
 * el logo no se publica nunca (AGENTS.md §5.4), y vale solo para el logo y el
 * nombre que se autorizaron. No es parte del borrador: se guarda aparte, rige
 * ya y autoriza lo guardado, que se muestra antes de confirmar. Quien no puede
 * ponerla la ve bloqueada, con quién sí y por qué; el servidor la rechaza igual.
 */
export function AutorizacionDelAliado({ id, autorizacion, aAutorizar, alDia, haySinGuardar, puedeAutorizar, quienPuede }: Props) {
  const m = useAutorizar(id, autorizacion, aAutorizar);
  const bloqueada = !puedeAutorizar || !id;
  const estado = { id, puedeAutorizar, quienPuede, marcado: m.marcado, autorizado: autorizacion.autorizado, alDia, hayQueAutorizar: aAutorizar !== null, haySinGuardar };
  const falta = faltaPara(estado);
  const accion = bloqueada ? null : accionDe(estado);

  return (
    <Bloque id="bloque-autorizacion" titulo="Autorización">
      <p id="autorizacion-explicacion" className="text-admin-meta text-gris-texto">
        {explicacionDe(estado)}
      </p>
      {autorizacion.autorizado && !alDia ? <Aviso tono="error">{CAMBIO_DESDE_LA_AUTORIZACION}</Aviso> : null}
      <LoQueSeAutorizo autorizacion={autorizacion} tamano={aAutorizar?.tamano ?? "chico"} />
      <CasillaDeLaMarca marcado={m.marcado} bloqueada={bloqueada} pendiente={m.pendiente} alCambiar={m.setMarcado} />
      <CamposDeLaMarca
        bloqueada={bloqueada}
        notaGuardada={autorizacion.nota}
        aAutorizar={aAutorizar}
        mostrarQueSeAutoriza={m.marcado && !alDia}
        falta={falta}
        nota={m.nota}
        alCambiarNota={m.setNota}
      />
      <Cuando a={autorizacion} />
      <PieDeLaMarca aviso={m.aviso} alCerrarAviso={() => m.setAviso(null)} accion={accion} pendiente={m.pendiente} falta={falta} alGuardar={m.guardar} />
    </Bloque>
  );
}
