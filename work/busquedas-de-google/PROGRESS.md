# PROGRESS — Búsquedas de Google

## In progress

- Nada: los 10 pasos están hechos y verificados. Espera la revisión de cierre
  del padre (abajo, «Next»).

## Done

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_busquedas` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las migraciones de `main` aplicadas.
- 2026-09-26 — SPEC.md escrito desde el brief del padre (lane 5 del XL
  `work/mapa-del-admin/`), con la API de Search Analytics y el token de cuenta
  de servicio verificados contra la documentación oficial de Google.

- 2026-09-26 — SPEC aprobado por el padre (opción A en §9.1, nota en §9.9;
  DECISIONS.md). PLAN.md escrito: 10 pasos.

- 2026-09-26 — **Paso 1** (`2a42684`): `lib/tareas/registro.ts` (`Tarea`,
  `ResultadoDeTarea`, `definirTareas`, que rechaza claves repetidas) y
  `lib/tareas/corredor.ts` (`correrTareas(tareas, { registrar, limiteMs })`:
  todas a la vez, aisladas, con tiempo máximo, y registrar sin frenar a las
  otras), con 4 tests. `pnpm --filter sitio test` → exit 0 (84 tests, 83 pass,
  1 skip: el de las respuestas grabadas de Vercel, que espera a A1);
  `pnpm typecheck` → exit 0.

- 2026-09-26 — **Paso 2** (`2879cb0`): `tareas.prisma` (`CorridaDeTarea`) y
  `busquedas.prisma` (`BusquedaDiaria`); `SincronizacionMetricas` sale de
  `metricas.prisma`. Migración `20260926213050_busquedas_y_tareas`: generada
  con `pnpm migrate --create-only --name busquedas_y_tareas` (en una terminal
  de Orca: `migrate dev` pide confirmar el `DROP` y no corre sin TTY), con el
  `INSERT … SELECT` comentado sumado antes de aplicarla y el `DROP` bajado
  hasta después; aplicada con `pnpm migrate`. La copia de Vercel se mudó a
  `datos/tareas/metricas-de-vercel.ts` (`sincronizarMetricas`,
  `copiarMetricas`, `copiaDeVercel`), sin registrarse sola; `corridas.ts`
  (`registrarCorrida`, `ultimaCorrida`), `diarias.ts` (`TAREAS_DIARIAS`,
  `LIMITE_POR_TAREA_MS`, `correrTareasDiarias`) y `a-mano.ts`
  (`correrAMano(clave, correr)`, freno de 10 minutos por tarea, con test);
  `/api/cron/diario` reemplaza a `/api/cron/metricas`; `vercel.json` con ese
  único cron. Sin variables, «Actualizar ahora» contesta sin registrar (como
  antes). Prisma 7 no regenera el cliente en `migrate dev`: hizo falta
  `pnpm generate`.
  - El movimiento del historial, sobre tres filas sembradas antes de migrar
    (`psql -d ed_busquedas`):

    ```
     id |       tarea        |      corridaEn      | ok |                                     detalle
    ----+--------------------+---------------------+----+----------------------------------------------------------------------------------
      1 | metricas-de-vercel | 2026-09-20 04:00:12 | t  | 30 días, 412 filas, 4 ventanas. (del 2026-08-21 al 2026-09-19)
      2 | metricas-de-vercel | 2026-09-21 04:00:09 | f  | Vercel respondió 401: el token no sirve o venció. (del 2026-09-20 al 2026-09-20)
      3 | metricas-de-vercel | 2026-09-22 04:00:30 | t  | Nada nuevo: ya estaba al día. (del 2026-09-21 al 2026-09-21)
    (3 rows)

    SELECT to_regclass('public.metricas_sincronizaciones') → (vacío: la tabla ya no existe)
    ```
  - `pnpm typecheck` → exit 0; `pnpm --filter sitio test` → exit 0 (85
    tests, 84 pass, 1 skip); `pnpm lint` → exit 0.

- 2026-09-26 — **Paso 3** (`d2fb7e0`): `PUEDE.configurarConexiones`, hoy
  solo `administra`. `pnpm typecheck` → exit 0; `git diff --stat main --
  packages/auth` → solo `permisos.ts` (6 líneas).
- 2026-09-26 — **Paso 4** (`d79a252`): `lib/busquedas/` con `tipos.ts`
  (`DimensionDeBusqueda`, `FilaDeBusqueda`, `ErrorDeBusquedas`), `token.ts`
  (`firmarJwt`, `pedirToken`: JWT RS256 con `node:crypto`, clave con `\n`
  escritos aceptada, `invalid_grant` en llano), `search-console.ts`
  (`mapearFilas`, `crearClienteDeBusquedas` con un token por cliente,
  paginado por `startRow`, 401/403/429 en llano, 20 s por pedido) y
  `entorno.ts` (`hayVariablesDeBusquedas`, `clienteDeBusquedasDesdeEntorno`).
  Tres respuestas grabadas con la forma de la documentación en
  `__fixtures__/`, y 9 tests (la firma se verifica con la pública de una clave
  generada en el test). `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0
  (94 tests, 93 pass, 1 skip); `pnpm --filter sitio lint` → 0; ningún
  `from "@/` en `lib/busquedas` ni `lib/tareas` (Grep, sin coincidencias).

