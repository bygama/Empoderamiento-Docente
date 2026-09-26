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

## Hecho

## Abierto
