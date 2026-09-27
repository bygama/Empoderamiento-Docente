import { z } from "zod";
import { puede, type Capacidad } from "@ed/auth";
import { base } from "./cliente";

/**
 * La actividad del admin: quién hizo qué, sobre qué y cuándo (tabla
 * `actividad`). **La única puerta para escribirla.**
 *
 * No es una Server Action ni vive en `datos/acciones/`, a propósito: si lo
 * fuera, el navegador podría llamarla y anotar lo que quisiera. La llaman las
 * acciones, después de hacer lo suyo, y los ganchos de la sesión
 * (`datos/auth.ts`).
 */

/**
 * Lo que se registra, cerrado: cada módulo suma acá los suyos. Un verbo en
 * pasado sobre quien lo hizo («Ana entró», «Ana cambió su nombre»). De un CV
 * se registra solo que se borró, sin `sobre`.
 */
export const TIPOS_DE_ACTIVIDAD = [
  "entro",
  "salio",
  "cambio-su-contrasena",
  "cambio-su-nombre",
  // Las páginas (work/paginas-inicio/): sobre la página, con su slug.
  "publico-una-pagina",
  "descarto-un-borrador",
  "restauro-una-version",
  // Mensajes (work/mensajes/): de Contacto, con el tema en `sobre`, nunca el
  // nombre ni el texto de quien escribió; de un CV, solo que se borró.
  "tomo-un-mensaje",
  "cerro-un-mensaje",
  "marco-un-mensaje-como-spam",
  "borro-un-mensaje",
  "borro-un-cv",
  "activo-el-segundo-factor",
  "desactivo-el-segundo-factor",
  // Cuentas: `sobre` es el nombre de la otra persona, como era; `sobreId`, su cuenta.
  "invito",
  "reenvio-la-invitacion",
  "cancelo-la-invitacion",
  "cambio-el-rol",
  "cambio-el-correo",
  "suspendio",
  "reactivo",
  "borro-una-cuenta",
  "paso-la-direccion",
  "cerro-las-sesiones",
  // Novedades (work/novedades-y-kit/): sobre la novedad, con su título como
  // era en ese momento y su id. Guardar un borrador no se anota.
  "publico-una-novedad",
  "despublico-una-novedad",
  "descarto-cambios-de-una-novedad",
  "borro-una-novedad",
  // Ajustes (work/ajustes/): una redirección con «/viejo → /nuevo» en `sobre`;
  // un aviso, con su nombre («CV»); los plazos, con lo que cambió.
  "cambio-los-datos-del-sitio",
  "agrego-una-redireccion",
  "borro-una-redireccion",
  "cambio-quien-recibe-un-aviso",
  "cambio-los-plazos-de-guarda",
  // Biblioteca (work/biblioteca/): sobre el material, con su título como era
  // en ese momento y su id. Agregarlo sí se anota (entra uno nuevo); guardar
  // un borrador, no.
  "agrego-un-material",
  "publico-un-material",
  "oculto-un-material",
  "descarto-cambios-de-un-material",
  "borro-un-material",
  // Casos (work/casos-aliados-fotos/): sobre el caso («Caso 01»), con su id.
  "publico-un-caso",
  "descarto-cambios-de-un-caso",
  // Aliados: sobre el aliado, por su nombre como era, con su id.
  "autorizo-un-aliado",
  "quito-la-autorizacion-de-un-aliado",
  "publico-un-aliado",
  "despublico-un-aliado",
  "borro-un-aliado",
  // Fotos: sobre la foto, por su texto alternativo, con su id.
  "subio-una-foto",
  "reemplazo-una-foto",
  "borro-una-foto",
] as const;
export type TipoDeActividad = (typeof TIPOS_DE_ACTIVIDAD)[number];