- 2026-09-26 — **Paso 5** (`b591a98`): `lib/busquedas/lecturas.ts`
  (`posicionPromedio`, `ordenarPorClics`, `casiNosEncuentran` con
  `PUESTOS_CASI`, `MINIMO_DE_IMPRESIONES`, `MUCHAS_IMPRESIONES`, `POCOS_CLICS`,
  `MAXIMO_CASI` y la razón de cada fila) y `lib/busquedas/paises.ts`
  (`nombreDelPais`, 40 líneas: 264 pares alfa-3 → alfa-2 de CLDR 48.2, tag
  `release-48-2`, filtrados y comentados como pidió el padre). 4 tests.
  `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0 (98, 97 pass, 1 skip);
  lint → 0.
- 2026-09-26 — **Paso 6** (`0892637`): `datos/tareas/busquedas-de-google.ts`
  (`sincronizarBusquedas`, `copiarBusquedas`, `copiaDeSearchConsole`): del día
  siguiente al último `total` hasta ayer, 90 días como máximo y la primera vez,
  cada dimensión reemplazada en su rango en una transacción (`deleteMany` +
  `createMany`: miles de filas en dos consultas), `total` al final. Suma la
  tarea a `TAREAS_DIARIAS` y las tres variables a `.env.example`. 2 tests
  contra la base (idempotente; sin avanzar la marca si una dimensión falla).
  `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0 (100, 99 pass, 1
  skip); lint → 0. De punta a punta, con el dev server en el 3015 y un
  `CRON_SECRET` local en `.env.local`:

  ```
  sin header → 401 · secreto equivocado → 401
  con el secreto → 500
  [{"clave":"metricas-de-vercel","ok":false,"detalle":"Faltan VERCEL_TOKEN y/o VERCEL_ANALYTICS_PROJECT_ID: ver el README."},
   {"clave":"busquedas-de-google","ok":false,"detalle":"Search Console no está conectado: faltan las variables (README)."}]
  corridas_de_tareas: de 3 filas a 5, una por tarea
  ```

- 2026-09-26 — **Regla del padre, por el buzón:** las pestañas encienden la
  más específica y no hay prop `exacta` (DECISIONS.md). SPEC §9.6 y PLAN paso
  7 ajustados.
