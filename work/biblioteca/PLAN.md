# PLAN — Biblioteca

SPEC aprobado por el padre el 2026-09-26, con las precisiones C e I
(DECISIONS). Lo ejecuta work-run en este worktree; cada paso es un commit, con
su aceptación y su línea en PROGRESS.

## Restricciones de todo el cambio

- **El molde es el de Novedades** (ADR-0014): se copia con las columnas de un
  material. Novedades se toca solo en su relación con `materiales` (paso 4):
  la lane 9 copia el mismo molde en paralelo, y generalizarlo ahora chocaría
  con ella.
- **Toda Server Action** empieza por `auth.api.getSession` y sigue con
  `puede(rol, "editarBiblioteca")` (`acciones-con-sesion.test.ts`); cada
  página del módulo chequea la capacidad antes de leer, y el layout pasa por
  `<Guarda>` (`guarda.test.ts`).
- **Las fronteras**: `lib/red/` y `lib/metadatos/` no importan nada de la app
  (ni un `@/`); ningún componente importa Prisma; `features/` recibe props.
- **Sin dependencias nuevas.** Aplicar una migración nunca depende de la red.
- **El sitio queda igual**: `scripts/comparar-render.mjs` contra
  `%LOCALAPPDATA%\Temp\ed-biblioteca-base` (el build de `main`, `77611c1`); la
  única diferencia permitida es «Copiar cita APA» en `/biblioteca` (paso 14).
- **UI del admin**: DESIGN.md §11 manda (designing-consistently antes de cada
  pantalla, frontend-design para lo visual); tokens, cuatro tamaños de tipo,
  un primario por pantalla, contrastes medidos; lo nuevo se escribe en §11 en
  el paso que lo estrena.
- **Topes**: componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md §6).
- **El repo es CRLF**; los commits en español, atómicos, nunca `git add -A`.

## Pasos

1. **El modelo de un material** — `features/biblioteca/contenido/`:
   `modelo.ts` (`TIPOS`, `TEMAS`, `PUBLICOS`, `FORMATOS`, `TOPES`,
   `LUGARES_DE_DESTACADO`, `accionDe`, `fechaDelSitio`, `anioDe`, `firmaDe`,
   `borradorVacio`), `material.ts` (`esquemaMaterial`, `esquemaBorrador`, los
   tipos `Material`, `BorradorDeMaterial`, `MaterialDelSitio`), `cita.ts`
   (`citaApa`) y `parecidos.ts` (`sonParecidos`), con sus tests.
   Aceptación: `pnpm --filter sitio exec tsx --test "src/features/biblioteca/contenido/*.test.ts"` → exit 0; `pnpm typecheck` → exit 0.
   *(judgment · high)*

2. **Las tablas y los 57** — `prisma/schema/materiales.prisma` (`Material`,
   `Autoria`), la migración `biblioteca` con `--create-only` y su SQL de datos
   (generado desde `materiales.ts` por un script fuera del repo que valida cada
   fila con `esquemaMaterial` del paso 1 y pide las citas a Crossref una vez),
   y `biblioteca/portadas` entre las carpetas de fotos de
   `lib/contenido/fotos.ts`.
   Aceptación: `pnpm migrate` aplica; `pnpm migrate:status` → «up to date»;
   `psql` sobre `ed_biblioteca`: 57 materiales publicados, 36 con DOI, 4
   destacados (1 a 4), 3 con `autores` escrita, cada material con al menos una
   autoría; `pnpm typecheck` → exit 0.
   *(judgment · high)*

3. **El sitio lee los materiales de la base** — `datos/consultas/materiales.ts`
   (`materialesDelSitio`, `destacadosDelSitio`, `publicadoDe`: publicados, o
   como quedarían en vista previa; orden por año y `creado_en`), y
   `/biblioteca` (catálogo y destacados) y el Inicio (`BibliotecaNovedades`)
   por props; `data/materiales.ts` queda solo para Novedades.
   Aceptación: `pnpm --filter sitio exec tsx --test src/datos/consultas/materiales.test.ts` → exit 0; `pnpm build` → exit 0;
   `node scripts/comparar-render.mjs "$env:LOCALAPPDATA/Temp/ed-biblioteca-base" apps/sitio` → exit 0.
   *(integration · high)*

4. **Novedades abre un material de la base** — la migración
   `material_de_las_novedades` (`material_id` con fk `SET NULL`, la columna y
   los borradores convertidos, `publicacion` borrada), la clave `material` en
   los esquemas de una novedad, su select desde la base (usa
   `materialesParaElegir` de `datos/consultas/materiales.ts`), «Qué cambió» y
   la ficha del sitio con el material resuelto; `data/materiales.ts` se borra.
   Aceptación: `pnpm migrate` aplica; `pnpm --filter sitio test` → 0 fail;
   `pnpm build` y `comparar-render` → exit 0; `git ls-files apps/sitio/src/features/biblioteca/data` → vacío.
   *(integration · high)*

5. **El pedido protegido** — `lib/red/`: la URL (solo `https:`, puerto 443,
   sin credenciales), las IP que no se piden (v4 y v6), el `lookup` propio que
   conecta a la IP chequeada, cada redirección chequeada otra vez (hasta 5),
   2 MB, 8 s, sin cookies. Expone `pedirProtegido(url, opciones)`. Tests con
   el resolvedor y el pedido inyectados, sin red.
   Aceptación: `pnpm --filter sitio exec tsx --test "src/lib/red/*.test.ts"` → exit 0.
   *(judgment · high)*

