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
- 2026-09-26 — **SPEC de `busquedas-de-google` aprobado.** Tablas
  `corridas_de_tareas` y `busquedas_diarias`; `metricas_sincronizaciones` se
  borra moviendo su historial. **Migraciones con datos:** `migrate dev
  --create-only` y el SQL de datos sumado antes de la primera aplicación (la
  vía documentada de Prisma). La regla protege las migraciones aplicadas, y
  esta no lo es; perder el historial era peor. La línea de AGENTS.md §12 se
  precisa en ese PR para que diga eso, y el ADR-0011 lo registra. Sus lecturas
  9.2 a 9.11 aprobadas en bloque (tres listas, 28 días fijos, umbrales con
  nombre, `exacta` en Pestañas, pasos en el estado vacío, la acción de
  «Actualizar ahora» por prop, países por `Intl.DisplayNames` con una tabla
  CLDR compacta, tareas en paralelo con 50 s, la copia de Vercel a
  `datos/tareas/`).
- 2026-09-26 — **SPEC de `paginas-inicio` aprobado con cuatro cambios.**
  (a) El SEO de 60/160 es recomendación con aviso, no límite duro: el valor
  de hoy (72/241) tiene que validar y el SEO nunca frena guardar. (b)
  Pestañas: **gana la más específica** (el prefijo más largo, cortando en un
  segmento), que reemplaza la prop `exacta` aprobada a la lane 5; la
  implementa la lane 5 y la 4a la consume. (c) Los alts del hero siguen bajo
  `aria-hidden`: es un collage decorativo de 19 fotos, anunciarlas es ruido y
  cambiaría el HTML del sitio; el alt se sigue pidiendo porque es de la foto.
  (d) El error en el campo mismo entra en la 4a, base del editor de 4b y 4c.
  Aprobado tal cual: `versiones_de_paginas` sin relleno (producción no tiene
  filas), el resaltado sin séptimo tipo, «seo» como clave reservada del
  documento, el editor con cuatro pestañas-ruta, el choque en toda escritura.
- 2026-09-26 — **#180 mergeado** (`446ab51`), sin preguntar, con la
  autorización de Mateo: revisor PASS, ronda de Minor hecha, gate sobre
  `main` en verde. Los dos tests que fallaron en `main` eran de la base `ed`,
  que no tenía las migraciones nuevas: `migrate:deploy` las aplicó.
- 2026-09-26 — **La lane 3 se parte en tres** (el padre): 3a
  `roles-y-actividad` (tres roles, la guarda y «Sin permiso», la tabla
  `actividad`, Mi cuenta, `/.well-known/change-password`); después, en
  paralelo, 3b `cuentas` (Cuentas, invitar, una cuenta, pasar la dirección,
  suspender, Actividad, segundo factor, «← volver») y 3c `inicio` (el Inicio
  nuevo, que además espera a la 5 por los clics de Google). Novedades,
  Mensajes y Ajustes necesitan solo permisos y actividad: pasan a depender de
  3a y no esperan a Cuentas ni al Inicio.
- 2026-09-26 — **El registro de actividad de páginas y fotos** lo suma la
  lane que se mergee después, entre 3a y 4a (las dos tocan lo suyo y ninguna
  lo del otro); el padre se lo pide en su rebase.
- 2026-09-26 — **SPEC de `roles-y-actividad` aprobado.** Tablas:
  `actividad` (FK a la cuenta con `RESTRICT`: se suspende, no se borra),
  `ciudad` y `pais` en `session` (de las cabeceras de Vercel), el índice
  único parcial de una sola dirige. Las 11 capacidades del §3 enteras (la
  matriz aprobada en un solo lugar; las que no tienen consumidor dicen qué
  lane las usa). El test de capacidades exceptúa por nombre las acciones de
  4a y 5, que las suman al rebasear. Suma `nombrar-direccion <correo>` para
  la persona de ED que ya tiene cuenta en producción.
- 2026-09-26 — **Pendiente del padre al mergear 3a:** pedirles a 4a y a 5
  que en su rebase saquen su excepción del test de capacidades, chequeen la
  capacidad y registren en `actividad` sus acciones.
