import { Bloque } from "@/admin/armazon/Bloque";
import { BotonEnlace } from "@/admin/armazon/Boton";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import type { RecorridoEnElFormulario } from "./formulario";

type Props = {
  /** `null` mientras el perfil no se guardó nunca: todavía no puede firmar nada. */
  id: string | null;
  firmados: readonly Firmado[];
  recorrido: RecorridoEnElFormulario | null;
};

/** Dónde está un material en el recorrido: «Etapa 5 · Producción», o fuera del perfil. */
function dondeEsta(material: string, recorrido: RecorridoEnElFormulario | null): string {
  const etapas = (recorrido?.etapas ?? []).flatMap((e, i) =>
    e.publicaciones.some((p) => p.origen === "biblioteca" && p.material === material) ? [`Etapa ${i + 1}${e.titulo.trim() ? ` · ${e.titulo.trim()}` : ""}`] : [],
  );
  return etapas.length ? etapas.join(" y ") : "Fuera del perfil";
}

/**
 * Lo que la persona firma en la Biblioteca (SPEC §7.2 de `work/equipo/`), de
 * solo lectura: cada material, con dónde está en el recorrido y el link a su
 * ficha, y «Agregar en Biblioteca», que abre un material nuevo con la persona
 * ya elegida como autora. De acá eligen las etapas sus publicaciones.
 */
export function EnLaBiblioteca({ id, firmados, recorrido }: Props) {
  return (
    <Bloque id="bloque-biblioteca" titulo="En la Biblioteca">
      {id ? (
        <>
          <p className="text-admin-meta text-gris-texto">
            {firmados.length
              ? "Lo que firma en la Biblioteca. Las etapas eligen de acá: el título, el año, el tipo y el link son los del material."
              : "Todavía no firma nada en la Biblioteca."}
          </p>
          {firmados.length ? (
            <Lista>
              {firmados.map((m) => (
                <Fila
                  key={m.id}
                  principal={m.titulo}
                  detalle={[m.anio, dondeEsta(m.id, recorrido)].filter(Boolean).join(" · ")}
                  insignias={m.publicado ? null : <Insignia tono="apagado">Oculto</Insignia>}
                  accion={
                    <BotonEnlace variante="secundario" href={`/admin/biblioteca/${m.id}`} aria-label={`Abrir «${m.titulo}» en la Biblioteca`}>
                      Abrir
                    </BotonEnlace>
                  }
                />
              ))}
            </Lista>
          ) : null}
          <BotonEnlace variante="secundario" href={`/admin/biblioteca/nuevo?persona=${id}`}>
            Agregar en Biblioteca
          </BotonEnlace>
        </>
      ) : (
        <p className="text-admin-meta text-gris-texto">Guardá el perfil para sumarle publicaciones de la Biblioteca.</p>
      )}
    </Bloque>
  );
}
