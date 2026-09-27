# PROGRESS — El cierre del mapa del admin

## In progress

- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado (base `ed`, esta lane no migra). Dev server en el 3032, en su
  propia pestaña de Orca. Cuentas de prueba `cierre-administra@ed.test` y
  `cierre-edita@ed.test`.
- 2026-09-27 — SPEC.md escrito desde el brief del padre, con 7 propuestas
  (§10). **Aprobado por el padre tal cual** (DECISIONS). PLAN.md escrito: 11
  pasos.
- 2026-09-27 — Para comparar: un worktree de `main` en
  `%TEMP%/ed-cierre-antes` (`910dabf5`, desacoplado), con `pnpm install`,
  `pnpm generate` y `pnpm build` en verde. Se borra al cerrar.

## Hecho

- **Paso 1 — `linkDelDoi` por segmento** (`132e9a89`): `lib/metadatos/doi.ts`
  codifica cada segmento con `encodeURIComponent` y conserva las `/`; test
  nuevo en `doi.test.ts` (`#`, `?`, `%`, espacio, y un DOI con varias
  barras). RED antes del cambio (exit 1), GREEN después: `tsx --test
  doi.test.ts metadatos.test.ts` → 8 pass, 0 fail; `buscar-datos.test.ts` y
  `cita.test.ts` → 7 pass. Los 40 DOI de `ed` salen iguales codificados (0
  cambian), así que el render no cambia.
- **Paso 2 — las dos portadas** (`8dc0d103`): `grep` de `44-resignificacion`
  y `57-juguemos` en `apps/sitio/src`, `scripts`, `docs`, `packages` y los
  `.md` de la raíz → exit 1 (nada); `pg_dump --data-only` de `ed` entero → 0
  menciones (y 55 de `biblioteca/portadas/`, así que la búsqueda anda);
  `CARPETAS_DE_FOTOS` es una regex de validación, no un listado. Borradas.
- **Paso 3 — `por-hacer/` y `[modulo]`** (`c06ea0cf`): borrados
  `admin/por-hacer/` (2 archivos), `(protegido)/[modulo]/page.tsx`, el test
  «los módulos que todavía son una guía…» de `guarda.test.ts` y `moduloDe` de
  `barra-lateral/modulos.ts`, que nació con esa ruta (`cde864cf`) y nadie más
  usaba. `grep por-hacer|guiaDe|GuiaDelModulo` → nada; `pnpm typecheck` 0;
  `guarda.test.ts` 6 pass. Con sesión: `/admin/nope` y `/admin/nope/mas` →
  404 «Página no encontrada | Empoderamiento Docente» (antes, el primero daba
  404 «Admin ED»); `/admin` y `/admin/ajustes` 200; sin sesión `/admin/nope`
  → 307 a entrar, como antes.
- **Paso 4 — `datos/actividad/`** (`784641a3`): `index.ts` (99 líneas)
  compone 13 módulos (acceso 9, mi-cuenta 10, paginas 9, mensajes 12,
  cuentas 17, novedades 11, ajustes 12, biblioteca 12, casos 8, aliados 12,
  fotos 10, metricas 10, equipo 12) y `regla.ts` (32: el tipo `Regla` y los
  dos ayudantes que recuperan las claves). Paridad contra `main` con un
  script de paso que importa los dos registros: 57/57 tipos, `QUIEN_VE` y
  `VA_AL_INICIO` iguales, el orden igual salvo los dos del segundo factor
  (P4). `tsx --test` de `actividad.test.ts`, `frase.test.ts`,
  `consultas/actividad.test.ts`, `actividad-reciente.test.ts`,
  `modulos.test.ts` y `marcas.test.ts` → 18 pass, 0 fail; `tsc` 0; `eslint`
  0; ningún test tocado. Los comentarios que nombraban `datos/actividad.ts`
  (el `.prisma` y `actividad-reciente.ts`) apuntan a la carpeta; `prisma
  validate` en verde y `migrate status` «up to date» (un comentario no es
  migración).
- **Paso 5 — `admin/actividad/frase/`** (`0d2d1500`): `index.ts` (43) y
  `comun.ts` (13: `EventoParaLeer`, `Frase`, `contraer`) más 13 módulos (el
  mayor, `cuentas.ts`, 18). Las 57 frases con siete valores de `sobre` cada
  una salen byte a byte iguales que en `main`. `frase.test.ts` y
  `actividad-reciente.test.ts` → 7 pass; `tsc` y `eslint` 0.
