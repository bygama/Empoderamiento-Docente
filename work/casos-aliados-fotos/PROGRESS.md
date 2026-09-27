# PROGRESS — Casos, Aliados y Fotos

## In progress

- 2026-09-27 — Lane 9 del XL `work/mapa-del-admin/`, rama
  `mateo/casos-aliados-fotos` desde `main` en `77611c1`. Worktree listo:
  `pnpm install`, `pnpm generate`, `.env.local` apuntado a la base propia
  `ed_casos` (creada en `ed-postgres`) y `pnpm migrate:deploy` con las 16
  migraciones de `main`. SPEC escrito desde el brief del padre, con doce
  propuestas (§12); la aprobación la da el padre por `orca orchestration ask`.
- 2026-09-27 — SPEC aprobado por el padre con las doce propuestas y tres
  resguardos (DECISIONS). PLAN de 20 pasos escrito; arranca el paso 1.

## Hecho

- **Paso 1 — el recorrido de fotos** (`d1c164b`): `lib/contenido/fotos-en.ts`
  (`fotosEn`, `cambiarFoto`) y su test. `pnpm --filter sitio exec tsx --test
  src/lib/contenido/fotos-en.test.ts` → 4 pass, 0 fail; typecheck 0.
- **Paso 2 — las fotos de `public/` en la tabla**: `Foto.url` única y
  `subidaPor` nulo; la migración `20260927030903_fotos_de_public` (creada con
  `--create-only` en una terminal de Orca, porque el aviso del índice único
  pide confirmar y el shell del agente no es interactivo) con las 47 filas
  medidas por un script que no se commitea y el dedupe de
  `origen-03-pregunta.webp` (novedad `relime-2025` → `/fotos/`); se borró
  `public/quienes-somos/`; `esSrcDeFoto` suma `investigacion` y `aliados` y
  saca `quienes-somos`. `pnpm migrate:deploy` → aplicada; `select count(*)
  from fotos where "subidaPor" is null` → 47; la novedad apunta a
  `/fotos/origen-03-pregunta.webp`; `fotos.test.ts` + `fotos-en.test.ts` → 9
  pass, 0 fail; typecheck 0; `migrate:status` al día. Commit `6ba6403`.
- **Paso 3 — los diez tipos de actividad**: `datos/actividad.ts` (tipos,
  `QUIEN_VE` todos `editarContenido`, `VA_AL_INICIO` todos sí menos
  `subio-una-foto`), sus frases en `admin/actividad/frase.ts`, su módulo
  (Contenido) y «Ver» solo para los casos en
  `admin/cuentas/actividad/modulos.ts` (DECISIONS), con `modulos.test.ts`
  nuevo. `tsx --test frase.test.ts actividad.test.ts filtros.test.ts
  modulos.test.ts` → 11 pass, 0 fail; typecheck 0. Commit `f4bd728`.
- **Paso 4 — subir una foto, probado**: `datos/acciones/subir-foto.ts`
  (`subirFotoEnBase`, con la base y el almacén inyectados; el esquema de la
  subida se mudó ahí) y `fotos.ts` queda con la sesión, la capacidad y la
  actividad `subio-una-foto`; el resultado trae el id (la grilla va a la
  ficha). `subir-foto.test.ts` (un SVG con `<script>` llamado `logo.png`
  recibe «El archivo no es una imagen jpg, png o webp.» sin fila ni archivo;
  un webp crea la fila con `subidaPor`; sin alt no sube) +
  `acciones-con-sesion.test.ts` → 16 pass, 0 fail, 0 skipped (contra
  `ed_casos`); typecheck 0.

## Abierto
