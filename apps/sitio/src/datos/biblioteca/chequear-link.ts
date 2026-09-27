import type { Pedir } from "./buscar-datos";

// Si el link de un material sigue andando (SPEC §10 de `work/biblioteca/`).
// Un DOI se pregunta a doi.org y no a la revista, que muchas veces frena a los
// robots: así no hay falsos rotos. Solo es `roto` lo definitivo —un 404, un
// 410, un sitio que ya no existe, un DOI sin registrar—; un sitio lento o que
// no quiere contestar es `sin-respuesta`, que no prende nada.

export type ResultadoDelChequeo = "bien" | "roto" | "sin-respuesta" | "sin-chequear";
export type Chequeo = { chequeo: ResultadoDelChequeo; detalle: string };

/** El DOI en el camino de la API de handles, con cada parte escapada. */
const caminoDelDoi = (doi: string) => doi.split("/").map(encodeURIComponent).join("/");

async function chequearDoi(doi: string, pedir: Pedir): Promise<Chequeo> {
  const r = await pedir(`https://doi.org/api/handles/${caminoDelDoi(doi)}`, { leerCuerpo: true, aceptar: "application/json" });
  if (!r.ok) return { chequeo: "sin-respuesta", detalle: `doi.org no contestó: ${r.detalle}` };
  let codigo: unknown = null;
  try {
    codigo = (JSON.parse(r.cuerpo) as { responseCode?: unknown }).responseCode;
  } catch {
    codigo = null;
  }
  if (r.estado === 200 && codigo === 1) return { chequeo: "bien", detalle: "El DOI está registrado en doi.org." };
  if (r.estado === 404 || codigo === 100) return { chequeo: "roto", detalle: "El DOI no está registrado en doi.org." };
  return { chequeo: "sin-respuesta", detalle: `doi.org contestó ${r.estado}.` };
}

/** Un estado HTTP, leído: menos de 400 es que anda; 404 y 410, que no está más. */
function porEstado(estado: number): Chequeo {
  if (estado < 400) return { chequeo: "bien", detalle: `Contestó ${estado}.` };
  if (estado === 404 || estado === 410) return { chequeo: "roto", detalle: `Dio ${estado}: la página no está más.` };
  return { chequeo: "sin-respuesta", detalle: `Contestó ${estado}.` };
}

async function chequearPagina(url: string, pedir: Pedir): Promise<Chequeo> {
  // HEAD primero, que no baja nada; si no sirve (muchos sitios lo rechazan), un GET que corta al tener el estado.
  let r = await pedir(url, { metodo: "HEAD" });
  if (!r.ok || r.estado >= 400) r = await pedir(url, { metodo: "GET" });
  if (r.ok) return porEstado(r.estado);
  if (r.motivo === "dns") return { chequeo: "roto", detalle: "El sitio ya no existe: su nombre no lleva a ninguna dirección." };
  if (r.motivo === "ip" || r.motivo === "url") return { chequeo: "sin-chequear", detalle: r.detalle };
  return { chequeo: "sin-respuesta", detalle: r.detalle };
}

/** El chequeo del link de un material: por su DOI si tiene, o por su `url`. */
export async function chequearLink({ url, doi }: { url: string | null; doi: string | null }, pedir: Pedir): Promise<Chequeo> {
  if (doi) return chequearDoi(doi, pedir);
  if (!url) return { chequeo: "sin-chequear", detalle: "No tiene link." };
  if (url.startsWith("/")) return { chequeo: "bien", detalle: "Es un archivo del sitio: va con cada deploy." };
  if (url.startsWith("http://")) return { chequeo: "sin-chequear", detalle: "El link no es https: no se chequea." };
  return chequearPagina(url, pedir);
}
