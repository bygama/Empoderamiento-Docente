# PROGRESS — El mapa entero del admin

## In progress

- 2026-09-26 — Mateo eligió «el mapa entero, 8 módulos» como alcance. SPEC.md
  escrito desde el diseño aprobado el 2026-09-23 y aprobado el mismo día;
  PLAN.md padre escrito; mergeado en #177 (`275518e`).
- 2026-09-26 — Run de Orca `run_d3bf8e72ab7d`. **Ola 1 en vuelo**, las dos
  desde `275518e`, con la cuenta `mateo` (`--command "claude"`):
  - `patrones-del-admin` — task `task_41311e80f9ba`, dispatch
    `ctx_216936e9c770`, puerto 3011, base `ed`.
  - `seguridad-del-acceso` — task `task_293bb730c952`, dispatch
    `ctx_9f771d16c4e2`, puerto 3012, base `ed_seguridad`.
  - `deploy-al-dia` sin arrancar: espera las respuestas del SPEC §8.
- 2026-09-26 — `patrones-del-admin` reportó `worker_done`: PR #178 (45
  archivos, +1395 −222), en `da1ab0b`. Terminal de la hija retenida. Revisor
  r1 (Opus 5.5, medium, lente «el cambio entero contra su SPEC»): task
  `task_c9c532f332e8`, dispatch `ctx_cf96692cb7e8`, worktree
  `patrones-del-admin-review-r1`.
