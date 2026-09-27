# PROGRESS — Páginas: Qué hacemos, Quiénes somos y lo compartido

Lane 4b del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md). SPEC en
[`SPEC.md`](SPEC.md).

## In progress

STATE: design-first approval window, waiting for owner approval of SPEC.md before PLAN.md

## Hecho

- **Arranque del worktree** (2026-09-26) — `pnpm install` (549 paquetes) y
  `pnpm generate` (Prisma 7.10.0); `.env.local` copiado y apuntado a la base
  propia `ed_paginasqh` (creada en `ed-postgres`), `pnpm migrate:deploy` →
  «All migrations have been successfully applied».
- **Build de referencia** sobre `48ed711` → `%TEMP%\ed-paginasqh\antes\.next`
  (base sin filas en `paginas`: el contenido inicial). `pnpm build` exit 0;
  `node scripts/comparar-render.mjs %TEMP%\ed-paginasqh\antes apps/sitio` →
  «11 páginas, render idéntico». El primer build falló con `next/font/google
  queries have exactly one entry` y el reintento repitió el error sobre el
  `.next` que dejó el primero; con `apps/sitio/.next` borrado, compiló. Si
  vuelve a aparecer: borrar `.next` antes de sospechar del código.
- **Relevamiento** de las dos páginas contra el código de hoy (dos agentes de
  lectura, verificado a mano en los puntos que deciden el diseño): las siete
  áreas idénticas a las de Inicio salvo la negrita; el método, solo las cinco
  frases iguales; `ImpulsanEd` 282 líneas de código, el único que pasa el tope;
  el `<head>` de las dos páginas hereda hoy el `og:`/`twitter:` de Inicio.