- 2026-09-26 — **Paso 7** (`3b41628`): `pestanaActiva(ruta, hrefs)` en
  `admin/armazon/ruta.ts` (test en rojo primero: «does not provide an export
  named 'pestanaActiva'»; después 4 en verde: ruta exacta, subruta, prefijo que
  no corta en segmento, sin coincidencia) y `Pestanas` la usa;
  `admin/metricas/pantallas.ts` (`METRICAS`, `PANTALLAS_DE_METRICAS`,
  `pantallaDeMetricas`) y `EncabezadoDeMetricas`; las rutas `metricas/page.tsx`
  (Resumen = encabezado + `PanelMetricas`), `metricas/[pantalla]/page.tsx` y
  `metricas/error.tsx`; `guias-de-metricas.ts` y `GuiaDeMetricas.tsx` con los
  bloques de Origen, Qué hace la gente y Links para compartir (con anclas);
  la entrada `metricas` sale de `guias.ts`; DESIGN.md §11 «Pestañas» registra
  la regla y a Métricas. `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0
  (102, 101 pass, 1 skip); lint → 0. En el navegador de Orca (perfil aislado
  «busquedas-de-google», cuenta `busquedas@ed.test`, administra):

  ```
  /admin/metricas           → «Métricas · Admin ED», h1 Métricas, activa: Resumen (solo)
  /admin/metricas/origen    → «Origen · Admin ED», activa: Origen
  /admin/metricas/acciones  → «Qué hace la gente · Admin ED», activa: Qué hace la gente
  /admin/metricas/enlaces   → «Links para compartir · Admin ED», activa: Links para compartir
  /admin/metricas/nada      → 404 («Admin ED»)
  ```

- 2026-09-26 — **Paso 8** (`e6ab824`): `datos/consultas/busquedas.ts`
  (`estadoDeBusquedas`, `resumenDeBusquedas(hasta)`, `DIAS_DEL_PERIODO = 28`):
  totales del período contra los 28 anteriores, las tres listas (hasta 10, por
  clics) y «Casi nos encuentran», todo con `groupBy` y
  `posicionPromedio(Σ sumaDePosiciones, Σ impresiones)`. Test contra la base
  con filas de 1999 (los de la copia usan 2001 y corren a la vez): la
  posición da 3,64 y no 11, y las variaciones +100 % y +120 %.
  `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0 (103, 102 pass, 1
  skip); lint → 0.
- 2026-09-26 — **Paso 9** (`6daea40`): `metricas/busquedas/page.tsx` (lee el
  rol para `PUEDE.configurarConexiones`), `admin/busquedas/` (`PanelBusquedas`
  62 líneas, `ConDatos` 54, `Seccion` 40, `formato.ts` 37),
  `datos/acciones/actualizar-busquedas.ts` (sesión primero, sin variables
  contesta sin registrar, `correrAMano` con 5 días); `EstadoVacio` con
  `pasos` (strings: la clave de cada `li` es el paso, sin índices);
  `ActualizarAhora` recibe su acción y pasa a `Boton` secundario;
  `Tarjeta` con `variacion` opcional; DESIGN.md §11 (estado vacío con pasos,
  las pestañas de Métricas a 390, las listas de Búsquedas). Corrige además la
  limpieza del test de la copia: con la base vacía, la primera corrida
  arranca 90 días antes y dejaba filas de 2000.
  - En el navegador, con 56 días sembrados en `ed_busquedas` y las variables
    puestas y sacadas: **sin conectar, administra** → «Conectá Search Console»
    con los cuatro pasos; **sin conectar, edita** (`edita-busquedas@ed.test`,
    perfil «busquedas-edita») → «Todavía no está conectado», sin Cuentas ni
    Ajustes; **conectado sin días** → «Los datos llegan con la primera
    copia»; **sin impresiones** (una fila `total` en 0) → «Todavía no
    aparecemos en Google en estos 28 días»; **listas sin filas** (solo
    `total` y `pagina`) → «Nada por ahora», «Todavía no hay búsquedas para
    mostrar», «Todavía ningún país»; **con datos** → 101 clics (+130 %),
    3.217 impresiones (+36 %), puesto 7,1; Casi nos encuentran: «matemática
    educativa» (puesto 14), «formación docente chile» (140 veces, nadie hizo
    clic), «talleres para docentes de matemática» (puesto 9); países en
    español con «Sin identificar» para `zzz`; **última corrida fallida** →
    el Aviso con el motivo, arriba de los datos.
  - «Actualizar ahora» con una clave falsa → «La clave privada de la cuenta
    de servicio no se pudo leer…», registrado en `corridas_de_tareas`; el
    segundo toque → «La última corrida fue hace 1 minuto; esperá un rato.»
  - Temas claro, mixto y oscuro (cookie `tema-del-admin`): todo con tokens,
    sin colores nuevos. A 390 de ancho: sin scroll horizontal de la página
    (`scrollWidth` 375), las pestañas scrollean de costado. Teclado: Tab
    recorre las cinco pestañas y «Actualizar ahora», todos con
    `:focus-visible` y outline sólido de 2 px `rgb(74, 111, 165)`
    (`azul-medio`) separado 2 px.
