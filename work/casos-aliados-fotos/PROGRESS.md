# PROGRESS — Casos, Aliados y Fotos

## In progress

- 2026-09-27 — Lane 9 del XL `work/mapa-del-admin/`, rama
  `mateo/casos-aliados-fotos` desde `main` en `77611c1`. Worktree listo:
  `pnpm install`, `pnpm generate`, `.env.local` apuntado a la base propia
  `ed_casos` (creada en `ed-postgres`) y `pnpm migrate:deploy` con las 16
  migraciones de `main`. SPEC escrito desde el brief del padre, con doce
  propuestas (§12); la aprobación la da el padre por `orca orchestration ask`.
- 2026-09-27 — SPEC aprobado por el padre con las doce propuestas y tres
  resguardos (DECISIONS). PLAN de 20 pasos escrito; arranca el paso 1.
- 2026-09-27 — Los 20 pasos hechos; rebaseada sobre `main` en `782aeb27`
  (Ajustes) y verificada (abajo). Falta la revisión de cierre, que corre el
  padre después del `worker_done`.
- 2026-09-27 — `main` sumó Biblioteca (`d051c6a0`) mientras se verificaba:
  segundo rebase, la portada de un material en el registro de usos, y la
  verificación repetida sobre el resultado (abajo).

## Hecho

- **Paso 1 — el recorrido de fotos** (`d1c164b`): `lib/contenido/fotos-en.ts`
  (`fotosEn`, `cambiarFoto`) y su test. `pnpm --filter sitio exec tsx --test
  src/lib/contenido/fotos-en.test.ts` → 4 pass, 0 fail; typecheck 0.
- **Paso 2 — las fotos de `public/` en la tabla**: `Foto.url` única y
  `subidaPor` nulo; la migración `20260927030903_fotos_de_public` (creada con
  `--create-only` en una terminal de Orca, porque el aviso del índice único
  pide confirmar y el shell del agente no es interactivo) con las 47 filas
  medidas por un script que no se commitea y el dedupe de
  `origen-03-pregunta.webp` (novedad `relime-2025` → `/fotos/`); se borró
  `public/quienes-somos/`; `esSrcDeFoto` suma `investigacion` y `aliados` y
  saca `quienes-somos`. `pnpm migrate:deploy` → aplicada; `select count(*)
  from fotos where "subidaPor" is null` → 47; la novedad apunta a
  `/fotos/origen-03-pregunta.webp`; `fotos.test.ts` + `fotos-en.test.ts` → 9
  pass, 0 fail; typecheck 0; `migrate:status` al día. Commit `6ba6403`.
- **Paso 3 — los diez tipos de actividad**: `datos/actividad.ts` (tipos,
  `QUIEN_VE` todos `editarContenido`, `VA_AL_INICIO` todos sí menos
  `subio-una-foto`), sus frases en `admin/actividad/frase.ts`, su módulo
  (Contenido) y «Ver» solo para los casos en
  `admin/cuentas/actividad/modulos.ts` (DECISIONS), con `modulos.test.ts`
  nuevo. `tsx --test frase.test.ts actividad.test.ts filtros.test.ts
  modulos.test.ts` → 11 pass, 0 fail; typecheck 0. Commit `f4bd728`.
- **Paso 4 — subir una foto, probado**: `datos/acciones/subir-foto.ts`
  (`subirFotoEnBase`, con la base y el almacén inyectados; el esquema de la
  subida se mudó ahí) y `fotos.ts` queda con la sesión, la capacidad y la
  actividad `subio-una-foto`; el resultado trae el id (la grilla va a la
  ficha). `subir-foto.test.ts` (un SVG con `<script>` llamado `logo.png`
  recibe «El archivo no es una imagen jpg, png o webp.» sin fila ni archivo;
  un webp crea la fila con `subidaPor`; sin alt no sube) +
  `acciones-con-sesion.test.ts` → 16 pass, 0 fail, 0 skipped (contra
  `ed_casos`); typecheck 0. Commit `9eafc8c`.
- **Paso 5 — los casos en la base**: `features/investigacion/contenido/caso.ts`
  (`esquemaCaso` y `esquemaBorradorDeCaso`) y `modelo-de-casos.ts` (los
  cuatro fijos, sujeciones, estados, topes, slugs reservados); `Caso` en
  `prisma/schema/casos.prisma` y la migración `20260927031538_casos` con los
  cuatro, generados por un script que no se commitea y validados con
  `esquemaCaso`; `publicadoDeCaso` en `datos/consultas/casos.ts`.
  `migrate:deploy` → aplicada (los cuatro, 5/5/4/9 evidencias);
  `caso.test.ts` → 3 pass, 0 fail, 0 skipped; typecheck 0. Commit `19851f5`.
- **Paso 6 — el sitio lee los casos de la base**: `casosDelSitio()` y
  `casoParaElSitio()` en `datos/consultas/casos.ts` (vista previa por
  borrador válido, tinte por número en `tintes.ts`, id y rótulo de cada
  evidencia por posición); los tipos del sitio pasan a
  `features/investigacion/casos/tipos.ts`; la página lee los casos y los
  pasa por prop a `InvestigacionEnAccion` → `CasosInvestigacion` → los dos
  hooks (por ref en los efectos de montaje); `CASO_DE_CADA_LINEA` pasa a ids
  en `modelo-de-casos.ts` y las líneas reciben `{ id, slug }`; `Papel` va
  sin «Ver en acción» si no hay slug (sitio sin base). Se borró
  `data/casos.ts`. Aceptación: `pnpm build` acá y en un worktree de `main`
  (`%TEMP%\ed-main-render`, base `ed_casos_main` con las migraciones de
  `main`) y `node scripts/comparar-render.mjs <main> apps/sitio` → 12
  páginas; **`investigacion.html` igual** (−20 084 bytes de JS: los casos ya
  no van en el bundle); `novedades.html` y `novedades/relime-2025.html`
  DISTINTAS en imágenes, y un diff de sus `<img>` cambiando
  `quienes-somos/origen-03` por `fotos/origen-03` en `main` da igual: es el
  dedupe aprobado (propuesta K). El script sale 1 por esas dos. Suite entera
  `pnpm --filter sitio test` → 319 tests, 318 pass, 0 fail, 1 skipped (el
  de antes); typecheck 0. Commit `219c19d5`.
