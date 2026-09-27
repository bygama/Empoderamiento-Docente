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
  el código sale por la consola, como los otros correos. En el ADR-0013 y en
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
- 2026-09-26 — **Cortes del PLAN movidos, sin cambiar el alcance** (work-run):
  `segundoFactorObligatorio` entró en el paso 1 (el `CHECK` y su espejo en
  código van juntos), y el correo del código y el resultado de
  `mandarCorreo` en el paso 3 (`mandarCodigo` es obligatoria en
  `OpcionesDeAuth`: sin cablearla, el paso 3 no compilaba). El paso 11 fue
  dos commits (paquete y app).
- 2026-09-26 — **`crear-cuenta` crea con el rol de fábrica y después
  `ponerRol`**: `internalAdapter.createUser` no escribe columnas que
  better-auth no conoce, y administra sin `twoFactorEnabled` choca con el
  `CHECK`. Invitar sí crea directo, porque ahí el plugin ya está configurado.
- 2026-09-26 — **`entro` lo anota un plugin propio que corre después del de
  `twoFactor`**: better-auth corre los ganchos de la config antes que los de
  los plugins (visto en su `api/dispatch.mjs`), y solo después del plugin se
  sabe si la contraseña ya es una sesión. Verificado antes, con un script
  descartable, que el `ctx.context` de `sendOTP` es el mismo que ve el gancho
  (así se espera el envío del código).
- 2026-09-26 — **Pasar la dirección cuenta en el bloqueo por cuenta**:
  `verifyPassword` llamado desde el servidor saltea el rate limit por IP;
  `confirmarContrasena` (`@ed/auth`) suma cada fallo al bloqueo de ADR-0010.
- 2026-09-26 — **Confirmar antes de lo que no se deshace con `window.confirm`**
  (suspender, borrar, cancelar, cerrar sesiones, cambiar el correo, pasar la
  dirección): es lo que ya usa «Descartar» del editor de páginas; no se
  inventó un patrón de confirmación nuevo.
- 2026-09-26 — **El aviso de pasar la dirección va en la URL**
  (`?direccion=pasada`), como el de Invitar: el apartado que la pasa deja de
  existir con el redibujo (encontrado en la verificación, `aca9c46`).
- 2026-09-26 — **Borrar se ofrece solo si la cuenta no tiene actividad**, pero
  la acción no lo pregunta: intenta el `DELETE` y contesta lo que diga la
  clave foránea. Una pendiente no muestra «Borrar»: muestra «Cancelar la
  invitación», que hace lo mismo.
- 2026-09-26 — **Rebase sobre `main` (`490547f`, con `paginas-inicio` y
  `mensajes`) y conciliación** (el padre: el que rebasea segundo concilia, y
  queda una de cada pieza):
  - **«← volver» y el buscador son los de `main`** (lane 7). Los míos se
    borraron; Invitar y la ficha usan su `Volver` por el slot `volver` del
    `Encabezado`, igual que antes.
  - **Los filtros de Actividad pasan a ser el `Filtro` de píldoras** de
    `main` (persona, módulo y cuándo), no `select` dentro de un buscador
    propio: en §11 el patrón para recortar una lista por un valor de la URL
    es ese. Cada filtro conserva los otros y la búsqueda (`conservar` del
    `Buscador`); «Sacar los filtros» se fue (cada fila tiene su «todos», y
    el buscador su «Borrar la búsqueda»).
  - **Confirmar con `Confirmacion`, no con `window.confirm`** (reemplaza la
    línea de arriba sobre `window.confirm`): §11 de `main` pide confirmar en el
    lugar del botón **lo que no se deshace**. Preguntan borrar la cuenta,
    cancelar la invitación y pasar la dirección; suspender, cerrar sus
    sesiones y cambiar el correo se deshacen con otro clic y no preguntan.
  - **El ADR del segundo factor pasa a ser el 0013** (la lane 7 mergeó antes
    su 0012).
  - **Los tipos de actividad de `main`** tienen su visibilidad (páginas:
    `editarContenido`; Contacto: `verContacto`; el CV: `verCV`), su frase y
    su módulo (Contenido y Mensajes). Lo de una página linkea a su editor; lo
    de un mensaje no, porque pudo haberse borrado. La 3c (con
    `VA_AL_INICIO`) todavía no está en `main`: concilia ella.
  - **El `CHECK` alcanza a los tests de Mensajes**: sus cuentas de prueba de
    administra llevan el segundo factor. Y `avisos.ts` pide solo algo que
    mande, porque `mandarCorreo` ahora contesta si salió.
  - Las migraciones de `main` (`…231213`, `…231819`) van antes que la mía
    (`…232051`): no se regeneró nada. Probado desde una base vacía.
