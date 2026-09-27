# PROGRESS — Equipo

## In progress

- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_equipo` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las 22 migraciones de `main` (`d051c6a0`).
- 2026-09-27 — SPEC.md escrito desde el brief del padre (lane 8b), con 16
  propuestas (§13); la cuenta de las publicaciones, en DECISIONS.
- 2026-09-27 — **SPEC aprobado por el padre** con el cambio J (sin arrastre:
  «Subir» y «Bajar» como Aliados) y las precisiones H y N (DECISIONS).
  PLAN.md escrito: 13 pasos; el 11 y el 12 esperan a la lane 9.
- 2026-09-27 — **Pausa para la revisión de cierre.** Los 13 pasos del PLAN
  están hechos y verificados (`## Verification`), la rama rebasada sobre
  `main` (`ddc8ca1d`) y el PR abierto. Sin bloqueos ni comandos en rojo.
  **Lo que sigue:** la revisión de cierre, que lanza el padre después de
  `worker_done`; sus hallazgos vuelven a esta lane como arreglos. Con su
  PASS, el cierre: un commit con el veredicto en `## Verification` y otro que
  borra `work/equipo/`, los dos en este mismo PR.

## Hecho

- **Paso 1 — los esquemas de una persona** (`28cbc763`):
  `features/quienes-somos/contenido/` suma `modelo-del-equipo.ts` (niveles
  con su rótulo y sus lugares, colores, composiciones, figuras, topes y
  `rotuloDePublicacion`, los cuatro rótulos de §5.2), `campos-de-persona.ts`
  (slug, foto, renglones, clave, `sinRepetir`), `etapa.ts` (hitos, ramas,
  territorios y la publicación `biblioteca | sin-link`, una destacada por
  etapa, un material una vez por etapa), `persona.ts` (`esquemaPersona` y
  `esquemaBorrador`, el recorrido con sus categorías, figura y cierre, la
  categoría de cada etapa entre las del recorrido al publicar, foto o «Sin
  foto») y `persona-vacia.ts`; `/equipo/` entra a `esSrcDeFoto`. Los textos
  de una línea reusan `linea`/`opcional`/`deLaLista` de la Biblioteca.
  `pnpm --filter sitio exec tsx --test src/features/quienes-somos/contenido/persona.test.ts`
  → 7 pass, 0 fail; `pnpm typecheck` 0; eslint de los archivos nuevos 0.
- **Paso 2 — la migración `equipo` y la FK** (`5500823a`):
  `prisma/schema/equipo.prisma` (modelo `Persona`, tabla `equipo`) y
  `Autoria.personaId` con su relación `SET NULL`; la migración
  `20260927073013_equipo` (renombrada al rebasear sobre la lane 9, para que vaya después de `aliados`; esquema de `migrate diff`, partido para mover los
  datos antes del `DROP`): la tabla, el índice parcial de la Dirección
  general, los 15 perfiles con ids fijos (generados por un script que valida
  con `esquemaPersona`: 64 referencias a la Biblioteca, 14 `sin-link`, 7
  detalles vacíos), `persona` → `persona_id` con un `RAISE` si alguna clave
  no mapea, los borradores de materiales reescritos, los 5 materiales nuevos
  con sus autorías y los 2 títulos corregidos (DECISIONS). La Biblioteca:
  `persona` pasa a `z.uuid()` y `personaQueNoEsta` la chequea al crear,
  guardar y publicar; las opciones salen de `equipo`
  (`ficha-de-material.ts`); `publicadoDe`, `autoriasDe` y `conPersonas` leen
  `personaId`. Probado antes de aplicar con un borrador sembrado con
  `karla-gomez`, `null` y `no-existe` → quedó `[id de Karla, null, null]`.
  En `ed_equipo`: 15 en `equipo`, 62 en `materiales`, 74 autorías con
  persona y 0 huérfanas; `pnpm migrate:status` al día; `migrate diff` →
  «This is an empty migration.»; el checksum resiste el checkout en CRLF.
  `pnpm --filter sitio exec tsx --test` de los 6 archivos de la Biblioteca
  → 21 pass, 0 fail (con «una persona que no está en el Equipo no se
  guarda»); `pnpm test` → sitio 427 pass, 0 fail, 1 saltado (el de
  antes); auth 46; kit 3; `pnpm --filter sitio typecheck` 0; eslint de
  `src/datos` y `src/features/biblioteca` 0.
