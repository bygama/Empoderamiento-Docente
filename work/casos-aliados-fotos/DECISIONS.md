# DECISIONS — Casos, Aliados y Fotos

- 2026-09-27 — **SPEC aprobado por el padre con las doce propuestas (A a L) y
  tres resguardos.** Aprobadas las tablas `casos` y `aliados`, los cambios a
  `fotos` (url única, `subida_por` nulo, `image/svg+xml` solo por
  importación), las tres migraciones con sus datos y los cambios a AGENTS.md
  §3 y §5.4 y a DESIGN.md §11. Los resguardos:
  1. **SVG:** entra solo por la importación (los logos del repo, de
     confianza) y nunca por subida: subir lo rechaza por el contenido (no por
     la extensión), con un test que intenta subir uno y recibe el rechazo.
     Como se sirven como estáticos de `public/`, queda escrito por qué es
     seguro: son archivos del repositorio.
  2. **Reemplazar:** la reescritura de URLs va en una transacción y el
     archivo viejo se borra **después** de que confirme; si el borrado falla,
     queda en el log y una tarea del cron diario limpia los archivos que
     ninguna fila usa. La base nunca apunta a un archivo que no existe.
  3. **El SQL generado** de cada migración lleva un comentario con de qué
     salió y cómo se generó (el script no se commitea).

- 2026-09-27 — **Lo que se repite de la ficha de una entidad sube al
  armazón, sin tocar lo que Biblioteca (8a, en vuelo) cambia** (paso 15).
  Casos es el segundo consumidor: `AccionesDeLaFicha` se mudó de
  `admin/novedades/` a `admin/armazon/` (8a no lo toca) y la fila de «Deshacer»
  pasó a `FilaDeAccion` (la usan Novedades y Fotos). El «Qué cambió» plegado y
  el `Bloque` del formulario nacen en el armazón como piezas nuevas; los de
  Novedades quedan como están, porque 8a está cambiando `QueCambio.tsx` y
  `FormularioDeNovedad.tsx`: que Novedades use los del armazón es un cambio
  mecánico para cuando las dos lanes estén en `main` (Abierto). Por lo mismo,
  la miniatura del logo en la lista de Aliados va adentro de lo principal de
  la `Fila`, sin sumarle una prop (8a le suma `miniatura`).
- 2026-09-27 — **Subir una foto a la biblioteca tiene su pantalla**
  (`/admin/contenido/fotos/subir`), como «Nueva novedad», y no un
  formulario que se abre en la grilla (el SPEC §7.3 decía «en la misma
  pantalla»): reusa el `CampoFoto` del kit entero (alt obligatorio, tope,
  errores) y al subir lleva a la ficha.
- 2026-09-27 — **«Ver» en Cuentas › Actividad lleva a un caso, no a un
  aliado ni a una foto** (paso 3). El SPEC decía «a la ficha del aliado o de
  la foto, nada si se borró»; saber si todavía existen pedía otra consulta en
  la pantalla de Actividad, que Ajustes (en vuelo) también toca. Se sigue el
  precedente de Novedades: lo que se puede borrar no lleva link. Los casos,
  que no se borran, sí. El SPEC §9 quedó al día.
- 2026-09-27 — **La migración se crea en una terminal de Orca** (paso 2):
  `migrate dev --create-only` pide confirmar el aviso del índice único y se
  niega en un shell no interactivo. Se corre en una pestaña de Orca y se le
  contesta ahí; el archivo es el que genera Prisma, con los datos sumados
  antes de la primera aplicación.
- 2026-09-27 — **Lo que la exploración encontró y el SPEC toma** (antes de la
  aprobación): los casos se consumen solo en componentes del navegador
  (`CasosInvestigacion`, `useAccionesLugar`, `useHistorialLugar`), así que
  entran por prop desde `InvestigacionEnAccion`, el único del servidor; el
  expediente se dibuja recién al abrirlo, y en el HTML prerenderizado está
  solo la pila. `LineasInvestigacion` cruza cada línea con un caso por su
  slug, escrito en código (`CASO_DE_CADA_LINEA`): con el slug editable eso se
  rompía en silencio (SPEC §4.1). Los topes de cada texto salen de los
  largos de hoy y de lo que la escena aguanta (la pregunta, dos renglones de
  48ch en la tapa; el indicio, una caja de `h-5`). Los dos
  `origen-03-pregunta.webp` son idénticos byte a byte.
