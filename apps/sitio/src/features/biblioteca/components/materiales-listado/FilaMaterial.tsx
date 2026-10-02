import { ArrowUpRight } from "@/components/ui/icons";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { accionDe } from "@/features/biblioteca/contenido/modelo";
import { contar } from "@/lib/contadores/contar";
import { estiloDe } from "@/features/biblioteca/components/portada/estilo-de-tipo";
import { PortadaDeMaterial } from "@/features/biblioteca/components/portada/PortadaDeMaterial";
import { TextoPlegable } from "@/features/biblioteca/components/destacados/TextoPlegable";
import { CopiarCita } from "./CopiarCita";

/** Una fila del catálogo: portada, chips de tipo y tema, título, autores, descripción, metadata con «Copiar cita APA» y el link de acción. */
export function FilaMaterial({ material: m }: { material: MaterialDelSitio }) {
  const { Icon, fondo, velo, acento, borde } = estiloDe(m.tipo);
  return (
    <article className="grid gap-5 py-7 md:grid-cols-[218px_minmax(0,1fr)] md:gap-8 md:py-8 max-md:grid-cols-[34%_minmax(0,1fr)] max-md:gap-4 max-md:py-5">
      {/* Portada: el tipo y el año con el color del tipo, o la foto que cargue el equipo.
          Acompaña el scroll mientras dura su fila (cuando el texto es más alto
          que ella), pegada bajo el header o, con la barra de filtros, bajo la barra. */}
      <div className="bg-azul-claro/30 relative aspect-[16/9] overflow-hidden rounded-xl md:aspect-[4/3] max-md:aspect-[3/4] sticky top-[13.5rem] self-start lg:top-28">
        <PortadaDeMaterial material={m} variante="miniatura" sizes="(min-width: 768px) 218px, 34vw" />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {/* El chip del tipo lleva su mismo color e ícono que la portada. */}
          <span className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium ${fondo} ${borde ? "ring-azul-principal/15 ring-1 ring-inset" : ""}`}>
            {velo ? <span aria-hidden="true" className={`absolute inset-0 ${velo}`} /> : null}
            <Icon size={13} className={`relative shrink-0 ${acento}`} />
            <span className="relative">{m.tipo}</span>
          </span>
          <span className="bg-gris-fondo text-azul-principal rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium">
            {m.tema}
          </span>
        </div>

        <h3 className="font-display text-azul-principal mt-3 text-[1.3rem] leading-snug font-bold tracking-[-0.01em] max-md:text-[1.08rem]">
          {m.titulo}
        </h3>
        <p className="text-azul-principal/70 mt-1.5 font-sans text-[0.9rem] leading-snug">
          {m.autores}
        </p>
        <div className="mt-2 flex flex-col">
          <TextoPlegable
            descripcion={m.descripcion}
            renglones={2}
            sobreClaro
            claseParrafo="text-gris-texto max-w-[68ch] font-sans text-[0.97rem] leading-relaxed max-md:text-[0.9rem]"
          />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-gris-texto font-mono text-[0.72rem] tracking-[0.08em] uppercase">
              {m.fecha} · {m.paginas ? `${m.paginas} páginas` : m.formato}
            </p>
            {m.cita ? <CopiarCita cita={m.cita} /> : null}
          </div>
          {/* Se abre en otra pestaña: la revista, la editorial o el PDF. El clic suma una consulta del material, sin nada de quien lo abre. */}
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => contar("material-consultado", m.id)}
            className="text-naranja-accion group inline-flex items-center gap-1.5 font-sans text-[0.92rem] font-medium max-md:min-h-11"
          >
            {accionDe(m)}
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={17} />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