- 2026-09-26 — **Ronda de arreglos 1** (la revisión r1 dio FAIL por la fuga
  de Cuentas a quien edita; el padre pidió tres capas):
  - **Página:** cada `page.tsx` de Cuentas pregunta `puede(rol,
    "usarCuentas")` justo después de la sesión y, sin la capacidad, devuelve
    `<SinPermiso>` antes de leer nada. El layout conserva su `<Guarda>`: sigue
    siendo lo que ve quien entra al módulo, pero ya no se lo cuenta como
    protección.
  - **`datos/`:** `listarCuentas`, `unaCuenta`, `cuentaParaActuar` y
    `listarActividad` reciben primero el rol de quien mira (`unknown`, como
    `puede`) y sin `usarCuentas` devuelven `[]`, `null` o una página vacía.
    Que sea el primer argumento, obligatorio, es lo que hace difícil
    olvidarlo: llamarlas sin rol no compila. Se descartó un tipo «marcado»
    (un permiso que solo emite un chequeo): obliga a chequear, pero deja la
    consulta confiando en quien la llama, que es justo lo que falló.
    `listarActividad` además cruza los tipos pedidos con `tiposQueVe(rol)`,
    y el título de la ficha pasa por la misma consulta, porque el nombre
    viajaba en el `<title>`.
  - **El test** vive en `guarda.test.ts`, al lado del de los layouts. Pide el
    chequeo a toda página de un módulo cuya capacidad deja afuera a algún rol
    (`PUEDE[capacidad]` más corto que `ROLES`): hoy Cuentas; Ajustes, apenas
    tenga carpeta, sin tocar el test. Métricas y Contenido, que ven los tres
    roles, no entran. La bandeja de Mensajes va aparte, en
    `CAPACIDAD_DE_LA_RUTA`, con su motivo: la capacidad sale de la ruta
    (`capacidadDe(bandeja)`). Vale `puede(…, capacidad)` o envolver lo que
    lee en `<Guarda capacidad=…>`, y el chequeo tiene que aparecer antes de
    la primera llamada a algo importado de `@/datos/consultas/`. Es un chequeo
    de texto, como el de los layouts: no ve una lectura escondida en un
    componente, y para eso está la capa de `datos/`.
  - **El id en la URL no es una fuga:** en la ficha, el id que tipeó quien
    edita vuelve en el árbol de rutas del payload. Nombre, correo y título no.
  - **Rebase sobre `15def2c` (la 3c):** van al Inicio los tipos que le hacen
    algo a otra cuenta (invitar, reenviar, cancelar, cambiar el rol o el
    correo, suspender, reactivar, borrar, pasar la dirección y cerrarle las
    sesiones a alguien); activar o desactivar el segundo factor propio, no,
    porque son de la cuenta propia. Conflictos: `actividad.ts` y `frase.ts`
    quedaron con la forma de `main` más los tipos de esta lane; la línea de
    historia de DESIGN.md y la intro del README suman las dos lanes.
  - **«Ver toda la actividad»:** terciario en la fila de «Actividad
    reciente», como «Ver métricas» en la de la semana, para quien tiene
    `usarCuentas` (`DatosDelInicio.verActividad`). Sin CTA propio en el
    estado vacío: el link ya está arriba.
  - **El código que no se pudo pedir:** `envio` suma `fallo`. Solo el 429 es
    «Pediste muchos códigos seguidos»; cualquier otro fallo de send-otp que
    no sea `CODIGO_NO_SALIO` dice «No pudimos mandarte el código. Probá
    entrar de nuevo.», con «Volver a entrar» y sin el campo, porque no hay
    código que escribir. En «Mandar otro», la cookie vencida conserva su
    texto propio («Pasó mucho tiempo…»), que dice más que el genérico.