- 2026-09-26 — Los encabezados de 9 commits pasaban los 72 caracteres de
  AGENTS.md §9: reescritos antes del primer push con `git filter-branch
  --msg-filter` (solo la primera línea; `git diff` contra el original, vacío).
  Los hashes de arriba son los nuevos.

- 2026-09-26 — **Paso 10** (`c161c13`, `b9b1142`): ADR-0011 (con la sección
  «La migración con datos» que pidió el padre; las referencias externas
  responden 200, y la de Prisma apunta a la página de la v7, porque la sin
  versión ya describe el flujo de la 8) y su fila en el índice, con la 0009
  «enmendada por 0011»; el README (las tres variables, los cuatro pasos para
  conectar, «Las métricas y lo programado»; el link viejo a `work/metricas/`,
  que ya no existe, se fue con el párrafo); AGENTS.md §12 precisado, y para
  que diga lo mismo en todos lados también la línea de `migrations/` del árbol
  de §3 y la de lo generado en §6, más `datos/tareas/` y los `lib/` nuevos en
  el árbol. `grep -rnE "api/cron/metricas|metricas_sincronizaciones" README.md
  AGENTS.md apps/sitio/src apps/sitio/vercel.json` → sin coincidencias (exit
  1); cada link relativo nuevo apunta a un archivo que existe.

- 2026-09-26 — **work-verify** (abajo): el verificador de react-doctor dio
  93/100 por la complejidad de `PanelBusquedas` (15); se partió en
  `CabeceraDeBusquedas` y `CuerpoDeBusquedas` (`33bbcfb`) y volvió a 100. Todo
  el gate en verde sobre ese árbol.

## Next

- **PR #181** (https://github.com/bygama/Empoderamiento-Docente/pull/181),
  abierto sobre `main` en `446ab51`. La lane está en **pausa**: verificada
  (L1–L3, abajo), esperando la revisión de cierre del padre. Cuando esa
  revisión dé PASS (con su ronda de arreglos, si la hay), la lane se cierra en
  este mismo PR: un commit con el estado final y otro que borra
  `work/busquedas-de-google/` (work-handoff, modo close), como hizo #178.
- **La revisión de cierre es del padre** (1 revisor Opus 5.5, «el cambio
  entero contra su SPEC»): esta lane reporta `worker_done` con el PR abierto y
  no abre asientos propios. Sus hallazgos vuelven como una tarea a esta
  terminal.
- Nunca se mergea desde la lane. Si el padre lo pide, se rebasea sobre el
  `main` nuevo: si `seguridad-del-acceso` entra antes, choca en el README,
  `.env.example`, `docs/architecture/adrs/README.md` (su 0010) y un comentario
  de `actualizar-metricas.ts`; y si otra migración quedó después, la de esta
  lane se regenera con `--create-only` y el mismo SQL de datos.
