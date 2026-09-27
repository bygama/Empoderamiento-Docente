# PROGRESS — Cuentas y segundo factor

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_cuentas` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con todas las migraciones de `main`. SPEC.md escrito
  desde el brief del padre (lane 3b), con la API del plugin `twoFactor`
  verificada contra better-auth 1.7.5 instalado.
- 2026-09-26 — SPEC aprobado por el padre con tres condiciones (DECISIONS),
  ya escritas en el SPEC. PLAN.md escrito: 16 pasos. Arranca work-run.
- 2026-09-26 — Los 16 pasos hechos y verificados. **Pausa con el PR #186**
  (https://github.com/bygama/Empoderamiento-Docente/pull/186), **rebasado
  sobre `main` (`490547f`) y conciliado** a pedido del padre, con el gate y
  el recorrido otra vez en verde (abajo): espera la revisión de cierre. La
  lane se cierra (se borra esta carpeta) después del PASS del revisor, antes
  del merge. Para retomar: `.env.local` apunta a `ed_cuentas`, que tiene
  cuentas de prueba de las tres (la contraseña se elige de nuevo por «Olvidé
  mi contraseña», con el enlace en la consola); el dev server va en el 3017,
  con un perfil de navegador aislado.
- 2026-09-26 — **Ronda de arreglos 1** (la revisión r1 dio FAIL: la fuga de
  Cuentas a quien edita, más tres menores; «Tried and failed»). Hecha,
  rebasada sobre `main` (`15def2c`, con la lane 3c del Inicio) y verificada
  (abajo). **Vuelve a revisarla el mismo revisor**: esta carpeta no se borra
  hasta su PASS. Para retomar: la contraseña de Ada (administra) se eligió de
  nuevo en esta ronda por «Olvidé mi contraseña» y no está en el repo; Eli
  (edita) tiene el segundo factor apagado, para poder entrar con `next
  start`, donde el código no sale.
- 2026-09-26 — **Revisión r2: PASS** (abajo). **Cierre:** `origin/main`
  sigue en `15def2c` (el rebase no tuvo nada que hacer), el gate otra vez en
  verde, y esta carpeta sale en el commit siguiente, dentro del PR #186. La
  base `ed_cuentas` quedó limpia de lo que se puso a mano para probar: la
  invitación a Inés (su cuenta, su enlace y la fila de actividad), Eli con el
  segundo factor otra vez prendido, y las sesiones abiertas para probar,
  cerradas. La contraseña que se le eligió a Ada no quedó guardada en ningún
  lado, como la de las demás cuentas de prueba. **La base se borra al
  cerrar**: cuando se saque el worktree, `DROP DATABASE ed_cuentas` en
  `ed-postgres`; hasta entonces sirve si el padre pide otra vuelta.

## Verification

### 2026-09-26 — Cierre, sobre `main` (`15def2c`) — PASS

Sobre `5254b43` (la ronda de arreglos 1), sin cambios de código después de
la revisión r2.

- **Rebase:** `git fetch origin` → `origin/main` en `15def2c`; `git
  rebase origin/main` → «Current branch mateo/cuentas is up to date.».
- **L1, en limpio** (`rm -rf apps/sitio/.next apps/sitio/next-env.d.ts`
  antes): `pnpm typecheck` → 0; `pnpm lint` → 0; `node
  scripts/verificar-react-doctor.mjs` → 0, «react-doctor: 100/100, sin
  diagnósticos» (apps/sitio/src 668 archivos · packages/db/src 3 ·
  packages/auth/src 27).
- **L2:** `pnpm test` → 0 (`@ed/auth` 46 pasan, 0 fallan; sitio 258: 256
  pasan, 0 fallan, 2 saltados, los de siempre); después, en `ed_cuentas`,
  las mismas 6 cuentas de antes. `pnpm build` → 0 («Compiled
  successfully»).
- **L3:** la de la ronda de arreglos 1 (abajo); el código no cambió desde
  entonces.
- **Barrido:** en el diff de la lane contra `main`, ningún `TODO`,
  `FIXME`, `console.log`, `debugger`, `.only(` ni marcador sin llenar.
- **Close review — r1** (Opus 5.5, medium, «el cambio entero contra su
  SPEC»): FAIL, la fuga de Cuentas a quien edita («Tried and failed»).
- **Close review — r2** (el mismo revisor, Opus 5.5, medium), como lo pasó
  el padre: «La re-revisión r2 (mismo revisor, Opus 5.5, medium) dio PASS
  sobre 5254b43: la fuga cerrada (con control positivo y una mutación del
  test que falla como debe), los tres Minor, lo del rebase, y el gate en
  limpio. Sin hallazgos nuevos.»

### 2026-09-26 — Ronda de arreglos 1, sobre `main` (`15def2c`) — PASS

Seis commits sobre `de40636` (`b8913fe`…`502709f`) y el de este PROGRESS,
base `ed_cuentas`. Los hashes de «Hecho» siguen siendo los de antes de los
rebases.

- **La fuga, probada como la probó el revisor:** `next start -p 3017` con el
  build de producción, la sesión de Eli (edita), un GET por ruta con su
  cookie y un `grep` del HTML entero (payload de RSC incluido) contra los
  correos de las otras cinco cuentas y el id de Nico. Antes del
  arreglo, con el build de la rama sin él: `/admin/cuentas` 5 correos y 2 veces el id, la ficha de Nico 2
  y 2, Actividad 0 y 2, Invitar 0 y 0. Después, con el de `502709f`:

  ```
  GET /admin/cuentas → 200, 48874 bytes: correos de otras cuentas = 0, id de Nico = 0, «Sin permiso» = 1
  GET /admin/cuentas/8OcOeB1aNozsGiRTCIVPUW47EE1pH2R9 → 200, 49440 bytes: correos de otras cuentas = 0, id de Nico = 2, «Sin permiso» = 1
  GET /admin/cuentas/actividad → 200, 49377 bytes: correos de otras cuentas = 0, id de Nico = 0, «Sin permiso» = 1
  GET /admin/cuentas/invitar → 200, 49369 bytes: correos de otras cuentas = 0, id de Nico = 0, «Sin permiso» = 1
  ```

  Los nombres de las otras cinco cuentas: 0 en las cuatro rutas. Las dos
  veces que aparece el id de Nico en su ficha son el árbol de rutas del
  payload (`"c":["","admin","cuentas","<id>"]`): la URL que tipeó quien
  edita, no un dato; el `<title>` es «Admin ED», sin el nombre.
- **La capa 3 atrapa la fuga:** con `cuentas/actividad/page.tsx` de
  `de40636` (sin el chequeo) puesta en el árbol, `guarda.test.ts` → ✖ «cada
  página de un módulo que deja afuera a algún rol chequea su capacidad antes
  de leer»; con la de ahora, 7/7.
- **L1, en limpio** (sin `.next` ni `next-env.d.ts`): `pnpm typecheck` → 0;
  `pnpm lint` → 0; `node scripts/verificar-react-doctor.mjs` → 0, «100/100,
  sin diagnósticos» (sitio 668 archivos, db 3, auth 27). La primera corrida
  dio un hallazgo (`js-set-map-lookups` en `listarActividad`): se arregló con
  un `Set`, dentro del commit del arreglo.
- **L2:** `pnpm test` → 0 (`@ed/auth` 46/46; sitio 258: 256 pass, 0 fail, 2
  saltados, los de siempre); `pnpm build` → 0 («Compiled successfully»);
  `next start -p 3017` → 200 en `/admin/entrar`.
- **L3**, con `next start` y, para lo que pide el código por la consola,
  `next dev`; navegador de Orca con un perfil aislado (`cuentas-r1`, borrado
  al terminar):
  - Como edita: las cuatro rutas de Cuentas → «Esta sección es de quien
    dirige o administra», y su Inicio no tiene «Ver toda la actividad».
  - La pantalla del código: `?envio=fallo` → «No pudimos mandarte el código.
    Probá entrar de nuevo.»; `?envio=no-salio` → «…y sin él no se puede
    entrar con este rol…»; `?envio=esperar` → «Pediste muchos códigos
    seguidos…».
  - Como administra (Ada, entrando con el código de la consola): el Inicio con
    «Ver toda la actividad» en la fila de «Actividad reciente» (40 px, a la
    altura del título) y la actividad de Cuentas («Nico Nuevo le pasó la
    dirección a Dora Dirige», «…borró la cuenta de Zeta Sinhistoria»,
    «…reactivó a Eli Edita»); el clic → `/admin/cuentas/actividad`,
    «Actividad · Admin ED».
  - Invitar a Inés → la ficha con «Le mandamos la invitación a ines@ed.test.
    Vence el 29/9 a las 22:34.» (72 h).

### 2026-09-26 — Después del rebase sobre `main` (`490547f`) — PASS

Rebase de la rama sobre `main` con `paginas-inicio` (#183) y `mensajes`
(#185), y conciliación (DECISIONS: «Rebase sobre `main`…»). Sobre `d05167d`,
base `ed_cuentas` con las migraciones de `main` aplicadas.
Los hashes que citan las entradas de «Hecho» son de antes del rebase: los
commits son los mismos, con otro hash.

- **Migraciones:** las de `main` (`…231213_versiones_de_paginas`,
  `…231819_mensajes`) van antes que la mía (`…232051`): nada que regenerar.
  `pnpm migrate:deploy` y `migrate:status` al día; `migrate diff
  --from-config-datasource --to-schema prisma/schema --exit-code` → 0, «No
  difference detected»; desde una base vacía temporal, las tres en orden y
  el diff en 0 (la base se borró después).
- **L1 estática, en limpio** (sin `next-env.d.ts` ni `.next`): `pnpm
  typecheck` → 0; `pnpm lint` → 0, 0 warnings;
  `node scripts/verificar-react-doctor.mjs` → 0, «100/100, sin
  diagnósticos» (sitio 648 archivos, db 3, auth 27).
- **L2:** `pnpm test` → 0 (`@ed/auth` 46/46; sitio 235 pass, 0 fail, 2
  saltados, los mismos de antes); `pnpm build` → 0 («Compiled
  successfully»); `next dev -p 3017` → 200.
- **L3, en el navegador de Orca** (dos perfiles aislados):
  - Entrar como dirige: la contraseña lleva a `/admin/entrar/codigo` («Te
    mandamos un código a d•••@ed.test…»), el código → `/admin`.
  - Actividad: el `Filtro` de módulo con «Contenido» y «Mensajes»; las
    filas «Dora Dirige publicó Inicio» (→ `/admin/contenido/paginas/inicio`),
    «…tomó un mensaje sobre Investigación» y «…borró un CV» (sin link). La
    píldora «Mensajes» → `?modulo=mensajes` y el buscador la conserva
    (`?modulo=mensajes&q=investig` → una fila); «Borrar la búsqueda» vuelve a
    `?modulo=mensajes`. A 390 de ancho, sin desborde.
  - La ficha con `Confirmacion`: «Cancelar la invitación» → «¿Cancelar la
    invitación de Sol Sininvitar?…», «Cancelar» vuelve al botón, «Sí,
    cancelarla» borra y lleva a Personas; «Borrar la cuenta» de una sin
    historia → «Sí, borrar»; suspender y reactivar, sin pregunta, con su
    aviso; pasar la dirección a Nico con una contraseña mala → «Esa no es tu
    contraseña.», con la buena → «Listo: ahora dirige Nico Nuevo…»; Nico,
    entrando con su código en el otro perfil, se la devolvió a Dora.
  - Mi cuenta: `perfil`, `contrasena`, `rol`, `seguridad`, `sesiones` y
    `avisos`, las dos secciones nuevas. Personas (la tabla de 12
    capacidades) e Invitar («← Cuentas», el de `main`) responden.

### 2026-09-26 — L DoD (gate del brief + SPEC §11) — PASS

Sobre `aca9c46` (rama `mateo/cuentas`, base `5a07368`), base `ed_cuentas`,
dev server en el 3017.

- **L1 estática:** `pnpm typecheck` → exit 0; `pnpm lint` → exit 0, 0
  warnings; `node scripts/verificar-react-doctor.mjs` → exit 0, «100/100, sin
  diagnósticos» (sitio 534 archivos, db 3, auth 27).
- **L2 comportamiento:** `pnpm test` → exit 0 (`@ed/auth` 46/46; sitio 167
  pass, 0 fail, 2 saltados: las respuestas grabadas de A1, de antes, y
  `nombrar-direccion`, que se saltea solo si la base ya tiene quien dirige);
  `pnpm build` → exit 0 («Compiled successfully»; `/admin/cuentas`,
  `/[id]`, `/actividad`, `/invitar` y `/admin/entrar/codigo` dinámicas);
  arranca: `next dev -p 3017` contesta 200 en `/admin/entrar`.
- **L3 de punta a punta**, en el navegador de Orca con dos perfiles aislados
  (`cuentas` y `cuentas-otra`), una cuenta por rol creada con `crear-cuenta`:
  - Entrar como dirige: la contraseña lleva a `/admin/entrar/codigo` con
    «Te mandamos un código a d•••@ed.test. Vence en 10 minutos.»; un código
    malo → «Ese código no es…» y `aria-invalid`; «Mandar otro» → «Te
    mandamos otro código.»; el bueno con «Recordar este dispositivo» →
    `/admin`, con la cookie `trust_device`; salir y volver a entrar → directo
    a `/admin`, sin código.
  - Invitar (administra) → la ficha con «Le mandamos la invitación a
    nico@ed.test.», «Invitación pendiente», «Vence el 29/9…»; el correo por
    la consola («Dora Dirige te invitó… con el rol «administra»… 72
    horas… Si no esperabas esta invitación»). «Reenviar» → el enlace viejo
    redirige con `error=INVALID_TOKEN` y el nuevo con `token=`. Aceptar la
    invitación en «Elegí tu contraseña» → cuenta activa, `twoFactorEnabled =
    t`, y entrar le pide el código.
  - Cambiar el rol de Eli (edita, sin segundo factor, 3 sesiones) a
    administra → «…le cerramos las sesiones…», en la base `administra | t |
    0`; de vuelta a edita, el segundo factor queda prendido.
  - Suspender a Eli → el aviso sobrevive al redibujo, el botón pasa a
    «Reactivar», insignia «Suspendida»; entrar → 403 `CUENTA_SUSPENDIDA`, y en
    la pantalla, «Tu cuenta está suspendida. Si creés que es un error, hablá
    con quien dirige o administra.» (sin marcar los campos). Reactivar → «Eli
    Edita puede volver a entrar.».
  - Borrar a Zoe (activa, sin historia) → vuelve a Personas y no está. A Yago
    (sin historia al abrir la ficha, con una fila de actividad sumada
    después) → «Yago Conhistoria ya hizo cosas en el admin… suspendé su
    cuenta.»: lo decidió la clave foránea.
  - Cancelar la invitación de Uli → la cuenta se borra; actividad `invito` y
    `cancelo-la-invitacion`.
  - Cerrar las sesiones de Ada → 2 → 0 en la base, y «No tiene el admin
    abierto en ningún lado.».
  - Pasar la dirección de Dora a Ada: contraseña mala → «Esa no es tu
    contraseña.» y `aria-invalid`; la buena → Ada dirige, Dora administra.
    Ada, entrando con su código en el otro perfil, se la devolvió a Dora → la
    ficha llegó con «Listo: ahora dirige Dora Dirige, y vos pasaste a
    administra.» (el arreglo `aca9c46`, abajo).
  - Cambiar el correo de Ada y de Eli → «…avisamos por correo a las dos
    direcciones», dos correos «El correo de tu cuenta del admin cambió» (a la
    vieja y a la nueva) en la consola; las sesiones de Eli 1 → 0.
  - Actividad: 86 filas → página 1 con 50 y «Más viejas», página 2 con 36 y
    «Más nuevas»; buscador «yago» + persona + módulo Acceso + últimas 24 horas
    → 24 filas, sin paginado, los `select` conservan lo elegido, «Sacar los
    filtros» vuelve a las 50. Quedó anotado cada tipo nuevo: invito 2,
    reenvio-la-invitacion 1, cancelo-la-invitacion 1, cambio-el-rol 2,
    cambio-el-correo 2, suspendio 1, reactivo 1, borro-una-cuenta 1,
    paso-la-direccion 2, cerro-las-sesiones 1, activo- y
    desactivo-el-segundo-factor 1 y 1. La tabla `twoFactor`: 0 filas.
  - Mi cuenta › Seguridad: como edita (Eli, entrando con código) «Activo» →
    «Desactivarlo» con la contraseña → «Apagado» y su aviso → «Activar el
    segundo factor» → «Activo»; como dirige, «Activo», «Es obligatorio para tu
    rol…» y ningún botón. Como edita, `/admin/cuentas` → «Esta sección es de
    quien dirige o administra» y Cuentas no está en la sidebar.
  - Estados: una invitación vencida → insignia «Invitación vencida»; una
    cuenta de `crear-cuenta` sin invitar → «Todavía no se le mandó ninguna
    invitación.» y el botón «Mandar la invitación».
  - **Los tres temas**, contraste WCAG medido en la página con los colores
    computados, en Personas, una cuenta y Actividad: claro y mixto, `h1`,
    pestaña activa, `th` y filas 13,63:1; frases, detalle, raya de la tabla,
    paginado y detalles de fila 4,83:1; resumen del desplegable y «←
    Cuentas» 5,11:1; oscuro, 13,59 · 7,08 · 7,14. Ninguno bajo 4,5.
  - **390 de ancho** (`orca set device "iPhone 12"`): Personas, Invitar, una
    cuenta, Actividad, Mi cuenta y el código, sin desborde horizontal
    (`scrollWidth` = 390); la tabla de permisos scrollea dentro de su caja.
  - **Foco:** cada enfocable de esas seis pantallas (53 en total) lleva la
    regla de foco de §11 en sus clases (`focus-visible:outline` o el
    `focus:ring` de `ENTRADA`). El foco real no se pudo ver (abajo).
- **Arreglado en la verificación** (`aca9c46`): al pasar la dirección, el
  apartado que la pasa desaparece con el redibujo y se llevaba el aviso;
  ahora la ficha llega con `?direccion=pasada` y lo muestra en el
  encabezado. typecheck, lint y react-doctor en verde después.
- **Revisión de cierre:** la lanza el padre al recibir `worker_done` (lane
  supervisada; DECISIONS del padre: 1 revisor Opus 5.5, medium, lente «el
  cambio entero contra su SPEC»). Marcas del PLAN: 6 `high` (pasos 1, 2, 3,
  4, 7 y 11), 9 `medium` y 1 `low`.

## Tried and failed

- **Revisión r1 (2026-09-26): FAIL.** La guarda del layout era la única
  barrera de Cuentas, y solo oculta la interfaz: Next dibuja la página en
  paralelo y la manda en el payload, así que quien edita recibía los correos
  de todas las cuentas y la actividad aunque viera «Sin permiso». Arreglado
  en tres capas (DECISIONS, «Ronda de arreglos 1»; la prueba, arriba).
- **Capturas:** `orca screenshot --json` cerró el runtime de Orca dos veces
  seguidas (`runtime_unavailable`); como dice la memoria, no se insistió. Lo
  visual quedó probado con probes numéricos (contraste, ancho, clases de
  foco), no con imágenes.
- **Teclado real:** `orca keypress --key Tab` no mueve el foco dentro de la
  webview, y `focus({ focusVisible: true })` tampoco activa `:focus-visible`,
  porque la ventana no tiene el foco del sistema (`document.hasFocus()` →
  `false`; lo mismo en los controles de Mi cuenta que ya estaban). Se
  reemplazó por la auditoría de clases de arriba.
- `orca snapshot` también cerró el runtime; se usó `orca eval`.

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
- **Paso 3 — el segundo factor en `@ed/auth`** (`c4f85d6`).
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
- **Paso 4 — una cuenta suspendida no abre sesión** (`b37cfe0`).
  `suspendidas.ts`: `CAMPO_SUSPENDIDA` (campo adicional de `user`, `input:
  false`, en `config.ts`) y `frenarSiEstaSuspendida(idDeCuenta, ctx)`, que
  corre primero en el gancho de la base que crea toda sesión
  (`GANCHOS_DE_LA_BASE` de `ubicacion.ts`) y contesta 403
  `CUENTA_SUSPENDIDA`. Test en `segundo-factor.test.ts`: con la contraseña
  buena, 403 y sin cookie; suspendida entre la contraseña y el código, el
  código también da 403; no se anota nada. Aceptación: `pnpm --filter
  @ed/auth test` 41/41; `pnpm typecheck` exit 0; `lint` exit 0.
- **Paso 5 — el enlace de invitación** (`34d72b8`).
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
- **Paso 6 — los correos que quedaban** (`4f8dd86`). `elegiTuContrasena`
  suma `invitacion?: { quienInvita, rol }`: dice quién invita y con qué rol,
  y «si no esperabas esta invitación» en vez de «si no lo pediste».
  `correos/tu-correo-cambio.ts › tuCorreoCambio({ nombre, anterior, nuevo,
  cuando })`, para las dos direcciones. `enHoraUniversal` se mudó a
  `plantilla.ts` (la usan dos correos). Un test nuevo encontró «te invitó a
  el admin»: corregido a «al». Aceptación: `pnpm --filter sitio test` exit 0
  (155 pass, 1 saltado de antes); `typecheck` y `lint` exit 0.
- **Paso 7 — entrar con código** (`e76dc86`). `FormularioEntrar`: si la
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
- **Paso 8 — Mi cuenta › Seguridad** (`865d5f4`). `admin/mi-cuenta/Seguridad.tsx`
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
- **Paso 9 — los tipos de actividad, su frase y quién los ve** (`5642c6a`).
  `datos/actividad.ts`: los diez tipos de Cuentas; `QUIEN_VE` (`satisfies
  Record<TipoDeActividad, Capacidad>`, todos `usarCuentas`, como la lectura
  5 de la 3c), `tiposQueVe(rol)` y `esTipoDeActividad`.
  `admin/actividad/frase.ts › fraseDe({ tipo, quien, sobre })` → «Ana Pérez
  invitó a Juan Pérez», un `Record<TipoDeActividad, …>`. Son las piezas que
  la 3c también crea (DECISIONS): concilia la que rebasee segunda. Test
  `frase.test.ts`. Aceptación: `pnpm --filter sitio typecheck`, `test` (159
  pass, 2 saltados) y `lint` exit 0.
- **Paso 10 — las consultas** (`e8bee07`). `datos/consultas/cuentas.ts`:
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
- **Paso 11 — las acciones de Cuentas** (`4573cd8` y `346ad68`). En el
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
- **Paso 12 — los patrones nuevos del armazón** (`a914e8b`).
  `admin/armazon/Volver.tsx` y el slot `volver` de `Encabezado` (en el modo
  navy pasa a `azul-claro`, para la ficha de una novedad de la lane 6);
  `Buscador.tsx` (formulario `GET` con `next/form`, `role="search"`, caja con
  `ENTRADA`, «Buscar» secundario y «Sacar los filtros») con `Filtro` (un
  `select` con su etiqueta); `Paginado.tsx` («Más nuevas», «Página n de m»,
  «Más viejas», links que conservan los filtros). DESIGN.md §11: «Volver»,
  «Buscador» y «Paginado», con contrastes y primer consumidor, y la línea de
  historia del §11. Aceptación: `pnpm --filter sitio typecheck` y `lint` exit
  0; react-doctor 100/100. **Hoy** (rebase sobre `490547f`): «← volver», el
  buscador y el filtro son los de `main` (`Volver`, `Buscador`, `Filtro` de
  píldoras); de este paso quedan el `Paginado` y la «Tabla».
- **Paso 13 — Personas e Invitar** (`5f6429a`). `cuentas/layout.tsx` con
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
  **Hoy** (ronda 1): esa guarda del layout solo oculta la interfaz; cada
  página chequea `usarCuentas` antes de leer y las consultas reciben el rol.
- **Paso 14 — una cuenta** (`99ee275`). `cuentas/[id]/page.tsx` (título con
  el nombre, 404 si no existe, `queSePuede` con la sesión, y el aviso de
  Invitar por `?invitacion=salio|no-salio`). `admin/cuentas/FichaDeLaCuenta.tsx`
  compone: «← Cuentas», el nombre con la insignia, correo y último acceso, y
  los apartados de `ficha/Apartados.tsx` (Datos con el cambio de correo,
  Rol con el selector, Estado o Invitación, Segundo factor, Sesiones, La
  dirección), cada uno según `queSePuede`. Piezas de cliente en `ficha/`:
  `BotonDeAccion` (**hoy** confirma con `Confirmacion`, la de `main`; al
  escribirse, con `window.confirm`, como «Descartar» del editor
  de páginas, lo que no se deshace con un clic; suspender y reactivar
  comparten `key` para que el aviso sobreviva), `FormularioDelRol`,
  `FormularioDelCorreo` y `FormularioDeLaDireccion`; `ficha/Acciones.tsx`
  para Estado e Invitación. `mi-cuenta/Sesiones.tsx` exporta
  `ListaDeSesiones` (las filas), que usan Mi cuenta y la ficha. Copy
  revisado con lenguaje inclusivo (sin pronombres con género sobre la
  persona). react-doctor pidió partir la ficha (complejidad 14): los
  apartados pasaron a su archivo. Aceptación: `pnpm --filter sitio
  typecheck`, `lint` y `test` (165 pass) exit 0; react-doctor 100/100; en el
  3017 como administra: `/admin/cuentas/no-existe` → 404; la de Eli → 200 con
  Datos, Rol, Estado, Segundo factor y Sesiones, y «Suspender», «Cambiar el
  rol», «Cambiar el correo», «Cerrar sus sesiones»; la de quien dirige →
  sin acciones y «no se suspende ni se borra: se pasa la dirección».
- **Paso 15 — Actividad** (`567aa0e`). `cuentas/actividad/page.tsx`: el
  encabezado con la pestaña Actividad, el `Buscador` con tres `Filtro`
  (persona, módulo, cuándo), la lista, el vacío (con o sin filtros) y el
  `Paginado`; muestra solo `tiposQueVe(rol)`. En `admin/cuentas/actividad/`:
  `modulos.ts` (el módulo de cada tipo, un `Record<TipoDeActividad, …>`, y
  `pantallaDe` para linkear lo de Cuentas), `filtros.ts` (los filtros de la
  URL con Zod, lo que no sirve se ignora; `urlDeActividad`; los rangos de
  «Cuándo»; test nuevo) y `ListaDeActividad.tsx` (la frase de `fraseDe`, el
  módulo, el momento, y «Ver» solo si la cuenta todavía existe).
  `listarActividad` pasa a recibir `dias` y calcula la fecha adentro (el
  lint del compilador de React no deja `Date.now()` en el render).
  Aceptación: `pnpm --filter sitio typecheck`, `lint` y `test` (167 pass)
  exit 0; react-doctor 100/100; en el 3017 como administra:
  `/admin/cuentas/actividad` → 200, «Actividad · Admin ED», `role="search"`,
  la pestaña encendida, las frases; `?pagina=2&modulo=cuentas&q=juan` → 200
  con «No hay actividad con esos filtros» y «Sacar los filtros»; parámetros
  basura → 200. **Hoy** los filtros son el `Filtro` de píldoras de `main`, y
  «Sacar los filtros» se fue (DECISIONS, rebase).
- **Paso 16 — los documentos** (`8b6d21d`, `f975239`, `adebce1`, `c299689`).
  ADR-0013 (se escribió como 0012 y pasó a 0013 al rebasar: la lane 7 mergeó
  antes su 0012) «Segundo factor por correo, obligatorio para quien dirige y
  administra» (y su fila en el índice de ADRs); el §7 del spec del admin
  (Cuentas, la suspensión, la invitación de 72 h, `queSePuede` y el segundo
  factor); AGENTS.md §12 (la línea de la sesión: el segundo factor y la
  suspensión, ADR-0013) y §3 (`roles.ts`, `sobre-cuentas.ts`, y las
  consultas y acciones nuevas en el árbol de `datos/`); README (Cuentas en
  la intro del admin, el código por la consola en local, «Las cuentas», los
  correos nuevos y **Resend como condición del primer deploy**). Aceptación:
  `git status` mostró solo esos archivos; los links nuevos resuelven (`ls` de
  `0013-segundo-factor-por-correo.md` (entonces `0012-…`) desde la raíz y desde `specs/`).
  Commits partidos por scope. Un encabezado de 76 caracteres se rehízo con
  `reset --soft` antes de pushear, y el del paso 3 (75) con un rebase sin
  conflictos **sobre la misma base** (`5a07368`), que solo cambió ese mensaje
  (el diff contra el árbol anterior da vacío): los hashes de este PROGRESS
  ya son los nuevos. Un primer intento se había ido contra `origin/main`, que
  avanzó con `paginas-inicio` mientras tanto: se abortó sin tocar nada;
  rebasear sobre `main` nuevo es del padre.

## Abierto

- ~~El rebase sobre `main`~~: hecho dos veces (`490547f` y `15def2c`).
- ~~La 3c (`inicio`)~~: está en `main`; conciliada en el rebase sobre
  `15def2c` (`VA_AL_INICIO` de los tipos nuevos y «Ver toda la actividad»).
- ~~Mi cuenta~~: conserva «Avisos» (lane 7) y «Seguridad».
- ~~La revisión r1 vuelve~~: r2 dio PASS sobre `5254b43`.
- **La base `ed_cuentas`** se borra al cerrar, con el worktree.
- **Para el deploy (lane 0):** Resend configurado y probado antes de que esta
  lane llegue a producción (README, ADR-0013).
