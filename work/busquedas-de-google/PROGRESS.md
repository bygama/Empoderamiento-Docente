# PROGRESS — Búsquedas de Google

## In progress

- Paso 1 del PLAN.

## Done

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_busquedas` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las migraciones de `main` aplicadas.
- 2026-09-26 — SPEC.md escrito desde el brief del padre (lane 5 del XL
  `work/mapa-del-admin/`), con la API de Search Analytics y el token de cuenta
  de servicio verificados contra la documentación oficial de Google.

- 2026-09-26 — SPEC aprobado por el padre (opción A en §9.1, nota en §9.9;
  DECISIONS.md). PLAN.md escrito: 10 pasos.

- 2026-09-26 — **Paso 1** (`f1e8470`): `lib/tareas/registro.ts` (`Tarea`,
  `ResultadoDeTarea`, `definirTareas`, que rechaza claves repetidas) y
  `lib/tareas/corredor.ts` (`correrTareas(tareas, { registrar, limiteMs })`:
  todas a la vez, aisladas, con tiempo máximo, y registrar sin frenar a las
  otras), con 4 tests. `pnpm --filter sitio test` → exit 0 (84 tests, 83 pass,
  1 skip: el de las respuestas grabadas de Vercel, que espera a A1);
  `pnpm typecheck` → exit 0.

- 2026-09-26 — **Paso 2** (`65fb2a8`): `tareas.prisma` (`CorridaDeTarea`) y
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

- 2026-09-26 — **Paso 3** (`94d8528`): `PUEDE.configurarConexiones`, hoy
  solo `administra`. `pnpm typecheck` → exit 0; `git diff --stat main --
  packages/auth` → solo `permisos.ts` (6 líneas).
- 2026-09-26 — **Paso 4** (`cbb7308`): `lib/busquedas/` con `tipos.ts`
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

- 2026-09-26 — **Paso 5** (`aced4ee`): `lib/busquedas/lecturas.ts`
  (`posicionPromedio`, `ordenarPorClics`, `casiNosEncuentran` con
  `PUESTOS_CASI`, `MINIMO_DE_IMPRESIONES`, `MUCHAS_IMPRESIONES`, `POCOS_CLICS`,
  `MAXIMO_CASI` y la razón de cada fila) y `lib/busquedas/paises.ts`
  (`nombreDelPais`, 40 líneas: 264 pares alfa-3 → alfa-2 de CLDR 48.2, tag
  `release-48-2`, filtrados y comentados como pidió el padre). 4 tests.
  `pnpm typecheck` → 0; `pnpm --filter sitio test` → 0 (98, 97 pass, 1 skip);
  lint → 0.
- 2026-09-26 — **Paso 6** (`6cba1f1`): `datos/tareas/busquedas-de-google.ts`
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
- 2026-09-26 — **Paso 7** (`1be1c32`): `pestanaActiva(ruta, hrefs)` en
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

## Next

- Los pasos 1 a 10 del PLAN, en orden; después work-verify y el PR.