- **Paso 3 — el sitio lee el equipo de la base** (`refactor` de los esquemas
  genéricos en `publicar` + `feat(quienes-somos)`): `datos/consultas/equipo.ts`
  (`publicadoDe`, `personasVisibles`, `firmadosPorPersona`, `equipoDelSitio`
  con `leerSinRomper` y `cache`), `contenido/del-sitio.ts` (`personaDelSitio`:
  la foto encuadrada, el recorrido y cada publicación resuelta contra lo
  que el sitio muestra y la persona firma, el detalle vacío leyendo la
  fuente) y `contenido/perfil-del-sitio.ts` (los tipos de los componentes,
  mudados, sin `bio`, `linkedin` ni `pubs`); la página le pasa las personas a
  `ImpulsanEd`; `PersonCard` y `PerfilShell` leen `persona.foto` y
  `rotuloDelNivel`; `revalidar-materiales.ts` suma `/quienes-somos`;
  `docs/content/equipo-sin-publicar.md` con la bio y el LinkedIn; `data/equipo.ts`
  borrado. `pnpm --filter sitio exec tsx --test src/datos/consultas/equipo.test.ts src/features/quienes-somos/contenido/persona.test.ts`
  → 11 pass, 0 fail. `pnpm build` 0 aquí y en un worktree de `main`
  (`C:/tmp/ed-antes`, detached en `d051c6a0`, contra `ed_equipo_antes` recién
  migrada); `node scripts/comparar-render.mjs C:/tmp/ed-antes/apps/sitio apps/sitio`
  → todas «igual» salvo `biblioteca.html` («DISTINTA en texto»: solo «57
  materiales» → «62»; las filas nuevas quedan fuera de la primera página
  del HTML); `quienes-somos.html` igual, con −221 802 bytes de JS (el
  `data.ts` ya no viaja en el bundle). El script de las tarjetas (scratch,
  en `C:/tmp/tmp-comparar-perfiles.ts`): 15 personas, 78 tarjetas, 18
  diferencias, todas las de DECISIONS (14 títulos, 2 rótulos, 2 detalles).
  `pnpm lint` 0; `node scripts/verificar-react-doctor.mjs` → 100/100 sin
  diagnósticos; `pnpm test` → sitio 431 pass, 0 fail, 1 saltado; auth 46;
  kit 3.
- **Paso 4 — el ciclo de un perfil en la base** (`368adac7`):
  `datos/acciones/editar-equipo.ts` (crear —último en el orden—, guardar con
  choque, descartar, borrar: la fila, sus redirecciones y la persona en los
  borradores de materiales, con la fk `SET NULL` para las autorías
  publicadas), `publicar-equipo.ts` (publicar con el 308 de
  `/quienes-somos/equipo/<viejo>`, al final de su nivel si es la primera vez
  o cambió de nivel; despublicar), `chequeos-del-perfil.ts`
  (`publicacionQueNoFirma`, `nivelSinLugar` con los nombres de quienes
  ocupan el lugar), `indices-del-equipo.ts` (el slug y la Dirección general
  que saltan en la transacción), `equipo-en-base.ts` y
  `features/quienes-somos/contenido/etiquetas-de-persona.ts` («Etapa 3 ›
  Publicación 1 › Material de la Biblioteca»). Fixtures en
  `equipo-de-prueba.ts`, con un prefijo por archivo (los archivos de test
  corren a la vez y la limpieza de uno borraba el material del otro: visto y
  corregido). `pnpm --filter sitio exec tsx --test src/datos/acciones/editar-equipo.test.ts src/datos/acciones/publicar-equipo.test.ts`
  → 6 pass, 0 fail; `ed_equipo` queda con sus 15 y 62.
