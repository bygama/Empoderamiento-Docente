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
