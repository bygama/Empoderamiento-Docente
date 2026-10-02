import type { RefObject } from "react";
import type { Destacados } from "@/features/biblioteca/contenido/destacados";
import type { DestacadoDelSitio } from "@/features/biblioteca/contenido/material";
import { PortadaDeMaterial } from "@/features/biblioteca/components/portada/PortadaDeMaterial";
import { fragmentos } from "@/lib/contenido/resaltado";

/**
 * El titular en dos tonos: lo resaltado (entre dobles asteriscos) en verde y
 * lo demás en azul, cada tramo en su span y un espacio entre ellos, como
 * estaba escrito a mano. Sin resaltado —un documento viejo—, todo azul.
 */
function TituloDosTonos({ texto }: { texto: string }) {
  const partes = fragmentos(texto);
  const i = partes.findIndex((f) => f.resaltado);
  if (i === -1) return <span className="text-azul-principal">{texto}</span>;
  const unir = (lista: typeof partes) => lista.map((f) => f.texto).join("").trim();
  const antes = unir(partes.slice(0, i));
  const despues = unir(partes.slice(i + 1));
  return (
    <>
      {antes ? <><span className="text-azul-principal">{antes}</span>{" "}</> : null}
      <span className="text-verde-concepto">{partes[i].texto}</span>
      {despues ? <>{" "}<span className="text-azul-principal">{despues}</span></> : null}
    </>
  );
}

/**
 * Fase 1: intro con pantalla propia — eyebrow, titular a dos azules, párrafo
 * del equipo y la fila de las 4 portadas viajeras (que en desktop la
 * coreografía pinea, converge y barre). Los textos llegan por props; las
 * portadas son de los materiales.
 */
export function IntroDestacados({
  contenido,
  items,
  refRow,
}: {
  contenido: Destacados;
  items: ReadonlyArray<DestacadoDelSitio>;
  refRow: RefObject<HTMLDivElement | null>;
}) {
  return (
    /* Alto por contenido (sin min-h de pantalla): así la banda azul viene
       enseguida después de las portadas. Los espacios son todos fijos:
       pt corto (cerca del hero), gap generoso titular→portadas y un pb
       moderado antes de la banda. */
    <div className="mx-auto w-full max-w-screen-xl px-5 pt-14 pb-16 md:px-10 md:pt-20 md:pb-20">
      <div className="md:grid md:grid-cols-12 md:gap-x-8">
        <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase md:col-span-3">
          {contenido.antetitulo}
        </p>
        <h2
          className="font-display mt-6 font-extrabold tracking-[-0.02em] md:col-span-9 md:mt-0"
          style={{ fontSize: "clamp(2.2rem, 1rem + 4.5vw, 4.25rem)", lineHeight: 1.05 }}
        >
          <TituloDosTonos texto={contenido.titulo} />
        </h2>
        {/* La presentación va debajo del titular, a lo ancho: en la columna
            angosta de la izquierda, al lado de las portadas, eran cinco
            renglones (y en tablet, una tira de una palabra por renglón). */}
        <p className="text-gris-texto mt-6 max-w-[62ch] font-sans text-[0.97rem] leading-relaxed text-pretty md:col-span-9 md:col-start-4 md:mt-8 lg:text-[1.05rem]">
          {contenido.presentacion}
        </p>
      </div>

      {/* Bajo `lg` las portadas van en la baraja, no acá. */}
      <div className="mt-24 md:grid md:grid-cols-12 md:gap-x-8 max-lg:hidden">
        {/* Las 4 portadas "viajeras": acá son la fila de la intro; en
            desktop se pinean, convergen sobre el slot y las barre cada
            divisoria. */}
        <div
          ref={refRow}
          className="z-30 grid grid-cols-4 gap-4 md:col-span-9 md:col-start-4"
        >
          {items.map(({ material }) => (
            <div
              key={material.id}
              data-viajera
              className="bg-azul-claro/30 relative aspect-[3/4] overflow-hidden rounded-xl"
            >
              <PortadaDeMaterial material={material} variante="tarjeta" sizes="(min-width: 768px) 25vw, 50vw" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
