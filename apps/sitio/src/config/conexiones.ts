import { urlDesviada } from "@/lib/correo/resend";

// Los servicios de afuera de los que depende el sitio (Ajustes › Conexiones,
// work/ajustes/SPEC.md §2.6): cómo se configura cada uno —por los nombres de
// sus variables, nunca su valor— y qué tareas del cron dependen de él. Sumar
// una conexión es sumar una línea acá.

export type Conexion = {
  clave: string;
  nombre: string;
  /** Para qué está, en una línea. */
  para: string;
  /** Las variables que la configuran, todas necesarias. */
  variables: readonly string[];
  /** Las tareas del cron que dependen de ella; «todas» es el cron mismo. */
  tareas: readonly string[] | "todas";
  /** Qué pasa mientras no está configurada. */
  sinConfigurar: string;
  /** Algo raro de la configuración que hay que ver, aunque tenga sus variables; `null` si nada. */
  avisar?: (entorno: Record<string, string | undefined>) => string | null;
};

export const CONEXIONES: readonly Conexion[] = [
  {
    clave: "vercel-analytics",
    nombre: "Vercel Analytics",
    para: "Las visitas de Métricas, copiadas una vez por día.",
    variables: ["VERCEL_TOKEN", "VERCEL_ANALYTICS_PROJECT_ID"],
    tareas: ["copia-de-visitas"],
    sinConfigurar: "Métricas no se actualiza.",
  },
  {
    clave: "search-console",
    nombre: "Search Console",
    para: "Qué busca la gente en Google para llegar, y si cada página está en su índice.",
    variables: ["SEARCH_CONSOLE_CLIENT_EMAIL", "SEARCH_CONSOLE_PRIVATE_KEY", "SEARCH_CONSOLE_SITE_URL"],
    tareas: ["busquedas-de-google", "indexacion-de-google"],
    sinConfigurar: "Búsquedas y la indexación no se actualizan.",
  },
  {
    clave: "resend",
    nombre: "Resend",
    para: "Los correos: los avisos de mensajes nuevos, el resumen semanal, las contraseñas y los códigos para entrar.",
    variables: ["RESEND_API_KEY", "CORREO_REMITENTE"],
    tareas: ["resumen-semanal"],
    sinConfigurar: "En producción los correos no salen, y sin el código nadie que dirige o administra puede entrar.",
    avisar: (entorno) => {
      const url = urlDesviada(entorno.RESEND_API_URL);
      return url ? `Los correos van a ${url}, no a Resend: RESEND_API_URL es solo para la prueba local.` : null;
    },
  },
  {
    clave: "blob-de-fotos",
    nombre: "Blob de fotos",
    para: "Las fotos que se suben desde el admin.",
    variables: ["BLOB_READ_WRITE_TOKEN"],
    tareas: [],
    sinConfigurar: "Las fotos van al disco del servidor: sirve en local, no en Vercel.",
  },
  {
    clave: "blob-de-cv",
    nombre: "Blob de CV, privado",
    para: "Los archivos de los CV, guardados sin URL pública.",
    variables: ["CV_BLOB_READ_WRITE_TOKEN"],
    tareas: ["retencion-de-cv"],
    sinConfigurar: "En Vercel no se reciben CV.",
  },
  {
    clave: "cron",
    nombre: "Cron diario de Vercel",
    para: "Corre una vez por día todo lo programado: las copias, la indexación y la retención.",
    variables: ["CRON_SECRET"],
    tareas: "todas",
    sinConfigurar: "Nada programado corre: el cron contesta 401.",
  },
];
