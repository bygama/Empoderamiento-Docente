# PROGRESS — Cuentas y segundo factor

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_cuentas` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con todas las migraciones de `main`. SPEC.md escrito
  desde el brief del padre (lane 3b), con la API del plugin `twoFactor`
  verificada contra better-auth 1.7.5 instalado.
- 2026-09-26 — SPEC aprobado por el padre con tres condiciones (DECISIONS),
  ya escritas en el SPEC. PLAN.md escrito: 16 pasos. Arranca work-run.

## Hecho

- **Paso 1 — la base** (`9e8749e`). `auth.prisma`: `twoFactorEnabled`,
  `suspendida`, `invitacionVence` y el modelo `TwoFactor`. Migración
  `20260926232051_segundo_factor_y_cuentas` con `--create-only` y el SQL
  sumado antes de aplicarla (prende el segundo factor de D y A, borra sus
  sesiones, `CHECK user_segundo_factor_obligatorio`). `segundoFactorObligatorio`
  en `permisos.ts` (adelantado del paso 2: el `CHECK` y su espejo en código
  van juntos) y `datos/roles.ts › ponerRol(id, rol, tx?)` →
  `{ cerroSesiones }`, que usan `nombrarDireccion` y `crear-cuenta` (esta crea
  con el rol de fábrica y después `ponerRol`, porque better-auth no escribe
  columnas que no conoce). Aceptación:
  - Sembré en `ed_cuentas` una administra y una edita con sesión; tras
    `pnpm migrate`: administra `twoFactorEnabled = t` y sin sesión, edita
    intacta.
  - `INSERT` de administra sin segundo factor → `violates check constraint
    "user_segundo_factor_obligatorio"`.
  - `pnpm prisma migrate diff --from-config-datasource --to-schema
    prisma/schema --exit-code` → exit 0, «No difference detected».
  - `pnpm migrate:status` → «Database schema is up to date!».
  - `pnpm typecheck` exit 0; `pnpm test` exit 0 (auth 29/29; sitio 152 pass,
    1 saltado de antes), con `roles.test.ts` nuevo (el `CHECK` y `ponerRol`).
- **Paso 2 — la política** (`c4dc354`). `permisos.ts › QUE_PERMITE`: la frase
  de cada capacidad, en el orden de `PUEDE` (`satisfies Record<Capacidad,
  string>`). `packages/auth/src/cuentas.ts`: `EstadoDeCuenta`,
  `CuentaObjetivo`, `LoQueSePuede` y `queSePuede(quien, objetivo)`, la tabla
  del SPEC §3 con `puede`/`esUnaSola`, sin strings de rol; exportados en
  `index.ts`. `cuentas.test.ts`, cinco casos contra la tabla. Aceptación:
  `pnpm --filter @ed/auth test` exit 0 (34/34), `typecheck` exit 0, `lint`
  exit 0.
- **Paso 3 — el segundo factor en `@ed/auth`** (`b623856`).
  `segundo-factor.ts`: el plugin `twoFactor` solo con código por correo (6
  dígitos, 10 min, `storeOTP: "hashed"`, 5 intentos, paso pendiente 30 min,
  dispositivo 30 días, TOTP apagado) y el plugin propio
  `alrededor-del-codigo`, que corre después: anota `entro` solo cuando hay
  sesión (`/sign-in/email`, `/two-factor/verify-otp`), espera el envío en
  `/two-factor/send-otp` y contesta 503 `CODIGO_NO_SALIO` si falló, anota
  `activo-`/`desactivo-el-segundo-factor`, y frena `/two-factor/disable`
  para D y A (403 `SEGUNDO_FACTOR_OBLIGATORIO`). `config.ts` se parte en
  `configDeAuth` (sin base) + `crearAuth`, para que los tests corran la config
  de verdad; suma el plugin y los 4 rate limits. `ganchos.ts` ya no anota
  `entro` (el test se mudó a `segundo-factor.test.ts`). `errores.ts` con los
  códigos que lee el navegador; `twoFactorClient` en el cliente.
  **Corte distinto del PLAN:** `OpcionesDeAuth.mandarCodigo` es obligatoria,
  así que la app la cablea en este mismo commit para no romper el typecheck:
  `mandarCorreo` devuelve `"resend" | "consola" | "no-salio"`, la plantilla
  `correos/tu-codigo.ts` (con `destacado` en `plantilla.ts` y `duracion`
  mudada ahí), `mandarCodigo` en `datos/auth.ts` (rechaza con «no salió») y
  los dos tipos de actividad. Al paso 6 le quedan la invitación y el cambio de
  correo.
  Verificado antes con un script descartable: el `ctx.context` que recibe
  `sendOTP` es el mismo objeto que ve el gancho `after`, y el plugin verifica
  un código con la tabla `twoFactor` vacía. Aceptación: `pnpm --filter
  @ed/auth test` 40/40 (7 nuevos en `segundo-factor.test.ts`, con
  `db.twoFactor.length === 0` al final de cada ida y vuelta); `pnpm test`
  exit 0 (sitio 153 pass, 1 saltado de antes); `pnpm typecheck` exit 0;
  `pnpm lint` exit 0; `node scripts/verificar-react-doctor.mjs` → 100/100,
  sin diagnósticos.
- **Paso 4 — una cuenta suspendida no abre sesión** (`0e22928`).
  `suspendidas.ts`: `CAMPO_SUSPENDIDA` (campo adicional de `user`, `input:
  false`, en `config.ts`) y `frenarSiEstaSuspendida(idDeCuenta, ctx)`, que
  corre primero en el gancho de la base que crea toda sesión
  (`GANCHOS_DE_LA_BASE` de `ubicacion.ts`) y contesta 403
  `CUENTA_SUSPENDIDA`. Test en `segundo-factor.test.ts`: con la contraseña
  buena, 403 y sin cookie; suspendida entre la contraseña y el código, el
  código también da 403; no se anota nada. Aceptación: `pnpm --filter
  @ed/auth test` 41/41; `pnpm typecheck` exit 0; `lint` exit 0.
- **Paso 5 — el enlace de invitación** (`2ee0ea4`).
  `packages/auth/src/invitacion.ts › crearEnlaceDeInvitacion(auth, {
  idDeCuenta, horas, volverA })` → `{ enlace, vence }`, exportada por
  `@ed/auth/servidor`: el formato del reset de better-auth
  (`reset-password:<token>` en `verification`, hasheado por la config) con
  otra vigencia; el enlace pasa por la ruta de better-auth que valida y lleva
  a `volverA` con el token. `invitacion.test.ts`, contra la config de verdad:
  el enlace lleva a `/admin/nueva-contrasena?token=…`, `resetPassword` crea la
  credencial y sirve una sola vez; vencido, redirige con
  `error=INVALID_TOKEN` y el reset da 400. Aceptación: `pnpm --filter
  @ed/auth test` 43/43; `typecheck` y `lint` exit 0.
- **Paso 6 — los correos que quedaban** (`323720a`). `elegiTuContrasena`
  suma `invitacion?: { quienInvita, rol }`: dice quién invita y con qué rol,
  y «si no esperabas esta invitación» en vez de «si no lo pediste».
  `correos/tu-correo-cambio.ts › tuCorreoCambio({ nombre, anterior, nuevo,
  cuando })`, para las dos direcciones. `enHoraUniversal` se mudó a
  `plantilla.ts` (la usan dos correos). Un test nuevo encontró «te invitó a
  el admin»: corregido a «al». Aceptación: `pnpm --filter sitio test` exit 0
  (155 pass, 1 saltado de antes); `typecheck` y `lint` exit 0.
- **Paso 7 — entrar con código** (`c4660aa`). `FormularioEntrar`: si la
  respuesta trae `twoFactorRedirect`, pide el código
  (`twoFactor.sendOtp`) y va a `/admin/entrar/codigo?correo=d•••@…&volver=…`
  con `envio=no-salio` o `envio=esperar` si no salió; el 403
  `CUENTA_SUSPENDIDA` se dice en llano. `destinoSeguro` se mudó a
  `entrar/destino.ts` (lo usan los dos pasos; test nuevo) y
  `lib/correo/enmascarar.ts › enmascararCorreo` (test nuevo). La pantalla
  `entrar/codigo/page.tsx` (`Pantalla`, título «Código para entrar», los
  minutos desde `MINUTOS_DEL_CODIGO` del servidor) con `FormularioCodigo`:
  el campo de 6 dígitos (`one-time-code`), la casilla «Recordar este
  dispositivo 30 días» (la de `Campo.tsx`, `accent-azul-principal`), el
  primario «Entrar», «Mandar otro» (terciario) y «Volver a entrar»; los
  estados por código de error; y si el correo no salió, **no finge**: el
  aviso de que no se pudo, a quién avisar y «Probar de nuevo». Aceptación:
  `pnpm --filter sitio typecheck`, `lint` y `test` (158 pass, 1 saltado de
  antes) exit 0; react-doctor 100/100 (arreglado por código un
  `rerender-lazy-state-init`); con el dev server del 3017 y `crear-cuenta`
  de las tres (dirige y administra quedaron con `twoFactorEnabled = t`):
  `curl` a `/api/auth/sign-in/email` de administra →
  `{"twoFactorRedirect":true,"twoFactorMethods":["otp"]}`; de edita → la
  sesión; `GET /admin/entrar/codigo` → 200. Y el código de punta a punta
  contra Postgres: `send-otp` → `{"status":true}`, el código leído de la
  consola, `verify-otp` → la sesión; `twoFactor` con 0 filas y `actividad`
  con un `entro` por persona.
- **Paso 8 — Mi cuenta › Seguridad** (`8f7ba38`). `admin/mi-cuenta/Seguridad.tsx`
  (la insignia Activo/Apagado; obligatorio y sin botón para D y A) y
  `FormularioDelSegundoFactor.tsx` (edita: la contraseña y «Activar el
  segundo factor» / «Desactivarlo», por `authCliente.twoFactor`), en el
  apartado `#seguridad` de `MiCuenta.tsx`; la página pasa
  `sesion.user.twoFactorEnabled`. Para que ese campo tenga tipo,
  `segundoFactor()` devuelve una tupla anotada (en un arreglo mezclado
  better-auth perdía las columnas del plugin). Aceptación: `pnpm typecheck`,
  `lint`, `test` exit 0 (sitio: 157 pass, 2 saltados: el de siempre y
  `nombrar-direccion`, que se saltea solo cuando la base ya tiene quien
  dirige, como `ed_cuentas` desde que creé una cuenta por rol); react-doctor
  100/100; `/admin/mi-cuenta` como edita → 200 con `id="seguridad"`,
  «Apagado» y «Activar el segundo factor».
