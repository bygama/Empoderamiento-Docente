import { Analytics } from "@vercel/analytics/next";
import { scriptDeAnalitica } from "@/lib/metricas/script";

/**
 * El script que cuenta vistas y visitantes sin cookies: Vercel Web Analytics
 * en Vercel (ADR-0009) o Umami en el VPS (ADR-0018), uno solo y solo en
 * producción (`scriptDeAnalitica`). El de Umami es del mismo origen —el proxy
 * lo sirve en `/umami/`—, así que la CSP del sitio no cambia por él.
 */
export function Analitica() {
  const script = scriptDeAnalitica(process.env);
  if (script?.tipo === "vercel") return <Analytics />;
  if (script?.tipo === "umami") return <script defer src="/umami/script.js" data-website-id={script.sitio} />;
  return null;
}
