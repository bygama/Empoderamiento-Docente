import Image from "next/image";
import { BotonEnlace } from "@ed/kit-admin";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { BookOpen } from "@/components/ui/icons";
import type { EstadoDeMaterial, FilaDeMaterial } from "@/datos/consultas/lista-de-materiales";
import { SALUDES } from "./filtros";

// Lo que dice la insignia de cada estado (DESIGN.md §11, «Insignias»): lo que
// pide atención va fuerte; «Oculto» ya no está en el sitio y va apagada. Un
// publicado sin cambios no lleva: es el estado de casi todos.
const INSIGNIA: Partial<Record<EstadoDeMaterial, { tono: "fuerte" | "apagado"; texto: string }>> = {
  "sin-publicar": { tono: "fuerte", texto: "Sin publicar" },
  "con-cambios": { tono: "fuerte", texto: "Cambios sin publicar" },
  oculto: { tono: "apagado", texto: "Oculto" },
};

/** La portada chica de la fila (decorativa: el título dice qué es); sin portada propia, un cuadro con el ícono. */
function Miniatura({ src }: { src: string | null }) {
  if (!src) {
    return (
      <span className="flex size-12 items-center justify-center rounded-lg bg-gris-fondo text-azul-medio">
        <BookOpen size={20} />
      </span>
    );
  }
  return (
    <span className="relative block size-12 overflow-hidden rounded-lg bg-gris-fondo">
      <Image src={src} alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}

/** «Consultado 3 veces este mes»: las del contador de Métricas, del 1 del mes hasta hoy. */
function consultadoEsteMes(veces: number): string {
  if (veces === 0) return "Sin consultas este mes";
  return `Consultado ${veces} ${veces === 1 ? "vez" : "veces"} este mes`;
}

/**
 * Los materiales de la Biblioteca (`Lista` de DESIGN.md §11, con miniatura):
 * la portada, el título y, debajo, quién firma, el tipo, el año y cuántas
 * veces se abrió este mes (`consultas`, por id); a la derecha el estado, la
 * salud y «Editar», con el título para el lector.
 */
export function ListaDeMateriales({ filas, consultas = new Map() }: { filas: readonly FilaDeMaterial[]; consultas?: ReadonlyMap<string, number> }) {
  return (
    <Lista>
      {filas.map((f) => {
        const insignia = INSIGNIA[f.estado];
        const titulo = f.titulo || "Sin título todavía";
        return (
          <Fila
            key={f.id}
            miniatura={<Miniatura src={f.portada} />}
            principal={f.titulo ? f.titulo : <span className="text-gris-texto">{titulo}</span>}
            detalle={
              <>
                <span className="block">{[f.autores, f.tipo, f.anio].filter(Boolean).join(" · ") || "Todavía sin datos"}</span>
                <span className="block">{consultadoEsteMes(consultas.get(f.id) ?? 0)}</span>
              </>
            }
            insignias={
              <>
                {insignia ? <Insignia tono={insignia.tono}>{insignia.texto}</Insignia> : null}
                {f.salud.map((s) => (
                  <Insignia key={s} tono="normal">
                    {SALUDES[s]}
                  </Insignia>
                ))}
              </>
            }
            accion={
              <BotonEnlace variante="secundario" href={`/admin/biblioteca/${f.id}`} aria-label={`Editar «${titulo}»`}>
                Editar
              </BotonEnlace>
            }
          />
        );
      })}
    </Lista>
  );
}
