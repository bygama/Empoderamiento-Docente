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
- 2026-09-22 — La revisión de cierre es un solo revisor, en Opus 5.5, con
  el lente de todo el cambio contra el SPEC — Decisión del owner, textual:
  «1 revisor opus 5.5». El default de las marcas era cuatro (ese lente más
  uno por cada paso `high`: tipos e interfaces para el 1, cobertura de tests
  para el 2, impacto en la documentación para el 5); esos tres lentes no se
  compran.
- 2026-09-22 — La re-review en Sonnet y no en Opus — La plantilla de
  re-review pide un modelo barato o medio para un diff chico y acotado a un
  hallazgo; el «opus 5.5» del owner se leyó como la elección para la
  revisión de cierre.
- 2026-09-22 — La observación fuera de alcance de la re-review («la
  excepción se busca solo por nombre, un `apagarVistaPrevia` en otro archivo
  la heredaría») no se toma — El test pasa `SIN_SESION[relativa]?.acciones`:
  la lista se busca por la ruta del archivo, así que en cualquier otro
  archivo llega `undefined` y no hay excepción. (El caso «una excepción vale
  para su acción y no para las otras del archivo» cubre el otro borde:
  dentro del mismo archivo.)
