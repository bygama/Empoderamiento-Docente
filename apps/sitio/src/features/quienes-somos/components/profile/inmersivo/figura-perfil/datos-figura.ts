import type { Profile } from "@/features/quienes-somos/contenido/perfil-del-sitio";

export type Figura = NonNullable<Profile["figura"]>;

/** Medidas de referencia cuando el perfil no declara las del archivo. */
const MEDIDAS_POR_DEFECTO = { width: 1200, height: 1600 };

/** Lo que las tres apariciones necesitan del perfil, resuelto una sola vez. */
export type DatosFigura = {
  cutout: string;
  cutoutPosition: string | undefined;
  /** El alt de la figura donde no es decorativa (el perfil lineal): el de la foto, o el nombre completo. */
  alt: string;
  medidas: { width: number; height: number };
  /** Marco apaisado (una lámina): misma altura de referencia, proporción 5:3. */
  apaisado: boolean;
};

/**
 * Devuelve `null` cuando no hay figura que mostrar (`figura: "sin"` o un
 * perfil sin `cutout`): el compositor lo usa como única guarda, en lugar de
 * repetir la condición en cada aparición.
 */
export function leerDatosFigura(profile: Profile, figura: Figura): DatosFigura | null {
  if (figura === "sin" || !profile.cutout) return null;
  return {
    cutout: profile.cutout,
    cutoutPosition: profile.cutoutPosition,
    alt: profile.cutoutAlt ?? profile.fullName,
    medidas: profile.cutoutSize ?? MEDIDAS_POR_DEFECTO,
    apaisado: figura === "marco" && !!profile.marcoApaisado,
  };
}