- **Paso 9 — los tipos de actividad, su frase y quién los ve** (`d302d7c`).
  `datos/actividad.ts`: los diez tipos de Cuentas; `QUIEN_VE` (`satisfies
  Record<TipoDeActividad, Capacidad>`, todos `usarCuentas`, como la lectura
  5 de la 3c), `tiposQueVe(rol)` y `esTipoDeActividad`.
  `admin/actividad/frase.ts › fraseDe({ tipo, quien, sobre })` → «Ana Pérez
  invitó a Juan Pérez», un `Record<TipoDeActividad, …>`. Son las piezas que
  la 3c también crea (DECISIONS): concilia la que rebasee segunda. Test
  `frase.test.ts`. Aceptación: `pnpm --filter sitio typecheck`, `test` (159
  pass, 2 saltados) y `lint` exit 0.
- **Paso 10 — las consultas** (`b621ceb`). `datos/consultas/cuentas.ts`:
  `listarCuentas()` → `CuentaEnLista[]` (quien dirige primero, después por
  nombre) y `unaCuenta(id)` → `FichaDeCuenta | null` (más `segundoFactor`,
  `invitacionVence` solo si está pendiente, `tieneActividad` y `sesiones`,
  con `sesionesAbiertas` de Mi cuenta). Estado: `suspendida` gana; si no,
  activa con credencial con contraseña, pendiente sin. Último acceso: lo más
  nuevo entre el último `entro` y las sesiones abiertas (dos `groupBy`).
  `datos/consultas/actividad.ts`: `listarActividad({ tipos, persona?,
  desde?, texto?, pagina })` → `{ filas, total, pagina, paginas }`,
  `POR_PAGINA = 50`, `contains` sin distinguir mayúsculas en `sobre` y en el
  nombre, y una página de más muestra la última. Tests contra `ed_cuentas`
  (`cuentas.test.ts`, `consultas/actividad.test.ts`: cuatro casos, corridos,
  no saltados). Aceptación: `pnpm --filter sitio test` 163 pass, 2 saltados
  (los de antes); `typecheck` y `lint` exit 0.