- **Paso 5 — mover dentro del nivel** (`fd8f5f98`): `mover-equipo.ts`, con la
  forma de `moverAliadoEnBase` de la lane 9 (`hacia: "antes" | "despues"`,
  renumera el nivel en una transacción, en la punta no se mueve); el nivel
  de quien nunca se publicó es el de su borrador (`nivelEnLaLista`).
  `mover-equipo.test.ts` → 1 pass (con perfiles sin nivel, un grupo solo de
  la prueba: los 15 no se tocan, comprobado en psql).
- **Paso 6 — las Server Actions, la vista previa y la actividad**
  (`3e27ca68`, `f5713c32`): los cinco tipos (`publico-`, `despublico-`,
  `descarto-cambios-de-`, `borro-un-perfil`, `movio-un-perfil`) en
  `datos/actividad.ts` (`editarContenido`, todos al Inicio), su frase, su
  módulo (Contenido) y su link en Cuentas › Actividad
  (`perfilesQueExisten`; `pantallaDe` ya no manda todo lo de Contenido al
  editor de páginas, solo sus tres tipos, como hace la lane 9);
  `datos/acciones/equipo.ts` y `ciclo-de-equipo.ts` (sesión +
  `editarContenido` primero; revalidan `/quienes-somos` y
  `/admin/contenido`), `revalidar-equipo.ts` y `abrirVistaPreviaDePersona`
  (`/quienes-somos?persona=<slug>`). `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts src/datos/actividad.test.ts src/admin/actividad/frase.test.ts`
  → 22 pass, 0 fail; typecheck 0; eslint 0; react-doctor 100/100.
- **Paso 7 — la ficha: la tarjeta** (`42b95429`): `/admin/contenido/equipo/nuevo`
  y `/[id]` (cada una chequea `editarContenido` antes de leer),
  `datos/consultas/ficha-de-persona.ts` (la ficha, lo que firma, quiénes
  ocupan cada nivel), `admin/equipo/` con `FichaDelPerfil` (el molde de un
  material), `formulario.ts` (claves estables, listas de texto en renglones,
  la foto siempre un valor del campo), los hooks de guardar, publicar y
  salida, `BloqueDeLaTarjeta` (nombre, rol, país, nivel con sus lugares,
  «Sin foto», la foto, el acercamiento, la URL), `PanelDelPerfil` («Se ve
  en»), `SalidaDelPerfil` y «Qué cambió» (`cambios.ts`, campo por campo y
  etapa por etapa, con `cambios.test.ts` → 2 pass).
- **Paso 8 — la ficha: el recorrido** (`a302156a`): `BloqueDelRecorrido`
  («Tiene recorrido», que no borra nada hasta guardar; quién es, titular,
  bajada, formación en renglones), `CategoriasDelRecorrido`,
  `BloqueDeLaFigura` (marco, recorte o sin foto; la foto y «apaisada») y
  `BloqueDelCierre`.
- **Paso 9 — la ficha: las etapas y sus publicaciones** (`5b8b3447`,
  `226567cf`): `EtapasDelRecorrido` y `EtapaDelRecorrido` (lo común y lo que
  usa cada composición, en `etapa-del-recorrido/composiciones.ts`), con
  `HitosDeLaEtapa`, `RamasDeLaEtapa`, `PublicacionesDeLaEtapa` y
  `PublicacionDeLaEtapa` (de la Biblioteca —lo que firma— o sin link), y
  `EnLaBiblioteca` (una `Lista` de lo que firma, dónde está en el recorrido,
  «Abrir» y «Agregar en Biblioteca»). react-doctor marcó el encabezado
  duplicado con el de un material y dos exports que no eran componentes: el
  encabezado subió al armazón (`EncabezadoDeFicha`, el refactor aparte) y
  los colores a `colores.ts`; queda en 100/100.
