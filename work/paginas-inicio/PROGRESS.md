# PROGRESS — Páginas: Inicio completo y la base de la edición

- **Rama:** `mateo/paginas-inicio` (sobre `main` `8b53269`)
- **Worktree:** propio (lane 4a del XL `mapa-del-admin`), dev server en el
  puerto 3014, base `ed_paginasinicio` en `ed-postgres`
- **Spec:** [`SPEC.md`](SPEC.md) · **Rulings:** [`DECISIONS.md`](DECISIONS.md)

## Baseline

Medido sobre `8b53269`:

- Desde el admin se edita solo Inicio → Hero (`contenido/paginas.ts`); las
  otras seis secciones de Inicio leen de `como-trabajamos/data.ts`,
  `lineas-accion/data.ts` y de arreglos sueltos en `Manifiesto.tsx`,
  `MisionPanel.tsx`, `DatosDuros.tsx`, `LineasAccion.tsx` y
  `BibliotecaNovedades.tsx`.
- `paginas` tiene borrador y publicado, sin historial. El choque existe solo
  al guardar; la primera fila se crea con `create` y dos altas a la vez tiran
  por la clave primaria.
- `/` no tiene `generateMetadata`: usa el título por defecto del layout (72
  caracteres) y `siteConfig.description` (241), con la imagen de
  `app/(sitio)/opengraph-image.png`.
- Por arriba del tope: `HeroQuienes.tsx` (314 líneas, 237 de código),
  `config/nav.ts` (104), `scripts/comparar-render.mjs` (117),
  `datos/acciones/editar-paginas.ts` en 100 justas.
- Los 19 `<img>` del hero (11 + 8) viven dentro de `aria-hidden="true"`.

## In progress

- STATE: design-first approval window, waiting for owner approval of SPEC.md before PLAN.md