- **Paso 11 — las acciones de Cuentas** (`5c07a13` y `6c9f337`). En el
  paquete: `confirmarContrasena(auth, { headers, correo, contrasena,
  bloqueos })` → `"bien" | "mal" | "frenada"` (`verifyPassword` desde el
  servidor, cada fallo en el bloqueo por cuenta, con el secreto del contexto
  de better-auth; test contra better-auth), `ROLES_QUE_SE_ASIGNAN` /
  `seAsigna` y `ROL_AL_DEJAR_LA_DIRECCION`. En la app:
  `datos/sobre-cuentas.ts` (lo común, sin «use server»: `sobreLaCuenta(sesion,
  id, accion, hacer)` con `queSePuede`, `cerrarSesiones`, `borrarEnlaces`,
  `borrarSiNuncaHizoNada` → `"borrada" | "tiene-historia"`, que intenta el
  `DELETE` y lee el P2003 de la clave foránea), `datos/esquemas.ts` (nombre,
  correo, id; `mi-cuenta.ts` usa el del nombre),
  `consultas/cuentas.ts › cuentaParaActuar`, y las acciones:
  `invitaciones.ts` (`invitar`, `reenviarInvitacion`, `cancelarInvitacion`),
  `cuentas.ts` (`cambiarElRol`, `cambiarElCorreo`, `cerrarSusSesiones`),
  `estado-de-cuentas.ts` (`suspender`, `reactivar`, `borrarCuenta`) y
  `direccion.ts` (`pasarLaDireccion`, en una transacción: baja quien dirige y
  sube la otra). Cada una: sesión, `puede`, Zod, `queSePuede`, lo suyo,
  `registrarActividad` y `{ ok, detalle }`. El correo de la invitación y el
  del cambio de correo se esperan y la respuesta dice si no salieron.
  Aceptación: `pnpm typecheck` y `pnpm lint` exit 0 (sin warnings);
  `pnpm --filter @ed/auth test` 46/46; `pnpm --filter sitio test` 165 pass, 2
  saltados de antes, con `acciones-con-sesion.test.ts` en verde sobre las
  diez acciones nuevas y `sobre-cuentas.test.ts` (borrar sin historia, y el
  rechazo de la clave foránea con historia); «subir a administra prende el
  segundo factor y cierra las sesiones» lo cubre `roles.test.ts` (paso 1);
  react-doctor 100/100.
