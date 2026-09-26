# SPEC — Cuentas y segundo factor

- **Fecha:** 2026-09-26
- **Estado:** esperando la aprobación del padre (design-first)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas y columnas incluidas: DECISIONS del padre, 2026-09-26)
- **Tier:** L · lane 3b del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/cuentas`, dev server en el 3017, base `ed_cuentas`
- **Diseño:** el brief del padre (lane 3b), sobre el SPEC padre §3, §5.1,
  §5.8, §5.10 y §6. Esto lo formaliza; no lo vuelve a decidir. Lo que el
  brief deja abierto va marcado **Lectura** con la que tomé.
- **Se apoya en** lo que ya está en `main`: los tres roles, sus capacidades y
  la guarda (`packages/auth/src/permisos.ts`, lane 3a), la tabla `actividad`
  y `registrarActividad`, los correos por Resend y sus plantillas (lane 2) y
  los patrones del admin (DESIGN.md §11, lane 1).

---

## 1. Qué se quiere

Hoy una cuenta nueva solo se crea por consola (`crear-cuenta`). Esta lane le
da a quien dirige y a quien administra el módulo **Cuentas** entero —las
personas, invitar, una cuenta y la actividad— y el **segundo factor por
correo**, obligatorio para quien ve los CV.

## 2. Estados de una cuenta

| Estado | Cuándo | Insignia |
| --- | --- | --- |
| **Activa** | eligió su contraseña y no está suspendida | normal |
| **Invitación pendiente** | todavía no eligió su contraseña (no tiene la credencial con contraseña). El detalle dice «vence el …» o «venció el …» | apagada; **fuerte** si venció, porque pide reenviarla |
| **Suspendida** | `suspendida` en la base. No abre sesión; su nombre sigue en la historia | apagada |

**Último acceso:** lo más nuevo entre su último `entro` de `actividad` y la
última actividad de sus sesiones abiertas («hace 2 horas»); «Nunca entró» si
no hay ninguna.

## 3. Quién toca qué cuenta

Todo Cuentas pide `usarCuentas` (dirige y administra). Adentro:

| Acción | Otra cuenta | La de quien dirige | La propia |
| --- | --- | --- | --- |
| Ver datos, estado, sesiones | D A | D A | D A |
| Cambiar el rol (administra ↔ edita) | D A | nadie | nadie |
| Cambiar el correo (§4.3) | D A | D (`tocarLaCuentaDeQuienDirige`) | D A |
| Cerrar sus sesiones | D A | nadie (la propia se cierra en Mi cuenta) | — (Mi cuenta) |
| Suspender · reactivar | D A | nadie | nadie |
| Borrar | D A, y solo si nunca hizo nada | nadie | nadie |
| Reenviar · cancelar la invitación | D A, si está pendiente | — | — |
| Pasarle la dirección | D, si está activa | — | — |

- **Dirige no se invita ni se asigna con el selector de rol:** se transfiere.
- **Sobre la propia cuenta** Cuentas no deja cambiar el rol, suspender ni
  borrar: quien se suspende a sí misma no lo puede deshacer.
- **Estas reglas viven en un solo lugar**, `packages/auth/src/cuentas.ts`
  (`queSePuede(quien, objetivo)`), escritas con `puede(…)` y `esUnaSola(…)`:
  sin comparar el string de un rol (permisos.ts sigue siendo el único). Las
  usan la pantalla, para mostrar solo lo que se puede, y cada acción, para
  verificarlo otra vez.

## 4. Pantallas

Todas bajo `app/(admin)/admin/(protegido)/cuentas/`, cuyo `layout.tsx` llama
a `<Guarda capacidad="usarCuentas">` (`guarda.test.ts` lo exige). La guía de
Cuentas sale de `admin/por-hacer/guias.ts`. Los componentes, en
`apps/sitio/src/admin/cuentas/`.

### 4.1. Personas — `/admin/cuentas`

- **Encabezado:** `h1` «Cuentas», pestañas **Personas · Actividad**, y el
  primario **«Invitar a alguien»** (→ `/invitar`).
- **Qué puede cada rol**, arriba: la frase de cada rol (`QUE_PUEDE`) y la
  tabla de permisos, una fila por capacidad y una columna por rol. **Todo sale
  de `permisos.ts`**: la frase de cada capacidad se suma ahí, al lado de su
  fila de `PUEDE`, y la tabla se arma recorriéndolas. Nada se escribe dos
  veces. **Lectura:** la tabla va plegada en un `details` («Ver qué puede
  cada rol, capacidad por capacidad»); las tres frases, a la vista.
- **La lista** (`Lista`/`Fila`): nombre, correo, rol, último acceso y la
  insignia del estado; cada fila lleva a su cuenta. Quien dirige primero,
  después por nombre. Vacía no puede estar: la persona que mira es una fila.

### 4.2. Invitar — `/admin/cuentas/invitar`

- **Encabezado:** «← Cuentas» (§8), `h1` «Invitar a alguien».
- **Formulario:** correo, nombre y rol, que se elige entre **administra** y
  **edita**, cada uno con su frase de `QUE_PUEDE` debajo. Primario «Mandar la
  invitación».
- **Qué hace** (Server Action, Zod en el borde): si el correo ya tiene
  cuenta, lo dice y no hace nada; si no, crea la cuenta sin contraseña (con
  el segundo factor encendido si el rol lo pide, §5.3), arma un enlace de
  «Elegí tu contraseña» que **vence a las 72 h**, guarda ese vencimiento,
  manda el correo y anota `invito`. Lleva a la cuenta nueva, con un aviso:
  «Le mandamos la invitación a …. Vence el …».
- **El correo** es «Elegí tu contraseña» (`correos/elegi-tu-contrasena.ts`)
  en su variante de invitación: dice quién invita y con qué rol, y cambia el
  «si no lo pediste» por «si no esperabas esta invitación, ignorá este
  correo». Mismo asunto.
- **El enlace** lleva a la pantalla que ya existe (`/admin/nueva-contrasena`,
  cuyo `h1` ya es «Elegí tu contraseña»). Lo arma
  `@ed/auth/servidor › crearEnlaceDeInvitacion` con el mismo formato que
  usa better-auth para su reset (un valor de `verification`
  `reset-password:<token>`, hasheado como los demás), pero con 72 h: el
  reset de better-auth tiene una sola vigencia, la de una hora. Un test
  contra better-auth de verdad prueba que `resetPassword` lo acepta y que
  vencido no; si una versión nueva cambia el formato, se entera ese test.
- **Reenviar** (en la cuenta pendiente): borra los enlaces que tenía, arma
  uno nuevo de 72 h, manda el correo y anota `reenvio-la-invitacion`. Si la
  cuenta vino de `crear-cuenta` y nunca se invitó, el botón dice «Mandar la
  invitación».
- **Cancelar** (en la cuenta pendiente): borra la cuenta y sus enlaces, y
  anota `cancelo-la-invitacion` con el nombre. Como nunca entró, no tiene
  historia que la frene.

### 4.3. Una cuenta — `/admin/cuentas/[id]`

- **Encabezado:** «← Cuentas» (§8), `h1` con el nombre, la insignia del
  estado, y en el detalle el correo y el último acceso. Sin primario: los
  apartados son independientes, como en Mi cuenta. Una cuenta que no existe
  da 404.
- **Apartados** (`Apartado`), cada uno solo si `queSePuede` lo permite o si
  hay algo que mostrar:
  - **Datos:** nombre y correo; el correo se puede cambiar (§3). **Lectura:**
    Mi cuenta ya le promete a cada persona que «si cambió tu correo» se
    cambia desde Cuentas; sin esto esa frase miente. Cambiarlo valida y
    verifica que no esté en otra cuenta, y anota `cambio-el-correo`. Es
    también cómo se recupera alguien que perdió su buzón (§5).
  - **Rol:** el rol y su frase; el selector administra · edita y «Cambiar el
    rol». Anota `cambio-el-rol` («Juan Pérez, de edita a administra»).
  - **Estado:** «Suspender» (cierra sus sesiones al instante; anota
    `suspendio`) o «Reactivar» (anota `reactivo`). Debajo, **«Borrar la
    cuenta»** (destructivo), solo si la cuenta no tiene ninguna fila en
    `actividad`. **La acción no lo pregunta:** intenta el `DELETE` y la
    clave foránea de `actividad` (`RESTRICT`) es la que decide; si choca,
    contesta «Ya hizo cosas en el admin y su nombre queda en la historia:
    suspendela». Anota `borro-una-cuenta` con el nombre.
  - **Invitación** (solo pendiente): cuándo se mandó y cuándo vence;
    «Reenviar» y «Cancelar la invitación».
  - **Segundo factor:** si está activo, y si su rol lo hace obligatorio.
    Solo se mira: lo prende o apaga cada persona en Mi cuenta (§5).
  - **Sesiones:** las filas de Mi cuenta (dispositivo, lugar, última
    actividad) y «Cerrar sus sesiones», que las borra y anota
    `cerro-las-sesiones`.
  - **La dirección** (solo quien dirige, sobre una cuenta activa): «Pasarle la
    dirección», que **pide otra vez tu contraseña**. En una transacción, quien
    dirige pasa a administra y la otra persona a dirige (primero baja una y
    después sube la otra, por el índice único `user_una_sola_dirige`). Anota
    `paso-la-direccion`. La contraseña se comprueba con
    `auth.api.verifyPassword`, que desde el servidor saltea el rate limit por
    IP: por eso cada fallo cuenta en el **bloqueo por cuenta** de ADR-0010,
    como un intento de entrar (5 en 15 minutos la frenan).

### 4.4. Actividad — `/admin/cuentas/actividad`

- **Encabezado:** `h1` «Cuentas», pestaña Actividad encendida.
- **Filtros** en un formulario `GET` (sin JavaScript, la URL es el estado):
  el **buscador** (§8) y tres `select`: **persona** (todas las cuentas, con
  las suspendidas), **módulo** y **cuándo** (Todo · Últimas 24 horas ·
  Últimos 7 días · Últimos 30 días · Últimos 3 meses). **Lectura:** «por
  fecha» como rangos relativos y no dos fechas sueltas: el servidor no sabe
  en qué zona está quien mira (Chile, México o Argentina), y un rango no
  depende de eso. «Sacar los filtros» si hay alguno.
- **El buscador** busca, sin distinguir mayúsculas, en el `sobre` de cada fila
  y en el nombre de quien la hizo.
- **La lista:** «Ana Pérez invitó a Juan Pérez», el módulo y el momento; si lo
  que se tocó todavía tiene pantalla, es un link. **50 por página, paginado
  en el servidor** (`?pagina=`), la más nueva arriba; la tabla guarda 12
  meses.
- **Cómo se lee cada tipo** vive en `admin/actividad/como-se-lee.ts`: por
  tipo, su módulo y su frase, con `satisfies Record<TipoDeActividad, …>`
  para que un tipo nuevo sin frase no compile. El filtro de módulo se
  traduce ahí a la lista de tipos y la consulta recibe tipos, no módulos. El
  Inicio (lane 3c) puede leer sus «últimos 8 eventos» con la misma función.
- **Vacía** (sin filas con esos filtros): `EstadoVacio` «No hay actividad con
  esos filtros».

## 5. Segundo factor por correo

Con el plugin `twoFactor` de better-auth 1.7.5, que ya está en el paquete:
**sin dependencias nuevas.** Verificado contra su código instalado
(`dist/plugins/two-factor/`), no de memoria.

### 5.1. Cómo se configura (`@ed/auth`)

- **Solo código por correo:** `otpOptions` con `sendOTP` (la app lo manda por
  Resend, en segundo plano como los otros correos), **6 dígitos**, **vence a
  los 10 minutos** (`period: 10`), **guardado hasheado** (`storeOTP:
  "hashed"`, como los tokens de ADR-0010) y **5 intentos por código**
  (`allowedAttempts`). `totpOptions.disable: true`: sin app de
  autenticación ni códigos de respaldo.
- **El paso pendiente** (la contraseña ya dio bien y falta el código) dura
  **30 minutos** (`twoFactorCookieMaxAge`), para que «Mandar otro» tenga
  sentido después de un código vencido; pasado eso, se vuelve a entrar.
- **«Recordar este dispositivo 30 días»:** `trustDevice` del plugin, una
  cookie firmada de 30 días que se renueva al entrar (`trustDeviceMaxAge`,
  fijado explícito aunque sea el de fábrica).
- **Rate limit por IP**, sumado a los de hoy: `/two-factor/send-otp` 5 cada
  10 minutos; `/two-factor/verify-otp` 10 cada 5 minutos;
  `/two-factor/enable` y `/two-factor/disable` 5 cada 5 minutos (piden la
  contraseña, como `/change-password`).
- **La tabla `twoFactor`** tiene que existir aunque quede vacía: el plugin la
  consulta al verificar un código. Con solo código por correo nunca escribe
  una fila, así que su bloqueo por cuenta (que cuelga de esa fila) no
  aplica; cubren los 5 intentos por código, la vigencia del paso pendiente y
  el rate limit.
- **Qué se anota:** `entro` pasa de anotarse al dar bien la contraseña a
  anotarse **cuando la sesión existe de verdad**: con un gancho de un plugin
  propio que corre después del de `twoFactor` (better-auth corre los ganchos
  de la config antes que los de los plugins), en `/sign-in/email` y en
  `/two-factor/verify-otp`. Así, quien pone bien la contraseña y nunca el
  código no «entró». El bloqueo por cuenta y el rehash a Argon2id siguen
  donde están: son de la contraseña. Activar y desactivar anotan
  `activo-el-segundo-factor` y `desactivo-el-segundo-factor`
  (`SucesoDeSesion` suma los dos).

### 5.2. Entrar con código — `/admin/entrar/codigo`

- `FormularioEntrar`: si la respuesta pide el segundo factor, pide el código
  (`twoFactor.sendOtp`) y va a `/admin/entrar/codigo`, llevando `volver` y el
  correo enmascarado (`d•••@dominio`) en la URL. El proxy ya deja abierta
  esa ruta (cuelga de `/admin/entrar`).
- **La pantalla** (`Pantalla`, la de acceso): `h1` «Escribí el código»,
  bajada «Te mandamos un código a d•••@…. Vence en 10 minutos.»; el campo
  (`inputMode="numeric"`, `autoComplete="one-time-code"`, 6 dígitos), la
  casilla «Recordar este dispositivo 30 días», el primario «Entrar», y
  «Mandar otro» (terciario) y «Volver a entrar» (link).
- **Estados:** código incorrecto («Ese código no es. Revisalo y probá de
  nuevo.»), vencido («El código venció. Pedí otro.»), demasiados intentos con
  ese código («Demasiados intentos con este código. Pedí otro.»), el paso
  pendiente vencido o ausente («Pasó mucho tiempo desde que pusiste la
  contraseña. Volvé a entrar.») y el 429 («Demasiados intentos. Esperá unos
  minutos.»). «Mandar otro» confirma con un aviso.
- **El correo**, `correos/tu-codigo.ts`: asunto «Tu código para entrar»; el
  código grande, que vence en 10 minutos, y «si no fuiste vos, alguien tiene
  tu contraseña: cambiala ya desde … y avisale a quien administra».

### 5.3. Obligatorio para dirige y administra

- **La política** es una función de `permisos.ts`,
  `segundoFactorObligatorio(rol)`: dirige y administra.
- **La base lo garantiza:** un `CHECK` `user_segundo_factor_obligatorio`,
  `rol NOT IN ('dirige','administra') OR "twoFactorEnabled"`. Prisma no
  escribe `CHECK`: va con `--create-only` y el SQL sumado antes de la primera
  aplicación, como `user_una_sola_dirige`, y se comprueba que `migrate diff`
  no lo quiera borrar.
- **Cada camino que pone a alguien en dirige o administra** prende el
  segundo factor en la misma escritura: invitar, cambiar el rol, pasar la
  dirección, `crear-cuenta` y `nombrar-direccion`. El `CHECK` es la red si
  uno se olvida.
- **Apagarlo:** un gancho de `@ed/auth` frena `/two-factor/disable` para
  esos roles con un 403 en llano. Bajar a edita no lo apaga: queda prendido
  y la persona lo apaga en Mi cuenta si quiere.

### 5.4. Quien ya tiene sesión el día que se vuelve obligatorio

**Su sesión se cierra, y vuelve a entrar con el código.** Una sesión abierta
sin código no tiene que sobrevivir al cambio de regla:

- **El día del deploy:** la misma migración prende el segundo factor de las
  cuentas que ya dirigen o administran y **borra sus sesiones**, antes de
  poner el `CHECK`. A la próxima pantalla del admin van a «Entrar».
- **Cuando alguien pasa a administra o a dirige** (invitar no aplica: no
  tiene sesión), si el segundo factor estaba apagado se prende y **se cierran
  sus sesiones**. Si ya lo tenía, nada cambia. Los permisos nuevos valen igual
  al instante, porque la sesión lee el rol de la base en cada pedido.

**Riesgo, para el deploy:** desde esta lane, quien dirige y administra
dependen de que salga un correo para entrar. Sin `RESEND_API_KEY` en
producción no llega ningún código y **no pueden entrar**. Hoy no hay
producción (lane 0); el README lo deja escrito en «Correos» y en el deploy:
Resend andando antes del primer deploy que traiga esta lane. Si alguien
pierde su buzón, quien dirige o administra le cambia el correo desde Cuentas
(§4.3).

### 5.5. Mi cuenta › Seguridad — `#seguridad`