/**
 * Qué hay que poder para ver cada tipo, en el Inicio y en Cuentas › Actividad:
 * la misma regla en los dos lados. Un tipo nuevo no compila hasta decir quién
 * lo ve. Entrar, salir y lo que alguien cambia de su propia cuenta es de las
 * cuentas: lo ve quien usa Cuentas. Lo que se hace con una página lo ve quien
 * edita el contenido; con un mensaje de Contacto, quien ve Contacto; que se
 * borró un CV, solo quien ve los CV; lo que se le hace a otra cuenta, quien
 * usa Cuentas; lo que se hace con una novedad, quien edita las novedades; con
 * un material, quien edita la Biblioteca; con un caso, un aliado o una foto,
 * quien edita el contenido (también que se autorizó un logo, aunque marcarlo
 * sea de quien dirige o administra); y lo que se cambia en Ajustes, quien usa
 * Ajustes.
 */
export const QUIEN_VE: Record<TipoDeActividad, Capacidad> = {
  entro: "usarCuentas",
  salio: "usarCuentas",
  "cambio-su-contrasena": "usarCuentas",
  "cambio-su-nombre": "usarCuentas",
  "publico-una-pagina": "editarContenido",
  "descarto-un-borrador": "editarContenido",
  "restauro-una-version": "editarContenido",
  "tomo-un-mensaje": "verContacto",
  "cerro-un-mensaje": "verContacto",
  "marco-un-mensaje-como-spam": "verContacto",
  "borro-un-mensaje": "verContacto",
  "borro-un-cv": "verCV",
  "activo-el-segundo-factor": "usarCuentas",
  "desactivo-el-segundo-factor": "usarCuentas",
  invito: "usarCuentas",
  "reenvio-la-invitacion": "usarCuentas",
  "cancelo-la-invitacion": "usarCuentas",
  "cambio-el-rol": "usarCuentas",
  "cambio-el-correo": "usarCuentas",
  suspendio: "usarCuentas",
  reactivo: "usarCuentas",
  "borro-una-cuenta": "usarCuentas",
  "paso-la-direccion": "usarCuentas",
  "cerro-las-sesiones": "usarCuentas",
  "publico-una-novedad": "editarNovedades",
  "despublico-una-novedad": "editarNovedades",
  "descarto-cambios-de-una-novedad": "editarNovedades",
  "borro-una-novedad": "editarNovedades",
  "cambio-los-datos-del-sitio": "usarAjustes",
  "agrego-una-redireccion": "usarAjustes",
  "borro-una-redireccion": "usarAjustes",
  "cambio-quien-recibe-un-aviso": "usarAjustes",
  "cambio-los-plazos-de-guarda": "usarAjustes",
  "agrego-un-material": "editarBiblioteca",
  "publico-un-material": "editarBiblioteca",
  "oculto-un-material": "editarBiblioteca",
  "descarto-cambios-de-un-material": "editarBiblioteca",
  "borro-un-material": "editarBiblioteca",
  "publico-un-caso": "editarContenido",
  "descarto-cambios-de-un-caso": "editarContenido",
  "autorizo-un-aliado": "editarContenido",
  "quito-la-autorizacion-de-un-aliado": "editarContenido",
  "publico-un-aliado": "editarContenido",
  "despublico-un-aliado": "editarContenido",
  "borro-un-aliado": "editarContenido",
  "subio-una-foto": "editarContenido",
  "reemplazo-una-foto": "editarContenido",
  "borro-una-foto": "editarContenido",
};

/**
 * Si el tipo va a la actividad reciente del Inicio. Van los que cambian algo
 * del sitio o del admin (publicar, descartar, restaurar, lo que se le hace a
 * otra cuenta, y lo que sumen los módulos); los de la sesión y de la cuenta
 * propia no, porque taparían lo que el Inicio tiene que contar: siguen en
 * Cuentas › Actividad. Un tipo nuevo no compila hasta decidirlo.
 */
