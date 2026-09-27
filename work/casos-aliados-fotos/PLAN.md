# PLAN — Casos, Aliados y Fotos

SPEC aprobado por el padre el 2026-09-27 (DECISIONS). Cada paso es un commit
Conventional en español (`docs/COMMITS.md`), con su aceptación corrida y
anotada en PROGRESS antes del siguiente.

## Lo que vale en cada paso

- **Las cuatro fronteras** (AGENTS.md §3): `packages/` y `lib/` no saben de
  ED; `datos/` es la única puerta a la base y ningún componente importa
  Prisma; `app/` son rutas; `features/` recibe props.
- **Toda Server Action** empieza por `auth.api.getSession` y sigue con
  `puede(…)` de su capacidad (`editarContenido`; `autorizarAliados` para la
  marca), valida con Zod, y lo de la base va en una función `…EnBase` con el
  cliente inyectado, probada contra el Postgres local (`ed_casos`).
- **Migraciones:** `pnpm migrate --create-only`, el SQL de datos y su
  comentario (de qué salió y cómo se generó) en el mismo archivo, y recién
  ahí `pnpm migrate`. Nunca se edita una aplicada ni se usa `db push`.
- **El sitio no cambia:** texto, links, head e imágenes iguales a `main`
  (`node scripts/comparar-render.mjs`).
- **UI:** DESIGN.md §11 manda (leerlo entero antes de tocar), solo tokens,
  cuatro tamaños de tipo, un primario por pantalla, contrastes medidos y
  escritos; componentes ≤ 200 líneas y utilidades ≤ 100.
- **El repo es CRLF:** editar con la herramienta de edición, no con reemplazos
  multilínea por script.
- `pnpm typecheck` en verde al cerrar cada paso, además de su aceptación.

## Pasos

1. **El recorrido de fotos en un JSON** — `lib/contenido/fotos-en.ts`:
   encontrar cada `{ src, alt }` con su camino y cambiar un `src` por otro,
   sin ED. Aceptación: `pnpm --filter sitio exec tsx --test src/lib/contenido/fotos-en.test.ts`
   sale 0. *(integration · medium)*
2. **Las fotos de `public/` entran a la tabla** — `fotos.url` única,
   `subida_por` nulo, la migración `fotos_de_public` con las 47 filas (alt del
   primer uso, medidas con `sharp`) y la novedad `relime-2025` pasada a
   `/fotos/origen-03-pregunta.webp`; se borra `public/quienes-somos/`, y
   `esSrcDeFoto` suma `aliados` e `investigacion` y saca `quienes-somos`.
   Aceptación: la migración aplicada en `ed_casos` (`pnpm migrate:status` al
   día), `SELECT count(*) FROM fotos WHERE subida_por IS NULL` da 47 y
   `pnpm --filter sitio exec tsx --test src/lib/contenido/fotos.test.ts` sale
   0. *(integration · high)*
3. **Los tipos de actividad de la lane** — los trece de SPEC §9 en
   `datos/actividad.ts` (quién los ve, si van al Inicio), sus frases, su
   módulo y a qué ficha lleva «Ver» en Cuentas › Actividad. Aceptación:
   `pnpm --filter sitio exec tsx --test src/admin/actividad/frase.test.ts src/datos/actividad.test.ts src/admin/cuentas/actividad/filtros.test.ts`
   sale 0. *(integration · medium)*
4. **Subir una foto, probado** — `subirFotoEnBase` con el almacén inyectado:
   rechaza un SVG por su contenido, crea la fila y anota `subio-una-foto`.
   Aceptación: su test (un SVG llamado `.png` recibe el rechazo; un webp crea
   la fila) y `acciones-con-sesion.test.ts` salen 0. *(integration · high)*
5. **Los casos en la base** — `features/investigacion/contenido/caso.ts` (los
   dos esquemas) y `modelo.ts` (ids, números, tintes, topes, rutas
   reservadas), el modelo `Caso` y la migración `casos` con los cuatro,
   validados con `esquemaCaso`. Aceptación: la migración aplicada y
   `pnpm --filter sitio exec tsx --test src/features/investigacion/contenido/caso.test.ts`
   (los cuatro de la base pasan `esquemaCaso`) sale 0. *(integration · high)*
6. **El sitio lee los casos de la base** — `datos/consultas/casos.ts`
   (`casosDelSitio`, con la vista previa), `InvestigacionEnAccion` los pasa
   por prop, los hooks los reciben, `LineasInvestigacion` apunta por id y
   recibe los slugs; se borra `data/casos.ts`. Aceptación: `pnpm build` en
   este worktree y en uno de `main`, y `node scripts/comparar-render.mjs
   <main>/apps/sitio apps/sitio` sale 0. *(integration · high)*
7. **Los aliados en la base** — `features/aliados/contenido/aliado.ts` (dos
   esquemas) y `modelo.ts` (tamaños con sus clases), el modelo `Aliado` y la
   migración `aliados` con los cinco, autorizados y con su nota. Aceptación:
   la migración aplicada y el test de los esquemas (los cinco pasan
   `esquemaAliado`) salen 0. *(integration · high)*
