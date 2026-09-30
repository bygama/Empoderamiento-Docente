import { correrTareasDiarias } from "@/datos/tareas/diarias";
import { esElSecreto } from "@/lib/seguridad/secreto";

// El cron diario pega acá una vez por día y corre todas las tareas registradas
// (ADR-0011): en Vercel, el de `vercel.json` (en el plan gratis, con hasta una
// hora de imprecisión); en el VPS, el servicio `cron` del compose, por la red
// interna (ADR-0018). Sin el secreto correcto, 401 y no se toca nada; el
// secreto se compara en tiempo constante (lib/seguridad/secreto.ts).
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || !esElSecreto(req.headers.get("authorization"), `Bearer ${secreto}`)) {
    return new Response("No autorizado", { status: 401 });
  }
  const corridas = await correrTareasDiarias();
  return Response.json(corridas, { status: corridas.every((c) => c.ok) ? 200 : 500 });
}
