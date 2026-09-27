"use client";

import { BotonEnlace } from "@/admin/armazon/Boton";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { AvisosDelOrden, BotonesDeOrden } from "@/admin/armazon/ListaQueSeOrdena";
import { useMoverEnOrden } from "@/admin/armazon/useMoverEnOrden";
import { moverAliado } from "@/datos/acciones/aliados";
import type { FilaDeAliado } from "@/datos/consultas/aliados-del-admin";
import { altoDe } from "@/features/aliados/contenido/modelo";
import { insigniaDeLaPublicacion } from "./estado";
import { LogoEnLaTira } from "./LogoEnLaTira";

/**
 * Los aliados en el orden de la tira (SPEC §7.2 de `work/casos-aliados-fotos/`):
 * cada fila con su logo como se ve (blanco sobre el azul), el nombre, si está
 * autorizado y cómo está su publicación; «Subir», «Bajar» (cambian el lugar en
 * la tira del sitio en el momento) y «Editar». Al mover, el foco sigue al
 * aliado (DESIGN.md §11, «Lista que se ordena»).
 */
export function ListaDeAliados({ filas }: { filas: readonly FilaDeAliado[] }) {
  const { pendiente, aviso, anuncio, mover } = useMoverEnOrden("aliado");

  return (
    <div className="space-y-3">
      <AvisosDelOrden anuncio={anuncio} aviso={aviso} />
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
                  <BotonesDeOrden
                    prefijo="aliado"
                    id={f.id}
                    nombre={nombre}
                    donde="en la tira"
                    primero={i === 0}
                    ultimo={i === filas.length - 1}
                    pendiente={pendiente}
                    alMover={(hacia) => mover(f.id, hacia, () => moverAliado({ id: f.id, hacia }), `${nombre} pasó al lugar ${hacia === "antes" ? i : i + 2} de la tira.`)}
                  />
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
