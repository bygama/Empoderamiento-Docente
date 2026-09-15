// En Vercel, arrancar sin estas variables no es «modo degradado»: es un
// error de configuración que hay que ver en el build, no en producción.
// En local todo esto es opcional: sin token las fotos van al disco y sin
// clave de Resend los correos salen por consola.
const EN_VERCEL = Boolean(process.env.VERCEL);
const EN_PRODUCCION = process.env.VERCEL_ENV === "production";

export function exigirVariablesEnVercel(): void {
  if (!EN_VERCEL) return;
  const faltan: string[] = [];
  for (const nombre of ["DATABASE_URL", "PAYLOAD_SECRET", "VISTA_PREVIA_SECRET", "BLOB_READ_WRITE_TOKEN"]) {
    if (!process.env[nombre]) faltan.push(nombre);
  }
  // El dominio de Resend se verifica una sola vez y para producción; en los
  // previews sin clave los correos siguen saliendo por consola.
  if (EN_PRODUCCION && !process.env.RESEND_API_KEY) faltan.push("RESEND_API_KEY");
  if (faltan.length > 0) {
    throw new Error(
      `Faltan variables de entorno en Vercel (${process.env.VERCEL_ENV}): ${faltan.join(", ")}. ` +
        "Ver .env.example y la sección Deploy del README.",
    );
  }
}
