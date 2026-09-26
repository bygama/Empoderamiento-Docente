# DECISIONS — El mapa entero del admin

- 2026-09-26 — **Alcance: el mapa entero, 8 módulos.** Mateo, entre cuatro
  opciones (cerrar lo visual · lo visual + Mi cuenta · fase B de páginas · el
  mapa entero).
- 2026-09-26 — **SPEC aprobado tal cual** («Aprobado, seguí»), con la fase 4
  del spec del admin afuera.
- 2026-09-26 — **Pegasuz no tiene nada que ver con este repo** (Mateo: «acá
  pegasuz no tiene nada que ver»). Las hijas heredan la cuenta de esta sesión:
  `--command "claude"`. Se borró la memoria `spawns-en-pegasuz`.
- 2026-09-26 — **Cómo corren las hijas** (Mateo eligió «Solas hasta el PR»):
  commitean, pushean y abren su PR sin pedir OK; el merge a `main` siempre con
  el OK de Mateo, *Rebase and merge*. El padre aprueba los SPEC de las hijas
  que no crean tablas; los que crean tablas o suman dependencias van a Mateo.
  Al cierre de cada lane, **1 revisor Opus 5.5** (lente: el cambio entero
  contra su SPEC). La lane padre va en un PR chico de docs.
- 2026-09-26 — **Un patrón nace con su primer consumidor** (el padre, al
  armar los briefs): la lane 1 se queda con el índice de Contenido, la
  mudanza de Páginas y su lista nueva, que eran de la lane 4, porque ahí
  estrena las pestañas, el índice de tarjetas y la lista; «Sin permiso» pasa a
  la lane 3 y el buscador a la lane 6. Construirlos antes, sin quien los use,
  era código muerto.
- 2026-09-26 — **Los cambios a DESIGN.md y AGENTS.md** que haga una hija
  (§5.6 los pide con confirmación) los revisa Mateo en el PR, antes de su OK
  al merge: van nombrados en el SPEC de la lane.
- 2026-09-26 — **Cada hija que migra usa su propia base** en el mismo
  contenedor (`ed_<lane>`), para que una migración sin mergear no quede
  aplicada en la base `ed` que usan las demás.
