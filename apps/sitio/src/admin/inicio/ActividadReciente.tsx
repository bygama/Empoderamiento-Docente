import { fraseDe } from "@/admin/actividad/frase";
import { Aviso } from "@/admin/armazon/Campos";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { EventoReciente } from "@/datos/inicio/actividad-reciente";

/**
 * Los últimos eventos que tu rol puede ver, una línea cada uno: qué pasó a la
 * izquierda y cuándo a la derecha, en relativo. `null` es que no se pudo leer.
 */
export function ActividadReciente({ eventos }: { eventos: readonly EventoReciente[] | null }) {
  let cuerpo: React.ReactNode;
  if (eventos === null) {
    cuerpo = <Aviso tono="error">No se pudo leer la actividad reciente. Probá recargar la página.</Aviso>;
  } else if (!eventos.length) {
    cuerpo = <EstadoVacio titulo="Todavía no hay actividad para mostrarte" texto="Acá van a aparecer las publicaciones y los cambios del contenido." />;
  } else {
    cuerpo = (
      <Lista>
        {eventos.map((e) => (
          <Fila
            key={e.id}
            principal={fraseDe(e)}
            insignias={
              <span className="text-admin-meta text-gris-texto">
                <Momento iso={e.en} relativo />
              </span>
            }
          />
        ))}
      </Lista>
    );
  }
  return (
    <section aria-labelledby="actividad-reciente" className="space-y-3">
      <h2 id="actividad-reciente" className="font-display text-admin-seccion font-bold">
        Actividad reciente
      </h2>
      {cuerpo}
    </section>
  );
}