- **Paso 10 — «Agregar en Biblioteca» con la persona elegida** (`b2763ec6`):
  `/admin/biblioteca/nuevo?persona=<id>` (la persona que no existe se
  ignora), `personaParaAutoria`, `AgregarMaterial` (a mano: primera autora;
  con datos de afuera: `vincularPersona`, palabra por palabra sin tildes ni
  mayúsculas, o el aviso «Ningún autor de este material es…») y el aviso
  inicial de la ficha de un material. `vincular-persona.test.ts` → 2 pass.
- **Paso 13, en parte** (`3ff14bdd`, `3bda882c`): AGENTS.md §3 y §13, el
  README (Equipo), el spec del admin §6 y DESIGN.md §11 (el encabezado de la
  ficha en el armazón y la lista variable anidada). Falta «Lista que se
  ordena», que es del paso 11.
- **Pasos 7 a 10 en el navegador de Orca** (perfil aislado `equipo`, cuenta
  de prueba «Ana Prueba», edita), con sondas de DOM por `orca eval`:
  crear un perfil en `/nuevo` (la URL pasa a `/[id]`, «Sin publicar»,
  «Borrador guardado.»), publicarlo («Publicado: el sitio ya lo muestra.»,
  la tarjeta en `/quienes-somos`, último del nivel 4 con `orden` 6),
  cambiarle la URL y republicar (`/quienes-somos/equipo/prueba-navegador`
  → **308** a `…-dos`), un borrador con vista previa (`?persona=` abre el
  perfil básico con «Rol en borrador» e iniciales sin foto), «Agregar en
  Biblioteca» (`/admin/biblioteca/nuevo?persona=<id>`; «Cargar a mano»
  trae a la persona elegida en la primera autoría), descartar (el foco va
  a «Cancelar»; vuelve a lo publicado), despublicar (sale del sitio),
  borrar (vuelve a `/admin/contenido/equipo?borrado=1`, la fila y su
  redirección se van) y la actividad: las cinco filas en `actividad` y sus
  frases en el Inicio («Ana Prueba publicó el perfil de Prueba
  Navegadora»…). En la ficha de Karla Gómez: **contraste AA en los tres
  temas, 0 fallas** (cada texto contra su fondo real, con 2 s para la
  transición del tema: a 300 ms salían 55 falsas en oscuro, y 10 iguales
  en la ficha de un material); **a 390 px, 0 desbordes** (la caja a 390, una
  sola columna, todos los `details` abiertos; los breakpoints siguen en
  escritorio porque el viewport no se puede emular); **teclado**: 0 clics
  sobre `div`, 0 campos sin etiqueta, y todo lo interactivo del perfil pasa
  por `Boton`, `BotonEnlace` y los controles del kit, que llevan su
  `focus-visible`.
  - **Lo que el navegador no dejó:** `orca screenshot` (png y jpeg), `orca
    exec "set viewport 390 844"` y `orca cookie get` tiran el runtime y
    cierran la pestaña; `orca keypress` no llega a la página (la ventana
    de Orca no tiene el foco). La pestaña además se recarga con la primera
    evaluación después de un rato quieta: cada sonda va precedida de otra
    que la despierta. Sin capturas ni Tab de verdad, la mirada visual y el
    recorrido con teclado quedan para la revisión de cierre.
  - **Encontró dos cosas, arregladas:** el aviso de publicar decía «El
    primero: URL» con el nombre vacío, porque el `slug` iba primero en el
    esquema (`0c04a052`, con su test); y un perfil nuevo no se publicaba sin
    escribir la URL a mano: ahora sigue al nombre hasta que se escribe o se
    publica, como la de una novedad (`585f468e`). `persona.test.ts` → 8
    pass; typecheck 0; eslint 0.

