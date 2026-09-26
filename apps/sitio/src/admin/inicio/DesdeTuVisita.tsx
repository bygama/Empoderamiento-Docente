import { Momento } from "@/admin/armazon/Momento";
import type { DatosDelInicio } from "@/datos/inicio/inicio";

/**
 * Lo que pasó mientras no estabas, en una frase: va en el detalle del
 * encabezado, debajo del saludo. Un solo `<p>`, porque el detalle es una fila
 * flexible y cada pedazo suelto quedaría separado del siguiente.
 */
export function DesdeTuVisita({ visita }: { visita: DatosDelInicio["desdeTuVisita"] }) {
  if (visita === null) return <p>No se pudo leer tu última visita.</p>;
  if (visita.ultima === null) return <p>Desde la próxima vez que entres, acá vas a ver lo que cambió mientras no estabas.</p>;
  const cuando = <Momento iso={visita.ultima} />;
  if (!visita.loNuevo.length) return <p>Nada nuevo desde tu última visita, el {cuando}.</p>;
  return (
    <p>
      Desde tu última visita, el {cuando}: {visita.loNuevo.join("; ")}.
    </p>
  );
}