8. **El sitio lee los aliados de la base** — `datos/consultas/aliados.ts`
   (`aliadosDelSitio`: publicados **y** autorizados, en orden, con las
   medidas y el tipo de su foto), el layout los baja al pie, el Inicio y Qué
   hacemos los reciben por prop, `LogoDeAliado` dibuja cada uno; se borra
   `config/aliados.ts`. Aceptación: el test de la consulta (un publicado sin
   autorizar no sale, ni en la vista previa) sale 0, y `comparar-render`
   contra `main` sale 0. *(integration · high)*
9. **El registro de usos** — `datos/fotos/registro.ts` y sus cuatro
   entradas (páginas con su contenido del código, novedades, casos,
   aliados): buscar y reemplazar. Aceptación:
   `pnpm --filter sitio exec tsx --test src/datos/fotos/*.test.ts` sale 0 (una
   foto usada en una página, en una novedad, en un caso y en un aliado se
   encuentra en cada uno, con `en` bien puesto). *(integration · high)*
10. **Lo que se hace con una foto** — `datos/consultas/fotos.ts` (la grilla
    con su filtro, la ficha con «Se usa en», las fotos para elegir) y las
    acciones: editar el alt, reemplazar (transacción, después el archivo,
    frena si un uso es de código), borrar (solo sin usos), con su actividad.
    Aceptación: sus tests (reemplazar reescribe y borra el viejo después;
    frena con un uso de código; borrar frena si se usa) y
    `acciones-con-sesion.test.ts` salen 0. *(integration · high)*
11. **Los archivos sueltos, en el cron** — la tarea
    `archivos-de-fotos-sueltos` en `datos/tareas/`, registrada en
    `diarias.ts`: borra de Blob o del disco lo que ninguna fila usa y tiene
    más de un día. Aceptación: su test (con un almacén en disco temporal:
    borra el suelto viejo, deja el nuevo y el usado) sale 0. *(integration · medium)*
12. **Fotos en el admin** — `/admin/contenido/fotos` (subir, el filtro, la
    grilla) y `/[id]` (la foto, el alt, los datos, «Se usa en», reemplazar,
    borrar), y «Grilla de fotos» en DESIGN.md §11. Aceptación:
    `pnpm typecheck`, `pnpm lint` y `node scripts/verificar-react-doctor.mjs`
    salen 0. *(judgment · medium)*
13. **Elegir una foto ya subida** — `CampoFoto` suma `elegir` (el panel en
    línea con la grilla y el filtro) y `conFoco`; el README del kit y
    «Elegir una foto» en DESIGN.md §11; las páginas y las novedades le pasan
    `fotosParaElegir`. Aceptación: `pnpm typecheck`, `pnpm lint` y
    `node scripts/verificar-react-doctor.mjs` (los cuatro proyectos en 100)
    salen 0. *(judgment · high)*
14. **Casos: guardar, publicar y descartar** — las acciones y sus `…EnBase`
    (choque, 308 del slug sin cadenas, revalidar `/investigacion`), la vista
    previa y su actividad. Aceptación:
    `pnpm --filter sitio exec tsx --test src/datos/acciones/*casos*.test.ts`
    y `acciones-con-sesion.test.ts` salen 0. *(integration · high)*
15. **Casos en el admin** — la lista y la ficha (formulario por bloques,
    lámina sin foco, evidencias y producción como listas variables, caso
    provisional, «Se ve en», «Qué cambió», descartar). Aceptación: el test de
    «Qué cambió» de un caso, `pnpm typecheck`, `pnpm lint` y
    `node scripts/verificar-react-doctor.mjs` salen 0. *(judgment · medium)*
16. **Aliados: el ciclo y la marca** — crear, guardar, publicar (exige la
    marca), despublicar, descartar, borrar, subir y bajar, autorizar y quitar
    la autorización (`autorizarAliados`), con su vista previa y su
    actividad. Aceptación: sus tests (publicar sin marca frena; autorizar con
    el rol `edita` frena; borrar se lleva la fila) y
    `acciones-con-sesion.test.ts` salen 0. *(integration · high)*
17. **Aliados en el admin** — la lista en el orden de la tira y la ficha
    (la tira, «Autorización» bloqueada para quien edita, «Cómo se ve», «Se ve
    en», «Qué cambió», deshacer), y «Logo de aliado» en DESIGN.md §11.
    Aceptación: `pnpm typecheck`, `pnpm lint` y
    `node scripts/verificar-react-doctor.mjs` salen 0. *(judgment · medium)*
18. **El índice de Contenido** — las tarjetas con su estado real, el punto de
    la sidebar con casos y aliados, y se borran las guías de casos, aliados y
    fotos. Aceptación: el test del índice (el resumen de cada tarjeta, y
    `guiaDeContenido` ya sin casos, aliados ni fotos) sale 0. *(integration · low)*
19. **Dos pendientes del Inicio** — «N aliados sin autorizar» (dirige y
    administra) y «N fotos sin texto alternativo». Aceptación: sus tests
    (quién ve cada fila; la frase con uno y con varios) salen 0. *(integration · medium)*
20. **Los documentos** — AGENTS.md §3 y §5.4, el README, el spec del admin §6
    y `docs/content/aliados-fuentes-drive.md`. Aceptación: `grep -rn
    "config/aliados" AGENTS.md README.md docs/ apps/` solo encuentra la
    historia (ADRs y specs viejos), y los links de los documentos tocados
    apuntan a archivos que existen. *(mechanical · low)*

Después del paso 20, work-verify: el gate entero, las migraciones desde cero,
`comparar-render` contra `main` y el recorrido de punta a punta en el
navegador de Orca (SPEC §14).