- 2026-09-26 — r1: PASS con dos Important (sin cambio de código; ver
  DECISIONS). Ronda de arreglos en la misma terminal (`ctx_2ebd8b4dd4e4`):
  16 capturas en `%TEMP%\ed-orq\capturas\patrones-del-admin\`, lane cerrada
  (`cb6f56c`), gate verde después del rebase.
- 2026-09-26 — **#178 mergeado con OK de Mateo** → `main` en `0778edb`.
  Gate sobre `main`: typecheck 0 (después de borrar los tipos viejos de
  `.next/`), lint 0, react-doctor 100/100 sin diagnósticos, test 80 (79
  pasan, 0 fallan, 1 saltado de antes), build 0. Worktree, rama, dispatches
  (`ctx_216936e9c770`, `ctx_2ebd8b4dd4e4`) y el revisor
  (`ctx_cf96692cb7e8`) fuera.
- 2026-09-26 — #179 (docs del padre) mergeado → `8b53269`. **Ola 2 en
  vuelo**, las dos desde `8b53269`:
  - `paginas-inicio` (4a) — task `task_d534dacad768`, dispatch
    `ctx_847d0547b5a1`, puerto 3014, base `ed_paginasinicio`.
  - `busquedas-de-google` (5) — task `task_fecf94e17d5a`, dispatch
    `ctx_d214d4e05907`, puerto 3015, base `ed_busquedas`.
  - `roles-y-cuentas` (3) espera el merge de `seguridad-del-acceso`.
- 2026-09-26 — `seguridad-del-acceso` reportó `worker_done`: PR #180 (13
  pasos, su PASS sobre `82cd904`). Terminal retenida; antes de la revisión,
  rebase sobre `8b53269` en la misma terminal (`ctx_5f859d5a58b5`), para que
  el revisor vea el código final (choca una línea del layout del admin con la
  lane 1).
- 2026-09-26 — Rebase de #180 a `1328353`, gate verde. Revisor r1 (Opus
  5.5, medium; `ctx_e94a304f381f`): **PASS**, 0 Critical, 0 Important, 3
  Minor, con el gate y las promesas del SPEC probadas de punta a punta (sin
  enlace en el log de producción, nonce por respuesta, 401 ×5 → 429, rehash a
  Argon2id, rebote cross-site). Revisor liberado y worktree fuera. Ronda
  corta de cierre (los Minor 1–3, la nota de X-Forwarded-For para el deploy,
  work-handoff, rebase, gate) en la misma terminal: `ctx_ecfd28147a38`.
- 2026-09-26 — Cierre de #180 (`6796369`): los tres Minor, la nota de
  X-Forwarded-For para el deploy y la lane cerrada. **#180 mergeado** →
  `main` en `446ab51`. Gate sobre `main`: typecheck 0, lint 0, react-doctor
  100/100, test (auth 16/16; sitio 101 pasan, 0 fallan, 1 saltado), build 0
  (después de `migrate:deploy` en la base `ed`). Dispatches, worktree y base
  `ed_seguridad` fuera; el remoto queda solo con `main`.
- 2026-09-26 — **Lane 3a `roles-y-actividad` en vuelo** desde `446ab51`:
  task `task_404a626cb01b`, dispatch `ctx_5ac5f90807f9`, puerto 3016, base
  `ed_roles`.
- 2026-09-26 — `busquedas-de-google` reportó `worker_done`: PR #181, ya
  rebaseado sobre `446ab51` (`cb9195e`), gate verde (sitio 124 tests).
  Capturas en `%TEMP%\ed-orq\capturas\busquedas-de-google\`, vistas por el
  padre. Revisor r1 (Opus 5.5, medium, base propia `ed_revbusquedas`): task
  `task_886ed84b9aea`, dispatch `ctx_1544b8084693`.
- 2026-09-26 — r1 de #181: **PASS** (0 Critical, 0 Important). Ronda de
  cierre en la misma terminal (`ctx_e55c8f2e28ae`): el aviso de «recién
  conectado», el freno atómico con `pg_try_advisory_xact_lock`, la lane
  cerrada (`6ccc895`). **#181 mergeado** → `main` en `c957586`. Gate sobre
  `main`: typecheck 0, lint 0, react-doctor 100/100, test (auth 16/16; sitio
  128 pasan, 0 fallan, 1 saltado), build 0, la migración
  `busquedas_y_tareas` aplicada en `ed`. Dispatches, worktree y base
  `ed_busquedas` fuera.
- 2026-09-26 — `roles-y-actividad` reportó `worker_done`: PR #182 (12
  pasos, gate verde sobre `446ab51`). Terminal retenida; antes de la
  revisión, rebase sobre `c957586` en la misma terminal (`ctx_410f0b26f247`):
  `configurarConexiones` a dirige, las acciones de la 5 con su capacidad y
  sin excepción, la poda de actividad como tarea del cron diario.
- 2026-09-26 — Rebase de #182 a `6f4d834` sobre `c957586`, gate verde
  (auth 28/28; sitio 149 pasan). Revisor r1 (Opus 5.5, medium, base propia
  `ed_revroles`): task `task_b29dde718302`, dispatch `ctx_5830778ef3b6`.
- 2026-09-26 — r1 de #182: **PASS** (0 Critical, 0 Important), permisos
  probados con tres cuentas. Cierre en la misma terminal
  (`ctx_39131d4da8ac`), lane cerrada (`1b4158e`). **#182 mergeado** →
  `main` en `5a07368`. Gate sobre `main`: typecheck 0, lint 0, react-doctor
  100/100, test (auth 28/28; sitio 150 pasan, 0 fallan, 1 saltado), build 0;
  tres migraciones aplicadas en `ed`. Dispatches, worktree y base `ed_roles`
  fuera. A la 4a, por mail: en su rebase, capacidades y actividad en sus
  acciones.
- 2026-09-26 — **Ola nueva en vuelo**, las tres desde `5a07368`:
  - `cuentas` (3b) — task `task_3646b6524515`, dispatch `ctx_de6fe1cf2dfd`,
    puerto 3017, base `ed_cuentas`.
  - `inicio` (3c) — task `task_2316df2596bb`, dispatch `ctx_84e9868a7f1a`,
    puerto 3018, base `ed`.
  - `mensajes` (7) — task `task_413f8d61ccfe`, dispatch `ctx_6ef71e70d3d5`,
    puerto 3019, base `ed_mensajes`.
- 2026-09-26 — `paginas-inicio` reportó `worker_done`: PR #183 (19 pasos),
  ya rebaseado sobre `5a07368` con capacidades y actividad (`824201b`), gate
  verde (sitio 177 tests), render de `/` idéntico. Revisor r1 (Opus 5.5,
  medium, base propia `ed_revpaginas`): task `task_3be3b9d59c2f`, dispatch
  `ctx_00d06923af95`.
- 2026-09-26 — r1 de #183: **PASS con un Important** (el import de imagen
  que rompe el typecheck en un clon limpio). Ronda de cierre en la misma
  terminal (`ctx_c7adb67e393d`), con `aria-labelledby` en las secciones.
- 2026-09-26 — Cierre de #183 (`d565ae3`): el import de imagen con un
  `.d.ts` commiteado que referencia `next/image-types/global` (la opción D
  del padre), `aria-labelledby` en tres secciones. **#183 mergeado** →
  `main` en `48ed711`. Gate sobre `main` **con el typecheck en limpio** (sin
  `next-env.d.ts` ni `.next/`): typecheck 0, lint 0, react-doctor 100/100,
  test (auth 28/28; sitio 177 pasan, 0 fallan, 1 saltado), build 0, la
  migración `versiones_de_paginas` aplicada en `ed`. Dispatches, worktree y
  base `ed_paginasinicio` fuera.
- 2026-09-26 — **Tres lanes nuevas en vuelo**, desde `48ed711`:
  - `paginas-que-hacemos-y-quienes-somos` (4b) — task `task_7e9caa1693b4`,
    dispatch `ctx_d0c2ac421501`, puerto 3022, base `ed_paginasqh`.
  - `paginas-investigacion-y-resto` (4c) — task `task_f7ac3c746fac`,
    dispatch `ctx_9f41fb6d799f`, puerto 3023, base `ed_paginasinv`.
  - `novedades-y-kit` (6) — task `task_0c9998801dc7`, dispatch
    `ctx_2e37635a97b5`, puerto 3024, base `ed_novedades`.
- 2026-09-26 — `inicio` reportó `worker_done`: PR #184, ya rebaseado sobre
  `48ed711` (`3631cbd`), 10 capturas vistas por el padre. Antes de la
  revisión, el ajuste de la actividad del Inicio en la misma terminal
  (`ctx_3a1b653dae02`).
- 2026-09-26 — `mensajes` reportó `worker_done`: PR #185 (14 pasos), ya
  rebaseado sobre `48ed711` (`dce306f`). Revisor r1 (Opus 5.5, medium, base
  `ed_revmensajes`): task `task_d891f0323387`, dispatch `ctx_4fb8680231a1`.
  Su ADR es el 0012 y `cuentas` planea otro 0012: renumera el que mergee
  segundo.
- 2026-09-26 — r1 de #185 (`mensajes`): **PASS** (0 Critical, 0 Important;
  privacidad probada por siete caminos). Cierre en la misma terminal
  (`ctx_5ba86c09b738`): los Minor 1 y 2, tope propio del cuerpo en los
  formularios públicos, la cabecera real de la descarga con `next start`.
  A `cuentas`, por mail: su ADR pasa a ser el 0013.
- 2026-09-26 — Ajuste de #184 hecho (`2f58d20`, `VA_AL_INICIO`). Revisor r1
  de #184: dispatch `ctx_aa9267dbdd5b`. `orca terminal create` dio timeout
  esperando el handle, aunque la terminal y Claude sí arrancaban: los
  scripts del padre ahora buscan la terminal nueva en el worktree si pasa.
  Se cerraron seis shells de arranque ociosos de los worktrees de las hijas.
  La cuenta `mateo` iba en 72 % de la ventana de 5 h y 52 % de la semanal:
  no se abren lanes nuevas hasta que se renueve.
- 2026-09-26 — Cierre de #185 (`d902364`). **#185 mergeado** → `main` en
  `490547f`. Gate sobre `main` con typecheck en limpio: typecheck 0, lint 0,
  react-doctor 100/100, test (auth 28/28; sitio 218 pasan, 0 fallan, 1
  saltado), build 0, la migración `mensajes` aplicada en `ed`. Dispatches,
  worktree y base `ed_mensajes` fuera. A 4c: Contacto libre. A
  `novedades-y-kit`: consumir las piezas de la 7.
- 2026-09-26 — `cuentas` reportó `worker_done`: PR #186 (16 pasos). Antes de
  la revisión, rebase sobre `490547f` en la misma terminal
  (`ctx_0ba3e3932b8d`): una sola versión de Buscador y «volver» (las de la 7),
  el ADR a 0013, los tipos de actividad nuevos con su frase y visibilidad.
- 2026-09-26 — r1 de #184 (`inicio`): **PASS** (0 Critical, 0 Important),
  probado con tres cuentas. Cierre en la misma terminal (`ctx_c672539f5376`):
  «Visitantes» con los mismos cortes que Resumen, el test que no deja filas
  en `ed`, y las filas y el número de Mensajes (la 7 ya está en `main`).
- 2026-09-26 — Rebase y conciliación de #186 (`49099e9`): una sola versión
  de Buscador y Volver (las de la 7), ADR a 0013, los tipos nuevos con frase
  y visibilidad; gate verde con typecheck en limpio (auth 46/46; sitio 235).
  Revisor r1 (Opus 5.5, medium, base `ed_revcuentas`): task
  `task_0e6286c83569`, dispatch `ctx_ac2af2f36b1e`.
- 2026-09-26 — Cierre de #184 (`790b447`): los arreglos de r1 y las filas
  y el número de Mensajes (revisados por el padre con la captura). **#184
  mergeado** → `main` en `15def2c`. Gate sobre `main` con typecheck en
  limpio: todo en verde (auth 28/28; sitio 234 pasan, 0 fallan). Dispatches y
  worktree fuera. Siete lanes en `main`.
- 2026-09-26 — La lane 10 (`ajustes`) ya tiene sus dependencias en `main`
  y su spec está generada, pero **no se lanza todavía**: la cuenta `mateo` va
  en 87 % de la ventana de 5 h (se renueva en ~47 min) con cinco agentes
  corriendo.
- 2026-09-26 — r1 de #186 (`cuentas`): **FAIL por una fuga de datos**
  (páginas que confiaban en la guarda del layout). Arreglo en la misma
  terminal (`ctx_68f526f31209`), revisor retenido (`ctx_ac2af2f36b1e`) para
  la re-revisión. La regla va al bloque común de las hijas.
- 2026-09-26 — `paginas-que-hacemos-y-quienes-somos` reportó `worker_done`:
  PR #187. Rebase sobre `15def2c` en la misma terminal (`ctx_7478837b4ad0`);
  el revisor sale cuando se renueve la ventana de 5 h (93 %).
- 2026-09-26 — 4b rebaseada sobre `15def2c` (`07c2b6b`), gate verde,
  comparar-render con solo las cuatro diferencias aprobadas. 4c reportó
  `worker_done`: PR #188 (Investigación, Biblioteca y Contacto). En cola hasta
  que se renueve la ventana de 5 h (95 %): los revisores de #187 y #188, la
  re-revisión de #186 y el arranque de `ajustes`.
- 2026-09-26 — Ronda de #186 hecha (`5254b43`): la fuga cerrada en tres
  capas (0 correos de otras cuentas como edita, con `next start`), el test
  que la atrapa, los Minor, «Ver toda la actividad» en el Inicio.
- 2026-09-26 — **Se renovó la ventana de 5 h** (0 %, semanal 59 %). Salió la
  cola: re-revisión de #186 en la terminal del mismo revisor
  (`ctx_f4c064fc9f1e`); revisor de #187 (`ctx_1af30bc4da5f`, sobre
  `07c2b6b`); revisor de #188 (`ctx_714ff5f52552`, sobre `83a332c`); y la
  lane `ajustes` desde `15def2c` (task `task_06b9324760d7`, dispatch
  `ctx_d70abd0be1d6`, puerto 3025, base `ed_ajustes`).
- 2026-09-26 — r2 de #186: **PASS** (la fuga cerrada, con control positivo
  y mutación del test). Revisor liberado; cierre en la misma terminal
  (`ctx_2b7b83305553`).
- 2026-09-26 — `novedades-y-kit` reportó `worker_done`: PR #189 (+6938
  −1329, 164 archivos), sobre `15def2c`. Revisor r1 (Opus 5.5, medium, base
  `ed_revnovedades`): dispatch `ctx_c5e8d213abfc`.
- 2026-09-26 — Cierre de #186 (`cf0d3eb`). **#186 mergeado** → `main` en
  `293e7ba`. Gate sobre `main` con typecheck en limpio: todo verde (auth
  46/46; sitio 257 pasan, 0 fallan), la migración
  `segundo_factor_y_cuentas` aplicada en `ed` (prende el segundo factor de
  dirige y administra y cierra sus sesiones). Dispatches, worktree y base
  `ed_cuentas` fuera. Ocho lanes en `main`.
- 2026-09-26 — SPEC de `ajustes` aprobado. r1 de #187 (4b): **PASS** (0
  Critical, 0 Important). Cierre en la misma terminal (`ctx_3e85e62541e0`):
  el test sobre el registro real, el payload del hero de Qué hacemos, rebase
  sobre `293e7ba`.
- 2026-09-26 — r1 de #189 (Novedades): **PASS** (0 Critical, 0
  Important), migración comparada fila por fila, kit sin ED. Cierre en la
  misma terminal (`ctx_09f9a58ed30f`): mensajes de error por restricción, el
  guid del RSS por id, despublicar sin borrar la intención del borrador, el
  título del borrador en el pendiente del Inicio.
- 2026-09-26 — r1 de #188 (4c): **PASS** (0 Critical, 0 Important). Cierre
  en la misma terminal (`ctx_e8be2e2c666a`): keys de React estables en las
  listas de texto editable, el orden de imports.
- 2026-09-26 — Cierre de #187 (`7a62f84`). **#187 mergeado** → `main` en
  `5737390`. Gate sobre `main` con typecheck en limpio: todo verde (auth
  46/46; sitio 268 pasan, 0 fallan). Dispatches, worktree y base
  `ed_paginasqh` fuera. A la 4c: conciliar `openGraphDeLaPagina` en una.
  Nueve lanes en `main`.
- 2026-09-26 — Cierre de #188 (`c46d5e8`): keys estables, una sola
  `openGraphDeLaPagina` (la de la 4b era idéntica) con el test de las cinco
  páginas hijas. **#188 mergeado** → `main` en `de3f7c2`. Gate sobre `main`
  con typecheck en limpio: todo verde (auth 46/46; sitio 271 pasan, 0
  fallan). Dispatches, worktree y base `ed_paginasinv` fuera. Las siete
  páginas del sitio se editan desde el admin.
- 2026-09-26 — Cierre de #189 (`87e3ed0`). **#189 mergeado** → `main` en
  `77611c1`. Gate sobre `main` con typecheck en limpio: todo verde (kit 3/3,
  auth 46/46, sitio 306 pasan, 0 fallan), la migración `novedades` aplicada.
  Dispatches, worktree y base `ed_novedades` fuera. Once lanes en `main`.
- 2026-09-26 — **Dos lanes nuevas en vuelo**, desde `77611c1` (5 h al 12 %,
  semanal al 62 %):
  - `biblioteca` (8a) — task `task_43ab4647d99d`, dispatch
    `ctx_80de316092b6`, puerto 3026, base `ed_biblioteca`.
  - `casos-aliados-fotos` (9) — task `task_85c1b7aea8b4`, dispatch
    `ctx_17275b94d948`, puerto 3027, base `ed_casos`.
- 2026-09-27 — `ajustes` reportó `worker_done`: PR #190 (cinco pantallas,
  cuatro migraciones, ADR-0015), rebaseado sobre `77611c1` (`7c49911`).
  Revisor r1 (Opus 5.5, medium, base `ed_revajustes`): dispatch
  `ctx_837edaa7a5bc`. Seguimiento anotado por la hija: `datos/actividad.ts`
  ya pasaba el tope de utilidades en `main`.
- 2026-09-27 — r1 de #190: **PASS con un Important** (el «desde» de una
  redirección a mano solo se validaba contra el sitemap: aceptaba rutas
  vivas y la redirección nunca se aplicaba). Arreglo en la misma terminal
  (`ctx_9a03db79c3ea`): un registro de todas las rutas vivas y un test que
  falla si aparece una ruta sin declarar. Revisor retenido para re-revisar.
- 2026-09-27 — r2 de #190: **PASS** (el Important cerrado, con mutación
  del test). Cierre (`196f042`): `/_*` rechazado como «desde». **#190
  mergeado** → `main` en `782aeb27`. Gate sobre `main` con typecheck en
  limpio: todo verde (kit 3/3, auth 46/46, sitio 369 pasan, 0 fallan), cuatro
  migraciones aplicadas. Dispatches, worktree y base `ed_ajustes` fuera. A
  `biblioteca` y `casos-aliados-fotos`: declarar sus rutas en
  `config/rutas.ts` al rebasear. Doce lanes en `main` (contando la 4 como
  tres).
- 2026-09-27 — `biblioteca` reportó `worker_done`: PR #191 (15 pasos,
  ADR-0016), rebaseada sobre `782aeb27` (`0d4f5af`). Revisor r1 (base
  `ed_revbiblioteca`, con foco en SSRF): dispatch `ctx_2c5fa4eee2c3`.
- 2026-09-27 — **Lane 11 `metricas-completas` en vuelo** desde `782aeb2`
  (no espera a la 8a: el contador de materiales lo suma al rebasear): task
  `task_f6fdab703551`, dispatch `ctx_2f56b40105f3`, puerto 3029, base
  `ed_metricas`. Sin deploy, se construye con datos sembrados.
- 2026-09-27 — r1 de #191 (`biblioteca`): **PASS** con un Minor de SSRF
  (el prefijo IPv4-translated `::ffff:0:0/96` pasaba el filtro; no
  explotable acá, pero se arregla). Más de 25 ataques de SSRF rechazados, la
  migración con 0 diferencias. Cierre en la misma terminal: el filtro de IPv6
  con su test, el error de Zod en español, el DOI codificado en OpenAlex.
- 2026-09-27 — SPEC de `metricas-completas` aprobado.
- 2026-09-27 — Cierre de #191 (`5157723`), con el arreglo de IPv6 revisado
  por el padre. **#191 mergeado** → `main` en `d051c6a0`. Desde acá el gate
  sobre `main` corre en un checkout aparte (`%TEMP%\ed-gate`), porque el
  checkout principal tiene el dev server de Mateo en el 3000: typecheck en
  limpio 0, lint 0, react-doctor 100/100, test (kit 3/3, auth 46/46, sitio
  419 pasan, 0 fallan), build 0; dos migraciones aplicadas en `ed`.
  Dispatches, worktree y base `ed_biblioteca` fuera. A la 11: la Biblioteca
  ya está.
- 2026-09-27 — **Lane 8b `equipo` en vuelo** desde `d051c6a`: task
  `task_54001b1676f4`, dispatch `ctx_03f1d6bf0f33`, puerto 3030, base
  `ed_equipo`.
- 2026-09-27 — Para Mateo: dev server en el 3000 (pestaña «dev sitio
  (3000)») y cuenta local `mateo@ed.local` (dirige).
- 2026-09-26 — SPEC de `paginas-inicio` aprobado con cuatro cambios (ver
  DECISIONS); a la lane 5, por mail, la regla «gana la pestaña más
  específica» en lugar de `exacta`.
- 2026-09-27 — SPEC de `equipo` aprobado sin arrastre (ver DECISIONS).
- 2026-09-27 — La 9 rebaseada sobre `d051c6a` y verificada; autorizado su
  force-push con lease a `mateo/casos-aliados-fotos`. Revisor r1 preparado
  (base `ed_revcasos`), sale con su PR.
- 2026-09-27 — La 9 abrió **#192** (`8669148`), rebaseada sobre `d051c6a`.
  Worker retenido. Revisor r1 (Opus 5.5, medium) en `casos-aliados-fotos-review-r1`,
  dispatch `ctx_bd18c611919c`, base `ed_revcasos`.
- 2026-09-27 — r1 de #192: **FAIL**, 1 Critical (la marca de aliado no
  estaba atada al logo). Todo lo demás lo midió y está bien. Ronda de arreglos 1
  en la terminal de la hija: task `task_c4734fcfe0d1`, dispatch
  `ctx_0dca0f67e257`. El revisor queda retenido para la re-revisión.
- 2026-09-27 — El dev server de Mateo (el 3000, en el checkout principal)
  corría con el cliente de Prisma de antes de #191: el Inicio y la Biblioteca
  tiraban errores. Se regeneró y se reinició (terminal
  `term_fa505b3a-a5b0-46c5-971b-e46b073a081c`). **Desde acá, después de cada
  merge:** `pnpm generate` en el checkout principal y reiniciar su dev server,
  además de `migrate:deploy`.
- 2026-09-27 — Ronda de arreglos 1 de #192 hecha (`4f3afafc`): la marca atada
  al logo y al nombre, la migración `aliados` regenerada, Fotos no reemplaza
  un logo autorizado, borrar en una transacción. Gate verde y la fuga con next start
  medida (edita: 0 de 11 marcadores). Re-revisión acotada al mismo revisor:
  task `task_1314b4de3165`, dispatch `ctx_b43647012481`.
- 2026-09-27 — La 11 abrió **#193** (`7fb1921`, 42 commits): las cuatro
  pantallas, `/api/contar`, `/l/`, el resumen semanal apagado, la columna de
  la Biblioteca y el ADR-0017. En el camino arregló el test intermitente de
  avisos. Worker retenido. Revisor r1 (Opus 5.5, medium) en
  `metricas-completas-review-r1`, dispatch `ctx_bf92aadedb6c`, base
  `ed_revmetricas`.
- 2026-09-27 — r2 de #192: el Critical cerrado y verificado (5 tests que
  fallan sin el arreglo). **FAIL** por dos Important: tests inestables en
  paralelo (exit 1, 0, 1) y el alt sin atar. Ronda 2 despachada: task
  `task_faaac9458e43`, dispatch `ctx_3001f719c41a`.
- 2026-09-27 — r1 de #193: **FAIL**, tres Important (el test de avisos
  sigue inestable, HEAD cuenta en `/l/`, la ventana de 90 días más larga que
  el plan) y cuatro Minor. Ronda 1: task `task_3157b0825805`, dispatch
  `ctx_d0c350c90f41`. Revisor retenido.
- 2026-09-27 — Ronda 2 de #192 hecha (`412bf2b8`): `autorizado_alt`, los tests
  con filas propias, `pnpm test` cinco veces con exit 0. Re-revisión r3 al mismo
  revisor: task `task_bec23576876e`, dispatch `ctx_bd77c9de15a5`.
- 2026-09-27 — r3 de #192: **PASS** sobre `412bf2b8`, sin hallazgos (el alt
  atado, cinco corridas estables, migraciones y render). Revisor liberado y su
  worktree fuera. Cierre en la terminal de la hija: task `task_02c53e5b9d30`,
  dispatch `ctx_966d713d4377`.
- 2026-09-27 — **#192 mergeado** (`casos-aliados-fotos`) → `main` en `ddc8ca1d`.
  Tres migraciones aplicadas en `ed`. El checkout principal quedó al día, con
  el cliente regenerado y el dev server reiniciado (`term_ef15658e`). Fuera:
  dispatches, terminal, worktree, rama y base `ed_casos`. Aviso a `equipo`
  (fotos, Lista que se ordena, tests con filas propias) y a `metricas-completas`
  (rebasear y conciliar). El gate sobre `main` está corriendo en `ed-gate`.
- 2026-09-27 — Gate sobre `main` en `ddc8ca1d` (`ed-gate`): typecheck en limpio 0,
  lint 0, react-doctor 100/100, test (kit 3/3, auth 46/46, sitio 470 pasan, 0
  fallan, 2 saltados), build 0. Los 2 saltados: la respuesta grabada de Vercel,
  que llega con A1, y `direccion.test`, porque la base `ed` ya tiene la cuenta de
  Mateo que dirige. La primera corrida del build falló por `next/font/google` (`Can
  not resolve @vercel/turbopack-next/internal/font/google/font`, 18 errores de
  JetBrains Mono): la descarga de la fuente, pasajera. La segunda, desde
  `.next` limpio, dio 0.
- 2026-09-27 — Ronda 1 de #193 hecha y rebaseada sobre `ddc8ca1d` (`7ec4363b`,
  migración regenerada). Test cinco veces con exit 0. Re-revisión r2 al mismo
  revisor: task `task_aacb56d46ede`, dispatch `ctx_141940838b19`.
- 2026-09-27 — r2 de #193: **PASS**. La corrida roja fue un deadlock de la 9
  en `main`, no de la lane. Cierre en la hija: task `task_27fbad4f9e3f`, dispatch
  `ctx_a6f044929413`: la siembra de 1997, UTM apagado dicho en llano, el renglón de
  Google fuera, el handoff y el gate. Revisor liberado y su worktree fuera.
- 2026-09-27 — La 8b abrió **#194** (`90ea947f`, 39 commits, rebasada sobre
  `ddc8ca1d`). Worker retenido. Revisor r1 (Opus 5.5, medium) en
  `equipo-review-r1`, dispatch `ctx_3077e09608ee`, base `ed_revequipo`. El
  deadlock de mover en una lista (`moverAliadoEnBase`, de la 9) va a la ronda
  de arreglos de Equipo, que es dueña de la pieza compartida.
- 2026-09-27 — r1 de #194: **FAIL**, 1 Important (el deadlock de mover, heredado
  de Aliados) y 3 Minor (5/5 sin respaldo, 11 px de desborde a 390, la Dirección
  hasta dos fuera de la transacción), más borrar un perfil que pisa borradores.
  La migración, las 78 tarjetas y el render, verificados. Ronda 1: task
  `task_9005154cc37d`, dispatch `ctx_ea95b9f02edf`.
- 2026-09-27 — Cierre de #193 revisado por el padre: los tests de Vercel borran
  solo sus filas, Links explica una vez por qué no hay visitas en Hobby y el
  resumen ya no trae los clics de Google. **#193 mergeado** (`metricas-completas`)
  → `main` en `d7c8107b`. Migración aplicada en `ed`, checkout principal al día,
  cliente regenerado y dev server reiniciado (`term_a15ea0f4`). Fuera: dispatches,
  terminales, worktree, ramas y base `ed_metricas`. Aviso a `equipo`: rebasear
  y conciliar. El gate sobre `main` está corriendo en `ed-gate`.
- 2026-09-27 — Gate sobre `main` en `d7c8107b` (`ed-gate`): typecheck en limpio 0,
  lint 0, react-doctor 100/100, test (kit 3/3, auth 46/46, sitio 549 pasan, 0
  fallan, 2 saltados: la respuesta grabada de Vercel y `direccion`), build 0.
- 2026-09-27 — Ronda 1 de #194 hecha y rebaseada sobre `d7c8107b` (`da155d73`):
  `datos/acciones/lista-ordenada.ts` con `pg_advisory_xact_lock` para Aliados y
  Equipo, el cupo de la Dirección con el candado, FOR UPDATE al borrar y
  `grid-cols-1`. Test cinco veces con exit 0. Re-revisión r2: task `task_e25df24b89d0`,
  dispatch `ctx_a960d12fbf0d`. Brief de `cierre-del-mapa` listo en `ed-orq`: sale
  cuando Equipo esté en `main`.
- 2026-09-27 — r2 de #194: **PASS** sobre `da155d73`: la concurrencia medida en
  Equipo y Aliados, los 5/5 y los 390 reales. El Minor del test que despublica
  a Raquel pasa a un cupo inyectado. Cierre en la hija: task `task_35ecbd079e66`,
  dispatch `ctx_304e0e246c9e`. El revisor, su worktree y `C:/tmp/ed-antes`, fuera.
- 2026-09-27 — Cierre de #194 revisado por el padre: el cupo es inyectable solo
  desde adentro de `datos/`, porque la acción valida con un `z.object` cerrado.
  **#194 mergeado** (`equipo`) → `main` en `910dabf5`. Migraciones aplicadas en `ed`.
  Checkout principal al día, cliente regenerado y dev server reiniciado
  (`term_9a2d147f`). Fuera: dispatches, terminales, worktree, ramas y todas las
  bases `ed_equipo*`. **Las once lanes de código del mapa están en `main`.** El
  gate sobre `main` está corriendo.
- 2026-09-27 — Gate sobre `main` en `910dabf5`: typecheck en limpio 0, lint 0,
  react-doctor 100/100 (1181 archivos en sitio), test (kit 3/3, auth 46/46, sitio
  576 pasan, 0 fallan, 2 saltados), build 0.
- 2026-09-27 — **Lane `cierre-del-mapa` en vuelo** desde `910dabf`: task
  `task_c7e02925a257`, dispatch `ctx_28b2fe9ae3a8`, puerto 3032, sin migraciones.
  Hace la mudanza del armazón al kit, parte los registros que pasan el tope,
  arregla `linkDelDoi`, borra `admin/por-hacer/` y las portadas sin uso, y deja
  al día los documentos del cierre. Los `scrub: true` del sitio (11 en 8
  archivos) quedan afuera: van a una lane propia, con verificación visual.
- 2026-09-27 — r1 de #195 (`cierre-del-mapa`): **PASS**, sin Critical ni Important.
  Registros idénticos entre `main` y la rama, HTML del admin igual con los tres
  roles y los tres temas (salvo la 404 de P5), 12 páginas idénticas, 5 de 5 en
  test. Los cuatro Minor, arreglados en la ronda de cierre: el spec §11, ejemplos
  neutros en el kit, `useErroresDelEditor` en la lista del armazón y un test que
  frena una clave repetida entre módulos. El worker de la hija quedó cortado por
  un reinicio de la máquina, después de pushear su cierre. El padre corrió el
  gate sobre la cabeza de la rama (`756a60a1`, sobre `f50cf408`), con Docker
  vuelto a levantar: typecheck en limpio 0, lint 0, react-doctor 100/100 (sitio
  1197, kit 52), test (kit 11/11, auth 46/46, sitio 569 pasan, 0 fallan, 2
  saltados), build 0. **#195 mergeado** → `main` en `eb4b4e19`, con el mismo árbol
  que se midió. Fuera: su worktree, su terminal, la rama, `%TEMP%/cierre` y el
  checkout del gate (`%TEMP%/ed-gate`); la copia `ed_cierre` ya la había borrado
  la hija.
- 2026-09-27 — **El código del mapa está entero en `main`**: las once lanes de
  código y el cierre. Del criterio de cierre del SPEC §11 falta lo que no es
  código: la lane 0 (deploy) y el recorrido en producción (entrar con segundo
  factor, publicar una novedad, recibir un contacto, verla en el Inicio). La
  lane padre queda abierta solo para eso.

## Hecho

## Abierto

- Lo que tiene que venir de afuera: SPEC §8.
- Antes del primer deploy de lo nuevo: Resend configurado y probado (sin mail,
  dirige y administra no entran: segundo factor de la 3b); verificar en
  Vercel cómo llega `X-Forwarded-For` (nota de la lane 2).
- `scrub: true` en 11 coreografías de 8 archivos del sitio (HeroQuienes, Hero,
  Biblioteca, Investigación), contra AGENTS.md §8: una lane propia con
  verificación visual de cada coreografía, fuera del mapa del admin.
- `origen-03-pregunta.webp` está dos veces (`public/fotos/` para Quiénes
  somos y `public/quienes-somos/` para una novedad): deduplicar en la lane 9
  (Fotos), cuando se consolide dónde vive cada archivo.
- `linkDelDoi` arma `https://doi.org/{doi}` sin escapar `#` ni `?` (nota de
  la hija de la 8a): codificar el DOI como segmento de ruta.