- **Rebase sobre `main` con la lane 9** (`ddc8ca1d`, 43 commits): conflictos
  en `lib/contenido/fotos.ts` (las carpetas de fotos: la lista nueva de la 9
  más `equipo`), la actividad (`datos/actividad.ts`, `frase.ts` y su test,
  `modulos.ts`: los tipos de las dos lanes, y `pantallaDe` con casos y
  perfiles), el encabezado de la ficha de un material (la 9 solo movió el
  import de `AccionesDeLaFicha` al armazón: queda `EncabezadoDeFicha` con
  ese import) y los documentos (AGENTS.md §3 y §12, README, spec del admin
  §6 y DESIGN.md §11: lo de las dos lanes). Después del rebase, la
  migración del equipo se renombró de `…060356` a
  **`20260927073013_equipo`** (`4c787a64`) para que vaya después de
  `…065218_aliados`: solo estaba aplicada en `ed_equipo`, donde se
  actualizó su fila de `_prisma_migrations` (mismo contenido) y
  `pnpm migrate:deploy` aplicó las 3 de la 9. `prisma migrate reset` no se
  usó: Prisma lo frena para un agente sin el consentimiento del usuario. El
  orden completo se probó desde cero en una base nueva, `ed_equipo_orden`
  (`migrate:deploy` de las 26), con los mismos conteos que `ed_equipo` (15
  perfiles, 62 materiales, 74 autorías con persona, 5 aliados, 4 casos, 47
  fotos); `migrate diff` contra el esquema, vacío. El perfil pasó al
  `Bloque` y la `FilaDeAccion` del armazón que subió la 9 (`b67ad7ea`).
  `pnpm typecheck` 0, `pnpm lint` 0, react-doctor 100/100, `pnpm test` →
  545 (544 pass, 1 skip, 0 fail).
- **Paso 11 — la lista del Equipo** (`2db8bd30`, `c41ddf2d`, `4fee870e`,
  `d2e70342`): lo compartido de mover (el foco que sigue, el anuncio, los
  botones quietos) subió al armazón (`useMoverEnOrden`,
  `ListaQueSeOrdena`) y la lista de aliados lo usa sin cambiar su
  comportamiento; `/admin/contenido/equipo` (chequea `editarContenido`
  antes de leer) con `listaDelEquipo()`, un grupo por nivel (y «Sin nivel»
  al final), miniatura, rol · país, la insignia si pide atención, «Subir»,
  «Bajar» y «Editar»; la tarjeta del índice («15 perfiles · N con cambios
  sin publicar», `resumenDeEquipo` con su test), el punto de Contenido con
  los perfiles, y la guía de Contenido afuera (se fueron
  `guias-de-contenido.ts`, `GuiaDeContenido.tsx` y la ruta
  `contenido/[pantalla]/`: era la última). DESIGN.md §11 suma «Lista que
  se ordena» (con su variante agrupada) y Aliados apunta a ella. En el
  navegador: los cuatro niveles con su explicación y los botones justos en
  cada punta; «Subir» a Judith Hernández deja quietos los 22 botones de
  mover, la pasa al lugar 1, el foco va a su «Bajar», el `status` dice
  «Judith Hernández pasó al lugar 1 de Líderes de área y proyecto.» y
  `/quienes-somos` la muestra antes de Iván Pérez; «Bajar» la devuelve, y
  quedan dos `movio-un-perfil` en la actividad. La tarjeta del índice dice
  «15 perfiles». `pnpm typecheck` 0 (con `next typegen`: el
  `validator.ts` de `.next/` seguía nombrando la ruta borrada), `pnpm lint`
  0, react-doctor 100/100, `pnpm test` → 545 (544 pass, 1 skip).

