# PROGRESS — La edición de las páginas

- **Rama:** `feat/edicion-de-paginas` (sobre `main` d9126bd)
- **Base:** `9e721f1` (= `origin/main` al 2026-09-21, con la fase A de métricas mergeada)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) · **Inventario:** [`INVENTARIO.md`](INVENTARIO.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: fase A implementada (A0–A9) y revisada tarea por tarea; PR en preparación.**

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

## Abierto

- Cargar `BLOB_READ_WRITE_TOKEN` en Vercel (Mateo/Gastón) y probar una subida en producción.
- Fase B: ¿Quiénes somos? y Misión con `textoConResaltado`.
- Las cinco decisiones del SPEC §12 con Gastón y Mateo, incluida la excepción de AGENTS.md §12 (ya escrita acá con el OK de Facundo; falta que la vean ellos).
- La revisión final de toda la rama, con lo que quedó diferido tarea a tarea: `editar-paginas.ts` (116 líneas) y `comparar-render.mjs` (117) por arriba de las 100 de la guía — a decidir si se parten o si se escribe la excepción en AGENTS.md §6, como la de `verificar-react-doctor.mjs`; y los máximos de los campos del hero al ras (título 56/60, carteles 22/24), decisión de contenido para Facundo.
