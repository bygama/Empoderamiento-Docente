# PLAN — El mapa entero del admin (padre, XL)

SPEC aprobado por Mateo el 2026-09-26. Este PLAN no tiene pasos ejecutables:
cada lane hija escribe su propio SPEC y PLAN adentro de su worktree, con
work-plan en design-first. Lo ejecuta **orchestrate**, desde el checkout
principal, que no implementa nada.

## Las tres preguntas

**¿Dónde se hace cada cosa?** Cada lane del SPEC §7 en su worktree de Orca,
creado desde `main` recién actualizado, en la rama `mateo/<lane>`, con una
sesión de Claude propia. Una lane arranca cuando todas las de su columna
«Depende de» están mergeadas: nada se apila sobre una rama sin mergear. La
lane 0 es del lado de Mateo o Gastón (el checklist del deploy); una hija la
toma solo cuando llegan las respuestas del SPEC §8.

**¿Cómo se juntan los resultados?** Cada lane abre su propio PR contra `main`
cuando su verificación pasa. El padre los mergea con *Rebase and merge*
(AGENTS.md §5.7), con el OK de Mateo, en el orden de las olas. Los archivos
que tocan varias lanes —`admin/por-hacer/guias.ts`,
`admin/armazon/barra-lateral/modulos.ts`, DESIGN.md §11, AGENTS.md §13, el
README y `prisma/migrations/`— los concilia la lane que rebasea después; una
migración generada antes que otra ya mergeada se vuelve a generar sobre el
`main` nuevo, nunca se edita a mano.

**¿Quién resuelve un desacuerdo?** El diseño y el alcance, Mateo: el SPEC
padre y los SPEC de cada lane son suyos. Entre lanes, DESIGN.md §11 es el
registro: la lane 1 es dueña de los patrones de `admin/armazon/`, y una lane
que necesita cambiar uno se lo plantea al padre, que decide o lo sube a
Mateo. En la revisión de cierre, el padre; si el hallazgo contradice un SPEC,
Mateo.

## Lanes

Worktrees en `~/orca/workspaces/Empoderamiento-Docente/<lane>`. Cada hija
hereda la cuenta de esta sesión: arranque en dos pasos (`orca worktree
create` → `orca terminal create --command "claude"` → `orca orchestration
worker-start --task <id> --terminal <handle>`), porque un `claude.exe`
pelado desde Orca resuelve a la cuenta por defecto de la máquina
(`~/.claude/CLAUDE.md`, «Orca agent spawns»). Pegasuz no tiene nada que ver
con este repo (Mateo, 2026-09-26).

| # | Lane | `work/<lane>/` | Rama | Ola | Depende de | Runner |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | deploy-al-dia | `work/deploy-al-dia/` | `mateo/deploy-al-dia` | 1 | — (respuestas del §8) | Claude, `--command "claude"` |
| 1 | patrones-del-admin | `work/patrones-del-admin/` | `mateo/patrones-del-admin` | 1 | — | Claude, `--command "claude"` |
| 2 | seguridad-del-acceso | `work/seguridad-del-acceso/` | `mateo/seguridad-del-acceso` | 1 | — | Claude, `--command "claude"` |
| 3 | roles-y-cuentas | `work/roles-y-cuentas/` | `mateo/roles-y-cuentas` | 2 | 1, 2 | Claude, `--command "claude"` |
| 4 | paginas-completas | `work/paginas-completas/` | `mateo/paginas-completas` | 2 | 1 | Claude, `--command "claude"` |
| 5 | busquedas-de-google | `work/busquedas-de-google/` | `mateo/busquedas-de-google` | 2 | 1 | Claude, `--command "claude"` |
| 6 | novedades-y-kit | `work/novedades-y-kit/` | `mateo/novedades-y-kit` | 3 | 3 | Claude, `--command "claude"` |
| 7 | mensajes | `work/mensajes/` | `mateo/mensajes` | 3 | 2, 3 | Claude, `--command "claude"` |
| 8 | biblioteca-y-equipo | `work/biblioteca-y-equipo/` | `mateo/biblioteca-y-equipo` | 4 | 6 | Claude, `--command "claude"` |
| 9 | casos-aliados-fotos | `work/casos-aliados-fotos/` | `mateo/casos-aliados-fotos` | 4 | 4, 6 | Claude, `--command "claude"` |
| 10 | ajustes | `work/ajustes/` | `mateo/ajustes` | 4 | 3, 5, 7 | Claude, `--command "claude"` |
| 11 | metricas-completas | `work/metricas-completas/` | `mateo/metricas-completas` | 5 | 0, 7, 8 | Claude, `--command "claude"` |

## Lo que cada hija recibe en su brief

- El SPEC padre (este folder) y su fila del SPEC §7, más las secciones del
  §5 que le tocan.
- Empezar por work-plan en design-first: su SPEC nombra las tablas y columnas
  y espera el OK de Mateo antes del PLAN (AGENTS.md §12).
- Las reglas del SPEC §9, y para toda UI: designing-consistently sobre
  DESIGN.md §11, con lo nuevo registrado en el mismo PR.
- Commits, push y PR con la confirmación que AGENTS.md §5.6 pide; el merge es
  del padre.
