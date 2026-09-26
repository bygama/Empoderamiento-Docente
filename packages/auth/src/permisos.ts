/**
 * Quién puede qué. Tres roles fijos, explicados en una frase, y ninguno a
 * medida (SPEC de `work/mapa-del-admin/` §3).
 *
 * **Este es el único archivo que compara contra el string de un rol.** El
 * resto pregunta por una capacidad con nombre (`puede(rol, "usarCuentas")`):
 * el día que cambie un rol, cambia este archivo y nada más. Los roles son
 * verbos para que el nombre no tenga género.
 *
 * Todos publican: no hay paso de aprobación, porque ED son tres personas y
 * una cola de revisión entre ellas sería ceremonia sin lector.
 */

/**
 * El largo mínimo de una contraseña. Vive acá y no en la config porque lo usan
 * los dos lados: el servidor para rechazar, y el formulario para avisar antes
 * de mandar. Duplicarlo hacía que un cambio de política dejara al formulario
 * mintiendo, y peor: su error genérico habría reportado «el enlace no sirve»
 * ante un rechazo por largo.
 */
export const LARGO_MINIMO_CONTRASENA = 12;

export const ROLES = ["dirige", "administra", "edita"] as const;
export type Rol = (typeof ROLES)[number];

/** El rol que recibe una cuenta nueva si nadie dice otra cosa. */
export const ROL_POR_DEFECTO: Rol = "edita";

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === "string" && (ROLES as readonly string[]).includes(valor);
}

/**
 * El rol de quien dirige: el que se le da a quien se nombra
 * (`nombrar-direccion`). Para preguntar si un rol es este, `esUnaSola`.
 */
export const ROL_DE_LA_DIRECCION: Rol = "dirige";

/**
 * Si de ese rol hay una sola persona. Dirige es una, siempre, y no solo acá:
 * la base lo garantiza con un índice único parcial (`user_una_sola_dirige`,
 * migración `una_sola_dirige`), también contra dos altas a la vez.
 */
export function esUnaSola(rol: Rol): boolean {
  return rol === ROL_DE_LA_DIRECCION;
}

const DIRIGE_Y_ADMINISTRA: readonly Rol[] = ["dirige", "administra"];

/**
 * Si el rol entra con segundo factor sí o sí: quien ve los CV y las cuentas
 * (SPEC de `work/cuentas/` §5.3). La base lo garantiza con el CHECK
 * `user_segundo_factor_obligatorio`, que repite esta lista en SQL.
 */
export function segundoFactorObligatorio(rol: unknown): boolean {
  return esRol(rol) && DIRIGE_Y_ADMINISTRA.includes(rol);
}

/**
 * Las capacidades, fila por fila de la tabla de permisos del §3. Inicio y Mi
 * cuenta no están: son el piso de toda sesión. Una capacidad que todavía no
 * usa nadie dice qué lane la va a usar; la tabla está entera igual, porque
 * tenerla en un solo lugar es lo que evita que cada módulo edite la política.
 */
export const PUEDE = {
  /** Contenido (Páginas, Casos, Equipo, Fotos) y editar Aliados. */
  editarContenido: ROLES,
  /** Marcar un aliado como «Autorizado» (AGENTS.md §5.4). Lo usa la lane 9, casos-aliados-fotos. */
  autorizarAliados: DIRIGE_Y_ADMINISTRA,
  editarNovedades: ROLES,
  editarBiblioteca: ROLES,
  /** Mensajes › Contacto. */
  verContacto: ROLES,
  /** Mensajes › CV, con el archivo privado. Lo usa la lane 7, mensajes. */
  verCV: DIRIGE_Y_ADMINISTRA,
  /** Métricas y sus pestañas: verlas y pedir «Actualizar ahora». */
  verMetricas: ROLES,
  /** Cuentas y Actividad. */
  usarCuentas: DIRIGE_Y_ADMINISTRA,
  /** Tocar la cuenta de quien dirige: quien administra puede todo en Cuentas menos esto. Lo usa la lane 3b. */
  tocarLaCuentaDeQuienDirige: ["dirige"],
  /** Pasarle la dirección a otra persona. Lo usa la lane 3b. */
  pasarLaDireccion: ["dirige"],
  usarAjustes: DIRIGE_Y_ADMINISTRA,
  /**
   * Conectar los servicios de afuera (Search Console, y después los de
   * Ajustes › Conexiones): a quien puede, la pantalla le muestra los pasos; a
   * quien no, que todavía no está conectado.
   */
  configurarConexiones: DIRIGE_Y_ADMINISTRA,
} as const satisfies Record<string, readonly Rol[]>;

export type Capacidad = keyof typeof PUEDE;

/** Si ese rol tiene esa capacidad. Lo que no es uno de los tres roles no puede nada. */
export function puede(rol: unknown, capacidad: Capacidad): boolean {
  const roles: readonly Rol[] = PUEDE[capacidad];
  return esRol(rol) && roles.includes(rol);
}

/** «quien dirige o administra»: de quién es algo, para decírselo a quien no lo tiene. */
export function quienPuede(capacidad: Capacidad): string {
  const roles: readonly Rol[] = PUEDE[capacidad];
  const antes = roles.slice(0, -1);
  const ultimo = roles[roles.length - 1];
  return `quien ${antes.length ? `${antes.join(", ")} o ${ultimo}` : ultimo}`;
}

/**
 * Qué puede cada rol, en una frase. La leen «Tu rol», en Mi cuenta, y «Qué
 * puede cada rol», en Cuentas: se escribe una vez, al lado de la tabla que
 * resume.
 */
export const QUE_PUEDE: Record<Rol, string> = {
  dirige:
    "Todo, incluidas las cuentas y los CV. Es la única persona que puede pasar la dirección a otra, y nadie puede borrar, suspender ni cambiar de rol su cuenta.",
  administra: "Todo lo de quien dirige, menos tocar la cuenta de quien dirige o pasarse la dirección.",
  edita:
    "Edita y publica el contenido, las novedades y la Biblioteca, contesta los mensajes de contacto y ve las métricas. No ve los CV, las Cuentas ni los Ajustes.",
};

/**
 * Qué le sale a quien no tiene permiso. Un mensaje, no un detalle: decir «esa
 * cuenta no existe» o «no sos administrador» le confirma cosas a quien está
 * probando.
 */
export const SIN_PERMISO = "No tenés permiso para hacer eso.";
