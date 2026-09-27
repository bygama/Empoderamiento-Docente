import type { DatosDelSitio } from "./datos-del-sitio";

// El formulario de Ajustes › Datos del sitio (work/ajustes/SPEC.md §2.2): un
// texto por campo, como lo escribe la persona, y el paso a y desde la forma
// que valida `esquemaDeDatosDelSitio`. Lo usan la pantalla y su acción, así los
// dos nombran los campos igual.

export const CAMPOS_DEL_SITIO = ["correo", "whatsapp", "calle", "complemento", "ciudad", "region", "pais", "paises", "instagram", "facebook", "linkedin"] as const;
export type CampoDelSitio = (typeof CAMPOS_DEL_SITIO)[number];
export type ValoresDelSitio = Record<CampoDelSitio, string>;

/** Cómo se rotula cada campo: la etiqueta del formulario y el resumen de errores. */
export const ETIQUETAS: Record<CampoDelSitio, string> = {
  correo: "Correo",
  whatsapp: "WhatsApp",
  calle: "Calle y número",
  complemento: "Piso u oficina",
  ciudad: "Ciudad",
  region: "Región",
  pais: "País",
  paises: "Países",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

/** Los datos, como texto para el formulario: lo que falta, vacío; los países, separados por coma. */
export function aValores({ correo, whatsapp, direccion, paises, redes }: DatosDelSitio): ValoresDelSitio {
  return {
    correo,
    whatsapp: whatsapp ?? "",
    calle: direccion.calle,
    complemento: direccion.complemento ?? "",
    ciudad: direccion.ciudad,
    region: direccion.region ?? "",
    pais: direccion.pais,
    paises: paises.join(", "),
    instagram: redes.instagram ?? "",
    facebook: redes.facebook ?? "",
    linkedin: redes.linkedin ?? "",
  };
}

/** Lo escrito, con la forma que valida el esquema. Los países se separan por coma y se saltean los vacíos. */
export function desdeValores(v: ValoresDelSitio): unknown {
  return {
    correo: v.correo,
    whatsapp: v.whatsapp,
    direccion: { calle: v.calle, complemento: v.complemento, ciudad: v.ciudad, region: v.region, pais: v.pais },
    paises: v.paises
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean),
    redes: { instagram: v.instagram, facebook: v.facebook, linkedin: v.linkedin },
  };
}

/** El campo del formulario de un problema del esquema: `["direccion", "calle"]` → `calle`, `["paises", 2]` → `paises`. */
export function campoDe(camino: ReadonlyArray<PropertyKey>): CampoDelSitio {
  const [primero, segundo] = camino;
  const campo = String(primero === "direccion" || primero === "redes" ? segundo : primero);
  return (CAMPOS_DEL_SITIO as readonly string[]).includes(campo) ? (campo as CampoDelSitio) : "correo";
}