- **Paso 7 — los aliados en la base**: `features/aliados/contenido/aliado.ts`
  (`esquemaAliado`, `esquemaBorradorDeAliado`; la URL solo `https://`) y
  `modelo.ts` (`TAMANOS` chico/mediano/grande con sus clases, `altoDe`,
  topes); `Aliado` en `prisma/schema/aliados.prisma` y la migración
  `20260927032338_aliados` con los cinco (publicados, autorizados, con la
  nota de dónde consta; Techint con el pendiente de confirmar con Raquel),
  generados por un script que no se commitea y validados con
  `esquemaAliado`; `publicadoDeAliado` en `datos/consultas/aliados.ts`.
  `migrate:deploy` → aplicada; `aliado.test.ts` → 4 pass, 0 fail, 0
  skipped; typecheck 0. Commit `844cdb60`.
- **Paso 8 — el sitio lee los aliados de la base**: `aliadosDelSitio()` y
  `aliadosVisibles()` en `datos/consultas/aliados.ts` (filtra `autorizado`
  en la consulta y otra vez en la función pura, también en la vista previa;
  las medidas y el tipo salen de la foto por su url); `LogoDeAliado`
  compartido (`features/aliados/components/`), con link en otra pestaña si
  hay URL; el layout del sitio pasa a `async` y le da los aliados al pie;
  el Inicio (`DatosDuros`) y Qué hacemos (`MiradaPasos` → `BandaAliados`)
  los reciben por prop. Se borró `config/aliados.ts`. Aceptación:
  `aliados.test.ts` (sin marca no sale ni en la vista previa; orden y
  medidas; borrador en la vista previa solo si se puede publicar; un logo
  que no está en Fotos no se dibuja y el SVG va sin optimizar) → 4 pass, 0
  fail; typecheck 0; `pnpm build` y `comparar-render` contra `main` → las
  12 páginas iguales salvo las dos de Novedades del dedupe (el diff de sus
  `<img>` con la ruta nueva da igual), y los cinco logos con el mismo
  `<img>` (p. ej. Techint 147×195, `h-12`, sin optimizar). `pnpm --filter
  sitio lint` 0. Commit `eef941d4` (enmendado: el primer `git add` falló por
  una ruta ya borrada y el commit se había llevado solo el borrado).
- **Paso 9 — el registro de usos**: `datos/fotos/uso.ts` (el uso, `Donde`,
  `Regenerar`, `UsosDeUnModulo`, `sinRepetir`), `registro.ts`
  (`USOS_DE_FOTOS`, `usosPorFoto`) y una entrada por módulo:
  `de-las-paginas.ts` (lo publicado, el borrador y, por sección que no está
  en la base, el contenido del código; la etiqueta con `caminoLegible`;
  reemplazar cambia también las versiones), `de-las-novedades.ts`,
  `de-los-casos.ts` y `de-los-aliados.ts` (en el sitio solo publicado y
  autorizado; regenera el layout). `registro.test.ts` (la misma foto en el
  borrador de Contacto, una novedad, el borrador del caso 04 y un aliado,
  cada una con su `en` y su lugar; una foto del código de Inicio como uso
  `codigo`; reemplazar la cambia en los cuatro y dice qué regenerar) → 2
  pass, 0 fail, 0 skipped, y las filas de prueba se deshacen; typecheck 0.
  Commit `74197f5c`.
- **Paso 10 — lo que se hace con una foto**: `datos/consultas/fotos.ts`
  (`grillaDe`/`grillaDeFotos` con los filtros y sus cuentas, `fichaDeFoto`
  con «Se usa en», `paraElegir` solo jpg/png/webp, `resumenDeFotos` (en el paso 18 pasó a llamarse `cuentaDeFotos`),
  `esDelRepositorio`); `editar-fotos.ts` (`editarAltEnBase`,
  `borrarFotoEnBase`: solo sin usos, la fila y después el archivo, nunca uno
  de `public/`); `reemplazar-foto.ts` (por los bytes; frena si un uso es del
  código; archivo nuevo con nombre nuevo, la transacción reescribe los usos
  y la fila, y el viejo se borra después); `revalidar-fotos.ts`; las
  acciones en `fotos.ts` (`editarAltDeFoto`, `reemplazarFoto`, `borrarFoto`,
  `fotosParaElegir`; subir no revalida porque se sube desde formularios a
  medio escribir) con su actividad. `editar-fotos.test.ts` +
  `consultas/fotos.test.ts` + `subir-foto.test.ts` +
  `acciones-con-sesion.test.ts` → 22 pass, 0 fail, 0 skipped; typecheck 0.
  Commit `d13982ac`.
- **Paso 11 — los archivos sueltos, en el cron**: `Almacen` suma `listar()`
  (Blob, de a páginas; el disco, los `<uuid>.<ext>` con su fecha); lo del
  disco se mudó a `lib/contenido/almacen-en-disco.ts` (y su test, con
  `git mv`) para que `almacen.ts` quede bajo las 100 líneas; la tarea
  `archivos-de-fotos-sueltos` (`datos/tareas/`) borra lo que ninguna fila
  usa y tiene más de un día, y está en `TAREAS_DIARIAS`. Su test (el usado y
  el recién subido quedan, el suelto de hace 48 h se va; la segunda corrida
  no encuentra nada) + los del almacén, la poda, «a mano», editar y subir →
  14 pass, 0 fail, 0 skipped; typecheck 0. Commit `c1f22b37`.
- **Paso 12 — Fotos en el admin**: `/admin/contenido/fotos` (el filtro con el
  número de las sin alt, `GrillaDeFotos` con `MiniaturaDeFoto`, «Subir foto»
  de primario y el vacío de cada filtro), `/fotos/subir` (el `CampoFoto` del
  kit, que al subir lleva a la ficha con `?subida=1`) y `/fotos/[id]`
  (`FichaDeFoto`: el alt como título con su insignia, medidas, peso, tipo y
  quién la subió; `FormularioDelAlt`; `UsosDeLaFoto`; `SalidaDeLaFoto`, que
  avisa antes si un uso es del código). `EncabezadoDeContenido` suma
  `acciones` y `avisos`. react-doctor marcó seis cosas y se arreglaron por
  código (estado perezoso, el formato fuera del componente, `Intl` al tope y
  las escrituras del registro y del cron en paralelo con `Promise.all`).
  «Grilla de fotos» en DESIGN.md §11. En el navegador de Orca (perfil propio
  `casos-aliados-fotos`, cuenta `edita`): la grilla con las 47 y sus usos; la
  ficha de `conferencia-problematizacion` con sus tres usos del código;
  subir un webp → ficha con «Se subió la foto»; editar el alt → aviso y la
  fila cambiada; reemplazar por un 800×600 → la url nueva, 800×600 en la
  fila y en `.fotos/` solo el archivo nuevo; borrar → el foco va a
  «Cancelar», «Sí, borrar» vuelve a la grilla con «Se borró la foto de la
  biblioteca», sin fila ni archivo; la actividad anotó subió, reemplazó y
  borró. Las capturas del navegador de Orca fallan («the browser tab may not
  be visible»): la verificación va por el árbol de accesibilidad y `eval`.
  `pnpm typecheck` 0, `pnpm --filter sitio lint` 0,
  `node scripts/verificar-react-doctor.mjs` → 100/100 sin diagnósticos.
  Commit `9c3ede43`.