Un `Apartado` más en `MiCuenta.tsx` (la lane 7 suma Avisos al lado: al
rebasear se conservan los dos).

- **Dirige o administra:** «Activo. Es obligatorio para tu rol: cuando
  entrás desde un dispositivo que no recordaste, te pedimos un código por
  correo.» Sin botón.
- **Edita:** apagado, la contraseña y «Activar el segundo factor»; prendido,
  «Activo» y la contraseña con «Desactivarlo». Por el cliente de better-auth
  (`twoFactor.enable({ method: "otp" })` / `disable`), no por una acción:
  así pasa por el rate limit y better-auth pone la cookie de la sesión nueva
  que crea.

## 6. Datos

Columnas nuevas en `user` (`auth.prisma`):

| Columna | Tipo | Qué es |
| --- | --- | --- |
| `twoFactorEnabled` | `boolean`, default `false` | La del plugin, con su nombre, como las demás de better-auth |
| `suspendida` | `boolean`, default `false` | No abre sesión. Campo adicional de `@ed/auth` (`input: false`): el `databaseHook` que crea una sesión lo mira y, si está suspendida, contesta 403 `CUENTA_SUSPENDIDA`. Entrar lo muestra en llano: «Tu cuenta está suspendida…» (solo lo ve quien puso bien la contraseña) |
| `invitacion_vence` | `timestamp` nullable | Cuándo vence la última invitación; `null` si nunca se invitó. La escriben invitar y reenviar; solo se lee mientras la cuenta está pendiente |

