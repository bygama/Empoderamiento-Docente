# DECISIONS — Cuentas y segundo factor

- 2026-09-26 — **SPEC aprobado por el padre, con condiciones.** La base, tal
  cual: `twoFactorEnabled`, `suspendida` e `invitacion_vence` en `user`, la
  tabla `twoFactor`, el `CHECK` del segundo factor obligatorio y el SQL de
  datos que lo prende y cierra las sesiones de quienes ya dirigen o
  administran, con `--create-only`. Aprobadas las lecturas: rangos relativos
  para la fecha de Actividad, Paginado y Tabla en DESIGN.md §11, `entro`
  anotado recién cuando la sesión existe.
- 2026-09-26 — **El plugin con la tabla `twoFactor` vacía, probado** (el
  padre): todo el diseño se apoya en que el plugin verifica un código sin
  escribir ni leer una fila suya, así que el PLAN lleva un test que lo
  prueba contra better-auth de verdad.
- 2026-09-26 — **Cambiar el correo desde Una cuenta: sí** (el padre), con dos
  cosas: le llega «El correo de tu cuenta del admin cambió» a la dirección
  vieja y a la nueva, y se cierran sus sesiones. Queda en actividad.
- 2026-09-26 — **La pantalla del código nunca finge** (condición del padre):
  si el correo no salió —falta `RESEND_API_KEY` o Resend contestó un error—,
  `/admin/entrar/codigo` dice en llano que no se pudo mandar el código y a
  quién avisar, en vez de «Te mandamos un código». En desarrollo sin clave,
  el código sale por la consola, como los otros correos. En el ADR-0012 y en
  el README, como condición del primer deploy: Resend configurado y probado
  antes de que esta lane llegue a producción (el padre lo anota en la lane 0).
  **Cómo:** el código no sale en segundo plano. Quien lo pide ya puso bien la
  contraseña, así que el tiempo no delata nada (el motivo de ADR-0010 para
  los otros correos no aplica), y esperar el envío es lo único que deja saber
  si salió. `mandarCorreo` pasa a decir si salió, y el gancho de
  `/two-factor/send-otp` convierte un «no salió» en un error
  `CODIGO_NO_SALIO`.
- 2026-09-26 — **Actividad: la frase y la visibilidad son de la 3c** (el
  padre, coordinando con `inicio`): la frase de cada tipo vive en
  `admin/actividad/frase.ts` y quién ve cada tipo, en un
  `Record<TipoDeActividad, Capacidad>` al lado de `TipoDeActividad`, en
  `datos/actividad.ts`. Mis tipos suman su frase y su visibilidad ahí. Si la
  3c ya está en `main` al rebasear, las consumo; si llego antes, las creo en
  esos lugares con esa forma y concilia la que rebasee segunda. Si la 3c ya
  está en `main`, sumo «Ver toda la actividad» del Inicio hacia mi pantalla si
  no está. El SPEC §4.4 decía `como-se-lee.ts`: manda esta línea.
