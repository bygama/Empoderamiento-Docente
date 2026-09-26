import { puede } from "@ed/auth";
import { actividadReciente, type EventoReciente } from "./actividad-reciente";
import { loNuevoPara, ultimaVisita } from "./desde-tu-visita";
import { numerosPara, type NumeroDeLaSemana } from "./esta-semana";
import { pendientesPara, type FilaDePendiente } from "./pendientes";

/** Lo que el Inicio necesita de la sesión: quién es, su rol y cuándo empezó esta sesión. */
export type SesionDelInicio = { user: { id: string; name: string; rol?: unknown }; session: { createdAt: Date } };

export type DatosDelInicio = {
  nombre: string;
  /** `null` si no se pudo leer; `ultima` en `null` si es la primera visita que se anotó. */
  desdeTuVisita: { ultima: string | null; loNuevo: string[] } | null;
  pendientes: FilaDePendiente[];
  numeros: NumeroDeLaSemana[];
  /** `null` si no se pudo leer. */
  actividad: EventoReciente[] | null;
  verMetricas: boolean;
};

/** Una lectura que no es de un registro, aislada igual: si tira, el bloque dice que no se pudo leer. */
async function oNull<T>(que: string, lectura: () => Promise<T>): Promise<T | null> {
  try {
    return await lectura();
  } catch (e) {
    console.error(`Inicio: no se pudo leer ${que}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

/** Lo nuevo desde la última visita: primero cuándo fue, y con eso qué pasó desde entonces. */
async function desdeTuVisita(sesion: SesionDelInicio): Promise<DatosDelInicio["desdeTuVisita"]> {
  const ultima = await ultimaVisita(sesion.user.id, sesion.session.createdAt);
  return { ultima: ultima?.toISOString() ?? null, loNuevo: ultima ? await loNuevoPara(sesion.user.rol, ultima) : [] };
}

/**
 * Todo lo que muestra el Inicio para esa sesión, leído en paralelo y aislado
 * por bloque: un módulo con un problema no tumba la pantalla. Las fechas
 * viajan como ISO.
 */
export async function inicioPara(sesion: SesionDelInicio): Promise<DatosDelInicio> {
  const { rol } = sesion.user;
  const [visita, pendientes, numeros, actividad] = await Promise.all([
    oNull("tu última visita", () => desdeTuVisita(sesion)),
    pendientesPara(rol),
    numerosPara(rol),
    oNull("la actividad reciente", () => actividadReciente(rol)),
  ]);
  return { nombre: sesion.user.name, desdeTuVisita: visita, pendientes, numeros, actividad, verMetricas: puede(rol, "verMetricas") };
}
