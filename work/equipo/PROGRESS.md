# PROGRESS — Equipo

## In progress

- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_equipo` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las 22 migraciones de `main` (`d051c6a0`).
- 2026-09-27 — SPEC.md escrito desde el brief del padre (lane 8b), con 16
  propuestas (§13); la cuenta de las publicaciones, en DECISIONS.
- 2026-09-27 — **SPEC aprobado por el padre** con el cambio J (sin arrastre:
  «Subir» y «Bajar» como Aliados) y las precisiones H y N (DECISIONS).
  PLAN.md escrito: 13 pasos; el 11 y el 12 esperan a la lane 9.

## Hecho

- **Paso 1 — los esquemas de una persona** (`13140059`):
  `features/quienes-somos/contenido/` suma `modelo-del-equipo.ts` (niveles
  con su rótulo y sus lugares, colores, composiciones, figuras, topes y
  `rotuloDePublicacion`, los cuatro rótulos de §5.2), `campos-de-persona.ts`
  (slug, foto, renglones, clave, `sinRepetir`), `etapa.ts` (hitos, ramas,
  territorios y la publicación `biblioteca | sin-link`, una destacada por
  etapa, un material una vez por etapa), `persona.ts` (`esquemaPersona` y
  `esquemaBorrador`, el recorrido con sus categorías, figura y cierre, la
  categoría de cada etapa entre las del recorrido al publicar, foto o «Sin
  foto») y `persona-vacia.ts`; `/equipo/` entra a `esSrcDeFoto`. Los textos
  de una línea reusan `linea`/`opcional`/`deLaLista` de la Biblioteca.
  `pnpm --filter sitio exec tsx --test src/features/quienes-somos/contenido/persona.test.ts`
  → 7 pass, 0 fail; `pnpm typecheck` 0; eslint de los archivos nuevos 0.
- **Paso 2 — la migración `equipo` y la FK** (`4b5daf56`):
  `prisma/schema/equipo.prisma` (modelo `Persona`, tabla `equipo`) y
  `Autoria.personaId` con su relación `SET NULL`; la migración
  `20260927060356_equipo` (esquema de `migrate diff`, partido para mover los
  datos antes del `DROP`): la tabla, el índice parcial de la Dirección
  general, los 15 perfiles con ids fijos (generados por un script que valida
  con `esquemaPersona`: 64 referencias a la Biblioteca, 14 `sin-link`, 7
  detalles vacíos), `persona` → `persona_id` con un `RAISE` si alguna clave
  no mapea, los borradores de materiales reescritos, los 5 materiales nuevos
  con sus autorías y los 2 títulos corregidos (DECISIONS). La Biblioteca:
  `persona` pasa a `z.uuid()` y `personaQueNoEsta` la chequea al crear,
  guardar y publicar; las opciones salen de `equipo`
  (`ficha-de-material.ts`); `publicadoDe`, `autoriasDe` y `conPersonas` leen
  `personaId`. Probado antes de aplicar con un borrador sembrado con
  `karla-gomez`, `null` y `no-existe` → quedó `[id de Karla, null, null]`.
  En `ed_equipo`: 15 en `equipo`, 62 en `materiales`, 74 autorías con
  persona y 0 huérfanas; `pnpm migrate:status` al día; `migrate diff` →
  «This is an empty migration.»; el checksum resiste el checkout en CRLF.
  `pnpm --filter sitio exec tsx --test` de los 6 archivos de la Biblioteca
  → 21 pass, 0 fail (con «una persona que no está en el Equipo no se
  guarda»); `pnpm test` → sitio 427 pass, 0 fail, 1 saltado (el de
  antes); auth 46; kit 3; `pnpm --filter sitio typecheck` 0; eslint de
  `src/datos` y `src/features/biblioteca` 0.

## Abierto

- La lane 9 (`casos-aliados-fotos`) no está en `main`: el registro de usos de
  fotos, los cambios de la tabla `fotos` y el orden de Aliados son suyos
  (SPEC §6.2 y §9; PLAN pasos 11 y 12).
- Fase 4: los ~110 KB del recorrido viajan en el payload del HTML de
  `/quienes-somos` (lo mismo que hoy pesa el `data.ts` en el bundle); cargar
  el perfil al abrirlo es de la fase 4 (nota del padre al aprobar).