Tabla nueva, **de la librería y con su nombre**, como las otras de better-auth:

| `twoFactor` | Tipo |
| --- | --- |
| `id` | `text` PK |
| `secret` | `text`, índice |
| `backupCodes` | `text` |
| `userId` | `text` → `user.id`, `ON DELETE CASCADE`, índice |
| `verified` | `boolean`, default `true` |
| `failedVerificationCount` | `integer`, default `0` |
| `lockedUntil` | `timestamp` nullable |

**Una migración**, `segundo_factor_y_cuentas`: las columnas y la tabla que
genera Prisma, más el SQL de datos antes de su primera aplicación (§5.4:
prender el segundo factor de dirige y administra, borrar sus sesiones) y el
`CHECK`, comentado en el mismo archivo.

**Nada más en la base.** El estado «Invitación pendiente» sale de que no haya
contraseña, y el último acceso, de `actividad` y `session`.

## 7. Actividad: los tipos nuevos

`TIPOS_DE_ACTIVIDAD` (`datos/actividad.ts`) suma, con `sobre` = el nombre de
la otra persona tal como era y `sobreId` = su id:

`invito` · `reenvio-la-invitacion` · `cancelo-la-invitacion` ·
`cambio-el-rol` (el `sobre` dice de qué a qué) · `cambio-el-correo` ·
`suspendio` · `reactivo` · `borro-una-cuenta` · `paso-la-direccion` ·
`cerro-las-sesiones` · `activo-el-segundo-factor` ·
`desactivo-el-segundo-factor` (estos dos, sin `sobre`: son de la propia
cuenta).

