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
- 2026-09-26 — **Dos patrones más cambian de lane** (el padre, al escribir el
  brief de la lane 1): «← volver» no tiene consumidor en la lane 1 y nace en
  la lane 3, con el primer detalle (`/admin/cuentas/[id]`); el punto de
  Contenido en la sidebar ya existía (#176), y el número de la sidebar nace
  en la lane 7 con Mensajes. El SPEC §7 no se toca a mitad de ola: manda el
  brief, y esta línea.
- 2026-09-26 — **Los cambios a DESIGN.md y AGENTS.md** que haga una hija
  (§5.6 los pide con confirmación) los revisa Mateo en el PR, antes de su OK
  al merge: van nombrados en el SPEC de la lane.
- 2026-09-26 — **SPEC de `patrones-del-admin` aprobado por el padre, con un
  cambio:** las pestañas salen sin número; lo suma la lane 7 con Mensajes,
  su primer consumidor. Aprobadas tal cual sus otras lecturas: el `h1` es el
  módulo, sin pestañas en el índice ni en el editor, acceso sin tema, vacío
  sin acción, la excepción de tipo solo en el panel de marca del login, y los
  títulos «Inicio · Páginas · Admin ED».
- 2026-09-26 — **SPEC de `seguridad-del-acceso` aprobado.** Mateo («Sí, las
  dos»): las columnas de `bloqueos_de_acceso` (`clave` HMAC, `fallos`,
  `desde`, `bloqueos`, `hasta`) y `tsx` como devDependency de `packages/auth`
  para sus tests. El padre: `'unsafe-eval'` solo en la CSP del admin en
  desarrollo; un reintento en el cliente de Resend con la misma
  `Idempotency-Key`, solo ante timeout, red o 5xx; `FormularioEntrar` consulta
  la sesión también al cargar (por `SameSite=Strict`, un link desde un mail
  llega sin cookie).
- 2026-09-26 — **`seguridad-del-acceso`: el rebote de `SameSite=Strict` va en
  el proxy, no en el cliente.** Consultar la sesión al cargar `Entrar` choca
  con react-doctor (`nextjs-no-client-side-redirect`,
  `rerender-state-only-in-handlers`), y esquivarlo era apagar la regla por
  otro nombre. El proxy contesta un meta refresh a la misma URL cuando una
  navegación GET de documento llega `cross-site` y sin cookie: cubre
  cualquier link al admin, sin JS. Condiciones: solo GET de documento
  `cross-site`; URL relativa, del propio pedido; `no-store`, las cabeceras de
  `/admin` y un link «Seguir»; test de las cuatro ramas y curl de punta a
  punta.
- 2026-09-26 — **Revisión r1 de `patrones-del-admin` (#178): PASS con dos
  Important, sin re-revisión.** (1) El padre ratifica que una página sin
  secciones va sin insignia ni «quién y cuándo»: el SPEC §5.3 ya le da su
  estado propio (atenuada, «Todavía no se edita desde acá»), y «Sin editar»
  sobre algo que no se edita confunde; se corrige el body del PR. (2) Las
  capturas se guardan en `%TEMP%\ed-orq\capturas\patrones-del-admin\` y
  Mateo las sube a mano (precedente #176). Ninguno de los dos cambia código,
  así que el padre los verifica sin otro asiento de revisor.
- 2026-09-26 — **Mateo autoriza seguir en automático hasta el final**, en
  sus palabras: «procede en automatico 100% de confianza en vos vamos hasta
  el final manteniendo las buenas practicas, y la escalabilidad». Desde acá
  el padre aprueba los SPEC de las hijas (tablas y dependencias incluidas) y
  mergea cada PR después del PASS del revisor y del gate sobre `main`, sin
  preguntar. No cambia la ceremonia: un revisor Opus 5.5 por lane, el gate
  entero, cada decisión escrita acá.
- 2026-09-26 — **#178 mergeado** (`0778edb`). El gate sobre `main` dio
  verde después de borrar los tipos generados viejos de `.next/` del checkout
  principal (apuntaban a las rutas de Páginas que se mudaron; no era código).
- 2026-09-26 — **La lane 4 se parte en tres** (el padre, al armar la ola
  2): las 41 secciones de las fases B, C y D más SEO, «ver qué cambió» y
  versiones no entran en un PR revisable. 4a `paginas-inicio` (la base:
  `versiones_de_paginas`, ver qué cambió, aviso de choque, la pestaña SEO; y
  el resto de Inicio), después, en paralelo, 4b
  `paginas-que-hacemos-y-quienes-somos` (con las áreas y el método en una
  sola fuente) y 4c `paginas-investigacion-y-resto`. La lane 9 pasa a
  depender de 4a.
- 2026-09-26 — **Un solo cron diario, con un registro de tareas** (el padre,
  por escalabilidad): la lane 5 es la primera que suma una tarea programada,
  así que crea `/api/cron/diario`, que corre cada tarea registrada aislada
  (una que falla no frena a las otras) y deja cada corrida en una tabla
  común que Ajustes › Conexiones va a leer. La copia de Vercel Analytics se
  muda ahí. Cada módulo que después necesite algo programado (chequeo de
  links, retención, resumen semanal) registra una tarea, no un cron nuevo:
  Vercel Hobby corre los crons una vez por día y en cantidad limitada.
- 2026-09-26 — **La lane 5 no toca el Inicio:** el panel de métricas sigue
  ahí hasta que la lane 3 rehaga el Inicio; Métricas › Resumen lo usa
  también.
- 2026-09-26 — **Cada hija que migra usa su propia base** en el mismo
  contenedor (`ed_<lane>`), para que una migración sin mergear no quede
  aplicada en la base `ed` que usan las demás.
