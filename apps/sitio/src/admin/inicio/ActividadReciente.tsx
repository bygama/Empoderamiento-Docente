import { fraseDe } from "@/admin/actividad/frase";
import { BotonEnlace } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { EventoReciente } from "@/datos/inicio/actividad-reciente";

/**
 * Los últimos eventos que tu rol puede ver, una línea cada uno: qué pasó a la
 * izquierda y cuándo a la derecha, en relativo. `null` es que no se pudo leer.
 * Quien usa Cuentas tiene al lado «Ver toda la actividad», con las sesiones y
 * la cuenta propia que acá no van.
 */
export function ActividadReciente({ eventos, verActividad }: { eventos: readonly EventoReciente[] | null; verActividad: boolean }) {
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
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <h2 id="actividad-reciente" className="font-display text-admin-seccion font-bold">
          Actividad reciente
        </h2>
        {/* El `-mr-4` alinea el texto del link con el borde de la lista, como «Ver métricas». */}
        {verActividad ? (
          <BotonEnlace variante="terciario" href="/admin/cuentas/actividad" className="-mr-4">
            Ver toda la actividad
          </BotonEnlace>
        ) : null}
      </div>
      {cuerpo}
    </section>
  );
}