- **Paso 13 — elegir una foto ya subida**: `CampoFoto` (231 líneas) queda de
  compositor y sus piezas pasan a `packages/kit-admin/src/campo-foto/`
  (`MiniaturaConFoco`, `SubidaDeArchivo`, `ElegirYaSubida`), como pide
  AI_GUIDELINES §2; suma `elegir` (el panel en línea, pedido en el clic) y
  `conFoco`; el kit exporta `ElegirFoto` y `FotoElegible`. El editor de
  páginas (`Campo.tsx`) y las dos fotos de una novedad le pasan
  `fotosParaElegir`. README del kit y «Elegir una foto» en DESIGN.md §11.
  react-doctor marcó un export de más en `SubidaDeArchivo` y se arregló. En
  el navegador, en la ficha de `bolema-2025`: el panel trae 46 fotos (las 47
  menos el SVG), el foco va al filtro, «pizarra» deja seis, elegir la primera
  cambia la foto, cierra el panel, devuelve el foco a «Elegir una ya
  subida…» y prende «Cambios sin guardar»; elegir la original lo apaga (no se
  guardó nada). `pnpm typecheck` 0, `pnpm lint` 0,
  `node scripts/verificar-react-doctor.mjs` → 100/100 (kit en 22 archivos).
  Commit `3e0fbab1`; rama pusheada (el pre-push dio «Todo en verde»).
- **Paso 14 — casos: guardar, publicar y descartar**:
  `features/investigacion/contenido/etiquetas-de-casos.ts` (cómo se llama
  cada campo, para errores, formulario y «Qué cambió»);
  `datos/acciones/casos-en-base.ts` (errores en el campo, URL de otro caso,
  columnas, la ruta de la ficha), `editar-casos.ts` (guardar con choque,
  descartar), `publicar-casos.ts` (valida entero, copia a columnas y escribe
  el 308 de `/investigacion/casos/<viejo>` en la transacción); el 308 sin
  cadenas pasa a `datos/acciones/redirigir.ts`, que ahora usan Novedades y
  los casos; las acciones en `casos.ts` (sesión, `editarContenido`, revalidan
  `/investigacion` y anotan publicó y descartó) y `abrirVistaPreviaDeCaso` en
  `vista-previa.ts` (`/investigacion#<slug>`). `editar-casos.test.ts` (sobre
  el caso 04, que queda como estaba: a medias se guarda y no se publica, la
  URL del 01 frena, el choque, publicar con otra URL deja el 308, sin
  borrador «ya está publicado así», descartar) + `acciones-con-sesion` +
  `publicar-novedades` → 21 pass, 0 fail, 0 skipped; typecheck 0; después:
  el caso 04 con su slug y sin borrador, cero redirecciones. Commit
  `88c6a36f`.
- **Paso 15 — Casos en el admin**: `datos/consultas/casos-del-admin.ts`
  (`listaDeCasos`, `fichaDeCaso`); `admin/casos/` (`ListaDeCasos`,
  `FichaDeCaso` con `useAccionesDelCaso`, `EncabezadoDelCaso`, el formulario
  en `formulario-del-caso/` —`ElCaso` con la ficha técnica y
  `CasoProvisional`, `ElExpediente` con la lámina sin foco y «Elegir una ya
  subida», `LasListas` con evidencias y producción—, `SeVeElCaso`,
  `DescartarElCaso`, `formulario.ts` que guarda el título de las evidencias
  en mayúsculas, y `cambios.ts` con su test); las rutas `/contenido/casos` y
  `/[id]`. Al armazón: `AccionesDeLaFicha` (mudada de Novedades),
  `FilaDeAccion` (Novedades y Fotos la usan), `Bloque` y `QueCambioPlegado`;
  `igual` de `lib/contenido/comparar.ts` pasa a exportarse (DECISIONS).
  DESIGN.md §11 al día. En el navegador (cuenta `edita`): la lista con los
  cuatro; la ficha del caso 03 con sus bloques; cambiar el indicio prende
  «Cambios sin guardar» y «Qué cambió · un campo»; guardar → «Borrador
  guardado…» y la insignia «Cambios sin publicar»; publicar → «Publicado: el
  sitio ya lo muestra», la columna cambiada, el borrador nulo,
  `publico-un-caso` en la actividad y `/investigacion` sirviendo el indicio
  nuevo; se volvió a publicar el de antes. `cambios.test.ts` 1 pass;
  `pnpm --filter sitio typecheck` 0, lint 0, react-doctor 100/100. Commit
  `6a5a9fbb`.
- **Paso 16 — aliados: el ciclo y la marca**: `features/aliados/contenido/etiquetas.ts`;
  `datos/acciones/aliados-en-base.ts`, `editar-aliados.ts` (crear al final de
  la tira y sin autorizar, guardar con choque, descartar, borrar),
  `publicar-aliados.ts` (exige `autorizado`, el logo tiene que estar en
  Fotos; despublicar conserva las columnas), `autorizar-aliados.ts` (la marca
  con su nota, que vuelve a chequear `autorizarAliados` con el rol, y mover
  en la tira renumerándola), `revalidar-aliados.ts` (el layout entero); las
  acciones en `aliados.ts` y `ciclo-de-aliados.ts` (`autorizarAliado` pide
  `autorizarAliados`; la actividad de publicó, despublicó, borró, autorizó y
  quitó). Las vistas previas de un caso y de un aliado pasan a
  `vista-previa-de-contenido.ts`, y `vista-previa.ts` vuelve a ser el de
  `main` (con las dos pasaba las 100 líneas). `editar-aliados.test.ts`
  (crear en el lugar 6 sin marca; publicar sin marca frena; `edita` no
  marca —`SIN_PERMISO`—; sin nota no marca; marcado se publica; mover y
  volver; quitar la marca, despublicar y borrar; la tira queda
  UNESCO·Techint·Bloom·UCSH·Science Up en 1..5) + `acciones-con-sesion` +
  `consultas/aliados.test.ts` → 18 pass, 0 fail, 0 skipped; typecheck 0.
  Commit `a3046b55`.
