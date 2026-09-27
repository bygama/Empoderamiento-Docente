import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { SesionAbierta } from "@/datos/consultas/mi-cuenta";
import { dispositivoDe, lugarDe } from "@/lib/sesiones";
import { CerrarLasDemas } from "./CerrarLasDemas";

/**
 * Las sesiones abiertas de una cuenta, una fila cada una: dispositivo, lugar
 * y última actividad. Con `idDeEstaSesion`, esa va primero y con su
 * insignia. La usan Mi cuenta y la ficha de una cuenta, en Cuentas.
 */
export function ListaDeSesiones({ sesiones, idDeEstaSesion }: { sesiones: SesionAbierta[]; idDeEstaSesion?: string }) {
  const ordenadas = [...sesiones].sort((a, b) => Number(b.id === idDeEstaSesion) - Number(a.id === idDeEstaSesion));
  return (
    <Lista>
      {ordenadas.map((s) => {
        const esta = s.id === idDeEstaSesion;
        return (
          <Fila
            key={s.id}
            principal={dispositivoDe(s.userAgent)}
            detalle={
              <span className="flex flex-wrap gap-x-3">
                <span>{lugarDe(s)}</span>
                <span>{esta ? "Activa ahora" : <>Última actividad <Momento iso={s.ultimaActividad} relativo /></>}</span>
              </span>
            }
            insignias={esta ? <Insignia tono="normal">Esta sesión</Insignia> : null}
          />
        );
      })}
    </Lista>
  );
}

/**
 * Dónde tiene cada persona el admin abierto: esta sesión primero, con su
 * insignia, y después las demás, la más usada arriba. El pie es una región
 * viva: cuando «Cerrar las demás» termina, el botón cambia por la frase de
 * que no hay otras, y eso se anuncia.
 */
export function Sesiones({ sesiones, idDeEstaSesion }: { sesiones: SesionAbierta[]; idDeEstaSesion: string }) {
  const otras = sesiones.length - (sesiones.some((s) => s.id === idDeEstaSesion) ? 1 : 0);
  return (
    <div className="space-y-4">
      <ListaDeSesiones sesiones={sesiones} idDeEstaSesion={idDeEstaSesion} />
      <div aria-live="polite">
        {otras > 0 ? (
          <CerrarLasDemas cuantas={otras} />
        ) : (
          <p className="text-admin-meta text-gris-texto">No tenés el admin abierto en ningún otro lado.</p>
        )}
      </div>
    </div>
  );
}
