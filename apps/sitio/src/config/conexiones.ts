import { urlDesviada } from "@/lib/correo/resend";
import { fuenteDeVisitas, fuenteEsperada, VARIABLES_DE_LA_FUENTE } from "@/lib/metricas/entorno";

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
  /** Si se muestra en este entorno; sin esto, siempre. Las dos fuentes de visitas se excluyen. */
  mostrar?: (entorno: Record<string, string | undefined>) => boolean;
  /** Algo raro de la configuración que hay que ver, aunque tenga sus variables; `null` si nada. */
  avisar?: (entorno: Record<string, string | undefined>) => string | null;
};

export const CONEXIONES: readonly Conexion[] = [
  {
    clave: "umami",
    nombre: "Umami",
    para: "Las visitas de Métricas, copiadas una vez por día desde la analítica del VPS.",
    variables: VARIABLES_DE_LA_FUENTE.umami,
    tareas: ["copia-de-visitas"],
    sinConfigurar: "Métricas no se actualiza.",
    mostrar: (entorno) => fuenteEsperada(entorno) === "umami",
    // Con sus variables Umami es la fuente también en Vercel (una sola regla:
    // lib/metricas/entorno.ts), pero su script lo sirve el proxy del VPS.
    avisar: (entorno) =>
      entorno.VERCEL && fuenteDeVisitas(entorno) === "umami"
        ? "El sitio corre en Vercel, donde no hay proxy que sirva /umami/script.js: el script de Umami da 404 y no se cuenta ninguna visita. En Vercel, dejá vacías las variables de Umami."
        : null,
  },
  {
    clave: "vercel-analytics",
    nombre: "Vercel Analytics",
    para: "Las visitas de Métricas, copiadas una vez por día.",
    variables: VARIABLES_DE_LA_FUENTE.vercel,
    tareas: ["copia-de-visitas"],
    sinConfigurar: "Métricas no se actualiza.",
    mostrar: (entorno) => fuenteEsperada(entorno) === "vercel",
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
    sinConfigurar: "Las fotos van al disco del servidor: en el VPS, a su volumen. En Vercel hace falta, porque su disco no dura.",
  },
  {
    clave: "blob-de-cv",
    nombre: "Blob de CV, privado",
    para: "Los archivos de los CV, guardados sin URL pública.",
    variables: ["CV_BLOB_READ_WRITE_TOKEN"],
    tareas: ["retencion-de-cv"],
    sinConfigurar: "Los CV van al disco privado del servidor: en el VPS, a su volumen. En Vercel no se reciben.",
  },
  {
    clave: "cron",
    nombre: "Cron diario",
    para: "Corre una vez por día todo lo programado: las copias, la indexación y la retención. Lo llama el cron de Vercel o el servicio `cron` del VPS.",
    variables: ["CRON_SECRET"],
    tareas: "todas",
    sinConfigurar: "Nada programado corre: el cron contesta 401.",
  },
];
