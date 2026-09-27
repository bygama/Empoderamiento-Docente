"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Boton, BotonEnlace } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { moverAliado } from "@/datos/acciones/aliados";
import type { FilaDeAliado } from "@/datos/consultas/aliados-del-admin";
import { altoDe } from "@/features/aliados/contenido/modelo";
import { insigniaDeLaPublicacion } from "./estado";
import { LogoEnLaTira } from "./LogoEnLaTira";

type Hacia = "antes" | "despues";

/**
 * Los aliados en el orden de la tira (SPEC §7.2 de `work/casos-aliados-fotos/`):
 * cada fila con su logo como se ve (blanco sobre el azul), el nombre, si está
 * autorizado y cómo está su publicación; «Subir», «Bajar» (cambian el lugar en
 * la tira del sitio en el momento) y «Editar». Al mover, el foco sigue al
 * aliado, como en `ListaVariable` del kit.
 */
export function ListaDeAliados({ filas }: { filas: readonly FilaDeAliado[] }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const enfocarAlTerminar = useRef<{ id: string; hacia: Hacia } | null>(null);

  // Mientras se mueve, el botón está deshabilitado y pierde el foco; y la fila
  // recién está en su lugar nuevo cuando termina el refresco. Ahí vuelve: al
  // mismo botón, o al otro si el aliado quedó en una punta.
  useEffect(() => {
    const destino = enfocarAlTerminar.current;
    if (pendiente || !destino) return;
    enfocarAlTerminar.current = null;
    const [igual, contrario] = destino.hacia === "antes" ? ["subir", "bajar"] : ["bajar", "subir"];
    (document.getElementById(`aliado-${destino.id}-${igual}`) ?? document.getElementById(`aliado-${destino.id}-${contrario}`))?.focus();
  }, [pendiente]);

  const mover = (id: string, nombre: string, lugar: number, hacia: Hacia) =>
    empezar(async () => {
      enfocarAlTerminar.current = { id, hacia };
      try {
        const r = await moverAliado({ id, hacia });
        if (!r.ok) return setAviso(r.detalle);
        setAviso(null);
        setAnuncio(`${nombre} pasó al lugar ${hacia === "antes" ? lugar - 1 : lugar + 1} de la tira.`);
        router.refresh();
      } catch {
        setAviso("No hubo respuesta del servidor. Fijate la conexión y probá de nuevo.");
      }
    });

  return (
    <div className="space-y-3">
      <p role="status" className="sr-only">
        {anuncio}
      </p>
      {aviso ? <Aviso tono="error">{aviso}</Aviso> : null}
      <Lista>
        {filas.map((f, i) => {
          const nombre = f.nombre || "Sin nombre todavía";
          const publicacion = insigniaDeLaPublicacion(f.estado);
          return (
            <Fila
              key={f.id}
              principal={
                <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <LogoEnLaTira src={f.logo} alt="" alto={altoDe(f.tamano).pie} />
                  <span className={f.nombre ? "" : "text-gris-texto"}>{nombre}</span>
                </span>
              }
              insignias={
                <>
                  <Insignia tono={f.autorizado ? "normal" : "fuerte"}>{f.autorizado ? "Autorizado" : "Sin autorizar"}</Insignia>
                  <Insignia tono={publicacion.tono}>{publicacion.texto}</Insignia>
                </>
              }
              accion={
                <span className="flex flex-wrap items-center gap-1">
                  {i > 0 ? (
                    <Boton id={`aliado-${f.id}-subir`} variante="terciario" disabled={pendiente} onClick={() => mover(f.id, nombre, i + 1, "antes")} aria-label={`Subir ${nombre} en la tira`}>
                      Subir
                    </Boton>
                  ) : null}
                  {i < filas.length - 1 ? (
                    <Boton id={`aliado-${f.id}-bajar`} variante="terciario" disabled={pendiente} onClick={() => mover(f.id, nombre, i + 1, "despues")} aria-label={`Bajar ${nombre} en la tira`}>
                      Bajar
                    </Boton>
                  ) : null}
                  <BotonEnlace variante="secundario" href={`/admin/contenido/aliados/${f.id}`} aria-label={`Editar ${nombre}`}>
                    Editar
                  </BotonEnlace>
                </span>
              }
            />
          );
        })}
      </Lista>
    </div>
  );
}