6. **Leer los datos de afuera** — `lib/metadatos/`: `reconocerEntrada` (DOI,
   ISBN con su dígito, link), `leerCrossref`, `leerOpenAlex`,
   `leerEtiquetas` (`citation_*` y Open Graph, sin parser de HTML) y el
   resumen JATS a texto; tests con respuestas grabadas.
   Aceptación: `pnpm --filter sitio exec tsx --test "src/lib/metadatos/*.test.ts"` → exit 0.
   *(integration · medium)*

7. **Las acciones de un material** — en `datos/acciones/`: crear, guardar,
   publicar (autorías reemplazadas, el lugar de destacado soltado, el chequeo
   reiniciado si cambió el link), ocultar, descartar, borrar y la vista previa,
   con el choque, el DOI repetido en el campo y la revalidación; los cinco
   tipos de actividad con su frase, `QUIEN_VE`, `VA_AL_INICIO` y su módulo.
   Tests contra la base.
   Aceptación: `pnpm --filter sitio exec tsx --test "src/datos/acciones/*material*.test.ts" src/datos/acciones/acciones-con-sesion.test.ts src/datos/actividad.test.ts src/admin/actividad/frase.test.ts` → exit 0; `pnpm typecheck` → exit 0.
   *(integration · high)*

8. **Buscar datos** — la acción `buscarDatosDeMaterial({ entrada })` (sesión y
   capacidad primero): las fuentes en orden con `pedirProtegido` (paso 5) y los
   lectores del paso 6, la marca de origen por campo, el tipo de la fuente
   pasado a uno de los 7, el DOI repetido y los títulos parecidos
   (`sonParecidos`, paso 1). Tests con el pedido inyectado.
   Aceptación: `pnpm --filter sitio exec tsx --test "src/datos/biblioteca/*.test.ts"` → exit 0.
   *(integration · medium)*

9. **La salud de los links** — la tarea `salud-de-links` en `TAREAS_DIARIAS`:
   lo vencido hace 7 días, hasta 15 por corrida y de a 5, los DOI en doi.org,
   el resto con `pedirProtegido`, qué es `roto` y qué `sin-respuesta`, el
   resultado en el material y el detalle de la corrida.
   Aceptación: `pnpm --filter sitio exec tsx --test src/datos/tareas/salud-de-links.test.ts src/lib/tareas/corredor.test.ts` → exit 0.
   *(integration · medium)*

10. **La lista del admin** — el layout con la guarda, `error.tsx`,
    `/admin/biblioteca` con los filtros Tipo, Estado y Salud, el buscador, el
    paginado, la `Lista` con miniatura (extendida en su archivo y en §11) y
    las insignias; la guía sale de `admin/por-hacer/guias.ts`.
    Aceptación: `pnpm --filter sitio exec tsx --test src/admin/armazon/guarda.test.ts src/datos/consultas/lista-de-materiales.test.ts` → exit 0; `pnpm typecheck`, `pnpm lint` → exit 0.
    *(integration · medium)*

11. **La ficha de un material** — `/admin/biblioteca/[id]` y el paso 2 de
    `/nuevo`: el formulario a mano (autores con el Equipo, la firma, la
    portada generada con «Usar otra», la cita con «Volver a la generada», el
    destacado), el panel (salud y «Se ve en»), «Qué cambió» y «Deshacer o
    sacar del sitio», y la portada en vivo por una ruta del admin.
    Aceptación: `pnpm --filter sitio exec tsx --test "src/admin/biblioteca/*.test.ts"` → exit 0; `pnpm typecheck`, `pnpm lint`, `node scripts/verificar-react-doctor.mjs` → exit 0.
    *(judgment · medium)*

12. **Agregar por DOI, ISBN o link** — el paso 1 de `/nuevo`: «Buscar datos»
    (llama a `buscarDatosDeMaterial`, paso 8), «Cargar a mano», las marcas «De
    Crossref» que se van al editar, y los avisos de parecido y de DOI
    repetido.
    Aceptación: `pnpm typecheck`, `pnpm lint`, `node scripts/verificar-react-doctor.mjs` → exit 0.
    *(integration · medium)*

13. **Lo que el módulo le suma al admin** — el número de la sidebar (los links
    rotos), la fila de pendientes del Inicio (a la lista filtrada por Link
    roto), el acceso rápido «Agregar material», y en Cuentas › Actividad el
    link «Ver el material».
    Aceptación: `pnpm --filter sitio exec tsx --test "src/datos/inicio/*.test.ts" "src/admin/cuentas/actividad/*.test.ts"` → exit 0; `pnpm typecheck` → exit 0.
    *(mechanical · low)*

14. **La portada generada y «Copiar cita APA» en el sitio** —
    `/biblioteca/portada/[id]` (`next/og`, estática, solo publicados sin
    portada propia) y el botón en la tarjeta del catálogo.
    Aceptación: `pnpm build` → exit 0; `comparar-render` → la única
    diferencia es «Copiar cita APA» en `biblioteca.html` (y nada en las demás).
    *(integration · medium)*

15. **Los docs** — el ADR-0015 (agregar por DOI, la defensa de SSRF y la salud
    de los links), AGENTS.md §3 y §12, el README (la tarea nueva), el spec del
    admin §5 y §6, y DESIGN.md §11 (lo que no entró en los pasos de UI).
    Aceptación: `git diff --stat main -- docs AGENTS.md README.md DESIGN.md` muestra los cinco; `pnpm lint` → exit 0.
    *(judgment · medium)*