- La mudanza mecánica de `admin/armazon/` a `packages/kit-admin`, cuando no
  haya lanes en vuelo, borrando los re-exports que deja la lane 6.
- `datos/avisos.test.ts` (Ajustes) falla 1 de cada 4 vueltas, también en
  `main` (nota de la hija de la 9): buscar la causa, no reintentar.
- `datos/inicio/pendientes.ts` pasa el tope de utilidades (104 en `main`,
  110 con la 9): partirlo por registro de módulo.
- Para ED: confirmar con Raquel la autorización de Techint (la hoja ALIANZAS
  todavía dice «solicitado»). Si la confirma, se cambia la nota desde la ficha
  de Techint, sin volver a autorizar el logo.
- El CSS del sitio y el del admin son uno solo: Métricas le sumó 2,5 KB al
  CSS global de cada página pública (lo midió el revisor de la 11). Separarlos
  en su momento.
- Para el deploy (lane 0), de la 11: las variables de Vercel y de Search
  Console en Production; A1, la primera corrida real, que confirma la forma del
  `by` repetido (`lib/metricas/vercel.ts:65` y `:91`) y graba las respuestas que
  espera el único test saltado; Resend en Production para el resumen semanal.
  Si ED cambia de plan, `PLAN_DE_VERCEL` (`config/metricas.ts`) prende la
  ventana de 90 días y las visitas por link.
