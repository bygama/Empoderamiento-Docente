# DECISIONS — Las condiciones de la revisión de la fase A

<!-- Append-only: fecha — decisión — por qué. -->

- 2026-09-22 — La lane se abre con `work/edicion-de-paginas/`,
  `work/metricas/` y `work/primer-deploy/` todavía en el árbol, aunque sus PRs
  (#171, #168, #167) están MERGED — Cada una es una lane de varios PRs y su
  propio SPEC declara trabajo que sigue en la misma lane (fases B–D; fases B
  y C; Tasks 3, 5 y 6). Son de Facundo y siguen vivas: cerrarlas desde acá
  borraría su estado. Si el owner lo ve distinto, se cierran con
  `work-handoff` antes de seguir.
- 2026-09-22 — `CampoFoto` recibe `subir` por prop además de las props planas
  — La condición 1 es que los controles se muden al kit sin arrastrar la app.
  Un control que importa `@/datos/acciones/fotos` arrastra la app igual que
  uno que conoce `Descripcion`: es el mismo desacople.
- 2026-09-22 — La prueba de que el formulario no cambió (paso 1) es un hash
  del HTML antes y después, no un snapshot commiteado — Un snapshot del HTML
  del admin se rompe con cualquier cambio visual legítimo y no protege nada
  después de este paso. La evidencia queda en PROGRESS.
