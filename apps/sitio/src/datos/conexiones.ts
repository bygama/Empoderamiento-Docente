import { puede } from "@ed/auth";
import { CONEXIONES, type Conexion } from "@/config/conexiones";
import { base } from "./cliente";
import type { UltimaCorrida } from "./tareas/corridas";
import { TAREAS_DIARIAS } from "./tareas/diarias";

// El estado de cada conexión (Ajustes › Conexiones): si está configurada, qué
// variables faltan y cómo salió cada tarea que depende de ella, de
// `corridas_de_tareas`. Así se ve por qué Métricas dejó de actualizarse sin
// llamar a quien desarrolla.

export type EstadoDeTarea = { clave: string; nombre: string; ultima: UltimaCorrida | null; ultimaCorrecta: Date | null };

export type EstadoDeConexion = Conexion & {
  /** Los nombres de las variables que faltan: nunca su valor. */
  faltan: string[];
  tareasDeLaConexion: EstadoDeTarea[];
  /** Lo raro de su configuración (`Conexion.avisar`), o `null`. */
  aviso: string | null;
  /** Configurada y con un aviso o con la última corrida de alguna tarea fallida. */
  conError: boolean;
};

type Lectura = { ultima: UltimaCorrida | null; ultimaCorrecta: Date | null };

/** La última corrida de una tarea (o de todas, con `null`) y la última que salió bien. */
async function leerCorridas(tarea: string | null): Promise<Lectura> {
  const donde = tarea ? { tarea } : {};
  const orden = { corridaEn: "desc" } as const;
  const [ultima, correcta] = await Promise.all([
    base.corridaDeTarea.findFirst({ where: donde, orderBy: orden, select: { corridaEn: true, ok: true, detalle: true } }),
    base.corridaDeTarea.findFirst({ where: { ...donde, ok: true }, orderBy: orden, select: { corridaEn: true } }),
  ]);
  return { ultima, ultimaCorrecta: correcta?.corridaEn ?? null };
}

const nombreDe = (clave: string) => TAREAS_DIARIAS.find((t) => t.clave === clave)?.nombre ?? clave;

/**
 * Cada conexión con su estado. Sin `usarAjustes`, ninguna: dice qué falta
 * configurar. `entorno` y `leer` se pasan para probarlo sin base.
 */
export async function estadoDeLasConexiones(
  rol: unknown,
  { entorno = process.env, leer = leerCorridas }: { entorno?: Record<string, string | undefined>; leer?: (tarea: string | null) => Promise<Lectura> } = {},
): Promise<EstadoDeConexion[]> {
  if (!puede(rol, "usarAjustes")) return [];
  return Promise.all(
    CONEXIONES.filter((conexion) => conexion.mostrar?.(entorno) ?? true).map(async (conexion) => {
      const faltan = conexion.variables.filter((v) => !entorno[v]);
      const tareasDeLaConexion =
        conexion.tareas === "todas"
          ? [{ clave: "todas", nombre: "Cualquier tarea", ...(await leer(null)) }]
          : await Promise.all(conexion.tareas.map(async (clave) => ({ clave, nombre: nombreDe(clave), ...(await leer(clave)) })));
      const aviso = conexion.avisar?.(entorno) ?? null;
      const conError = faltan.length === 0 && (aviso !== null || tareasDeLaConexion.some((t) => t.ultima && !t.ultima.ok));
      return { ...conexion, faltan, tareasDeLaConexion, aviso, conError };
    }),
  );
}
