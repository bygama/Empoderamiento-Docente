# PROGRESS — Biblioteca

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_biblioteca` con las 16 migraciones de `main` aplicadas
  (`pnpm migrate:deploy` → «All migrations have been successfully applied»),
  `.env.local` copiado y apuntado a ella.
- 2026-09-26 — **Build de base** para `scripts/comparar-render.mjs`: `pnpm
  build` sobre `77611c1` (el código de `main`), exit 0, guardado en
  `%LOCALAPPDATA%\Temp\ed-biblioteca-base\.next`.
- 2026-09-26 — SPEC.md escrito desde el brief del padre (lane 8a de
  `work/mapa-del-admin/`), con catorce propuestas (§16).
- 2026-09-26 — **SPEC aprobado por el padre** con dos precisiones, C e I
  (DECISIONS). PLAN.md escrito: 15 pasos.

- **Paso 1 — el modelo de un material** (`a613d95`).
  `features/biblioteca/contenido/`: `modelo.ts` (listas cerradas, topes,
  `fechaDelSitio`, `anioDe`, `firmaDe` con `Intl.ListFormat`, `accionDe`,
  `borradorVacio`), `material.ts` (`esquemaMaterial` y `esquemaBorrador`; la
  persona se valida contra las 15 claves de `equipo.ts`; el DOI se normaliza;
  la fecha sin día), `cita.ts` (`citaApa`, `partirNombre`, `iniciales`) y
  `parecidos.ts` (`sonParecidos`, umbral 0,75: con 0,8 un título con dos
  palabras de menos no se parecía). `lib/metadatos/doi.ts` (`normalizarDoi`,
  `linkDelDoi`), y `biblioteca/portadas` entre las carpetas de fotos
  (DECISIONS). Aceptación: `pnpm exec tsx --test "src/features/biblioteca/contenido/*.test.ts" "src/lib/metadatos/*.test.ts" "src/lib/contenido/*.test.ts"`
  → 66 pass, 0 fail; `pnpm typecheck` → exit 0.

- **Paso 2 — las tablas y los 57.** `prisma/schema/materiales.prisma`
  (`Material`, `Autoria`) y la migración `20260927030549_biblioteca`, creada
  con `pnpm migrate --create-only --name biblioteca` y completada antes de
  aplicarse con el SQL de datos y su comentario (de dónde sale cada cosa). El
  SQL lo generó un script que no se commitea (guardado en
  `%LOCALAPPDATA%\Temp\ed-biblioteca\generar.tmp.ts`, con las 36 fichas de
  Crossref bajadas el 2026-09-27 al lado): valida cada fila con
  `esquemaMaterial`, comprueba que las 54 firmas que son una lista dan el texto
  de hoy letra por letra y que ningún par de títulos de hoy «se parece». Las
  citas de Crossref se armaron con los nombres de ED (Crossref parte mal
  algunos, como «Melendres, M. B.»), salvo la de COVID-19, que lleva los trece
  de Crossref; la tesis, a mano; las 20 restantes, nulas (la generada).
  Aceptación: `pnpm migrate` → aplicada; `pnpm migrate:status` → «Database
  schema is up to date!» (17 migraciones); `psql`: 57 publicados, 36 con DOI,
  4 destacados (1 a 4), 3 con `autores` escrita, 37 citas guardadas; 134
  autorías, 69 con persona (13 personas distintas); 0 materiales sin autoría;
  `pnpm typecheck` → exit 0.
