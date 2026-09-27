import { BotonEnlace } from "@ed/kit-admin";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import type { Donde, Uso } from "@/datos/fotos/uso";

/** Dónde está cada uso, como insignia: lo que el sitio muestra es el estado estable; lo demás, todavía no. */
const INSIGNIA: Record<Donde, { tono: "normal" | "apagado"; texto: string }> = {
  sitio: { tono: "normal", texto: "En el sitio" },
  "sin-publicar": { tono: "apagado", texto: "Sin publicar" },
  codigo: { tono: "normal", texto: "En el sitio" },
};

/** El alt con que va en ese lugar y, si está en el contenido del código, que para cambiarla hay que pasar por su editor. */
function detalleDe(u: Uso): string {
  const alt = u.alt ? `Con el texto alternativo «${u.alt}»` : "Sin texto alternativo en este lugar";
  return u.en === "codigo" ? `${alt}. Es el contenido del código: la página todavía no se publicó desde acá.` : alt;
}

/**
 * «Se usa en» (SPEC §7.3 de `work/casos-aliados-fotos/`): una `Lista` con
 * cada lugar donde está la foto, con el alt con que va ahí (el alt es de cada
 * uso) y el link a la pantalla que lo edita. Sin usos, lo dice y dice qué
 * significa.
 */
export function UsosDeLaFoto({ usos }: { usos: readonly Uso[] }) {
  return (
    <section aria-labelledby="bloque-usos" className="space-y-4">
      <h2 id="bloque-usos" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Se usa en
      </h2>
      {usos.length ? (
        <Lista>
          {usos.map((u) => (
            <Fila
              key={`${u.enlace}·${u.donde}·${u.en}`}
              principal={u.donde}
              detalle={detalleDe(u)}
              insignias={<Insignia tono={INSIGNIA[u.en].tono}>{INSIGNIA[u.en].texto}</Insignia>}
              accion={
                <BotonEnlace variante="secundario" href={u.enlace} aria-label={`Editar ${u.donde}`}>
                  Editar
                </BotonEnlace>
              }
            />
          ))}
        </Lista>
      ) : (
        <EstadoVacio titulo="No se usa en ningún lado." texto="Para usarla, elegila desde el campo de foto de cualquier formulario. Mientras no se use, se puede borrar." />
      )}
    </section>
  );
}