- **Paso 6 — `admin/cuentas/actividad/modulos/`** (`e4827d0d`): `index.ts`
  (64) y `comun.ts` (30: `MODULOS_DE_ACTIVIDAD`, `Lectura`, `Existentes`)
  más 13 módulos. `moduloDe` y `pantallaDe` iguales a `main` en los 57 tipos
  × 6 combinaciones de `sobreId` y de lo que existe; `esModuloDeActividad`
  igual (incluido `toString`). `modulos.test.ts` y `filtros.test.ts` → 3
  pass; `tsc` y `eslint` 0.
- **Paso 7 — `datos/inicio/pendientes/`** (`f47f514c`, y `e0611f8c` para dos
  comentarios que nombraban el archivo viejo): `index.ts` (31) y
  `pendiente.ts` (41: `URGENCIAS` y los tipos) más 7 módulos (el mayor,
  `mensajes.ts`, 18). Las 9 filas, en el mismo orden y con los mismos
  campos que en `main`. `pendientes.test.ts` y los cinco `de-*.test.ts` → 17
  pass; `tsc` y `eslint` 0.
- **Paso 8 — los tres puentes** (`abbfd69c`): `BotonEnlace` pasó al
  `Boton.tsx` del kit; `armazon/Boton.tsx` y `armazon/clases.ts` borrados, y
  el `export { Aviso }` de `Campos.tsx` también. 77 archivos reescritos por
  un script de paso (`%TEMP%/cierre/reescribir.mjs`, no se commitea) que
  junta los nombres en el import de `@ed/kit-admin` que ya hubiera o lo pone
  antes del primer import interno. `grep` de `armazon/Boton"`,
  `armazon/clases"` y `export { Aviso }` → nada; `pnpm typecheck` y `pnpm
  lint` 0; react-doctor **100/100 sin diagnósticos** en los cuatro
  proyectos.
- **Paso 9 — las piezas sin ED, al kit** (`cc733c4f` la mudanza, `46ea8a4e`
  los comentarios, `20ed2000` los hooks):
  - 30 archivos con `git mv` (19 renombres puros, los demás solo con sus
    imports), 136 archivos de la app reescritos con el mismo script.
    `CampoSimple` y `BotonDeAcceso` (P2) en sus 7 formularios, sin alias
    (`BotonDelAdmin` también se fue). Íconos del kit: `ChevronAbajo`,
    `Check`, y `FlechaIzquierda`, `FlechaAfuera`, `Ojo` y `OjoTachado`
    nuevos: un script compara sus trazos con los de la app y las props base
    (iguales y en el mismo orden).
  - `grep '"@/' packages/kit-admin/src` → nada; ningún módulo de ED en el
    código ni, después de `46ea8a4e`, en los comentarios.
  - **El build se frenó** la primera vez: `useFrenarSalida` y
    `useMoverEnOrden`, ahora en el índice del kit, entraban al grafo del
    servidor por cualquier import de `@ed/kit-admin`. Con `"use client"`
    (`20ed2000`) el build pasa.
  - `pnpm typecheck`, `pnpm lint` y `pnpm --filter @ed/kit-admin test` (11
    pass) en 0; react-doctor **100/100 sin diagnósticos**
    (`packages/kit-admin/src: 52 archivos`).
  - **El sitio:** `node scripts/comparar-render.mjs` contra el build de
    `main` → **12 páginas, render idéntico**. El CSS de los dos builds es el
    mismo archivo (mismo hash, 194 299 y 18 653 bytes); un chunk de JS
    compartido baja 598 bytes (nombres del minificador y reparto de chunks).
  - **El admin, por HTML** (`next start` de `main` en el 3033 y de la rama en
    el 3034, contra la misma base; `%TEMP%/cierre/comparar-admin.mjs` recorre
    todo link a `/admin/…` y cada redirección, y compara sin `<script>`,
    nonce ni URL de `/_next/`):

    | Rol (base) | Tema | Pantallas | Iguales | CSS |
    | --- | --- | --- | --- | --- |
    | administra (`ed`) | por defecto (mixto) | 695 | 695 | igual |
    | administra (`ed`) | claro | 695 | 695 | igual |
    | administra (`ed`) | oscuro | 695 | 695 | igual |
    | edita (`ed`) | por defecto | 327 | 327 | igual |
    | dirige (`ed_cierre`, P6) | por defecto | 695 | 695 | igual |

    Entre 0 y 8 pantallas por corrida dieron igual recién al volver a
    pedirlas: la metadata de Next se transmite aparte y el `<title>` cae en
    el `<head>` o después según quién resuelve primero, en cualquiera de los
    dos servidores. Controles: `/admin/nope` sale distinto (P5) y el mismo
    `/admin` en claro y oscuro también; `/admin` normalizado tiene 32 919
    caracteres y 321 etiquetas.
  - **El admin, a ojo** (navegador de Orca, perfil aislado `cierre-del-mapa`,
    sesión de quien dirige en `ed_cierre`): Inicio, Contenido, Novedades,
    Biblioteca, Mensajes, Métricas, Cuentas, Ajustes, la ficha de un
    material y la lista del Equipo, en los tres temas a 1440, y cinco
    pantallas a 390. Cada captura de `main` y de la rama se compara por
    SHA-1: **las 35 combinaciones tienen una captura byte a byte igual**. Las
    que variaban lo hacían también repitiendo el mismo servidor (658 píxeles
    de texto en Métricas, entre dos capturas seguidas de `main`).
  - **Lo de cliente, andando** en la rama: las pestañas marcan la activa
    («Contenido: Equipo»); «Bajar» y «Subir» en el Equipo mueven, anuncian
    («Karla Gómez pasó al lugar 2 de Dirección.») y devuelven el foco (el
    orden quedó como estaba); «Borrar el material» abre la confirmación en el
    lugar con el foco en «Cancelar» y su `aria-describedby`, y «Cancelar» la
    cierra; «Mostrar contraseña» pasa el campo a texto con `aria-pressed`;
    con un cambio sin guardar, un `beforeunload` sintético queda frenado, y
    al volver al valor original ya no. (En la copia, «Suspender» sobre
    `cierre-edita` suspendió sin confirmar, como en `main`: esa acción no
    pide confirmación; `ed` no se tocó.)