- **Paso 17 — Aliados en el admin**: `datos/consultas/aliados-del-admin.ts`
  (la lista en el orden de la tira, la ficha y el aliado vacío); `admin/aliados/`:
  `LogoEnLaTira` (blanco sobre `azul-principal`, el filtro de la tira),
  `ListaDeAliados` («Subir» · «Bajar» · «Editar»; al mover, el foco sigue al
  aliado y un `status` lo anuncia), la ficha (`FichaDeAliado` con
  `useGuardarAliado`, `usePublicarAliado`, `useSalidaDelAliado`,
  `FormularioDelAliado`, `AutorizacionDelAliado`, `PanelDelAliado`,
  `SalidaDelAliado`, `EncabezadoDelAliado`, `cambios.ts`) y las tres rutas
  (`contenido/aliados`, `/nuevo`, `/[id]`), que le pasan a la ficha
  `puede(rol, "autorizarAliados")` y `quienPuede(...)`. DESIGN.md §11:
  «Logo de aliado» y los aliados en «Ficha de una entidad». En el navegador
  de Orca: como `edita`, la lista con los cinco y sus logos; la ficha de
  UNESCO con la casilla deshabilitada (`aria-describedby` a la explicación)
  y la nota a la vista; «Nuevo aliado» → nombre, URL y el logo elegido de
  los ya subidos → guardar crea la fila (URL con el id, «Sin autorizar»,
  «Borrador») → «Publicar» contesta «Sin la autorización, el logo no se
  publica…»; «Se ve en: En ningún lado…». Como `administra` (perfil de
  navegador aparte, segundo factor por el log): marcar sin nota frena en el
  campo; con nota → «Marcado por Ana Administra»; publicar → el link a
  `oas.org` en el pie de `/` y en `/que-hacemos`; quitar la marca → 0 en
  `/`; «Subir» con el foco en el botón → pasa al lugar 4 y el foco sigue en
  su «Subir»; dos «Bajar» → lugar 6 y el foco cae en «Subir»; despublicar y
  borrar (confirma en el lugar) → `?borrado=1` con «Se borró el aliado». La
  actividad anotó autorizó, publicó, quitó, despublicó y borró. A 390 px
  (`set viewport`) la lista, la ficha y `/nuevo` sin desborde; en oscuro la
  caja del logo va sobre `gris-fondo`. `cambios.test.ts` 1 pass;
  `pnpm typecheck` 0, `pnpm lint` 0, react-doctor 100/100 (el `await` doble
  de la lista pasó a `Promise.all`). Commit `93535dc8`.
- **Paso 18 — el índice de Contenido**: `admin/contenido/resumenes.ts`
  (`resumenDeCasos`, `resumenDeAliados`, `resumenDeFotos`: la cuenta y, si
  hay, lo que pide atención) y la página del índice los lee con
  `Promise.all`; Equipo sigue «Por hacer». `cuentaDeFotos` (antes
  `resumenDeFotos`, sin usar todavía) cuenta las sin alt con la misma vara
  que el filtro (`trim`). El punto de Contenido en la sidebar
  (`hayContenidoSinPublicar`) suma casos y aliados con borrador. Se borran
  las guías de casos, aliados y fotos de `por-hacer/guias-de-contenido.ts`.
  `resumenes.test.ts` (los tres resúmenes con y sin pendientes, el
  singular, y `guiaDeContenido` solo con Equipo) + `paginas/resumen.test.ts`
  → 7 pass. En el navegador: «7 páginas | 4 casos | Por hacer | 5 aliados |
  47 fotos»; un borrador en el caso 01 → «4 casos · 1 con cambios sin
  publicar» y «Contenido (cambios sin publicar)» en la sidebar; descartado
  después. `pnpm --filter sitio typecheck` 0, lint 0, react-doctor 100/100.
  Commit `3e442e4d`.
- **Paso 19 — dos pendientes del Inicio**: `datos/inicio/de-los-aliados.ts`
  («N aliados sin autorizar» con sus nombres, en el orden de la tira; lee
  `listaDeAliados`) y `de-las-fotos.ts` («N fotos sin texto alternativo»;
  lee `cuentaDeFotos`), registradas en `pendientes.ts` como
  `aliados-sin-autorizar` (`sin-autorizar`, `autorizarAliados`, a Aliados) y
  `fotos-sin-alt` (`a-corregir`, `editarContenido`, a
  `/admin/contenido/fotos?filtro=sin-alt`); las entradas van en una línea
  para que el registro quede en 100. `de-los-aliados.test.ts` y
  `de-las-fotos.test.ts` (la frase con uno y con varios, quién ve cada fila)
  + el resto de `datos/inicio` → 23 pass. En el navegador, con un aliado
  nuevo sin marca y una foto con el alt vacío (en la base local, restaurado
  después): `edita` ve «1 foto sin texto alternativo»; `administra` ve esa y
  «1 aliado sin autorizar · Prueba Inicio». La actividad del Inicio mostró
  «descartó los cambios de el caso 01»: se contraen «del» y «al» en
  `frase.ts`, con su test (commit aparte, `fix(actividad)`).
  `pnpm --filter sitio typecheck` 0, lint 0, react-doctor 100/100.
  Commits `9897c59d` (la frase) y `345c938e`.
- **Paso 20 — los documentos**: AGENTS.md §3 (el árbol: las consultas y
  acciones de casos, aliados y fotos, `datos/fotos/`, la tarea de los
  archivos sueltos, `admin/casos/ · aliados/ · fotos/`,
  `features/investigacion/contenido/` y `features/aliados/`, el almacén en
  disco), §5.4 (la lista vive en la tabla `aliados`; la marca la ponen
  dirige y administra, y la consulta del sitio nunca devuelve uno sin ella)
  y §12 (las tablas `casos` y `aliados`); el README (el resumen del admin,
  «elegir entre las ya subidas» y la sección «Casos, aliados y fotos», con
  reemplazar y el SVG); el spec del admin §6 (el origen de `fotos`, `casos`
  y `aliados`); `docs/content/aliados-fuentes-drive.md`, y los dos docs de
  contenido que apuntaban a `investigacion/data/casos.ts` (el inventario del
  2026-09-07 queda como estaba: es historia). §13 no se toca: la fase 3
  sigue abierta con equipo y materiales, que son de otras lanes.
  `grep -rn "config/aliados" AGENTS.md README.md docs/ apps/` → solo el spec
  del admin y el doc de fuentes diciendo «era»/«antes», y los comentarios
  de las migraciones y del esquema (historia).

