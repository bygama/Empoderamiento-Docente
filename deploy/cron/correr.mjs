// El cron diario del VPS (compose.yaml, servicio `cron`): llama a la ruta del
// cron por la red interna, con el secreto, y deja en el log lo que contestó —
// las corridas de cada tarea, también cuando alguna falla (500)—. Es lo mismo
// que hace el cron de `apps/sitio/vercel.json` en Vercel.
//
// A mano: docker compose exec cron node /etc/ed-cron/correr.mjs
import { readFileSync } from "node:fs";

// crond no le pasa el entorno del contenedor a sus trabajos: el secreto lo
// deja en este archivo el arranque del servicio, legible solo por root.
const secreto = readFileSync("/run/ed-cron/secreto", "utf8").trim();

console.log(`[cron] ${new Date().toISOString()}: corre el diario`);
try {
  const respuesta = await fetch("http://app:3000/api/cron/diario", {
    headers: { Authorization: `Bearer ${secreto}` },
    signal: AbortSignal.timeout(15 * 60_000),
  });
  console.log(`[cron] ${respuesta.status}: ${await respuesta.text()}`);
  process.exitCode = respuesta.ok ? 0 : 1;
} catch (e) {
  console.log(`[cron] la app no contestó: ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
}