- 2026-09-27 — **Rebase sobre `main` en `782aeb27` (la lane de Ajustes)**,
  como pidió el padre antes del `worker_done`. Conflictos, resueltos juntando
  las dos lanes: los tipos, las frases y quién ve cada cosa en la actividad
  (los de Ajustes primero, los de esta lane después); el layout del sitio lee
  los datos del sitio y los aliados en un `Promise.all` y el `Footer` recibe
  los dos (`sitio` y `aliados`); el renglón de §11 de DESIGN.md, el árbol de
  AGENTS.md §3 y el resumen del README suman las dos cosas. Las cuatro
  migraciones de Ajustes tienen fecha anterior a las de esta lane: el orden
  del historial queda Ajustes → fotos, casos, aliados, igual que en
  producción. La columna nueva `redirecciones.a_mano` tiene default `false`,
  así que las 308 que escribe `redirigir` al cambiar el slug de un caso
  quedan como «del sitio», que Ajustes no deja borrar: es lo que corresponde.
  `config/rutas.ts` (nuevo en `main`) declaraba la carpeta
  `public/quienes-somos/`, que esta lane borró al deduplicar
  `origen-03-pregunta.webp`: se saca de la lista. Las rutas nuevas del admin
  y `/api/fotos/[id]` ya están cubiertas por `/admin/[[...todo]]` y
  `/api/[[...todo]]`. Queda en la rama local
  `respaldo/casos-aliados-fotos-pre-rebase` (no se sube) por si hace falta
  comparar.
- 2026-09-27 — La rama de respaldo del rebase se borró después de la
  verificación: el gate, las migraciones desde cero y `comparar-render`
  pasaron sobre la rama rebaseada, así que ya no hace falta comparar. También
  se sacaron la copia de `main` para comparar (`git worktree remove`), las
  bases `ed_casos_limpia` y `ed_casos_main` y el perfil de navegador de
  `administra`.
- 2026-09-27 — **Arreglos que salieron de verificar, en commits aparte y no
  en su paso:** el ancho de la ficha a 390 px (`grid-cols-1`) y la carrera de
  mover en la tira (`updateMany`, y los tests separados por filas). El
  primero toca solo las fichas de esta lane; la de Novedades, que tiene lo
  mismo, queda anotada en PROGRESS para no pisar a la lane de Biblioteca.
- 2026-09-27 — **Segundo rebase, sobre `main` en `d051c6a0` (Biblioteca)**,
  que se mergeó mientras esta lane verificaba. Se juntó a mano lo de las dos
  (actividad, Inicio, cron, pendientes, docs). De las piezas que las dos lanes
  subieron al armazón quedó la de `main` (`QueCambioPlegado`); de
  `AccionesDeLaFicha`, el lugar de esta lane (el armazón), con el cambio de
  tipo que hicieron las dos igual, y la ficha del material apunta ahí. La
  portada propia de un material entra al registro de usos de Fotos: sin eso,
  borrar o reemplazar esa foto rompía la portada. Las portadas tipográficas de
  `public/` no se importan a `fotos`: las genera Biblioteca, no se editan como
  fotos. `pendientes.ts` queda en 110 líneas (104 en `main`): no se reformatea
  el código de otra lane para esconderlo.
- 2026-09-27 — El `grid-cols-1` de las fichas se extiende a la de una novedad
  y a la de un material una vez mergeada Biblioteca (antes se había dejado
  afuera para no pisarla): es una regla del patrón «Ficha de una entidad», no
  de una ficha, y queda escrita en DESIGN.md §11.
- 2026-09-27 — **Force-push de la rama de la lane, autorizado por el padre.**
  La rama remota estaba en `3e0fbab1`, de antes de los dos rebases. Se
  preguntó por `orca orchestration ask` (AGENTS.md §5.6) y el padre contestó:
  «Sí: hacé `git push --force-with-lease=mateo/casos-aliados-fotos:3e0fbab1
  origin mateo/casos-aliados-fotos`, solo sobre tu rama (nunca main, nunca
  --no-verify). Es tu rama de lane, reescrita por el rebase que pide el
  cierre; el lease protege contra pisar algo ajeno. Anotalo en tu DECISIONS
  con esta autorización del padre.»
