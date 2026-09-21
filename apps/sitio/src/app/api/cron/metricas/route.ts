import { sincronizarDesdeEntorno } from "@/datos/acciones/sincronizar-metricas";

// El cron de Vercel pega acá una vez por día. Sin el secreto correcto, 401 y
// no se toca nada. En el plan gratis corre con hasta una hora de imprecisión.
export const maxDuration = 60;

export async function GET(req: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const resultado = await sincronizarDesdeEntorno();
  return Response.json(resultado, { status: resultado.ok ? 200 : 500 });
}
