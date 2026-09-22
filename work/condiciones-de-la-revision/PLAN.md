# PLAN — Las condiciones de la revisión de la fase A

- **Spec:** [`SPEC.md`](SPEC.md) · **Progreso:** [`PROGRESS.md`](PROGRESS.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Restricciones (valen en cada paso)

- Un paso, un commit: Conventional en español, imperativo, ≤ 72 caracteres
  (`docs/COMMITS.md`). Se commitea con el OK del owner a la lista de commits
  (AGENTS.md §9).
- Cada paso deja en verde `pnpm typecheck`, `pnpm lint` y `pnpm react-doctor`
  (100/100 sin diagnósticos).
- Sin dependencias nuevas. Las lanes de Facundo no se tocan.
- `AGENTS.md` se edita solo en los pasos 5 y 6, con el OK del owner del
  2026-09-22.

## Pasos

- [ ] **1. Controles con props planas** `[batch]` — `TextoCorto`, `Parrafo`,
  `RutaInterna`, `ListaFija` y `CampoFoto` reciben `etiqueta`, `ayuda` y lo
  propio de cada uno (`maximo`, `opciones`, `cantidad`, `etiquetaItem`,
  `vacio`) en vez de `descripcion`; `CampoFoto` recibe `subir` por prop en vez
  de importar `subirFoto`; `Campo.tsx` es el único que traduce `Descripcion` a
  props. — accept: `git grep -l -E "Descripcion|@/datos/" -- apps/sitio/src/admin/campos`
  imprime solo `Campo.tsx`; el sha256 del HTML de `renderToStaticMarkup(Campo)`
  con la descripción y el contenido inicial del hero es el mismo antes y
  después (los dos hashes en PROGRESS); `pnpm typecheck && pnpm lint && pnpm react-doctor`
  sale 0. *(judgment · high)*
- [ ] **2. Test de sesión en las acciones** — `apps/sitio/src/datos/acciones/acciones-con-sesion.test.ts`
  lee los archivos `"use server"` de `datos/acciones/` y falla si una función
  exportada no llama a `auth.api.getSession`; exceptúa
  `salir-de-vista-previa.ts` con su motivo. — accept: `pnpm --filter sitio test`
  sale 0; con el `getSession` de `publicar` sacado a mano, el test falla y
  nombra `paginas.ts › publicar` (RED anotado en PROGRESS, cambio revertido).
  *(integration · high)*
- [ ] **3. Salir apaga la vista previa** — `apagarVistaPrevia(): Promise<void>`
  en `salir-de-vista-previa.ts` (sin sesión, el mismo motivo que
  `salirDeVistaPrevia`), y `SalirDelAdmin` la llama antes de `signOut`. —
  accept: `pnpm --filter sitio test` sale 0 (el test del paso 2 la acepta por
  el archivo exceptuado); en el navegador, con una cuenta local de prueba:
  vista previa abierta → `/` muestra la franja de borrador → «Salir» → `/` sin
  la franja. *(integration · medium)*
- [ ] **4. El spec del admin dice lo que cambió** — en
  `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`: §6, las
  páginas como documento validado por esquema y la columna por texto para las
  entidades; §7, la cookie del Draft Mode tal cual es (la pone una acción con
  sesión, sin vencimiento, el mismo valor hasta el próximo deploy, se apaga con
  «Salir de la vista previa» y al salir del admin) y la sesión de las Server
  Actions verificada en cada acción con el test del paso 2; §9, las páginas se
  adelantaron y los controles se mudan al kit con props planas. — accept:
  `git diff --stat main -- docs/` muestra solo ese archivo; `git grep -n -E "Draft Mode|props planas|columna por texto" -- docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
  encuentra §6, §7 y §9. *(judgment · medium)*
- [ ] **5. Los límites de la excepción** — `AGENTS.md` §12, en el párrafo
  «Una excepción, acotada»: solo `paginas`; un tipo de campo nuevo se discute
  como una regla nueva; nada de visibilidad condicional, componentes por campo
  ni hooks; los controles reciben props planas y solo `Campo.tsx` conoce
  `Descripcion`. — accept: `git grep -n "visibilidad condicional" -- AGENTS.md`
  sale 0; `git diff --stat HEAD` muestra solo `AGENTS.md`. *(judgment · high)*
- [ ] **6. El criterio de `lib/`** — `AGENTS.md` §12, junto a «Lo reutilizable
  vive en `packages/`»: lo que no sabe de ED (`lib/contenido/`,
  `lib/metricas/`) incuba en `apps/sitio/src/lib/`, no importa nada de la app
  y pasa a `packages/` cuando lo use un segundo proyecto (el criterio del
  ADR-0009, extendido a contenido). — accept: `git grep -n "segundo proyecto" -- AGENTS.md`
  sale 0; `git grep -l "from \"@/" -- apps/sitio/src/lib/contenido apps/sitio/src/lib/metricas`
  sale 1 (sin resultados). *(judgment · medium)*

## Cierre

`work-verify`: los gates, `pnpm test`, `pnpm build` y la revisión de cierre,
con un lente por cada paso `high` (1, 2 y 5). Después, `work-handoff`.