## 8. Patrones nuevos (DESIGN.md §11)

Nacen acá, con su primer consumidor, en `admin/armazon/`:

- **«← volver»** (`Volver.tsx`, y un slot `volver` en `Encabezado`): arriba
  del `h1`, un link en meta medium `azul-medio` con `ArrowLeft`, al padre de
  un detalle («← Cuentas»). Reemplaza a las pestañas en los detalles; las
  migas siguen siendo solo del editor. Primeros consumidores: Invitar y Una
  cuenta.
- **Buscador** (`Buscador.tsx`): un formulario `GET` con `role="search"`, el
  campo `type="search"` con su etiqueta, los filtros que le pase quien lo usa
  y «Buscar» (secundario). Sin JavaScript. Primer consumidor: Actividad; lo
  toma Novedades (lane 6).
- **Paginado** (`Paginado.tsx`): «Más nuevas» · «Página 2 de 7» · «Más
  viejas», links que conservan los filtros de la URL. Primer consumidor:
  Actividad.
- **Tabla**: la de permisos es la primera tabla del admin. Encabezados en meta
  medium, filas con el divisor de la `Lista`, y un ✓ que el lector lee «Sí»
  (y «No» donde no hay). La pieza vive en `admin/cuentas/` hasta que haya una
  segunda tabla; la regla visual, en §11.