- **Paso 12 — los patrones nuevos del armazón** (`331f8aa`).
  `admin/armazon/Volver.tsx` y el slot `volver` de `Encabezado` (en el modo
  navy pasa a `azul-claro`, para la ficha de una novedad de la lane 6);
  `Buscador.tsx` (formulario `GET` con `next/form`, `role="search"`, caja con
  `ENTRADA`, «Buscar» secundario y «Sacar los filtros») con `Filtro` (un
  `select` con su etiqueta); `Paginado.tsx` («Más nuevas», «Página n de m»,
  «Más viejas», links que conservan los filtros). DESIGN.md §11: «Volver»,
  «Buscador» y «Paginado», con contrastes y primer consumidor, y la línea de
  historia del §11. Aceptación: `pnpm --filter sitio typecheck` y `lint` exit
  0; react-doctor 100/100.
- **Paso 13 — Personas e Invitar** (este commit). `cuentas/layout.tsx` con
  `<Guarda capacidad="usarCuentas">`; `cuentas/page.tsx` (Personas: el
  encabezado con las pestañas Personas · Actividad y el primario «Invitar a
  alguien», «Qué puede cada rol» y la lista) y `cuentas/invitar/page.tsx`
  («← Cuentas» y el formulario). En `admin/cuentas/`: `pantallas.ts`,
  `EncabezadoDeCuentas`, `EstadoDeLaCuenta` (la insignia; «Invitación
  vencida» en fuerte), `QuePuedeCadaRol` (las tres frases a la vista y la
  tabla en un `Desplegable`), `TablaDePermisos` (recorre `PUEDE` y
  `QUE_PERMITE`), `ListaDePersonas` y `FormularioDeInvitacion` (`onSubmit`,
  como el nombre de Mi cuenta; edita marcado de fábrica). `Lista.tsx` suma
  `Desplegable`, que ahora usa también su `Fila`. La consulta suma
  `invitacionVencida` (el lint del compilador de React no deja `Date.now()`
  en un render). `HORAS_DE_LA_INVITACION` en `datos/sobre-cuentas.ts`. La guía
  de Cuentas salió de `por-hacer/guias.ts`. DESIGN.md §11 suma «Tabla».
  Aceptación: `pnpm --filter sitio typecheck`, `lint` (sin warnings) y `test`
  (165 pass, `guarda.test.ts` incluido) exit 0; react-doctor 100/100; en el
  3017, como administra entrada con código: `/admin/cuentas` → 200 con «Qué
  puede cada rol», las tres cuentas e «Invitar a alguien», título «Cuentas ·
  Admin ED»; `/admin/cuentas/invitar` → 200, «Invitar · Admin ED»; como
  edita, `/admin/cuentas` → «Esta sección es de quien dirige o administra».

## Abierto