## Verification

Sobre `9069d86a`, rebaseada sobre `main` en `d051c6a0` (Ajustes y
Biblioteca). La primera pasada fue sobre `782aeb27`; lo que cambió con
Biblioteca se volvió a correr entero y está en «Segunda pasada», al final.

**Después del paso 20, tres arreglos que salieron de verificar** (commits
aparte): `07ea387b` saca `public/quienes-somos` de `config/rutas.ts` (llegó
con Ajustes y declaraba la carpeta que esta lane borró; su test fallaba);
`07e41dd2` pone `grid-cols-1` en las fichas de caso y aliado (a 390 px la del
caso medía 530: la grilla sin columnas tomaba el ancho mínimo de un título con
`truncate`); `66a42920` hace que mover en la tira use `updateMany` (con
`update`, un aliado borrado a la vez tiraba) y separa los tests que corrían a
la vez sobre las mismas filas (el registro de fotos pasa al caso 03 y a un
aliado al principio de la tira; el de aliados mira lugares relativos).

**Estático y de comportamiento** (salida en el scratch de la sesión):

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | exit 0 (los cuatro proyectos) |
| `pnpm lint` | exit 0 |
| `node scripts/verificar-react-doctor.mjs` | exit 0 · `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 945 archivos · packages/db/src: 3 · packages/auth/src: 27 · packages/kit-admin/src: 22)` |
| `pnpm test` | exit 0 · sitio 411 tests, 410 pass, 0 fail, 1 skip (el de las respuestas grabadas de Vercel, ajeno); auth 46/46; kit-admin 3/3 |
| `pnpm build` | exit 0 · `/admin/contenido/{casos,casos/[id],aliados,aliados/nuevo,aliados/[id],fotos,fotos/[id],fotos/subir}` dinámicas, `/investigacion` estática |

La suite se corrió tres veces más: una vuelta falló en `datos/avisos.test.ts`
(«poner quién recibe…», `cambiaron: 1` en vez de `0`), que es de Ajustes y
**falla igual en `main` puro** (1 de 4 vueltas en `782aeb27`): queda para el
padre, no se toca desde esta lane.

**Migraciones desde cero:** base nueva `ed_casos_limpia`, `pnpm
migrate:deploy` → las 23 aplicadas en orden (las cuatro de Ajustes antes que
`fotos_de_public`, `casos` y `aliados`). Quedan 47 fotos (0 sin alt), 4 casos,
5 aliados publicados y autorizados, y ninguna novedad con la ruta vieja de
`origen-03-pregunta.webp`.

**El sitio contra `main`:** `main` en `782aeb27` buildeado contra
`ed_casos_main` recién migrada y esta rama contra `ed_casos_limpia`;
`node scripts/comparar-render.mjs <main> apps/sitio` → 12 páginas; iguales
todas menos `novedades.html` y `novedades/relime-2025.html`, «DISTINTA en
imagenes», y la única diferencia es `src`/`srcSet` de
`/quienes-somos/origen-03-pregunta.webp` → `/fotos/origen-03-pregunta.webp`
(la deduplicación de la propuesta K). JS: `/investigacion` −17,6 KB (los casos
salieron del bundle); el resto +0,6 a +2,1 KB.

**De punta a punta en el navegador de Orca** (dev server propio en 3027,
perfil `casos-aliados-fotos` con `edita` y otro con `administra`, segundo
factor por el log):

- Aliados (paso 17): crear, publicar sin marca (frena), marcar sin nota
  (frena), marcar, publicar y verlo en el pie, quitar la marca (sale del
  sitio), mover con el foco siguiendo, despublicar y borrar.
- Fotos: subir desde «Subir foto», usarla en un aliado autorizado y publicado
  (el pie sirve `/api/fotos/<id>`), «Borrar» no se ofrece mientras se usa y
  dice por qué; reemplazar → la fila y el logo del aliado pasan a la URL nueva,
  el pie la sirve, el archivo viejo da 404 y en `.fotos/` queda solo el nuevo;
  sin usos, se borra con su archivo. La actividad anotó subió, autorizó,
  publicó, reemplazó y borró.
- Casos: la vista previa de un borrador del caso 02 con «Estás viendo un
  borrador»; el payload de la escena trae la pregunta del borrador y no la
  publicada, y `/investigacion` sin la cookie no la tiene; «Volver al sitio
  publicado» y descartar. (Editar y publicar, en el paso 15; el cambio de URL
  con su 308, en `editar-casos.test.ts`.)
- Inicio: las dos filas nuevas con quién ve cada una (paso 19); índice de
  Contenido y el punto de la sidebar (paso 18).
- **Temas:** una sonda de contraste (cada texto visible contra su fondo
  efectivo, WCAG 2.x) en las diez pantallas nuevas × claro, mixto y oscuro:
  30 de 30 sin textos bajo 4,5:1 (3:1 si es grande) y sin desborde; con el
  encabezado en «Cambios sin guardar» (ficha de caso y de aliado), 6 de 6.
- **390 px** (`set viewport 390 844`): Contenido, Casos, la ficha del caso,
  Fotos, la ficha de una foto, Subir, Aliados, la ficha de un aliado y el
  Inicio, sin desborde (después del arreglo del ancho).
- **Teclado:** los 183 controles de esas pantallas llevan su estilo de foco
  (`focus-visible:` en el control o `has-[…:focus-visible]` en su tarjeta; las
  casillas y el archivo, el anillo del navegador). El `Tab` real no llega por
  `orca keypress` en este navegador embebido, así que el recorrido de teclado
  se probó con foco programático: mover en la tira devuelve el foco al botón,
  el panel de elegir foto lo pone en el filtro, y confirmar un borrado, en
  «Cancelar».
- **Fuga de datos:** las pantallas nuevas son de los tres roles (guarda de
  Contenido, `editarContenido`); lo reservado es poner la marca, que chequea
  `autorizarAliados` la acción (test) y la página solo decide si mostrar la
  casilla habilitada. No hay consulta que devuelva algo reservado por rol.