- **Paso 10 — los documentos de la mudanza** (`8186a892`): el README del
  kit con las piezas de una pantalla, qué sabe de Next y el cuarto tamaño de
  tipo que espera (`text-admin-titulo`); cada token del README aparece en
  `packages/kit-admin/src` y no hay en el kit ninguno fuera de la lista. El
  ADR-0014 anota la mudanza hecha. DESIGN.md §11: las 16 rutas de las piezas
  mudadas apuntan a `packages/kit-admin/src/` (existen todas) y la línea de
  dónde viven dice qué quedó en `admin/armazon/`; `grep admin/armazon/
  DESIGN.md` nombra solo la sidebar, «Sin permiso», la guarda, la pantalla de
  acceso, «Qué cambió» y «Cómo se ve».
- **Paso 11 — los documentos del cierre** (`c9fddbe3`, y `c0864f9e` para
  cuatro comentarios de código que decían «del armazón» de piezas que ya son
  del kit): AGENTS.md §3 (el kit, lo que queda en el armazón, los registros
  como carpetas, sin `por-hacer/`), §12 (las rutas de los registros) y §13
  (la fase 3 hecha, con una línea por módulo, y la 4 sin el `sitemap.xml` ni
  las redirecciones, que ya hizo Ajustes); el spec del admin en §3 (el kit),
  §7 (la actividad), §9 (la fase 3) y §11 (lo que sigue afuera, con el §10 del
  SPEC padre); AI_GUIDELINES §2 con ejemplos que existen; el README con el
  estado del admin. `grep` de `por-hacer`, `datos/actividad.ts`,
  `actividad/frase.ts` y `lineas-accion/data.ts` en esos cuatro → nada (la
  única mención de `quienes-somos/data/equipo`, en el spec §6, dice que se
  borró); ninguna ruta de una pieza mudada queda nombrada en un `.md` ni en
  el código.
- **Encabezados de commit:** cuatro pasaban los 72 caracteres de
  `docs/COMMITS.md`; se reescribieron antes del primer push con un filtro
  de mensajes (el árbol, idéntico), y los hashes de acá, al día.

## Abierto