- 2026-09-26 — **Revisión r1 de `busquedas-de-google` (#181): PASS**, sin
  Critical ni Important. El padre ratifica dos desvíos de la hija: los
  cambios extra en el árbol de AGENTS.md §3 y §6 (mantenimiento necesario) y
  «Actualizar ahora» en secundario también en el Inicio (su borde daba
  1,77:1; un control pide 3:1, y eso gana sobre «la lane 5 no toca el
  Inicio»). Se arreglan antes del merge: el falso «falló» recién conectado
  y el freno de «Actualizar ahora», que pasa a ser atómico en la base.
- 2026-09-26 — **Revisión r1 de `roles-y-actividad` (#182): PASS**, sin
  Critical ni Important, con los permisos probados con tres cuentas. El
  padre ratifica la contraseña en su propio apartado de Mi cuenta y «Activa
  ahora» para la sesión actual; se arreglan antes del merge DESIGN.md («Sin
  permiso» también en Métricas), el árbol de AGENTS.md §3 y el literal del
  rol en `crear-cuenta`.
- 2026-09-26 — **La lane 6 espera también a la 4a**: `novedades-y-kit` muda
  `admin/campos/` a `packages/kit-admin`, y la 4a le está sumando el error en
  el campo mismo. Mudar un archivo que otra lane está cambiando es el choque
  que `--deps` existe para evitar.
- 2026-09-26 — **Lo que un módulo le suma al Inicio o a la sidebar lo suma
  el que se mergea segundo**: la lane 3c crea el registro de pendientes con
  las filas que existen ese día (páginas sin publicar, Search Console sin
  conectar); cada módulo suma su fila cuando el registro ya está en `main`,
  y si no está, el padre se lo pide a quien llegue después.
- 2026-09-26 — **SPEC de `inicio` (3c) aprobado**, con «quién ve cada tipo
  de actividad» junto a los tipos, en `datos/` (y la frase en
  `admin/actividad/frase.ts`), porque la pantalla de Actividad de 3b usa la
  misma regla; se lo avisé a 3b. `Tarjeta` pasa al armazón como el patrón
  «Número». Sin tabla nueva.
- 2026-09-26 — **SPEC de `mensajes` (7) aprobado.** CV en un store
  **privado** de Vercel Blob (GA desde 2026-06-30; `@vercel/blob` 2.8.0 ya lo
  soporta, sin dependencia nueva), aparte del de fotos. Tablas `mensajes`,
  `limites_por_ip` (HMAC, nunca la IP) y `avisos`. El mail de aviso no lleva
  ningún dato de quien escribió: una copia en cada buzón haría falsa la
  promesa de borrar a los 24 meses. Los estados son un filtro y las pestañas
  son las bandejas. El CV público (`/sumate-al-equipo`) se enciende con
  `CV_ABIERTO=si`, con el diseño del sitio y fuera del sitemap mientras esté
  apagado.
- 2026-09-26 — **SPEC de `cuentas` (3b) aprobado.** Segundo factor por mail
  con el plugin de better-auth, obligatorio para dirige y administra, y
  garantizado por un CHECK en la base; quien ya tiene sesión ese día vuelve
  a entrar con código. Quien dirige o administra puede cambiar el correo de
  otra cuenta (la vía para recuperar un buzón perdido), con aviso a las dos
  direcciones. **Condición del deploy (lane 0): Resend configurado y probado
  antes de que esto llegue a producción**, porque sin mail dirige y
  administra no entran; la pantalla del código dice en llano si el mail no
  salió.
- 2026-09-26 — **Revisión r1 de `paginas-inicio` (#183): PASS con un
  Important.** Un import de imagen como módulo solo tipaba gracias a
  `next-env.d.ts`, que es generado y está en `.gitignore`: en un clon limpio
  el typecheck (y el pre-push) fallaba. Se arregla usando la URL
  `/opengraph-image.png`. **Desde acá, el gate del padre sobre `main` corre
  el typecheck sin `next-env.d.ts` ni `.next/`**, como lo ve un clon nuevo.
  Las secciones de Inicio pasan de `aria-label` fijo a `aria-labelledby` de
  su título editable (cambio de HTML a propósito).
- 2026-09-26 — **El `scrub: true` de HeroQuienes** (AGENTS.md §8) es de antes
  del XL y cambiar una coreografía pide su propia verificación visual: queda
  en «Abierto» del padre, fuera de las lanes de contenido.
- 2026-09-26 — **#183 mergeado** (`48ed711`). Para el import de imagen, el
  padre eligió una cuarta opción sobre las tres de la hija: el import
  estático es función oficial de Next y solo le faltaba el tipo, que Next
  publica en `next/image-types/global`; un `.d.ts` commiteado que lo
  referencia lo resuelve sin URL internas ni cambios en el sitio.
- 2026-09-26 — **Cortes de la ola de páginas y Novedades** (el padre): los
  textos propios de la página Novedades van con la lane 6, que rehace
  `features/novedades/`, no con la 4c; Contacto va al final de la 4c y solo
  si `mensajes` (7) ya está mergeada, porque las dos tocan
  `features/contacto/`; si no, el padre lo asigna después. La lane 6 muda al
  kit **solo los controles** de `admin/campos/`: `admin/armazon/` se queda en
  la app mientras haya lanes en vuelo que lo consumen, y se muda en un
  cambio mecánico aparte.
- 2026-09-26 — **SPEC de `paginas-investigacion-y-resto` (4c) aprobado
  tal cual** (sin tablas; `og:title` y `og:description` propios por página;
  los textos de interfaz del catálogo quedan en código).
- 2026-09-26 — **SPEC de `novedades-y-kit` (6) aprobado.** El modelo de
  entidad que copian las que siguen: lo publicado en columnas, el borrador
  en un documento jsonb que puede estar incompleto, un esquema para guardar
  y otro para publicar. Destacada única por índice parcial. `Boton`,
  `claseDeBoton` y `Aviso` pasan al kit y `admin/armazon/` los re-exporta
  como puente hasta la mudanza mecánica (anotada en Abierto).
- 2026-09-26 — **SPEC de `paginas-que-hacemos-y-quienes-somos` (4b)
  aprobado.** Lo compartido entre páginas vive en la página dueña (Qué
  hacemos) y la otra lo lee con una anotación en el registro; una página
  aparte rompía versiones, «qué cambió» y choque, que son por página. Del
  método se comparten solo las 5 frases idénticas. Regla que se extiende a
  toda página: donde una región tiene título editable, su nombre accesible
  sale de ese título (`aria-labelledby`).
- 2026-09-26 — **La actividad del Inicio muestra solo lo que cambia algo**
  (el padre, al ver las capturas de #184): sesiones y cuenta propia (entró,
  salió, cambió su contraseña o su nombre) quedan en Cuentas › Actividad y no
  llenan el Inicio. Es una marca por tipo en el registro, no un filtro en la
  consulta.
- 2026-09-26 — **Revisión r1 de `cuentas` (#186): FAIL por una fuga de
  datos.** Las páginas de Cuentas confiaban en la `<Guarda>` del layout, pero
  en el App Router el segmento de la página se renderiza igual y viaja en el
  payload RSC: con la cuenta de quien edita, el HTML traía los correos, roles
  y últimos accesos de todas las cuentas (probado con `next start`). **Regla
  desde acá:** la guarda del layout solo oculta la interfaz; cada página que
  lee datos que un rol no puede ver chequea su capacidad antes de leer, las
  consultas sensibles de `datos/` la exigen también, y un test falla si una
  página de un módulo protegido no la chequea. `main` no tenía la fuga (sus
  módulos con guarda de layout son de los tres roles, y las páginas de CV ya
  chequeaban). La regla va al bloque común de todas las hijas que siguen.
- 2026-09-26 — **SPEC de `ajustes` (10) aprobado.** Alargar un plazo de
  retención no vale para lo ya recibido (rige el menor entre lo prometido al
  llegar y lo posterior; acortar vale para todo, con confirmación): es lo que
  se le prometió a la persona. Las «personas de referencia» no se mudan
  (nada las lee) y quedan para el JSON-LD de la fase 4. Las redirecciones se
  aplican en la ruta atrapa-todo antes del 404, con «hacia» en el sitemap y
  «desde» fuera, así no hay cadenas ni ciclos.
- 2026-09-26 — **La lane 8 se parte en dos** (el padre, al merge de #189):
  8a `biblioteca` (materiales, agregar por DOI con defensa de SSRF, salud de
  links, la autoría, la relación de Novedades) y después 8b `equipo` (los
  perfiles, que sacan sus publicaciones de la autoría de 8a). Equipo depende
  de los materiales; juntas eran un PR que nadie revisa bien. La 11 pasa a
  depender de 8a. Los contadores de «consultado N veces» son de la 11.
- 2026-09-26 — **SPEC de `biblioteca` (8a) aprobado con dos precisiones.**
  Son 57 materiales, no 63. El texto de la firma se deriva de las autorías y
  solo se escribe a mano en las 3 firmas que no son lista (una sola fuente de
  verdad). Las citas de Crossref se buscan al escribir la migración y quedan
  como datos fijos: aplicar una migración nunca depende de la red.
- 2026-09-27 — **SPEC de `casos-aliados-fotos` (9) aprobado con tres
  resguardos.** Los SVG (logos de aliados) entran solo por importación y
  nunca por subida, con test, porque un SVG puede llevar script. Reemplazar
  una foto reescribe sus usos en una transacción y borra el archivo viejo
  después de confirmarla, así la base nunca apunta a un archivo que no
  existe. Autorizar un aliado es una acción aparte con nota obligatoria, y la
  consulta del sitio filtra siempre por autorizado.
- 2026-09-27 — **SPEC de `metricas-completas` (11) aprobado.** La API de
  Vercel no da regiones ni ciudades: Origen lo dice en llano. Las marcas
  automáticas de la curva salen de `actividad`, sin tocar las acciones de
  publicar. Los links cortos atribuyen visitas por `utm_campaign` y CV por
  el código en la URL, sin guardar nada de la persona (con ese límite
  escrito). La hora de Chile, una constante, dicha en pantalla. El resumen
  semanal viene apagado: se activa en Mi cuenta.
- 2026-09-26 — **Cada hija que migra usa su propia base** en el mismo
  contenedor (`ed_<lane>`), para que una migración sin mergear no quede
  aplicada en la base `ed` que usan las demás.
- 2026-09-27 — **SPEC de `equipo` (8b) aprobado, sin arrastre.** Las 5
  publicaciones con link que faltaban entran a la Biblioteca en la migración;
  las 14 sin link quedan escritas una vez en su etapa (la Biblioteca pide link
  y no se inventan tema ni público). `autorias.persona` pasa a una FK al id,
  no al slug, porque el slug cambia y un `jsonb` no sigue un cascade. El
  orden se mueve solo con «Subir» y «Bajar», como Aliados (lane 9): el brief
  pedía arrastrar, pero dos interacciones para lo mismo en dos módulos es
  drift, y el arrastre de HTML5 no anda en pantallas táctiles. Equipo es el
  segundo consumidor y sube «Lista que se ordena» a DESIGN.md §11 Global ›
  Patrones. Los 2 títulos de la Biblioteca más cortos que los del perfil se
  corrigen contra su fuente en la misma migración, si la fuente da el
  completo.
- 2026-09-27 — **Un force-push con lease sobre la rama de la propia lane** es
  lo que pide un rebase de cierre y lo autoriza el padre (AGENTS.md §5.6):
  nunca sobre `main` y nunca con `--no-verify`. Primer caso: la 9.
- 2026-09-27 — **Revisión r1 de `casos-aliados-fotos` (#192): FAIL.** La
  marca «autorizado» no estaba atada al logo: quien edita podía publicar
  cualquier logo y cualquier nombre sobre un aliado ya autorizado (probado
  con «Ministerio de Educación» sobre UNESCO). **La autorización queda atada
  a lo que se autorizó:** `autorizado_logo` y `autorizado_nombre`, que se
  guardan al marcar. Publicar se niega para todos si el documento difiere de
  ellos, y la consulta del sitio, con la vista previa, exige que coincidan.
  Reemplazar en Fotos el logo autorizado se niega, porque si no sería una
  puerta de atrás. La autorización es siempre la acción aparte con su nota:
  publicar no reautoriza a nadie.
- 2026-09-27 — **Re-revisión r2 de #192: el Critical cerrado, FAIL por dos
  Important.** (1) **El alt del logo también va atado a la autorización**
  (`autorizado_alt`): es el texto público del logo, lo que lee un lector de
  pantalla y lo que indexa un buscador. (2) **Un test que toca la base crea
  sus propias filas y mide contra ellas**, nunca contra el estado global de la
  tabla: `tsx --test` corre los archivos en paralelo. No se serializa la
  corrida ni se reintenta, porque las dos cosas esconden el error. Un «gate
  en verde» se prueba con varias corridas seguidas sobre una base recién
  migrada.
- 2026-09-27 — **Revisión r1 de `metricas-completas` (#193): FAIL, sin
  Critical.** (1) El test de avisos seguía inestable, y además el código tiraba
  si una cuenta se borraba en el medio: la misma regla de filas propias, y la
  acción no puede tirar. (2) **Un HEAD a `/l/` no cuenta un clic.** (3) **La
  copia nunca le pide a Vercel una ventana más larga que la del plan** (un
  mes en Hobby). Una ventana que falla no voltea la copia ni frena la marca de
  agua. Las vistas de 90 días salen de las filas diarias propias; los
  visitantes únicos de 90 días, sin ventana, se dicen en llano como no
  disponibles.
- 2026-09-27 — **Mover en una lista ordenada es una sola pieza de datos, con
  un candado por lista** (la tira de aliados, cada nivel del equipo). Va en
  una transacción que toma el candado antes de leer y renumerar. El revisor de
  Equipo reprodujo el deadlock (39 de 40 rondas concurrentes fallaban) y el de
  Métricas lo vio romper `main` 1 de cada 5 corridas. Lo arregla Equipo, que
  es el segundo consumidor. Lo mismo para cualquier regla de cupo (la Dirección
  hasta dos): se chequea con el candado, adentro de la transacción.
- 2026-09-27 — **Métricas: UTM apagado en Hobby, aprobado.** Las visitas de
  un link no se miden en el plan gratuito de Vercel, y la pantalla lo dice en
  llano. Clics y CV sí. **La semana del resumen, en días UTC** (así se guardan
  las sumas; el desfase es de 3 horas), ratificado. **El renglón de clics de
  Google sale del correo**: casi nunca tenía número.
- 2026-09-27 — **SPEC de `cierre-del-mapa` aprobado tal cual.** El kit lleva
  sus propios íconos, porque un package no importa de la app. Los registros
  (actividad, pendientes) se parten en un archivo por módulo, con un índice que
  conserva la API y el orden. Lo que depende de `lib/contenido/` se queda en la
  app. `/admin/<algo>` desconocido pasa a dar la misma 404 que ya daba
  `/admin/<a>/<b>`. La prueba principal es el HTML del admin, igual pantalla por
  pantalla y rol por rol entre `main` y la rama.
- 2026-09-27 — **El deploy va a un VPS, no a Vercel.** Mateo, en sus palabras:
  «esto se va a deployar en un vps al final», «vps de hostinger», y eligió
  «Docker Compose». La lane 0 pasa de `deploy-al-dia` (Vercel) a `deploy-en-vps`:
  la imagen standalone, un compose (app, Postgres, la migración, Caddy con TLS,
  Umami y el cron), la IP real que pisa Caddy, backups con restauración probada
  y el runbook desde un Hostinger vacío. **La analítica pasa a Umami instalado
  en el mismo VPS.** Lo eligió el padre como opción por defecto, porque Mateo no
  eligió otra: es gratis y sin cookies, y su API da lo que Métricas muestra. El
  cliente entra por la interfaz `ClienteDeAnaliticas` que ya existe. Del SPEC §8
  dejan de hacer falta el token de Vercel, el `prj_…` y Neon. Siguen haciendo
  falta el DNS (dominio, Resend, Search Console), el acceso al VPS, los campos
  del CV y el texto de privacidad.
- 2026-09-27 — **El código queda listo para Vercel y para el VPS** (Mateo eligió
  «Código para los dos», después de preguntar cómo quedaba el admin en
  Vercel). No se borran `vercel.json` ni `@vercel/analytics`. Las variables
  eligen cada servicio: Blob o disco para las fotos y los CV, Umami o Vercel
  Analytics para Métricas y su script, y el cron de `vercel.json` o el servicio
  del compose. Dónde se publica primero se decide sin tocar código, y mudarse es
  mover datos.