- **Paso 12 — las fotos del equipo** (`6a8a273c`, `6ef3d981`, `342c7d83`):
  la migración `20260927074549_fotos_del_equipo` (creada con `pnpm migrate
  --create-only` y completada con el SQL de datos antes de aplicarla): las
  15 `.jpg` de `public/equipo/` que usan los perfiles, medidas con sharp, con
  el alt de la tarjeta; los dos recortes de Daniela quedan afuera (DECISIONS).
  `pnpm migrate:deploy` → aplicada; `pnpm migrate:status` → «Database schema
  is up to date!»; `fotos` → 62 filas, 15 de `/equipo/`. La entrada
  `datos/fotos/del-equipo.ts` (tarjeta y figura, publicado y borrador;
  reemplazar cambia `foto`, `figura` y `borrador` y regenera `/quienes-somos`
  si tocó lo publicado) va en el registro entre Casos y Aliados, y
  `registro.test.ts` suma un perfil de prueba (la tarjeta publicada, la
  figura en el borrador) → 2 pass. La tarjeta y la figura de la ficha
  ofrecen «Elegir una ya subida…». En el navegador: la ficha de
  `/equipo/karla-gomez.jpg` en Fotos dice «Se usa en» «Perfil de Karla Gómez
  › Tarjeta» (alt «Karla Gómez», En el sitio) y «› Figura» (alt «Karla Gómez
  Osalde»), cada uno con «Editar» al bloque de su ficha; en la ficha de Karla,
  «Elegir una ya subida…» abre la grilla con las fotos del equipo y marca
  «Karla Gómez (la de ahora)».
- **Los tests, sin depender de las filas de otros** (`6bf12c68`,
  `2340d6dd`), por la nota del padre al mergear la 9: el intercambio de
  mover pasó a `lib/orden.ts` (`unPasoMovido`, la `tiraMovida` de la 9, con
  su test) y lo usan Aliados y Equipo; `mover-equipo.test.ts` prueba lo puro
  y contra la base solo el perfil que no existe, y `publicar-equipo.test.ts`
  mide «último en su nivel» contra los perfiles que no son de prueba.
  typecheck 0, eslint 0; los 6 archivos que tocan esto → 12 pass.

## Verification

Sobre `04e34788`, rebasada sobre `main` en `ddc8ca1d` (la lane 9 adentro).

- **Estático:** `pnpm typecheck` → exit 0 (los 4 proyectos); `pnpm lint` →
  exit 0; `node scripts/verificar-react-doctor.mjs` → «react-doctor: 100/100,
  sin diagnósticos (apps/sitio/src: 1104 archivos · packages/db/src: 3 ·
  packages/auth/src: 27 · packages/kit-admin/src: 22)»; `pnpm build` → exit 0
  («Compiled successfully», 64/64 páginas estáticas).
- **Tests, 5 veces seguidas sobre una base recién migrada**
  (`ed_equipo_tests`, creada vacía y con `pnpm migrate:deploy` de las 27
  migraciones; `DATABASE_URL` apuntada a ella):

  ```
  === corrida 1  exit=0  kit-admin 3/3 · auth 46/46 · sitio 497: 496 pass, 0 fail, 1 skipped
  === corrida 2  exit=0  kit-admin 3/3 · auth 46/46 · sitio 497: 496 pass, 0 fail, 1 skipped
  === corrida 3  exit=0  kit-admin 3/3 · auth 46/46 · sitio 497: 496 pass, 0 fail, 1 skipped
  === corrida 4  exit=0  kit-admin 3/3 · auth 46/46 · sitio 497: 496 pass, 0 fail, 1 skipped
  === corrida 5  exit=0  kit-admin 3/3 · auth 46/46 · sitio 497: 496 pass, 0 fail, 1 skipped
  ```

  El salteado es de Métricas y no de esta lane («las respuestas grabadas de
  la API se mapean enteras — sin respuestas grabadas: falta correr A1»).
- **Migraciones:** las 27 desde cero en una base vacía (`ed_equipo_orden` y
  `ed_equipo_tests`), con los mismos conteos que `ed_equipo`; `prisma migrate
  diff --from-config-datasource --to-schema` → «This is an empty migration.»;
  `pnpm migrate:status` → «Database schema is up to date!».