Cada uno con sus contrastes medidos, en los tres temas.

## 9. Documentos que cambian

- **Spec del admin §7:** el segundo factor, la suspensión, la invitación de
  72 h y quién toca qué cuenta.
- **AGENTS.md §12**, la línea de la sesión: el segundo factor por correo,
  obligatorio para dirige y administra. Y el árbol de §3: las acciones de
  cuentas en `datos/acciones/`. (Cambia AGENTS.md: lo revisa Mateo en el PR.)
- **README:** invitar desde Cuentas; `crear-cuenta` sigue para la primera
  persona; en local el código sale por la consola; y el aviso de §5.4 sobre
  Resend y el deploy.
- **DESIGN.md §11:** «← volver», el buscador, el paginado y la tabla. (Cambia
  DESIGN.md: lo revisa Mateo en el PR.)
- **ADR-0012, «Segundo factor por correo»:** lo que ADR-0010 no decidió —
  código por correo y no app, obligatorio por rol con un `CHECK`, la sesión
  que se cierra al volverse obligatorio, 10 minutos, 5 intentos, 30 días de
  dispositivo recordado, sin códigos de respaldo (se recupera cambiando el
  correo desde Cuentas) y el riesgo de depender de Resend.

## 10. Fuera de esta lane

- El Inicio (3c), Mensajes y la sección Avisos de Mi cuenta (lane 7), el
  resumen semanal (lane 11).
