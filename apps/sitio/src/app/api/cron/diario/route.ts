import { correrTareasDiarias } from "@/datos/tareas/diarias";

// El único cron de Vercel pega acá una vez por día y corre todas las tareas
// registradas (ADR-0011). Sin el secreto correcto, 401 y no se toca nada. En
// el plan gratis corre con hasta una hora de imprecisión.
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const corridas = await correrTareasDiarias();
  return Response.json(corridas, { status: corridas.every((c) => c.ok) ? 200 : 500 });
}