- **El render del sitio**, `node scripts/comparar-render.mjs` con `main`
  (`ddc8ca1d`, buildeado contra su base) antes y esta rama después → exit 1
  por una sola página:

  ```
  _global-error.html: igual — 8→8 activos (js+css), +0 bytes
  _not-found.html: igual — 8→8 activos (js+css), +0 bytes
  biblioteca.html: DISTINTA en texto — 28→28 activos (js+css), +186 bytes
  contacto.html: igual — 26→26 activos (js+css), +186 bytes
  index.html: igual — 26→26 activos (js+css), +186 bytes
  investigacion.html: igual — 28→28 activos (js+css), +172 bytes
  novedades.html: igual — 30→30 activos (js+css), +186 bytes
  novedades\relime-2025.html: igual — 28→28 activos (js+css), +186 bytes
  novedades\unesco-montevideo.html: igual — 28→28 activos (js+css), +186 bytes
  que-hacemos.html: igual — 28→28 activos (js+css), +186 bytes
  quienes-somos.html: igual — 26→26 activos (js+css), -219852 bytes
  sumate-al-equipo.html: igual — 16→16 activos (js+css), +86 bytes
  ```

  La diferencia de `biblioteca.html` es la cuenta: «57 materiales» → «62
  materiales» (los 5 que suma la migración `equipo`, aprobados).
  `quienes-somos.html` sale igual en texto, links, `<head>` e imágenes, con
  ~215 KB menos de JS: el `data.ts` del equipo ya no viaja en el bundle.
- **Las tarjetas de publicación de los perfiles** (script sin commitear que
  arma las 78 desde la base y las compara con el `data.ts` borrado): «18
  diferencias; 15 personas; 78 tarjetas de publicación», las mismas de
  DECISIONS (14 títulos, 2 rótulos, 2 detalles).
- **De punta a punta, en el navegador de Orca** (perfil aislado, cuenta
  `edita`): lo de cada paso está en su entrada de «Hecho» (7 a 10, 11 y 12):
  crear, guardar, publicar, cambiar la URL con su 308, vista previa,
  «Agregar en Biblioteca», descartar, despublicar, borrar, la actividad y sus
  frases, la lista con «Subir» y «Bajar» y el sitio en su orden nuevo, la
  tarjeta del índice, la ficha de una foto con «Se usa en» y «Elegir una ya
  subida…». Contraste AA medido en los tres temas (0 fallas); a 390, 0
  desbordes con la caja simulada; teclado revisado en el código y el DOM.
- **Lo que no se pudo verificar acá:** `orca screenshot`, `orca exec "set
  viewport"` y `orca cookie get` tiran el runtime, y `orca keypress` no llega
  a la página. La mirada visual (capturas, los tres temas a ojo, 390 con los
  breakpoints reales) y el recorrido con Tab de verdad quedan para la
  revisión de cierre.
- **Revisión de cierre:** la lanza el padre después de `worker_done`.

## Abierto

- `ed_equipo_orden` y `ed_equipo_tests` (donde se probaron las migraciones
  desde cero y los tests) y `ed_equipo_antes` (la de `comparar-render`)
  quedan en `ed-postgres`: son locales y se pueden borrar al cerrar.
- En `ed_equipo` queda la cuenta de prueba de la verificación (`equipo-prueba@ejemplo.org`,
  edita, con su actividad); su clave no quedó guardada: para volver a entrar,
  «Olvidé mi contraseña» y el link del log del dev server. El worktree
  `C:/tmp/ed-antes` (`main` en `ddc8ca1d`, buildeado) es la línea de base de
  `comparar-render`: se borra con `git worktree remove` al cerrar.
- `docs/AI_GUIDELINES.md` §2 da de ejemplo un `data.ts` que ya no existe
  (DECISIONS, «Visto al pasar»).
- Fase 4: los ~110 KB del recorrido viajan en el payload del HTML de
  `/quienes-somos` (lo mismo que hoy pesa el `data.ts` en el bundle); cargar
  el perfil al abrirlo es de la fase 4 (nota del padre al aprobar).