**Segunda pasada, sobre `d051c6a0` (Biblioteca):** el rebase juntó a mano la
actividad (los tipos de materiales y los de esta lane), el Inicio (los dos
cargan en el mismo `Promise.all`), el cron (la salud de los links y los
archivos sueltos), los pendientes, AGENTS.md, el spec y DESIGN.md.
Biblioteca también había subido `QueCambioPlegado` al armazón (quedó el suyo;
la ficha del aliado lo dibuja solo si hay algo publicado) y seguía importando
`AccionesDeLaFicha` de `admin/novedades/` (ahora del armazón). Y un hueco
real: **una portada propia de un material es una foto de la biblioteca y el
registro de usos no conocía la Biblioteca** — figuraba «Sin usar», se podía
borrar, y reemplazarla dejaba la portada apuntando a un archivo borrado. Se
suma `datos/fotos/de-los-materiales.ts` (`01ad5b0c`), la portada del material
ofrece «Elegir una ya subida…» (`18bbc0ed`) y el README nombra la Biblioteca
(`9069d86a`). `datos/inicio/pendientes.ts` queda en 110 líneas: en `main` ya
tenía 104 (el tope de §6 es 100); no se reformateó lo de Biblioteca.

| Comando | Resultado |
| --- | --- |
| `pnpm build` | exit 0 |
| `pnpm typecheck` | exit 0 (con los tipos de rutas regenerados por el build) |
| `pnpm lint` | exit 0 |
| `node scripts/verificar-react-doctor.mjs` | exit 0 · `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 1033 archivos · …)` |
| `pnpm test`, tres vueltas | exit 0 las tres · sitio 462 tests, 461 pass, 0 fail, 1 skip |

- **Migraciones:** quedan intercaladas por fecha (`biblioteca` →
  `fotos_de_public` → `material_de_las_novedades` → `casos` → `aliados`).
  Desde cero, las 25 en orden; y en el orden de producción (las 22 de `main`
  primero, las tres de esta lane después): las dos veces 47 fotos, 4 casos, 5
  aliados publicados y autorizados, y ninguna novedad con la ruta vieja.
- **`comparar-render`** contra `main` en `d051c6a0` (las dos buildeadas contra
  bases recién migradas): lo mismo que en la primera pasada, las 12 páginas
  iguales salvo `novedades` y `relime-2025`, cuya única diferencia es la ruta
  de `origen-03-pregunta.webp`.
- **En el navegador:** en la ficha de un material, «Usar otra» → «Elegir una
  ya subida…» → una foto → guardar; la ficha de esa foto la lista en «Se usa
  en» como «Material «Taller de conceptos básicos…» › Portada», «Sin
  publicar», con su link; se descartó el borrador.
- Con Biblioteca mergeada, la regla del ancho (`grid-cols-1`) pasa también a
  las fichas de una novedad y de un material, y queda escrita en DESIGN.md
  §11, «Ficha de una entidad»; a 390 px las dos sin desborde.

**Revisión de cierre:** la corre el padre después del `worker_done`
(orchestrate). r1 (Opus 5.5, medium) dio **FAIL** por un Critical: la marca
«Autorizado» no estaba atada al logo ni al nombre autorizados. Lo arregla la
ronda 1, abajo; vuelve a mirarlo el mismo revisor.

### Ronda de arreglos 1

Sobre `fff0a717` (commits `6a788882`, `5fd5dfc5`, `56dff890`, `fff0a717`), con
`main` en `d051c6a0`.

- **Critical — la marca atada a lo que se autorizó** (`6a788882`, decisión del
  padre en DECISIONS): `autorizado_logo` y `autorizado_nombre` en `aliados`;
  autorizar guarda los del borrador si se puede publicar (si no, los
  publicados) y exige que quien autoriza haya visto esos (`visto`); publicar
  se niega a todos si difieren; `aliadosVisibles` los compara también en la
  vista previa; la lista, la tarjeta de Contenido y la fila del Inicio cuentan
  como sin autorizar al que cambió; la ficha muestra «Se autorizó» y «Se va a
  autorizar» con el logo como en la tira. La migración `aliados` se regeneró
  (`20260927060913_aliados`, el CREATE de `prisma migrate dev --create-only` y
  la carga a mano con su comentario) y `ed_casos` se reseteó y se aplicó desde
  cero: 25 migraciones, los cinco con su logo y su nombre como autorizados.
  Como su fecha es posterior a todas las de `main`, el orden desde cero y el
  de producción son el mismo.
- **Reemplazar el logo autorizado se niega** (`5fd5dfc5`): antes de subir y
  adentro de la transacción; la ficha de la foto lo explica en lugar del
  control.
- **Borrar una foto, en una transacción con `FOR UPDATE`** (`56dff890`,
  Minor 5; la ventana que queda, en DECISIONS).
- **Tests, uno por hueco** (`autorizacion-de-aliados.test.ts`,
  `consultas/aliados.test.ts`, `editar-fotos.test.ts`): el escenario del
  revisor sobre UNESCO (publicar se niega; la vista previa no lo muestra, lo
  publicado sí); columnas publicadas con otro logo escritas directo en la
  base (el sitio no lo muestra; con el logo autorizado, sí); autorizar guarda
  el logo y el nombre del borrador y no autoriza lo que no se vio; quitar la
  marca vacía las dos columnas; reemplazar el logo autorizado se niega sin
  dejar archivo; cambiar solo la URL o el tamaño sigue publicándose.
