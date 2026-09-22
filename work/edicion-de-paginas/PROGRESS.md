# PROGRESS — La edición de las páginas

- **Rama:** `feat/edicion-de-paginas` (sobre `main` d9126bd)
- **Base:** `9e721f1` (= `origin/main` al 2026-09-21, con la fase A de métricas mergeada)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Inventario:** [`INVENTARIO.md`](INVENTARIO.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: fase A implementada (A0–A9), revisada tarea por tarea y con una revisión final de toda la rama («lista para mergear», sin críticos) más su ola de fixes; PR en curso.**

## Baseline

Medido sobre `9e721f1`:

- El admin tiene entrar/salir/contraseña y la portada con las métricas. Ninguna pantalla edita contenido.
- Todo el contenido del sitio vive en código: `features/<pagina>/data/*.ts`, archivos de datos dentro de las carpetas de componentes y arrays sueltos en los `.tsx` (ver INVENTARIO §0 y §(a)).
- `prisma/schema/` tiene `base`, `auth`, `sitio` y `metricas`; no hay tablas de páginas ni de fotos.
- `next.config.ts` ya admite imágenes de `*.public.blob.vercel-storage.com`.
- Build sin `DATABASE_URL` sobre `2ac8a57`: fallaba en `/api/cron/metricas` (`datos/cliente.ts` armaba el adaptador al cargarse); A0 lo arregla.

## Hecho

- 2026-09-21 — Inventario de las 42 secciones de las siete páginas (INVENTARIO.md).
- 2026-09-21 — SPEC escrito y aprobado en conversación en cuatro partes.
- 2026-09-21 — A0: `datos/cliente.ts` lee `DATABASE_URL` en la primera consulta; el build sin base, que fallaba en `/api/cron/metricas`, pasa (commit f4d0a9f).
- 2026-09-21 — A1: `prisma/schema/paginas.prisma` (`Pagina`, `Foto` sin columnas de foco y con id uuid) y su migración (commit 6940aaf).
- 2026-09-21 — A2: `lib/contenido/fotos.ts` (`ValorFoto` con foco, `src` acotado, `MAXIMO_BYTES` en 4 MB), `campos.ts` (textoCorto, parrafo, foto, rutaInterna, listaFija, grupo con metadata en un registro de Zod), `describir.ts` (esquema → árbol serializable), `documento.ts` (completar y validar por sección); `RUTAS_INTERNAS` en nav.ts; tests (commit cd597f6).
- 2026-09-21 — A3: `@vercel/blob`; `lib/contenido/imagen.ts` (tipo por bytes con sharp), `almacen.ts` (disco/Blob, sin `server-only` porque no resuelve desde `apps/sitio` sin instalar un paquete nuevo y sin OK — la frontera queda por convención); `/api/fotos/[id]`; `subirFoto`; `.fotos/` ignorada; `bodySizeLimit` 5 MB en el servidor (commit eeb07f0).
- 2026-09-21 — A4: `features/home/contenido/hero.ts` (esquema + inicial), `geometria-hero.ts`, el registro `contenido/paginas.ts`; el hero lee por props; `hero-cards.ts` borrado; render idéntico comprobado con `comparar-render.mjs` (commits 9c30126 + e8bfdcc; PLAN.md e INVENTARIO.md corregidos aparte en bdc238d tras un hallazgo de la revisión).
- 2026-09-21 — A5: `consultas/paginas.ts` (`contenidoDe` con `try`, Draft Mode, sin base), `consultas/editor-de-paginas.ts`, `acciones/editar-paginas.ts` (+ test de integración), `acciones/paginas.ts`, `acciones/vista-previa.ts`, `acciones/salir-de-vista-previa.ts`; `page.tsx` lee de la base; `comparar-render.mjs` suma la dimensión `imagenes` (src, alt, style de cada `<img>`) (commits 5c0e4a8 + a9fe958).
- 2026-09-21 — A6: `Momento` y los controles de `admin/campos/`, con el tope de tamaño y el punto de foco movible con el teclado (flechas + `aria-live`) en el navegador (commit 12b552d).
- 2026-09-21 — A7: «Páginas» y el editor (barra con estado relativo, secciones, acciones en try/catch); `cambio.ts` con `Cambio<T>` (valor o updater) para que `alCambiar` no pise ediciones concurrentes, con `confirmados` en vez de banderas de "sucio"; sin `useTransition` — un estado `pendiente` manual, porque react-doctor lo marcaba por `no-derived-useState`/`no-impure-state-updater` (commit aa29424, dos rondas de revisión).
- 2026-09-21 — A8: la franja de borrador (`z-[60]`, entre el header y el menú mobile) y el `noindex` en vista previa; `almacen.ts` con `turbopackIgnore` en sus dos `path.join` para que Turbopack no arrastre `apps/sitio` entero al bundle de `/api/fotos`; verificado en el navegador (los 13 puntos del plan) y el sitio sin base (commits c97d8ad + 7e3de9d).
- 2026-09-21 — A9: README (variables de entorno y «Editar las páginas», con la nota de no compartir fotos locales entre entornos), AGENTS.md §3/§12/§13 (con OK de Facundo), este PROGRESS.
- 2026-09-21 — Revisión final de la rama (Opus, nueve pasadas; corrió gates y tests, comparó las 19 tarjetas contra `hero-cards.ts`: 0 diferencias): sin críticos, dos importantes y trece menores. Ola de fixes antes del PR: el build falla fuerte si hay `DATABASE_URL` y la consulta tira (en runtime sigue el fallback); `esSrcDeFoto` rechaza `%2e`/`%2f`; el alt de la foto con updater; «descartar» sin borrador lo dice; las ayudas de las listas fijas derivan la cantidad; `maxDuration` en la página del editor; `propioDe`/`primerProblema` a `lib/contenido/documento.ts` (`editar-paginas.ts` en 100 líneas); y, con OK de Facundo, los máximos del hero con aire (título 72, cartel 30, descripción 60) y el contador avisa al llegar al tope.

## Abierto

- Cargar `BLOB_READ_WRITE_TOKEN` en Vercel (Mateo/Gastón) y probar una subida real: ese camino nunca corrió contra Vercel.
- Las cinco decisiones del SPEC §12 con Gastón y Mateo, incluida la excepción de AGENTS.md §12 (ya escrita con el OK de Facundo; falta que la vean ellos).
- `scripts/comparar-render.mjs` (117 líneas) por arriba de las 100 de la guía: la revisión final propone escribir la excepción en AGENTS.md §6, como la de `verificar-react-doctor.mjs` (con OK).
- Deuda anotada por la revisión final, para la fase B: nada borra una foto reemplazada (fila en `fotos` y archivo en Blob quedan); los 19 alts del hero viven dentro de `aria-hidden` (se escriben pero no se leen); `config/nav.ts` quedó en 104 líneas; `publicar` revalida solo su ruta (el SPEC §7 pide las dos cuando una sección se repite: fase D); dos pantallas que crean la fila a la vez chocan (ventana de milisegundos).
- Fase B: ¿Quiénes somos? y Misión con `textoConResaltado`; el resto de Inicio.