- Fuera del repo, sin commitear: el dev server en su pestaña de Orca («dev
  busquedas-de-google», puerto 3015), la terminal «migrate busquedas», los
  perfiles aislados del navegador «busquedas-de-google» y «busquedas-edita»,
  las cuentas `busquedas@ed.test` (administra) y `edita-busquedas@ed.test`
  (edita), 56 días de búsquedas sembrados en `ed_busquedas`, un `CRON_SECRET`
  local en `.env.local` y las capturas en `%TEMP%\ed-busquedas\`.

## Verification

### 2026-09-26 — L DoD — PASS sobre el `main` nuevo (con `seguridad-del-acceso`)

Antes del primer push entró `seguridad-del-acceso` a `main` (`446ab51`). La
rama se rebaseó sobre él: tres conflictos, todos de texto, resueltos juntando
los dos lados (el comentario de `actualizar-metricas.ts` dice «proxy»; el
índice de ADRs lleva la 0010 y la 0011; el árbol de AGENTS.md §3 lleva
`bloqueos-de-acceso.ts` y `correo/`, `seguridad/` junto a `tareas/` y
`busquedas/`). Sus dos migraciones son de antes que la de esta lane, así que la
nuestra sigue última y no se regeneró: `pnpm migrate:deploy` aplicó las suyas
en `ed_busquedas`, `pnpm migrate:status` → «Database schema is up to date!», y
`pnpm migrate --create-only --name comprobar` generó una migración vacía
(«This is an empty migration.»: el esquema y las migraciones coinciden), que
se borró sin aplicar. Los hashes de este archivo son los de después del
rebase. Sobre `33bbcfb`:

- L1 static: `pnpm typecheck` → exit 0; `pnpm lint` → exit 0;
  `node scripts/verificar-react-doctor.mjs` → exit 0: «react-doctor: 100/100,
  sin diagnósticos (apps/sitio/src: 458 archivos · packages/db/src: 3 archivos
  · packages/auth/src: 13 archivos)».
- L2 behavioral: `pnpm test` → exit 0 (`packages/auth`: 16 de 16;
  `apps/sitio`: 125 tests, 124 pass, 0 fail, 1 skip); `pnpm build` → exit 0,
  con `ƒ /admin/metricas`, `ƒ /admin/metricas/[pantalla]`,
  `ƒ /admin/metricas/busquedas` y `ƒ /api/cron/diario`. El dev server,
  reiniciado con las dependencias nuevas, arranca en el 3015.
- L3 end-to-end: `curl /api/cron/diario` sin header → 401; con el secreto →
  500 con las dos corridas aisladas, `corridas_de_tareas` de 8 a 10. En el
  navegador, con la sesión de `administra` y la CSP con nonce del admin nuevo,
  `/admin/metricas/busquedas` hidrata: «Actualizar ahora» sin variables
  contesta «Search Console todavía no está conectado.».
- Close review: la abre el padre (abajo).

### 2026-09-26 — L DoD — PASS (L1–L3; la revisión de cierre es del padre)

Sobre el árbol final de código antes del rebase (entonces `04cf3ec`), en esta
sesión:

- L1 static: `pnpm typecheck` → exit 0 (`packages/db`, `packages/auth`,
  `apps/sitio`: Done); `pnpm lint` → exit 0;
  `node scripts/verificar-react-doctor.mjs` → exit 0: «react-doctor: 100/100,
  sin diagnósticos (apps/sitio/src: 446 archivos · packages/db/src: 3 archivos
  · packages/auth/src: 5 archivos)».
- L2 behavioral: `pnpm test` → exit 0 (`apps/sitio`: 103 tests, 102 pass, 0
  fail, 1 skip: las respuestas grabadas de Vercel, que esperan a A1 de la lane
  de métricas); `pnpm build` → exit 0 («Compiled successfully»; rutas
  `ƒ /admin/metricas`, `ƒ /admin/metricas/[pantalla]`,
  `ƒ /admin/metricas/busquedas`, `ƒ /api/cron/diario`). Arranca: el dev server
  en el 3015 contesta y recompila con cada cambio.
- L3 end-to-end, sobre el mismo árbol: `curl /api/cron/diario` sin header →
  401; con el `CRON_SECRET` local → 500 con las dos corridas aisladas
  (`metricas-de-vercel`: faltan las variables; `busquedas-de-google`: la
  clave falsa no se pudo leer) y `corridas_de_tareas` de 6 a 8 filas. En el
  navegador de Orca, `/admin/metricas/busquedas`: con las variables y 56 días
  sembrados, activa solo «Búsquedas», las cinco secciones, el aviso de la
  corrida fallida y las tarjetas 101 · 3.217 · 7,1; sin las variables,
  `administra` ve «Conectá Search Console» con 4 pasos y Ajustes en la
  sidebar, y `edita` ve «Todavía no está conectado», sin pasos ni Ajustes. Los
  seis estados, los tres temas, 390 de ancho y el foco con teclado, en el
  paso 9 (arriba). La migración con el historial, en el paso 2.
- Close review: **no la abre esta lane** (hija supervisada): la abre el padre
  con `worker_done` (un revisor Opus 5.5, lente «el cambio entero contra su
  SPEC»). Las marcas del PLAN que la dimensionan: `high` en los pasos 1, 2 y
  4; `medium` en 5 a 10; `low` en 3.
