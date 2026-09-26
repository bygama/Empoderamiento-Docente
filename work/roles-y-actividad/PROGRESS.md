# PROGRESS — Roles y actividad

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_roles` con las 8 migraciones de `main` aplicadas, `.env.local`
  apuntado a ella. SPEC.md escrito desde el brief del padre (lane 3a de
  `work/mapa-del-admin/`).
- 2026-09-26 — Verificado para el SPEC §2: el índice parcial escrito a mano
  no genera drift (`prisma migrate diff --from-migrations … --to-schema …`
  da «This is an empty migration»); con el preview feature `partialIndexes`
  Prisma 7.10 escribe el mismo SQL, pero el brief pide el camino a mano y no
  hace falta un preview feature.
- 2026-09-26 — SPEC aprobado por el padre con siete rulings (DECISIONS), uno
  de ellos suma `nombrar-direccion`. PLAN.md escrito: 12 pasos.

- **Paso 1 — tres roles y sus capacidades** (`daac8c7`). `permisos.ts`:
  `ROLES` con dirige, `PUEDE` con las 11 capacidades del §3, `puede`,
  `quienPuede`, `QUE_PUEDE`, `esUnaSola`; `permisos.test.ts` con la matriz.
  `BarraLateral` pasa a `usarCuentas`. `pnpm --filter @ed/auth test` → 20
  pasan, exit 0; `pnpm typecheck` exit 0; `pnpm lint` exit 0.
- **Paso 2 — una sola dirige** (`8fd6c00`). Migración
  `20260926215735_una_sola_dirige` (vacía de `--create-only` + el SQL del
  índice, aplicada después): `\d "user"` muestra `user_una_sola_dirige UNIQUE
  … WHERE rol = 'dirige'`. `ROL_DE_LA_DIRECCION` en `permisos.ts`;
  `datos/direccion.ts` (`quienDirige`, `nombrarDireccion`); `crear-cuenta`
  acepta dirige y se niega si ya hay; `nombrar-direccion` nuevo.
  `pnpm migrate:status` → «up to date»; `direccion.test.ts` → 4 pasan.
  Probados a mano: rol inválido (exit 2), correo sin cuenta, segunda dirige
  por `crear-cuenta` y por `nombrar-direccion` (exit 1, mensaje en llano).
  Cuentas de prueba en `ed_roles`: `dirige@ed.test`, `admin@ed.test`,
  `edita@ed.test`. Con una dirige que no creó la prueba, el cuarto test de
  `direccion.test.ts` se saltea a propósito («ya hay quien dirige»): no le
  saca la dirección a nadie.
- **Paso 3 — la sidebar por capacidad** (`4c8d650`). `modulos.ts` con
  `capacidad` por módulo y `MODULOS`; `BarraLateral` calcula `visibles` con
  `puede`; `MenuDelAdmin` filtra grupos y configuración. typecheck y lint
  exit 0.
- **Paso 4 — la guarda y «Sin permiso»** (`440947a`, `129122b`).
  `datos/sesion.ts › sesionActual` (`cache`), `Guarda.tsx`, `SinPermiso.tsx`,
  `contenido/layout.tsx` (`editarContenido`), `[modulo]/page.tsx` con la
  guarda de su módulo (`moduloDe`), el layout protegido con `sesionActual`.
  `guarda.test.ts` → 4 pasan. DESIGN.md §11 «Sin permiso». La excepción
  `mi-cuenta/` del test entra con la carpeta, en el paso 10.

- **Paso 5 — cada acción chequea su capacidad** (`d11e5c5`).
  `acciones-con-sesion.test.ts` suma `problemasDeCapacidad` (`puede(` justo
  después de la sesión, sin `await` ni `base.` en el medio), `SIN_CAPACIDAD`
  con `paginas.ts` ×3 y `fotos.ts` (lane paginas-inicio) y
  `actualizar-metricas.ts` (lane busquedas-de-google), y un test que avisa
  cuando una excepción ya chequea. `abrirVistaPrevia` suma su
  `puede(…, "editarContenido")`. 13 pasan, exit 0.
- **Paso 6 — la tabla `actividad`** (`472881a`). `actividad.prisma`, la
  relación en `User`, migración `20260926220535_actividad` (FK `ON DELETE
  RESTRICT`; `migrate dev` no tocó el índice parcial: sin drift, como se
  midió). `datos/actividad.ts › registrarActividad` con los cuatro tipos y
  Zod. `actividad.test.ts` → 4 pasan. Nota: en Prisma 7 `migrate dev` no
  regenera el cliente; hay que correr `pnpm generate` después.
- **Paso 7 — entrar, salir y la contraseña quedan anotados** (`409fb6c`).
  `OpcionesDeAuth.registrar` y `SucesoDeSesion`; `sucesos.ts` (salir en el
  `before` de `/sign-out`, cambiar la contraseña en el `after` de
  `/change-password` con el aviso por correo); `ganchos.ts` anota `entro`;
  `onPasswordReset` anota; `/change-password` 5 cada 5 min. `datos/auth.ts`
  lo conecta a `registrarActividad`. El comentario de `freshAge` decía que
  cambiar la contraseña pedía sesión fresca y no es así (better-auth la
  marca `sensitive`, no `fresh`): corregido. `pnpm --filter @ed/auth test`
  → 24 pasan.
- **Paso 8 — dónde se abrió cada sesión** (`7422daa`). `ubicacion.ts`
  (`ubicacionDelPedido`, `CAMPOS_DE_LA_SESION`, `GANCHOS_DE_LA_BASE`),
  `session.additionalFields` y `databaseHooks` en `config.ts`, columnas
  `ciudad` y `pais` (migración `20260926221013_sesion_ubicacion`).
  `ubicacion.test.ts` → 4 pasan (incluye entrar con y sin las cabeceras
  contra better-auth en memoria). `pnpm migrate:status` al día.
- **Paso 9 — una sesión en llano** (`0487c65`). `lib/sesiones.ts`
  (`dispositivoDe`, `lugarDe`) con test de user agents reales → 3 pasan.

- **Paso 10 — Mi cuenta** (`f70b570`, `0dbafed`). `admin/armazon/Apartado.tsx`
  (patrón nuevo, en DESIGN.md §11); `admin/mi-cuenta/` (MiCuenta,
  FormularioDelNombre, FormularioDeLaContrasena, Sesiones, CerrarLasDemas);
  `datos/consultas/mi-cuenta.ts`, `datos/acciones/mi-cuenta.ts ›
  cambiarMiNombre`; la ruta; sale la guía de Mi cuenta; `mi-cuenta/` en
  `SIN_GUARDA` y `cambiarMiNombre` en `SIN_CAPACIDAD`, con motivo.
  react-doctor marcó dos (`js-set-map-lookups` en MenuDelAdmin,
  `no-derived-useState` en el nombre): arreglados por código → 100/100.
  En el navegador (3016), con las tres cuentas: sidebar por rol, «Sin
  permiso» de edita en `/admin/cuentas`, la guía para administra, el nombre
  (normaliza espacios, redibuja la sidebar, anota `cambio-su-nombre`), la
  contraseña (actual mala → «La contraseña actual no es esa.» con
  `aria-invalid`; buena → cierra la otra sesión, correo por consola, sigue
  con sesión), «Cerrar las demás», la ciudad de las cabeceras («Córdoba,
  Argentina», «Monterrey, México»), salir anota `salio`. Tres temas, 390 de
  ancho sin scroll horizontal, foco con Tab en todos los controles. Dos
  arreglos que salieron de mirarla: el campo del nombre se rearma con el
  nombre guardado (`key`), y para quien dirige «Tu rol» y el correo dicen
  que la dirección se pasa (no «lo cambia quien administra»).
- **Paso 11 — `/.well-known/change-password`** (`b364f1a`). `curl -sI` → `308`,
  `location: /admin/mi-cuenta#contrasena`.
- **Paso 12 — los documentos** (`7447589`, `ecfbc80`, `e6b6b0e`). Spec del
  admin §7 (tres roles, guarda, actividad, contraseña desde Mi cuenta; y
  `freshAge` corregido), AGENTS.md §12 (la línea de los roles), README
  (`crear-cuenta … dirige` y `nombrar-direccion`). Los greps de aceptación
  encuentran las tres.
- **Lo que no se pudo cerrar acá** (para el padre): `origin/main` sigue en
  `446ab51`, así que (1) la capacidad `configurarConexiones` de la lane 5 no
  existe todavía: quien rebasee después la extiende a dirige y administra en
  `permisos.ts` (y a `permisos.test.ts`); (2) la poda de 12 meses de
  `actividad` queda sin registrar: el cron diario es de la lane 5, y la
  tarea es un `deleteMany({ where: { en: { lt: hace12Meses } } })` desde
  `datos/`. Y (3) las excepciones de `SIN_CAPACIDAD` de 4a y 5, que salen
  cuando cada una sume su `puede(…)` y su registro.
- **Una rareza del entorno, no del código:** un «Cerrar las demás» dio 401
  una vez; la cookie de sesión había desaparecido del navegador. Causa: el
  perfil `default` de Orca comparte las cookies de `localhost` entre puertos
  y otra lane pisó la sesión (memoria `orca-perfil-por-lane`). Con un perfil
  aislado (`roles-y-actividad`) no volvió a pasar; el mismo pedido por curl
  y dos veces más en el navegador dio 200.
- **Rebase sobre `c957586` (#181, busquedas-de-google), pedido por el padre.**
  El único conflicto, `permisos.ts`: la tabla de esta lane más
  `configurarConexiones` para dirige y administra, con su comentario, y en la
  matriz del test; la pantalla de Búsquedas pasa de `PUEDE.configurarConexiones(rol)`
  a `puede(rol, "configurarConexiones")` (348d752). La migración de la 5
  (`20260926213050_busquedas_y_tareas`) queda antes que las tres de esta lane:
  no hubo que regenerar ninguna; aplicada a `ed_roles` con `migrate:deploy`.
  Lo que quedaba esperando:
  - **Métricas** (`2d37b4e`): `metricas/layout.tsx` con `<Guarda
    capacidad="verMetricas">` (el test de la guarda lo exigía), y
    `actualizarMetricasAhora` y `actualizarBusquedasAhora` con
    `puede(…, "verMetricas")` justo después de la sesión; sale su excepción de
    `SIN_CAPACIDAD`. No se anotan en la actividad (el §5.8 no lo lista).
  - **La poda de 12 meses** (`0ab9f1d`): `datos/tareas/poda-de-actividad.ts`,
    registrada en `TAREAS_DIARIAS`; su test la corre por el corredor con
    `registrarCorrida` y un «hoy» de 2001, y ve la corrida en
    `corridas_de_tareas`.
  - Quedan solo las excepciones de la 4a (`paginas.ts` ×3, `fotos.ts`).

- **Dónde queda (2026-09-26):** los 12 pasos hechos y verificados (abajo),
  rebasados sobre `c957586` con lo que esperaba a la lane 5, **PR #182**
  abierto contra `main`
  (https://github.com/bygama/Empoderamiento-Docente/pull/182), pre-push en
  verde. Falta la revisión de cierre que lanza el padre (1 revisor Opus 5.5,
  medium, «el cambio entero contra su SPEC»). **Lo que sigue:** los arreglos
  que pida esa revisión, en esta misma rama; con su PASS, el commit que cierra
  la lane (borra `work/roles-y-actividad/`), en este mismo PR y antes del
  merge. El merge es del padre, rebase-only; si `main` se movió, rebasar y
  volver a correr el gate antes.

- **Revisión de cierre r1** (Opus 5.5, medium, «el cambio entero contra su
  SPEC», lanzada por el padre sobre `6f4d834`): **PASS**, 0 Critical, 0
  Important, 4 Minor. Tres ratificados sin cambio de código y tres arreglos
  de una línea (DECISIONS): `crear-cuenta` con `ROL_POR_DEFECTO` (`c77c09a`;
  probado: sin rol da de alta con `edita`), Métricas en «Sin permiso» de
  DESIGN.md §11 (`38cabc2`), y `sesion.ts`, `actividad.ts` y `direccion.ts`
  en el árbol de AGENTS.md §3 (`28dc29b`). **La lane cierra** con el commit
  que borra esta carpeta, en el PR #182; después, el gate sobre `main`
  fresco, que va en el PR y en el `worker_done`.

## Verification

### 2026-09-26 — L DoD después del rebase sobre `c957586` — PASS

Sobre `0ab9f1d` (25 commits de la lane encima de `origin/main` en `c957586`).

- L1 static: `pnpm typecheck` → exit 0 (después de `pnpm generate` y de
  borrar `apps/sitio/.next/types`, tipos generados del build anterior que
  apuntaban a rutas viejas) · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos», apps/sitio/src 483 archivos · packages/db/src
  3 · packages/auth/src 17).
- L2 behavioral: `pnpm test` → exit 0 (packages/auth 28/28; apps/sitio 151:
  149 pasan, 0 fallan, 2 saltados, los mismos de antes). `pnpm build` →
  exit 0 (`ƒ /admin/metricas`, `/admin/metricas/busquedas`, `/admin/mi-cuenta`,
  `/api/cron/diario`). `pnpm migrate:status` contra `ed_roles` → «Database
  schema is up to date!». Desde cero (`ed_roles_prueba`, creada y borrada):
  `migrate deploy` de las 12 → «All migrations have been successfully
  applied»; `migrate diff --from-config-datasource --to-schema prisma/schema`
  → «This is an empty migration» (el índice parcial tampoco genera drift con
  la migración de la 5 en el medio).
- L3 end-to-end (navegador de Orca, perfil aislado, dev server en el 3016,
  apagado al terminar):
  - edita → `/admin/metricas` y `/admin/metricas/busquedas` se ven (sin «Sin
    permiso»); Búsquedas dice «Todavía no está conectado» y no muestra
    «Conectá Search Console». «Actualizar ahora» en las dos pasa la
    capacidad: `POST 200` y el aviso de la conexión que falta en local
    («Faltan las variables de Vercel…», «Search Console todavía no está
    conectado.»), no `SIN_PERMISO`.
  - administra y dirige → las dos pantallas, y Búsquedas muestra «Conectá
    Search Console» (antes de esta lane, dirige no existía y
    `configurarConexiones` era solo de administra).
  - `actividad`: los `entro` y `salio` de estos tres ingresos quedaron.
  - Capturas: dos intentos de `orca screenshot` fallaron (runtime de Orca);
    la evidencia de esta vuelta son las lecturas del DOM de arriba.
- Close review: la lanza el padre.

### 2026-09-26 — L DoD (SPEC §9 + las aceptaciones del PLAN) — PASS

Sobre `e6b6b0e` + los docs de la lane; `origin/main` en `446ab51` (sin
cambios desde que arrancó la lane).

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos», apps/sitio/src 443 archivos · packages/db/src
  3 · packages/auth/src 17).
- L2 behavioral: `pnpm test` → exit 0 (packages/auth: 28 pasan, 0 fallan;
  apps/sitio: 122, 120 pasan, 0 fallan, 2 saltados: «nombrar la dirección
  pasa a dirige…», que se hace a un lado cuando la base ya tiene quien
  dirige, y el de las respuestas grabadas de métricas, de antes). El saltado
  propio se corrió aparte contra una base vacía (`ed_roles_prueba`, creada,
  `migrate deploy` de las 11 migraciones desde cero → «All migrations have
  been successfully applied», y borrada): `tsx --test
  src/datos/direccion.test.ts src/datos/actividad.test.ts` → 8 pasan, 0
  saltados. `pnpm build` → exit 0 («Compiled successfully»,
  `ƒ /admin/mi-cuenta` en la tabla de rutas). `pnpm migrate:status` →
  «Database schema is up to date!». Arranca: dev server en el 3016
  (`next dev -p 3016`, pestaña de Orca), sirve.
- L3 end-to-end (navegador de Orca, perfil aislado `roles-y-actividad`, las
  tres cuentas de prueba):
  - sidebar: edita → «Inicio, Mensajes, Métricas, Contenido, Novedades,
    Biblioteca»; dirige y administra → las mismas más «Cuentas, Ajustes».
  - edita en `/admin/cuentas` y `/admin/ajustes` → `h1` «Esta sección es de
    quien dirige o administra», con su rol; en `/admin/contenido` y
    `/admin/contenido/paginas` → las pantallas de Contenido. administra en
    `/admin/cuentas` → la guía «Cuentas».
  - Mi cuenta: el nombre («  Raquel   Ayala  » → «Raquel Ayala», la sidebar
    lo muestra); la contraseña (actual mala → «La contraseña actual no es
    esa.», `aria-invalid="true"`; buena → 200, la otra sesión cerrada, 1
    sesión en la base, «Tu contraseña cambió» en la consola, sigue con
    sesión); «Cerrar las demás» → `POST /api/auth/revoke-other-sessions 200`
    y la lista queda en «No tenés el admin abierto en ningún otro lado»;
    sesiones con `x-vercel-ip-*` → «Córdoba, Argentina», «Monterrey,
    México»; sin ellas → «Ubicación desconocida».
  - `actividad`: 16 filas con los cuatro tipos (`entro`, `salio`,
    `cambio-su-contrasena` por el enlace y por Mi cuenta,
    `cambio-su-nombre` con `sobre` = «Raquel Ayala»).
  - `curl -sI http://localhost:3016/.well-known/change-password` → `308`,
    `location: /admin/mi-cuenta#contrasena`.
  - Tres temas (claro, mixto, oscuro), 390 × 844 sin scroll horizontal
    (`scrollWidth` 375 ≤ 390), y Tab recorre nombre, «Guardar el nombre»,
    las dos contraseñas con su «Mostrar», «Cambiar la contraseña», todos con
    foco visible (`:focus-visible`, outline `azul-medio` o el anillo de la
    entrada). Capturas en `%TEMP%\ed-orq\capturas\roles-y-actividad\`.
- Close review: la lanza el padre al recibir `worker_done` (brief: 1 revisor
  Opus 5.5, medium, «el cambio entero contra su SPEC»). No corrida acá, a
  propósito.

## Hecho

## Abierto