- `C:/tmp/ed-antes` es un worktree de `main` que armó el revisor de Equipo para
  comparar el render: sacarlo cuando cierre Equipo.
- Para ED, de Equipo:
  - La bio (15) y el LinkedIn (5) están en `docs/content/equipo-sin-publicar.md`
    para la fase 4.
  - Revisar en la Biblioteca los 14 títulos, 2 rótulos y 2 detalles que
    cambiaron en los perfiles.
  - Los 5 materiales nuevos no tienen descripción ni portada.
  - Confirmar el tema y el año de «la tortilla», y el público de la
    «Secuencia lúdica».
  - «Producción de fórmulas» tiene un PDF público: sumarle el link y pasarla
    a la Biblioteca.
- Del repo, de Equipo: `public/biblioteca/portadas/44-…` y `57-…` quedaron sin
  uso (sus títulos se corrigieron).
- Fase 4, de Equipo: las fichas públicas `/quienes-somos/equipo/<slug>` con su
  JSON-LD, y cargar el recorrido al abrir el perfil (hoy viajan ~110 KB en el
  HTML).
- La base `ed_panel` del contenedor no es de ninguna lane de este XL: preguntarle
  a Mateo antes de tocarla.
- De `cierre-del-mapa`, para después:
  - **Dos corridas de la suite a la vez contra la misma base se ensucian.**
    Pisan destacados, el orden de los aliados y los chequeos de links. Hasta
    que los tests con filas fijas pasen a filas propias, un gate por base a la
    vez.
  - El README (sección del deploy) todavía dice que el build va a correr las
    migraciones «cuando llegue la fase 1»: es de la lane 0.
  - AGENTS.md §6 cuenta los `.tsx` sobre el tope con una medición del
    2026-09-26. El cierre sacó 27 archivos de la app (24 al kit y 3 borrados),
    así que conviene volver a medir.
  - Una 404 propia del admin, con su armazón (idea de P5).
- Las cuentas de prueba de las lanes (`cierre-*@ed.test`, `equipo-prueba@ejemplo.org`
  y las anteriores) quedan en la base `ed` local. Tienen actividad, y la clave
  foránea no deja borrarlas. Es solo la base de desarrollo.
