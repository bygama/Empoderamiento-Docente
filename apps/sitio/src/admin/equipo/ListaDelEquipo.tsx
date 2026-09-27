"use client";

import Image from "next/image";
import { AvisosDelOrden, BotonEnlace, BotonesDeOrden, Fila, Insignia, Lista, useMoverEnOrden } from "@ed/kit-admin";
import { Persona } from "@/components/ui/icons";
import { moverPersona } from "@/datos/acciones/equipo";
import type { FilaDePerfil } from "@/datos/consultas/equipo-del-admin";
import { NIVELES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import { posicionDelFoco } from "@/lib/contenido/fotos";
import { insigniaDelPerfil } from "./estado";

type Grupo = { clave: string; rotulo: string; explicacion: string | null; filas: FilaDePerfil[] };

/** Qué dice cada nivel debajo de su rótulo: solo los que tienen lugares contados. */
function explicacionDe(lugares: number | null): string | null {
  if (lugares === null) return null;
  return lugares === 1 ? "Un solo lugar: el sitio muestra a una persona." : `${lugares} lugares: el sitio muestra a ${lugares} personas.`;
}

/** Los cuatro niveles en su orden y, al final, los que todavía no tienen; sin filas, un grupo no está. */
function gruposDe(filas: readonly FilaDePerfil[]): Grupo[] {
  const grupos: Grupo[] = NIVELES.map((n) => ({ clave: String(n.nivel), rotulo: n.rotulo, explicacion: explicacionDe(n.lugares), filas: filas.filter((f) => f.nivel === n.nivel) }));
  grupos.push({ clave: "sin-nivel", rotulo: "Sin nivel", explicacion: "No se publican hasta que su ficha diga dónde van.", filas: filas.filter((f) => f.nivel === null) });
  return grupos.filter((g) => g.filas.length);
}

/** La foto de la tarjeta, chica y decorativa (el nombre dice quién es); sin foto, el cuadro con el ícono. */
function Miniatura({ foto }: { foto: FilaDePerfil["foto"] }) {
  if (!foto) {
    return (
      <span className="flex size-12 items-center justify-center rounded-lg bg-gris-fondo text-azul-medio">
        <Persona size={20} />
      </span>
    );
  }
  return (
    <span className="relative block size-12 overflow-hidden rounded-lg bg-gris-fondo">
      <Image src={foto.src} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: posicionDelFoco(foto.foco) }} />
    </span>
  );
}

/**
 * Los perfiles del Equipo (SPEC §7.1 de `work/equipo/`), por nivel y en el
 * orden de Quiénes somos: cada fila con su foto, el nombre, el rol y el país,
 * la insignia si pide atención (un publicado sin cambios no lleva, como en la
 * Biblioteca), «Subir» y «Bajar» dentro de su nivel (DESIGN.md §11, «Lista que
 * se ordena») y «Editar».
 */
export function ListaDelEquipo({ filas }: { filas: readonly FilaDePerfil[] }) {
  const { pendiente, aviso, anuncio, mover } = useMoverEnOrden("perfil");
  return (
    <div className="space-y-8">
      <AvisosDelOrden anuncio={anuncio} aviso={aviso} />
      {gruposDe(filas).map((g) => (
        <section key={g.clave} aria-labelledby={`nivel-${g.clave}`} className="space-y-3">
          <div>
            <h2 id={`nivel-${g.clave}`} className="font-display text-admin-seccion font-bold">
              {g.rotulo}
            </h2>
            {g.explicacion ? <p className="max-w-prose text-admin-meta text-gris-texto">{g.explicacion}</p> : null}
          </div>
          <Lista>
            {g.filas.map((f, i) => {
              const insignia = insigniaDelPerfil(f.estado, f.id);
              const detalle = [f.rol, f.pais].filter(Boolean).join(" · ");
              return (
                <Fila
                  key={f.id}
                  miniatura={<Miniatura foto={f.foto} />}
                  principal={f.nombre}
                  detalle={detalle || undefined}
                  insignias={insignia.tono === "normal" ? null : <Insignia tono={insignia.tono}>{insignia.texto}</Insignia>}
                  accion={
                    <span className="flex flex-wrap items-center gap-1">
                      <BotonesDeOrden
                        prefijo="perfil"
                        id={f.id}
                        nombre={f.nombre}
                        donde="en su nivel"
                        primero={i === 0}
                        ultimo={i === g.filas.length - 1}
                        pendiente={pendiente}
                        alMover={(hacia) => mover(f.id, hacia, () => moverPersona({ id: f.id, hacia }), `${f.nombre} pasó al lugar ${hacia === "antes" ? i : i + 2} de ${g.rotulo}.`)}
                      />
                      <BotonEnlace variante="secundario" href={`/admin/contenido/equipo/${f.id}`} aria-label={`Editar ${f.nombre}`}>
                        Editar
                      </BotonEnlace>
                    </span>
                  }
                />
              );
            })}
          </Lista>
        </section>
      ))}
    </div>
  );
}
