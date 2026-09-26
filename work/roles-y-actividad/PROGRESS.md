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

## Hecho

## Abierto