- 2026-09-27 — **Ronda de arreglos 1: la marca «Autorizado» queda atada a lo
  que se autorizó** (decisión del padre sobre el Critical de r1: quien edita
  guardaba sobre UNESCO un borrador con el nombre «Ministerio de Educación» y
  otra foto, y se publicaba con la marca vieja). Lo que decidió el padre:
  - Dos columnas nuevas en `aliados`, `autorizado_logo` (el `src` del logo) y
    `autorizado_nombre`. Marcar como autorizado (`autorizarAliados`, con la
    nota obligatoria) guarda los del borrador si se puede publicar; si no, los
    publicados. La confirmación muestra ese logo y ese nombre. Quitar la
    autorización las vacía.
  - Publicar se niega para todos si el logo o el nombre del documento difieren
    de los autorizados («Cambió el logo o el nombre desde que se autorizó: lo
    vuelve a autorizar quien dirige o administra, mirando el nuevo.»).
    Publicar no reautoriza a nadie.
  - La consulta del sitio, también en la vista previa, muestra una fila solo si
    el documento que mostraría tiene ese logo y ese nombre.
  - Fotos › Reemplazar no reemplaza el logo autorizado de un aliado, y lo dice.
  - La migración `aliados` se regenera con las dos columnas (no va una
    segunda): los cinco de hoy entran autorizados con su logo y su nombre.
  Lo que se decidió al implementarlo:
  - **Quien autoriza manda lo que vio** (`visto`: el `src` y el nombre que se
    le mostraron). Si lo guardado ya es otro (alguien guardó mientras tanto),
    no se autoriza y se pide recargar. La Server Action lo exige al marcar.
    Además, el `update` exige que `autorizado_logo` y `autorizado_nombre` sigan
    como se leyeron: dos que autorizan a la vez no se pisan sin verse.
  - **Se autoriza lo guardado, nunca lo que está sin guardar**: con cambios sin
    guardar, el botón queda deshabilitado y la ficha lo dice. «Guardar la
    nota» cuando la marca ya vale y solo cambia la nota.
  - **Un aliado cuyo documento cambió cuenta como sin autorizar** en la lista,
    en la tarjeta de Contenido y en la fila del Inicio («N aliados sin
    autorizar»): no se puede publicar así, y alguien que autoriza tiene que
    mirarlo. En la ficha, un aviso de error lo explica.
  - **La vista previa es estricta**: si el borrador que mostraría no es lo
    autorizado, esa fila no sale (no cae a lo publicado). Es lo que pidió el
    padre: la fila se muestra solo si el documento que mostraría coincide.
  - Reemplazar chequea antes de subir el archivo nuevo y otra vez adentro de la
    transacción; si en el medio alguien autorizó esa foto como logo, borra el
    archivo nuevo y contesta lo mismo.
  - La lectura de la tira sale a `tiraEnBase(db)`, para probar la consulta
    contra la base sin `draftMode`.
  - Para volver a 100 en react-doctor, `AutorizacionDelAliado` se partió en
    `autorizacion-del-aliado/` (textos, estado, campos, controles y el hook
    `useAutorizar`) y el control de reemplazo de `SalidaDeLaFoto` en
    `salida-de-la-foto/ReemplazarElArchivo.tsx`.
- 2026-09-27 — **Borrar una foto, en una transacción con la fila bloqueada**
  (Minor 5 de r1): `SELECT … FOR UPDATE` sobre la fila de `fotos`, los usos
  leídos con el mismo cliente de la transacción y el borrado de la fila
  adentro; el archivo, después del commit. Un reemplazo o un borrado a la vez
  espera. **La ventana que queda:** un guardado que elige esa foto (el
  borrador de una página, una novedad, un caso, un material o un aliado) no
  toma el bloqueo, así que puede sumar un uso entre la lectura de los usos y
  el commit del borrado; ese uso quedaría apuntando a una foto que ya no está
  en la biblioteca (el archivo de `public/` sigue; el de una subida se borra).
  Es aceptable para el equipo de ED, que es chico y rara vez borra y elige la
  misma foto en el mismo segundo: lo decidió el padre, y queda escrito acá.
