# DECISIONS — El armazón del admin

<!-- Append-only: fecha — decisión — por qué. -->

- 2026-09-22 — Tier M para esta lane, aunque el pedido entero se triageó L
  — El L cubría el pedido completo, con el alcance de la seguridad abierto.
  El shaping lo cerró y lo partió en dos lanes. Esta tiene todos los
  archivos listados de antemano (§2 y §3 del SPEC) y entra en una sesión,
  que es la definición de M (`reference/task-tiers.md`). La lane 2 se
  triagea sola cuando se abra.
- 2026-09-22 — La lane se abre con `work/edicion-de-paginas/`,
  `work/metricas/` y `work/primer-deploy/` en el árbol, aunque sus PRs
  (#171, #168 y #167) están MERGED — Son lanes de Facundo de varios PRs, y
  su propio SPEC declara trabajo que sigue en la misma lane: fases B a D,
  fases B y C, y Tasks 3, 5 y 6. Es el mismo criterio que usó
  `condiciones-de-la-revision` (en la historia, `91e300d`). Si el owner lo
  ve distinto, se cierran con `work-handoff`.
