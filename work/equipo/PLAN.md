# PLAN — Equipo

SPEC aprobado por el padre el 2026-09-27, con el cambio J (sin arrastre) y
las precisiones H y N (DECISIONS). Tier L, un worktree, rama `mateo/equipo`.
Cada paso es un commit (o más, si el paso lo dice) y deja el gate en verde.

## Constraints

- **Español** en código, comentarios, docs y commits; la UI en voseo y
  lenguaje inclusivo, nunca «alumnos». Commits Conventional según
  `docs/COMMITS.md`, atómicos, nunca `git add -A`, nunca `--no-verify`;
  push y PR sin pedir OK, **nunca mergear**.
- **Las cuatro fronteras:** `packages/` sin ED; `datos/` es la única puerta a
  la base y ningún componente importa Prisma; `app/` son rutas; `features/`
  recibe props. Toda Server Action empieza por `auth.api.getSession` y sigue
  con `editarContenido` (o `editarBiblioteca` en lo de la Biblioteca); toda
  `page.tsx` chequea su capacidad antes de leer.
- **El sitio no cambia** salvo lo que el SPEC §8.2 lista: `comparar-render`
  contra `main` y el script de las 78 tarjetas lo prueban (paso 3 y cierre).
- **Topes de tamaño:** componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md
  §6); al partir, las piezas van a una subcarpeta con el nombre del
  compositor (AI_GUIDELINES §2).
- **Base propia `ed_equipo`**; una migración aplicada no se edita; `db push`
  está bloqueado. El repo es CRLF: un reemplazo multilínea por script
  normaliza antes.
- **UI:** DESIGN.md §11 manda (skill `designing-consistently`, §11 leído
  entero antes de tocar; `frontend-design` para decidir lo visual); los tres
  temas, 390 de ancho y el teclado, probados en el navegador de Orca contra
  el dev server del **3030** (su propia pestaña, con `NEXT_PUBLIC_SITE_URL`
  pisada, siempre por `localhost`).
- **La lane 9 entra antes:** el paso 10 (la lista, por «Lista que se ordena»)
  y el 11 (fotos) la esperan. Si al llegar no está en `main`, se anota en
  PROGRESS y se sigue con el paso siguiente que no dependa de ella; al
  entrar, se rebasea y se vuelve.

Comandos de una prueba sola: `pnpm --filter sitio exec tsx --test <archivo>`.

## Pasos

1. **Los esquemas de una persona.** `features/quienes-somos/contenido/modelo.ts`
   (los cuatro niveles con su rótulo y cuántos lugares tienen, composiciones,
   colores, topes, el rótulo de la tarjeta de §5.2, la persona vacía) y
   `persona.ts` (`esquemaPersona` y `esquemaBorrador`, la publicación
   `biblioteca | sin-link` de §5.1, una destacada por etapa, la categoría de
   cada etapa entre las del perfil, foto o «Sin foto»); `/equipo/` entra a
   las carpetas de `esSrcDeFoto`. Con `persona.test.ts`.
   Acepta: `pnpm --filter sitio exec tsx --test src/features/quienes-somos/contenido/persona.test.ts`
   sale 0; `pnpm typecheck` sale 0. *(judgment · high)*

2. **La migración `equipo` y la FK de las autorías.** `prisma/schema/equipo.prisma`
   y `Autoria.personaId` con su relación; la migración con `--create-only`
   (o `migrate diff`, como la 8a) y su SQL de datos, generado por un script
   que no se commitea desde `data/equipo.ts` validando con `esquemaPersona`
   del paso 1: los 15 publicados en su orden, el índice parcial de la
   Dirección general, `persona` → `persona_id` (y los borradores de
   materiales), los 5 materiales de §5.3 con sus autorías y su cita de
   Crossref bajada una vez, los 2 títulos cortos si la fuente los da enteros
   (H), el detalle vacío donde dice la fuente y el de Gedisa. En el mismo
   commit, la Biblioteca pasa a `personaId`: la persona se valida en la
   base al guardar y publicar un material, y las opciones salen de `equipo`
   (`campos-del-material.ts`, `ficha-de-material.ts`, `publicar-materiales.ts`,
   `materiales.ts`); con su test (una persona que no existe no se guarda).
   Acepta: `pnpm migrate:deploy` y `pnpm migrate:status` al día en
   `ed_equipo` recreada desde cero; en psql, 15 filas en `equipo`, 62 en
   `materiales` y ninguna autoría con `persona_id` que no esté en `equipo`;
   `pnpm --filter sitio exec tsx --test src/datos/acciones/editar-materiales.test.ts`
   sale 0; `pnpm typecheck` sale 0. *(judgment · high)*