- Avisarle por correo a una persona que le cambiaron el rol, el correo o que
  la suspendieron; «olvidar este dispositivo» por separado; la app de
  autenticación y los códigos de respaldo.
- Cambiar la pantalla de «nueva contraseña»: su `h1` ya es «Elegí tu
  contraseña».

## 11. Criterio de hecho

- El gate entero en verde, con la salida en el PROGRESS: `pnpm typecheck`,
  `pnpm lint`, `node scripts/verificar-react-doctor.mjs` (100/100 sin
  diagnósticos), `pnpm test`, `pnpm build`. Componentes ≤ 200 líneas,
  utilidades ≤ 100.
- **Tests**, del tamaño de los de al lado: contra better-auth de verdad (su
  adaptador en memoria), el ida y vuelta del código (la contraseña no anota
  `entro`, el código sí; el dispositivo recordado saltea el código;
  administra no puede apagarlo; una cuenta suspendida no entra) y el enlace
  de invitación que `resetPassword` acepta y vencido no; `queSePuede` contra
  la tabla de §3; `segundoFactorObligatorio`; contra la base, el `CHECK` y
  que borrar una cuenta con actividad choque; la consulta de actividad con sus
  filtros y su paginado. `acciones-con-sesion.test.ts` y `guarda.test.ts`
  cubren solas las acciones y el layout nuevos.
- **En el navegador**, en el 3017, con una cuenta por rol: invitar (el correo
  sale por la consola), aceptar la invitación, entrar con código (mandar otro,
  código malo, recordar el dispositivo), cambiar un rol (se cierran las
  sesiones si se prendió el segundo factor), suspender y ver que no entra,
  reactivar, borrar una sin historia y ver el rechazo en una con historia,
  pasar la dirección, cerrar las sesiones de otra, la actividad con filtros,
  buscador y paginado, y Mi cuenta › Seguridad como edita y como administra.
  Quien edita en `/admin/cuentas` ve «Sin permiso». Los tres temas, 390 de
  ancho y el foco con teclado.