- **Minor 2:** «Editar y publicar, en el paso 15» (decía 16).

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck`, sin `.next`, `next-env.d.ts` ni `tsconfig.tsbuildinfo`, antes del build | exit 0 |
| `pnpm build` | exit 0 |
| `pnpm lint` | exit 0 |
| `node scripts/verificar-react-doctor.mjs` | exit 0 · `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 1041 archivos · …)` (antes, dos diagnósticos de complejidad: se partieron `AutorizacionDelAliado` y `SalidaDeLaFoto`) |
| `pnpm test`, tres vueltas | ~~exit 0 las tres~~ — **no era estable**: tres vueltas en verde acá no lo probaban. El revisor r2, sobre una base recién migrada, sacó exit 1, 0 y 1 (`editar-aliados.test.ts` y `editar-fotos.test.ts`, que medían contra el estado de la tabla mientras otros archivos la tocaban). Lo arregla la ronda 2, abajo. |

La primera tanda de vueltas falló en `editar-aliados.test.ts`: suponía que el
vecino del aliado de prueba era Science Up, y un aliado de una prueba a mano
quedó al final de la tabla. `fff0a717` lo midió contra su lugar de antes, que
seguía siendo una posición en la tabla entera: el mismo error, más chico.

**En el navegador de Orca** (dev server en 3027; `edita` y `administra`, esta
con segundo factor por el log):

- El escenario del revisor, como `edita`: en UNESCO, nombre «Ministerio de
  Educación» y el logo de Bloom, guardar → «Publicar» contesta «Cambió el logo
  o el nombre desde que se autorizó: lo vuelve a autorizar quien dirige o
  administra, mirando el nuevo.»; la lista lo muestra «Sin autorizar»; con la
  vista previa, el pie tiene Techint, Bloom, UCSH y Science Up, sin UNESCO y
  sin «Ministerio de Educación» en la página; se descartó el borrador y `/`
  volvió a tener UNESCO.
- Como `administra`, la misma ficha: el aviso, «Se autorizó» (el logo de
  UNESCO, «UNESCO») y «Se va a autorizar» (el de Bloom, «Ministerio de
  Educación») antes de «Autorizar este logo»; no se tocó.
- La ficha de la foto `/aliados/unesco.png`: «Es el logo autorizado de UNESCO:
  subí el nuevo y cambialo desde su ficha, que pide volver a autorizarlo.» y
  sin el control de reemplazo.
- El camino bueno, como `administra`: un aliado nuevo con el logo de Bloom →
  «Se va a autorizar» → nota → «Autorizar este logo» → en la base
  `/aliados/bloom.png` y el nombre → publicar → cambiar solo la URL, guardar y
  publicar de nuevo → el link en el pie; se borró.
- **Minor 3 — la URL de un caso:** el caso 02 pasó de
  `resignificacion-escuelas-tecnicas` a `escuelas-tecnicas-prueba` desde su
  ficha: «Publicado: el sitio ya lo muestra, y
  /investigacion/casos/resignificacion-escuelas-tecnicas pasa a llevar a la URL
  nueva.»; `/investigacion` con el ancla nueva y la vieja → **308** a la nueva.
  Vuelto al original: una sola fila en `redirecciones` (la de prueba → la
  original, 308), sin cadena; la original ya no redirige.
- **Minor 4 — la fuga con `next start`:** el build de arriba en el puerto
  3028, con un aliado sin autorizar cargado. Con la sesión de `edita`, 9
  pantallas (Inicio, Contenido, Casos y la ficha del 01, Aliados y las fichas
  de UNESCO y del sin autorizar, Fotos y la ficha del logo de UNESCO), cada
  una pedida como HTML (con su payload inline) y como RSC (`text/x-component`):
  **18 pedidos, 11 marcadores** («aliado sin autorizar», «aliados sin
  autorizar», `aliados-sin-autorizar`, `autorizarAliados`, «Ir a Aliados»,
  «Autorizar este logo», «Guardar la nota», «Quitar la autorización», «Dónde
  consta la autorización» y `"puedeAutorizar":true` en sus dos escrituras):
  **0 apariciones**. El control con la sesión de `administra`, mismos pedidos:
  13 apariciones (la fila del Inicio en HTML y RSC, y los controles de la
  marca en las dos fichas). El código de los componentes de cliente viaja en
  los chunks de JS igual para todos; lo medido es lo que se renderiza.

### Ronda de arreglos 2

La re-revisión r2 (sobre `4f3afafc`) cerró el Critical y los Minors 2, 4 y 5,
y dio FAIL por dos Important. Sobre `2420d8bf` (commits `92b8cee3` y
`2420d8bf`), con `main` en `d051c6a0`.

- **Important 2 — el texto del logo, atado** (`92b8cee3`, decisión del padre
  en DECISIONS): `autorizado_alt`, con la misma regla que el logo y el nombre.
  La migración `aliados` se regeneró otra vez (`20260927065218_aliados`; los
  cinco con su alt de hoy como autorizado) y `ed_casos` se reseteó. El
  mensaje al negar publicar dice «Cambió el logo, el nombre o el texto del
  logo desde que se autorizó: …», y la confirmación muestra «Texto del logo».
  Tests nuevos: el escenario de r2 contra la base (el mismo logo y el mismo
  nombre, alt «Ministerio de Educación de Chile»: publicar se niega, la vista
  previa no lo muestra, lo publicado sigue igual), un alt distinto escrito
  directo en la base (no sale), y el mismo caso puro en
  `consultas/aliados.test.ts`. **Sin la comparación del alt fallan los tres**
  (se sacó un momento de `estaAutorizado`: 9 pass, 3 fail; con ella, 12 pass).
  El caso bueno sigue: cambiar solo la URL o el tamaño se publica.
- **Important 1 — tests estables** (`2420d8bf`, decisión del padre): cada
  test crea sus propias filas y mide contra ellas. `editar-aliados.test.ts`
  crea dos aliados y mira el orden entre ellos; la punta se prueba con
  `tiraMovida`, pura. `editar-fotos.test.ts` crea su novedad con un slug que
  no es `prueba-editar-…` (el prefijo que borra `editar-novedades.test.ts` en
  el medio: era el `findFirstOrThrow` que no encontraba la fila) y la lee por
  id; el logo autorizado es una foto y un aliado propios.
  `autorizacion-de-aliados.test.ts` ya no toca UNESCO. Con la misma vara,
  también `aliado.test.ts` (buscaba «todo lo que no tiene `creado_por`», y los
  tests crean aliados así) y el uso del código en `registro.test.ts` (ahora
  mide si el Inicio se publicó). El resto de los tests nuevos de la lane ya
  usaban filas propias (el caso 04, el 03, sus fotos, su carpeta temporal).

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck`, sin `.next`, `next-env.d.ts` ni `tsconfig.tsbuildinfo`, antes del build | exit 0 |
| `pnpm build` | exit 0 |
| `pnpm lint` | exit 0 |
| `node scripts/verificar-react-doctor.mjs` | exit 0 · `react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 1042 archivos · …)` |
| `pnpm test`, cinco vueltas seguidas sobre `ed_casos` recién migrada (25 migraciones) | exit 0 las cinco · sitio 472 tests, 471 pass, 0 fail, 1 skip (el de Vercel) |

Las cinco salidas (el resumen de cada paquete y el exit de `pnpm test`):

