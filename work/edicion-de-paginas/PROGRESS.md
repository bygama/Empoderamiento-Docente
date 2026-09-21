# PROGRESS — La edición de las páginas

- **Rama:** `feat/edicion-de-paginas` (todavía no creada)
- **Base:** `9e721f1` (= `origin/main` al 2026-09-21, con la fase A de métricas mergeada)
- **Spec:** [`SPEC.md`](SPEC.md) · **Inventario:** [`INVENTARIO.md`](INVENTARIO.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: SPEC leído y aprobado; PLAN de la fase A escrito, revisado (1 crítico y 7 importantes corregidos) y aprobado para ejecutar. Rama por crear.**

## Baseline

Medido sobre `9e721f1`:

- El admin tiene entrar/salir/contraseña y la portada con las métricas. Ninguna pantalla edita contenido.
- Todo el contenido del sitio vive en código: `features/<pagina>/data/*.ts`, archivos de datos dentro de las carpetas de componentes y arrays sueltos en los `.tsx` (ver INVENTARIO §0 y §(a)).
- `prisma/schema/` tiene `base`, `auth`, `sitio` y `metricas`; no hay tablas de páginas ni de fotos.
- `next.config.ts` ya admite imágenes de `*.public.blob.vercel-storage.com`.

## Hecho

- 2026-09-21 — Inventario de las 42 secciones de las siete páginas (INVENTARIO.md).
- 2026-09-21 — SPEC escrito y aprobado en conversación en cuatro partes.

## Abierto

- Las cinco decisiones del SPEC §12, a acordar con Gastón y Mateo.
- Si `BLOB_READ_WRITE_TOKEN` existe ya en el proyecto de Vercel (lo cargan ellos).
