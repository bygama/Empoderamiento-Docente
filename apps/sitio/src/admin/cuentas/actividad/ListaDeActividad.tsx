import { fraseDe } from "@/admin/actividad/frase";
import { BotonEnlace } from "@/admin/armazon/Boton";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import type { FilaDeActividad } from "@/datos/consultas/actividad";
import { MODULOS_DE_ACTIVIDAD, moduloDe, pantallaDe } from "./modulos";

/**
 * Una página de la actividad: la frase («Ana Pérez invitó a Juan Pérez»), el
 * módulo y cuándo. Si lo que se tocó todavía tiene pantalla, un link a ella.
 */
export function ListaDeActividad({ filas, cuentasQueExisten }: { filas: FilaDeActividad[]; cuentasQueExisten: ReadonlySet<string> }) {
  return (
    <Lista>
      {filas.map((f) => {
        const pantalla = pantallaDe(f, cuentasQueExisten);
        const frase = fraseDe(f);
        return (
          <Fila
            key={f.id}
            principal={frase}
            detalle={
              <span className="flex flex-wrap gap-x-3">
                <span>{MODULOS_DE_ACTIVIDAD[moduloDe(f.tipo)]}</span>
                <Momento iso={f.en} />
              </span>
            }
            accion={
              pantalla ? (
                <BotonEnlace variante="secundario" href={pantalla.href} aria-label={`${pantalla.que}: ${frase}`}>
                  Ver
                </BotonEnlace>
              ) : null
            }
          />
        );
      })}
    </Lista>
  );
}