3. **El sitio lee el equipo de la base.** `datos/consultas/equipo.ts`
   (`equipoDelSitio()`: los publicados por nivel y orden, la vista previa, el
   recorrido y sus publicaciones resueltas contra `materialesDelSitio()`,
   `leerSinRomper` y `cache`), los tipos del sitio (`Persona`, `Profile`, …)
   mudados a `features/quienes-somos/contenido/` sin `bio`, `linkedin` ni
   `pubs`, `ImpulsanEd` por props desde la página y los componentes del
   perfil con sus imports nuevos; publicar, ocultar o borrar un material
   regenera también `/quienes-somos` (P); `docs/content/equipo-sin-publicar.md`
   con la bio y el LinkedIn de cada persona; `data/equipo.ts` se borra. Con
   `equipo.test.ts` (orden, vista previa, una referencia oculta o que la
   persona no firma no sale, las `sin-link` salen).
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/consultas/equipo.test.ts`
   sale 0; `pnpm build` sale 0; `node scripts/comparar-render.mjs <main> apps/sitio`
   (main buildeado en un worktree aparte contra una base recién migrada)
   difiere solo en `/biblioteca`; el script de las tarjetas da exactamente
   las diferencias de §8.2, con su salida en PROGRESS. *(integration · high)*

4. **El ciclo de un perfil en la base.** `datos/acciones/editar-equipo.ts`
   (crear, guardar con choque, descartar, borrar: la fila, sus redirecciones y
   la persona en los borradores de materiales), `publicar-equipo.ts`
   (publicar con 308, la Dirección general una sola, la Dirección hasta dos,
   cada publicación existe y la persona la firma, último en su nivel si
   cambió; despublicar) y `equipo-en-base.ts` (errores en el campo,
   `columnasDe`, cómo se llama en llano). Con `editar-equipo.test.ts` y
   `publicar-equipo.test.ts`.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/acciones/editar-equipo.test.ts src/datos/acciones/publicar-equipo.test.ts`
   sale 0. *(judgment · high)*

5. **Mover dentro del nivel.** `moverPersonaEnBase({ id, hacia })`: un paso
   dentro de su nivel, en una transacción; en la punta, no se mueve y lo
   dice. Con su test.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/acciones/mover-equipo.test.ts`
   sale 0. *(integration · medium)*

6. **Las Server Actions, la vista previa y la actividad.** `datos/acciones/equipo.ts`
   (crear, guardar, borrar, mover) y `ciclo-de-equipo.ts` (publicar,
   despublicar, descartar), la vista previa del perfil, la revalidación de
   `/quienes-somos` y del admin; los cinco tipos de §10 en `datos/actividad.ts`
   (quién ve, `VA_AL_INICIO`), su frase en `admin/actividad/frase.ts` y su
   módulo en Cuentas › Actividad.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts src/datos/actividad.test.ts`
   sale 0 (con los nombres nuevos cubiertos); `pnpm typecheck` sale 0.
   *(integration · high)*

7. **La ficha de un perfil: la tarjeta.** `/admin/contenido/equipo/nuevo` y
   `/[id]` (cada página chequea `editarContenido` antes de leer),
   `datos/consultas/ficha-de-persona.ts`, `admin/equipo/` con la «Ficha de
   una entidad»: el encabezado (← Equipo, insignia, Guardar borrador · Vista
   previa · Publicar), los bloques «La tarjeta» y «La URL», el panel «Se ve
   en», «Qué cambió» y «Deshacer o sacar del sitio». Sirve entero para un
   perfil sin recorrido.
   Acepta: `pnpm typecheck`, `pnpm lint` y `node scripts/verificar-react-doctor.mjs`
   salen 0 (100/100); en el navegador, crear un perfil de prueba sin
   recorrido, guardarlo, publicarlo y verlo en `/quienes-somos`, anotado en
   PROGRESS. *(integration · medium)*