export const VA_AL_INICIO: Record<TipoDeActividad, boolean> = {
  entro: false,
  salio: false,
  "cambio-su-contrasena": false,
  "cambio-su-nombre": false,
  "publico-una-pagina": true,
  "descarto-un-borrador": true,
  "restauro-una-version": true,
  "tomo-un-mensaje": true,
  "cerro-un-mensaje": true,
  "marco-un-mensaje-como-spam": true,
  "borro-un-mensaje": true,
  "borro-un-cv": true,
  "activo-el-segundo-factor": false,
  "desactivo-el-segundo-factor": false,
  invito: true,
  "reenvio-la-invitacion": true,
  "cancelo-la-invitacion": true,
  "cambio-el-rol": true,
  "cambio-el-correo": true,
  suspendio: true,
  reactivo: true,
  "borro-una-cuenta": true,
  "paso-la-direccion": true,
  "cerro-las-sesiones": true,
  "publico-una-novedad": true,
  "despublico-una-novedad": true,
  "descarto-cambios-de-una-novedad": true,
  "borro-una-novedad": true,
  "cambio-los-datos-del-sitio": true,
  "agrego-una-redireccion": true,
  "borro-una-redireccion": true,
  "cambio-quien-recibe-un-aviso": true,
  "cambio-los-plazos-de-guarda": true,
  "agrego-un-material": true,
  "publico-un-material": true,
  "oculto-un-material": true,
  "descarto-cambios-de-un-material": true,
  "borro-un-material": true,
  "publico-un-caso": true,
  "descarto-cambios-de-un-caso": true,
  "autorizo-un-aliado": true,
  "quito-la-autorizacion-de-un-aliado": true,
  "publico-un-aliado": true,
  "despublico-un-aliado": true,
  "borro-un-aliado": true,
  // Subir una foto no cambia el sitio hasta que un formulario la usa y se publica.
  "subio-una-foto": false,
  "reemplazo-una-foto": true,
  "borro-una-foto": true,
};

/** Los tipos que ese rol puede ver, en el orden de la lista. Un rol que no es de los tres no ve ninguno. */
export function tiposQueVe(rol: unknown): TipoDeActividad[] {
  return TIPOS_DE_ACTIVIDAD.filter((tipo) => puede(rol, QUIEN_VE[tipo]));
}

/** Los que ese rol ve en el Inicio: los que puede ver y van al Inicio. */
export function tiposDelInicio(rol: unknown): TipoDeActividad[] {
  return tiposQueVe(rol).filter((tipo) => VA_AL_INICIO[tipo]);
}

export function esTipoDeActividad(valor: string): valor is TipoDeActividad {
  return (TIPOS_DE_ACTIVIDAD as readonly string[]).includes(valor);
}

const esquema = z.object({
  tipo: z.enum(TIPOS_DE_ACTIVIDAD),
  /** El id de la cuenta que lo hizo. */
  quien: z.string().min(1),
  /** Sobre qué, en llano y como es ahora: «Inicio», «Ana Pérez». */
  sobre: z.string().trim().min(1).max(200).optional(),
  /** El id o el slug de eso, para linkearlo. */
  sobreId: z.string().min(1).max(200).optional(),
});

export type Actividad = z.input<typeof esquema>;

/**
 * Anota algo hecho en el admin. **Nunca frena lo que se registra**: si lo que
 * llega no es válido o la base no contesta, queda en el log y la acción sigue.
 * Perder una fila de la historia es malo; que no se pueda salir del admin
 * porque la tabla no contestó, peor.
 */
export async function registrarActividad(actividad: Actividad): Promise<void> {
  const valida = esquema.safeParse(actividad);
  if (!valida.success) {
    console.error("registrarActividad: no se registró, no es válida:", z.prettifyError(valida.error));
    return;
  }
  const { tipo, quien, sobre, sobreId } = valida.data;
  try {
    await base.actividad.create({ data: { tipo, cuentaId: quien, sobre, sobreId } });
  } catch (e) {
    console.error(`registrarActividad: la base no guardó «${tipo}»:`, e instanceof Error ? e.message : e);
  }
}