```
--- vuelta 1
    packages/kit-admin test: ℹ tests 3
    packages/kit-admin test: ℹ pass 3
    packages/kit-admin test: ℹ fail 0
    packages/kit-admin test: ℹ cancelled 0
    packages/kit-admin test: ℹ skipped 0
    packages/kit-admin test: ℹ duration_ms 231.9531
    packages/auth test: ℹ tests 46
    packages/auth test: ℹ pass 46
    packages/auth test: ℹ fail 0
    packages/auth test: ℹ cancelled 0
    packages/auth test: ℹ skipped 0
    packages/auth test: ℹ duration_ms 2828.5792
    apps/sitio test: ℹ tests 472
    apps/sitio test: ℹ pass 471
    apps/sitio test: ℹ fail 0
    apps/sitio test: ℹ cancelled 0
    apps/sitio test: ℹ skipped 1
    apps/sitio test: ℹ duration_ms 18740.5074
    exit 0
--- vuelta 2
    packages/kit-admin test: ℹ tests 3
    packages/kit-admin test: ℹ pass 3
    packages/kit-admin test: ℹ fail 0
    packages/kit-admin test: ℹ cancelled 0
    packages/kit-admin test: ℹ skipped 0
    packages/kit-admin test: ℹ duration_ms 184.3883
    packages/auth test: ℹ tests 46
    packages/auth test: ℹ pass 46
    packages/auth test: ℹ fail 0
    packages/auth test: ℹ cancelled 0
    packages/auth test: ℹ skipped 0
    packages/auth test: ℹ duration_ms 2241.1983
    apps/sitio test: ℹ tests 472
    apps/sitio test: ℹ pass 471
    apps/sitio test: ℹ fail 0
    apps/sitio test: ℹ cancelled 0
    apps/sitio test: ℹ skipped 1
    apps/sitio test: ℹ duration_ms 17704.0507
    exit 0
--- vuelta 3
    packages/kit-admin test: ℹ tests 3
    packages/kit-admin test: ℹ pass 3
    packages/kit-admin test: ℹ fail 0
    packages/kit-admin test: ℹ cancelled 0
    packages/kit-admin test: ℹ skipped 0
    packages/kit-admin test: ℹ duration_ms 163.7967
    packages/auth test: ℹ tests 46
    packages/auth test: ℹ pass 46
    packages/auth test: ℹ fail 0
    packages/auth test: ℹ cancelled 0
    packages/auth test: ℹ skipped 0
    packages/auth test: ℹ duration_ms 2105.2839
    apps/sitio test: ℹ tests 472
    apps/sitio test: ℹ pass 471
    apps/sitio test: ℹ fail 0
    apps/sitio test: ℹ cancelled 0
    apps/sitio test: ℹ skipped 1
    apps/sitio test: ℹ duration_ms 17079.6517
    exit 0
--- vuelta 4
    packages/kit-admin test: ℹ tests 3
    packages/kit-admin test: ℹ pass 3
    packages/kit-admin test: ℹ fail 0
    packages/kit-admin test: ℹ cancelled 0
    packages/kit-admin test: ℹ skipped 0
    packages/kit-admin test: ℹ duration_ms 160.3657
    packages/auth test: ℹ tests 46
    packages/auth test: ℹ pass 46
    packages/auth test: ℹ fail 0
    packages/auth test: ℹ cancelled 0
    packages/auth test: ℹ skipped 0
    packages/auth test: ℹ duration_ms 1995.2642
    apps/sitio test: ℹ tests 472
    apps/sitio test: ℹ pass 471
    apps/sitio test: ℹ fail 0
    apps/sitio test: ℹ cancelled 0
    apps/sitio test: ℹ skipped 1
    apps/sitio test: ℹ duration_ms 17151.7984
    exit 0
--- vuelta 5
    packages/kit-admin test: ℹ tests 3
    packages/kit-admin test: ℹ pass 3
    packages/kit-admin test: ℹ fail 0
    packages/kit-admin test: ℹ cancelled 0
    packages/kit-admin test: ℹ skipped 0
    packages/kit-admin test: ℹ duration_ms 151.9527
    packages/auth test: ℹ tests 46
    packages/auth test: ℹ pass 46
    packages/auth test: ℹ fail 0
    packages/auth test: ℹ cancelled 0
    packages/auth test: ℹ skipped 0
    packages/auth test: ℹ duration_ms 1831.4121
    apps/sitio test: ℹ tests 472
    apps/sitio test: ℹ pass 471
    apps/sitio test: ℹ fail 0
    apps/sitio test: ℹ cancelled 0
    apps/sitio test: ℹ skipped 1
    apps/sitio test: ℹ duration_ms 16847.0007
    exit 0
```

Después de las cinco, la base quedó con sus 5 aliados y sin novedades ni
materiales de prueba: cada test borró lo suyo.

**En el navegador de Orca**, con las cuentas creadas de nuevo (la base se
reseteó): como `edita`, en UNESCO solo el texto del logo pasa a «Ministerio de
Educación de Chile» → guardar → «Publicar» contesta «Cambió el logo, el
nombre o el texto del logo desde que se autorizó: …»; como `administra`, la
misma ficha muestra «Se autorizó» («UNESCO», texto «UNESCO») y «Se va a
autorizar» («UNESCO», texto «Ministerio de Educación de Chile»); `/` no tiene
«Ministerio»; se descartó el borrador.

## Abierto

**Sigue:** la revisión de cierre del padre sobre el PR. Si pide arreglos,
vuelven como tarea a esta terminal (el dev server sigue en 3027, en su
pestaña). Con el PASS, el cierre de la lane —el commit que borra
`work/casos-aliados-fotos/`— va en este mismo PR, antes del merge.

Para después, fuera de esta lane:

- **`datos/avisos.test.ts` (de Ajustes) es inestable** cuando la suite corre
  entera: falla 1 de cada 4 vueltas también en `main` en `782aeb27`
  («repetirlo no cambia nada»: `cambiaron: 1`).
- Las portadas tipográficas de `public/biblioteca/portadas/` no entraron a la
  tabla `fotos` (las generó Biblioteca; no son fotos del contenido que se
  editen): un material que las usa no aparece en «Se usa en» de nadie, y no
  hace falta.
- Sin resolver con el cliente: la nota de autorización de Techint repite lo
  que dice `docs/content/aliados-fuentes-drive.md` («la hoja de ALIANZAS
  todavía dice “solicitado”: confirmar con Raquel»).