8. **La ficha: el recorrido.** Los bloques «El recorrido» (la casilla, los
   datos, la formación y las categorías), «La figura» y «El cierre», con
   «Qué cambió» sumándolos.
   Acepta: typecheck, lint y react-doctor salen 0; en el navegador, editar el
   titular y el cierre de un perfil, la vista previa los muestra, publicar.
   *(integration · medium)*

9. **La ficha: las etapas y sus publicaciones.** «Las etapas» (lista
   variable, cada una con lo que su composición usa: cita, hitos, ramas,
   territorios, publicaciones `biblioteca` o `sin-link`) y «En la
   Biblioteca» (lo que firma y dónde está en el perfil, con «Agregar en
   Biblioteca»); «Qué cambió» etapa por etapa.
   Acepta: typecheck, lint y react-doctor salen 0; en el navegador, sumar a
   una etapa un material que la persona firma, marcarlo destacado,
   publicar y verlo en su perfil abierto. *(judgment · medium)*

10. **«Agregar en Biblioteca» con la persona elegida.** `/admin/biblioteca/nuevo?persona=<id>`
    chequea que exista y se la pasa a `AgregarMaterial`: «Cargar a mano» la
    pone de primera autora; «Buscar datos» la vincula por nombre (palabra
    por palabra, sin mayúsculas ni tildes) o avisa. Con el test de la
    función que vincula.
    Acepta: `pnpm --filter sitio exec tsx --test <el test de vincular>` sale
    0; en el navegador, desde la ficha de un perfil, agregar por DOI un
    material que la nombra y ver el vínculo hecho. *(integration · medium)*

11. **La lista del Equipo.** `/admin/contenido/equipo` (chequea su
    capacidad antes de leer): «Nuevo perfil», la `Lista` con miniatura por
    nivel, las insignias, «Subir» y «Bajar» con el patrón de Aliados
    (§6.2, la lane 9) y «Editar»; la tarjeta de Equipo en el índice de
    Contenido con su estado, el punto de Contenido contando los perfiles con
    cambios sin publicar, y la guía de Equipo fuera de `admin/por-hacer/`.
    «Lista que se ordena» sube a regla de DESIGN.md §11 (y lo compartido,
    si se duplica, a `admin/armazon/`). **Espera a la lane 9.**
    Acepta: typecheck, lint y react-doctor salen 0; en el navegador, mover a
    alguien con el teclado y verlo en `/quienes-somos` en su lugar nuevo.
    *(integration · medium)*

12. **Las fotos del equipo.** La migración `fotos_del_equipo` (las 15 de
    `public/equipo/`, medidas del archivo, el alt de su primer uso) y la
    entrada del Equipo en el registro de usos (`datos/fotos/del-equipo.ts`:
    buscar y reemplazar en la tarjeta y la figura, publicado y borrador); el
    campo de foto de la ficha con «Elegir de Fotos». **Espera a la lane 9.**
    Acepta: `pnpm migrate:status` al día; el test del registro (el de la 9,
    con Equipo sumado) sale 0; en el navegador, la ficha de una foto del
    equipo dice «Se usa en» con su perfil. *(integration · high)*

13. **Los documentos.** AGENTS.md §3 (el árbol) y §13 (Equipo, hecho); el
    README; el spec del admin §6 (el origen de `equipo`, la FK de
    `autorias`, dónde quedaron la bio y el LinkedIn); DESIGN.md §11 si el
    paso 9 dejó algo nuevo (la lista variable anidada). *(mechanical · low)*

La verificación entera (el gate, `comparar-render` final, el recorrido de
punta a punta con una cuenta `edita`, los tres temas, 390 y el teclado) es de
work-verify, después del paso 13; la revisión de cierre la lanza el padre.
