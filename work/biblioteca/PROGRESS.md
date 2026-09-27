# PROGRESS — Biblioteca

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_biblioteca` con las 16 migraciones de `main` aplicadas
  (`pnpm migrate:deploy` → «All migrations have been successfully applied»),
  `.env.local` copiado y apuntado a ella.
- 2026-09-26 — **Build de base** para `scripts/comparar-render.mjs`: `pnpm
  build` sobre `77611c1` (el código de `main`), exit 0, guardado en
  `%LOCALAPPDATA%\Temp\ed-biblioteca-base\.next`.
- 2026-09-26 — SPEC.md escrito desde el brief del padre (lane 8a de
  `work/mapa-del-admin/`), con catorce propuestas (§16).
- 2026-09-26 — **SPEC aprobado por el padre** con dos precisiones, C e I
  (DECISIONS). PLAN.md escrito: 15 pasos.

- **Paso 1 — el modelo de un material** (`a613d95`).
  `features/biblioteca/contenido/`: `modelo.ts` (listas cerradas, topes,
  `fechaDelSitio`, `anioDe`, `firmaDe` con `Intl.ListFormat`, `accionDe`,
  `borradorVacio`), `material.ts` (`esquemaMaterial` y `esquemaBorrador`; la
  persona se valida contra las 15 claves de `equipo.ts`; el DOI se normaliza;
  la fecha sin día), `cita.ts` (`citaApa`, `partirNombre`, `iniciales`) y
  `parecidos.ts` (`sonParecidos`, umbral 0,75: con 0,8 un título con dos
  palabras de menos no se parecía). `lib/metadatos/doi.ts` (`normalizarDoi`,
  `linkDelDoi`), y `biblioteca/portadas` entre las carpetas de fotos
  (DECISIONS). Aceptación: `pnpm exec tsx --test "src/features/biblioteca/contenido/*.test.ts" "src/lib/metadatos/*.test.ts" "src/lib/contenido/*.test.ts"`
  → 66 pass, 0 fail; `pnpm typecheck` → exit 0.

- **Paso 2 — las tablas y los 57.** `prisma/schema/materiales.prisma`
  (`Material`, `Autoria`) y la migración `20260927030549_biblioteca`, creada
  con `pnpm migrate --create-only --name biblioteca` y completada antes de
  aplicarse con el SQL de datos y su comentario (de dónde sale cada cosa). El
  SQL lo generó un script que no se commitea (guardado en
  `%LOCALAPPDATA%\Temp\ed-biblioteca\generar.tmp.ts`, con las 36 fichas de
  Crossref bajadas el 2026-09-27 al lado): valida cada fila con
  `esquemaMaterial`, comprueba que las 54 firmas que son una lista dan el texto
  de hoy letra por letra y que ningún par de títulos de hoy «se parece». Las
  citas de Crossref se armaron con los nombres de ED (Crossref parte mal
  algunos, como «Melendres, M. B.»), salvo la de COVID-19, que lleva los trece
  de Crossref; la tesis, a mano; las 20 restantes, nulas (la generada).
  Aceptación: `pnpm migrate` → aplicada; `pnpm migrate:status` → «Database
  schema is up to date!» (17 migraciones); `psql`: 57 publicados, 36 con DOI,
  4 destacados (1 a 4), 3 con `autores` escrita, 37 citas guardadas; 134
  autorías, 69 con persona (13 personas distintas); 0 materiales sin autoría;
  `pnpm typecheck` → exit 0.

- **Paso 3 — el sitio lee los materiales de la base.**
  `datos/consultas/materiales.ts` (`materialesVisibles`, pura;
  `materialesDelSitio` y `destacadosDelSitio` con `cache` y `leerSinRomper`;
  `publicadoDe`) y `features/biblioteca/contenido/del-sitio.ts`
  (`materialDelSitio`: la firma, la fecha que se lee, la portada propia o la
  generada, la cita guardada o la generada con el link absoluto;
  `destacadosDe`: uno por lugar). La página de la Biblioteca pasa los
  materiales y los destacados por props a `MaterialesListado` (los años del
  filtro salen de ellos), a `DestacadosBiblioteca` y sus tres piezas
  (`DestacadoDelSitio`: `frase` en lugar de `tagline`), y el Inicio a
  `BibliotecaNovedades`. Las listas cerradas salen de `contenido/modelo.ts`.
  `data/materiales.ts` queda solo para Novedades (paso 4). Aceptación:
  `pnpm exec tsx --test src/datos/consultas/materiales.test.ts` → 4 pass;
  `tsc --noEmit` → exit 0; `pnpm build` → exit 0; `node
  scripts/comparar-render.mjs "$LOCALAPPDATA/Temp/ed-biblioteca-base"
  apps/sitio` → «12 páginas, render idéntico», exit 0 (el JS de la Biblioteca
  y del Inicio baja unos 91 KB: el catálogo ya no viaja en el bundle, viaja
  como props).

- **Paso 4 — Novedades abre un material de la base.** La migración
  `20260927031500_material_de_las_novedades` (DECISIONS: sale de `prisma
  migrate diff`): `material_id` con fk `SET NULL`, la columna convertida por
  título exacto y la clave `publicacion` de los borradores pasada a `material`,
  y `publicacion` borrada. Probada con dos borradores sembrados a mano (uno con
  título, otro con nulo): quedaron `{"material": "<id de Oaxaca>"}` y
  `{"material": null}`; `relime-2025` quedó con su material; los borradores de
  prueba se borraron. El esquema de una novedad lleva `material` (uuid o nulo);
  `materialQueNoEsta` lo chequea al crear, guardar y publicar; el select del
  formulario sale de `datos/consultas/materiales-para-elegir.ts`; «Qué cambió»
  lee el material por su nombre; la ficha del sitio recibe el material ya
  resuelto (`materialDelSitioPorId`) y el botón sale solo si el sitio lo
  muestra. `features/biblioteca/data/materiales.ts` y
  `admin/novedades/publicaciones.ts` borrados. Aceptación: `pnpm migrate:deploy`
  → aplicada; `migrate diff` → «This is an empty migration»; `pnpm test` →
  sitio 320 pass, 0 fail, 1 skipped (el de métricas que espera A1), auth 46,
  kit 3; `pnpm build` → exit 0; `comparar-render` → «12 páginas, render
  idéntico», exit 0; `git ls-files apps/sitio/src/features/biblioteca/data` →
  vacío.

- **Paso 5 — el pedido protegido.** `lib/red/` (sin ED ni `@/`): `ip.ts`
  (`ipQueNoSePide`, con `net.BlockList`: los rangos de RFC 6890 en IPv4, y en
  IPv6 solo la unicast global 2000::/3 menos Teredo, 6to4, documentación y el
  IETF; una IPv4 escrita como IPv6 se juzga como IPv4), `destino.ts`
  (`urlPermitida`: solo `https:`, puerto 443, sin credenciales, IP literal
  chequeada; `lookupProtegido`: resuelve, rechaza si una sola dirección es
  interna y le da a la conexión solo las chequeadas, en las dos formas de Node)
  y `pedido-protegido.ts` (`pedirProtegido`: `node:https` con ese `lookup` y
  `agent: false`, cada redirección chequeada otra vez hasta 5, 2 MB cortando
  la descarga, 8 s en total, sin cookies, el cuerpo en el juego de caracteres
  que declara). Aceptación: `pnpm exec tsx --test "src/lib/red/*.test.ts"` → 8
  pass, 0 fail. Prueba contra la red de verdad (script de un uso, no
  commiteado): la API de handles de doi.org → 200; `https://localhost/` → «ip»;
  un dominio inexistente → «dns»; Redalyc → 200 con 13 KB de HTML; y el DOI de
  RELIME por su link → «tiempo» a los 8 s (la revista tarda: por eso los DOI se
  chequean en doi.org, paso 9).

- **Paso 6 — leer los datos de afuera.** `lib/metadatos/` (sin ED ni `@/`):
  `datos.ts` (la forma común `DatosDeAfuera`, `decodificarEntidades`,
  `enLimpio`, `jatsATexto`, `conRaya`), `entrada.ts` (`reconocerEntrada`: DOI
  suelto o de doi.org, ISBN-10 o 13 que pasa su verificador, link),
  `crossref.ts` (`leerCrossref`, `publicacionDeCrossref` para `works/{doi}` y
  para la búsqueda por ISBN), `openalex.ts` (`leerOpenAlex`, el resumen desde
  el índice invertido) y `etiquetas.ts` (`etiquetasDe`, un lector de `<meta>`
  sin parser; `leerCitation` —autores «Apellido, Nombre» de SciELO,
  duplicados fuera, fechas «2026/01/01» y «08/2022», páginas solo si son un
  rango— y `leerOpenGraph`). Respuestas grabadas el 2026-09-27 y recortadas en
  `lib/metadatos/respuestas/` (Crossref y OpenAlex del artículo de RELIME;
  SciELO, la RMF E y la Fundación Roberto Rocca). Aceptación: `pnpm exec tsx
  --test "src/lib/metadatos/*.test.ts"` → 7 pass, 0 fail; `tsc --noEmit` →
  exit 0.

- **Paso 7 — las acciones de un material.** En `datos/acciones/`:
  `editar-materiales.ts` (crear —un DOI que ya está no entra—, guardar con el
  aviso de choque, descartar, borrar), `publicar-materiales.ts` (publicar en
  una transacción: columnas, autorías reemplazadas, el lugar de destacado
  soltado y el chequeo borrado si cambió el link; ocultar, que suelta el
  lugar), `vecinos-de-materiales.ts` (`soltarElLugar`, que solo toca el
  borrador del otro si pedía ese lugar; `novedadesQueLoAbren`),
  `materiales-en-base.ts` (errores con las etiquetas de
  `features/biblioteca/contenido/etiquetas.ts`, `doiOcupado`, `columnasDe`,
  `autoriasDe`), `indices-de-materiales.ts` (el DOI y el lugar, por nombre de
  índice) y `revalidar-materiales.ts` (la Biblioteca, el Inicio, la portada
  generada y las novedades que lo abren). Las Server Actions:
  `materiales.ts` (crear, guardar, borrar) y `ciclo-de-materiales.ts`
  (publicar, ocultar, descartar), cada una con la sesión y
  `editarBiblioteca` primero; `abrirVistaPreviaDeMaterial` en
  `vista-previa.ts`. Los cinco tipos de actividad con `QUIEN_VE`
  (`editarBiblioteca`), `VA_AL_INICIO`, su frase y el módulo «Biblioteca» de
  Cuentas › Actividad. Aceptación: `pnpm exec tsx --test
  src/datos/acciones/editar-materiales.test.ts` → 3 pass (contra
  `ed_biblioteca`; los cuatro destacados de los 57 quedan como estaban, visto
  con `psql`); `acciones-con-sesion`, `actividad`, `frase` y los de Cuentas ›
  Actividad → 25 pass; `tsc --noEmit` → exit 0.

- **Paso 8 — buscar datos.** `datos/biblioteca/`: `de-afuera.ts` (`camposDe`:
  lo de una fuente pasado a los campos de un material —el tipo de la fuente a
  uno de los siete, la fecha a `AAAA-MM`, las páginas de un rango, el resumen
  cortado en una palabra, el link del DOI, y la cita con los apellidos exactos
  solo si la fuente los separa o trae el volumen—; `juntar`: cada campo con la
  primera fuente que lo dio), `buscar-datos.ts` (`buscarDatos`: DOI → Crossref,
  y si no está OpenAlex; ISBN → Crossref; link → la página por el pedido
  protegido, y si sus etiquetas traen un DOI, primero Crossref; después las
  `citation_*` y el Open Graph) y `contra-la-biblioteca.ts` (el DOI que ya
  está, los títulos parecidos, las personas del Equipo que ya firman con ese
  nombre, y el `User-Agent` con el contacto del sitio). Las Server Actions
  `buscarDatosDeMaterial` y `materialesParecidos` en
  `datos/acciones/buscar-datos.ts`. `jatsATexto` saca también un «Resumen»
  pegado al texto (visto en Bolema). Aceptación: `pnpm exec tsx --test
  "src/datos/biblioteca/*.test.ts" src/datos/acciones/acciones-con-sesion.test.ts`
  → 17 pass; `"src/lib/metadatos/*.test.ts"` → pass; `tsc --noEmit` → exit 0.
  Contra las fuentes de verdad (script de un uso): un DOI de Bolema → todo de
  Crossref; SciELO sin DOI → todo «de la página», con 21 páginas y la cita con
  volumen y número; la RMF E → su `citation_doi` llevó a Crossref; el ISBN de
  Gedisa → «No encontramos datos» (Crossref no lo tiene).

- **Paso 9 — la salud de los links.** `datos/biblioteca/chequear-link.ts`
  (`chequearLink`: el DOI en la API de handles de doi.org —registrado es
  `bien`, sin registrar `roto`—; una ruta propia es `bien`; `http:` es
  `sin-chequear`; `https:` con `HEAD` y, si no sirve, `GET` sin leer el
  cuerpo: menos de 400 `bien`, 404 y 410 `roto`, un dominio que ya no existe
  `roto`, lo demás `sin-respuesta`) y `datos/tareas/salud-de-links.ts`
  (`chequearLinks`: los publicados con el chequeo vencido hace 7 días o sin
  chequear, los más viejos primero, 15 por corrida, de a 5, sin empezar otra
  tanda pasados 35 s; el resultado en el material y el resumen de la corrida;
  la tarea `salud-de-links`, sumada a `TAREAS_DIARIAS`). Aceptación: `pnpm
  exec tsx --test src/datos/tareas/salud-de-links.test.ts
  src/lib/tareas/corredor.test.ts` → 8 pass (la corrida contra
  `ed_biblioteca` devuelve cada chequeo a como estaba); `tsc --noEmit` → exit
  0. Contra la red de verdad, cuatro corridas seguidas (script de un uso):
  3,6 s, 7,1 s, 18,1 s y 2,8 s; 15 + 15 + 15 + 12 = los 57; ningún roto; ERIC
  sin respuesta (8 s), ResearchGate 403 (sin respuesta, como se quería: no es
  roto), Acta Scientiae sin chequear (`http:`).

- **Paso 10 — la lista del admin.** `(protegido)/biblioteca/`: `layout.tsx`
  con `<Guarda capacidad="editarBiblioteca">`, `error.tsx` y `page.tsx` (la
  sesión y `puede` antes de leer). `admin/biblioteca/`: `filtros.ts` (tipo,
  estado, salud, lo buscado y la página, validados con Zod en el borde),
  `PantallaDeBiblioteca.tsx` (los tres filtros apilados, el de salud con el
  número de links rotos; el buscador; paginada de a 50; el primario «Agregar
  material» en el encabezado, o en el estado vacío si no hay ninguno) y
  `ListaDeMateriales.tsx` (miniatura, título, firma · tipo · año, el estado y
  las insignias de salud). `datos/consultas/lista-de-materiales.ts`
  (`filasDeLaLista`, pura: cada material como se edita, su estado, su salud
  —link roto por el último chequeo; sin portada y datos incompletos, por lo
  que se edita—, los filtros y la búsqueda sin tildes). `Lista` suma
  `miniatura` (DESIGN.md §11, «Lista», y el Filtro de la Biblioteca). La guía
  de Biblioteca sale de `admin/por-hacer/guias.ts`. Aceptación: `pnpm exec
  tsx --test src/admin/armazon/guarda.test.ts
  src/datos/consultas/lista-de-materiales.test.ts` → 9 pass; `tsc --noEmit` →
  exit 0. En el navegador de Orca (perfil propio `ed-biblioteca`, dev server
  en el 3046 — DECISIONS), con una cuenta que edita: la lista de los 57, los
  tres filtros, el buscador y «Página 1 de 2»; las capturas no salen mientras
  la ventana de Orca muestra otro worktree («Screenshot timed out»): el
  recorrido visual queda para la verificación.

- **Paso 11 — la ficha de un material.** `/admin/biblioteca/[id]` y
  `/admin/biblioteca/nuevo` (cargar a mano), las dos con la sesión y `puede`
  antes de leer. `admin/biblioteca/`: `FichaDeMaterial.tsx` (el orquestador,
  con «cambios sin guardar», el choque, los errores en el campo y el aviso de
  parecidos después del primer guardado), `EncabezadoDeLaFicha.tsx` (usa las
  acciones de la ficha de Novedades, que ahora aceptan cualquier pendiente),
  `FormularioDeMaterial.tsx` y sus bloques (`AutoresDelMaterial` con el
  Equipo y la firma escrita, `PortadaDelMaterial` con la generada en vivo y
  «Usar otra», `CitaDelMaterial` con la generada y «Escribirla a mano»,
  `DestacadoDelMaterial` con quién tiene cada lugar), `PanelDelMaterial.tsx`
  (salud del link y «Se ve en»), `QueCambio.tsx` + `cambios.ts`,
  `SalidaDelMaterial.tsx` y los tres hooks. La portada tipográfica
  (`features/biblioteca/portada/generar.tsx`, `next/og`, el color de cada tipo
  como las 57) con su ruta del admin (`/admin/biblioteca/portada`, sesión y
  `editarBiblioteca`). En el kit, `Fecha` suma `conDia`; en el armazón,
  `QueCambioPlegado` (el plegado de Novedades, compartido: react-doctor lo
  pedía por el JSX duplicado). DESIGN.md §11: la fecha sin día, el plegado,
  y la ficha de un material (portada y cita generadas, «Se parece a…», la
  salud en el panel). Aceptación: `pnpm exec tsx --test
  "src/admin/biblioteca/*.test.ts"` → 2 pass; `editar-materiales`,
  `cambios` de Novedades, `guarda` y `acciones-con-sesion` → 26 pass; `tsc
  --noEmit` → exit 0; `node scripts/verificar-react-doctor.mjs` → «100/100,
  sin diagnósticos» (antes de los arreglos, 91: el plegado duplicado, un
  `await` que leía la fila y las novedades por separado al borrar, y un
  `includes` de texto en el catálogo). En el navegador (cuenta que edita):
  la ficha de un destacado con todos sus bloques; y el ciclo entero de uno
  nuevo cargado a mano —guardar crea la fila y pasa a su URL, publicar, ocultar
  («Oculto: ya no se ve en el sitio.»), borrar con confirmación y vuelta a la
  lista con «Se borró el material.»—, con la actividad anotada
  (`agrego-`, `publico-`, `oculto-`, `borro-un-material`). El clic de Orca no
  llega a los botones del formulario: se probó con `eval` sobre el DOM (la
  maña conocida del navegador embebido).

- **Paso 12 — agregar por DOI, ISBN o link.** `admin/biblioteca/AgregarMaterial.tsx`
  (el paso 1: el campo, «Buscar datos» —el primario— y «Cargar a mano»; el
  error en un aviso; el DOI repetido con el link al que ya está, sin pasar al
  paso 2; y el paso 2, la ficha llena con el origen de cada dato y los
  parecidos). `/admin/biblioteca/nuevo` lo dibuja. DESIGN.md §11, «Agregar con
  datos de afuera». Aceptación: `tsc --noEmit` → exit 0; `eslint
  src/admin/biblioteca` → sin salida. En el navegador (cuenta que edita): el
  DOI de RELIME → «Ese DOI ya está en la Biblioteca: «Resignificación…». Abrirlo»;
  el link de la RMF E → la ficha llena, cada campo «De Crossref.», «Cambios
  sin guardar», y Luis Manuel Cabrera Chim sugerido como «Luis Cabrera Chim»
  del Equipo; «Guardar borrador» → la fila con el DOI, las 4 autorías, la
  persona y la cita de Crossref (visto con `psql`), y las marcas se van;
  después se borró desde la ficha.

- **Paso 13 — lo que el módulo le suma al admin.** La sidebar suma el número
  de Biblioteca (los publicados con el link roto, «con el link roto»), cada
  número aislado en su consulta (`BarraLateral.tsx`); el Inicio, la fila
  «Materiales con el link roto» (`datos/inicio/de-la-biblioteca.ts`, urgencia
  `a-corregir`, capacidad `editarBiblioteca`, a la lista filtrada por Link
  roto) y el acceso rápido «Agregar material» (su línea de `modulos.ts`);
  Cuentas › Actividad, «Ver el material» mientras exista (`pantallaDe`).
  `datos/consultas/materiales-del-admin.ts` junta esas lecturas. Aceptación:
  `pnpm exec tsx --test "src/datos/inicio/*.test.ts"
  "src/admin/cuentas/actividad/*.test.ts" src/admin/armazon/guarda.test.ts` →
  29 pass; `tsc --noEmit` → exit 0; react-doctor → 100/100. En el navegador
  (cuenta que edita), con el chequeo de Oaxaca puesto en `roto` a mano: la
  sidebar «Biblioteca (1 con el link roto)», la fila «1 material con el link
  roto · «Oaxaca…»» con «Ver los materiales», y «Agregar material» entre los
  accesos rápidos; el chequeo se devolvió a como estaba.

- **Paso 14 — la portada generada y «Copiar cita APA» en el sitio.**
  `/biblioteca/portada/[id]` (estática, `generateStaticParams` de los
  publicados sin portada propia —hoy ninguno—, 404 para lo demás;
  `datos/consultas/portadas.ts`), y `CopiarCita.tsx` en la línea de la fecha de
  cada fila del catálogo: copia la cita, dice «Cita copiada» y lo anuncia; si
  el navegador no deja copiar, muestra la cita debajo, seleccionable.
  Aceptación: `pnpm build` → exit 0; `comparar-render` → «biblioteca.html:
  DISTINTA en texto» y las otras 11 iguales; el texto de `biblioteca.html`
  sin «Copiar cita APA» es idéntico al de `main` (comprobado con un script:
  8 botones, uno por fila de las que salen de entrada, `iguales sin el botón:
  true`). `curl` al dev server con la portada de Oaxaca sacada a mano un
  momento: `200 image/png` (la tipográfica, azul de Artículo, «ARTÍCULO ·
  REDALYC · 2016»), y un id que no existe → 404; la portada se devolvió. En
  el navegador de Orca, el clic en «Copiar cita APA» cae en el camino de falla
  (el navegador embebido no da permiso de portapapeles a un clic simulado), y
  la cita aparece debajo para copiarla a mano; el camino que copia queda para
  la revisión en un navegador de verdad.

- **Paso 15 — los docs.** El ADR-0016 (`0016-agregar-por-doi-y-salud-de-links.md`:
  agregar en dos pasos, `pedirProtegido`, la salud de los links; alternativas
  `undici`, un servicio de afuera, chequear en la revista y los 57 juntos) y
  su fila en el índice — 0016 porque `ajustes` tomó el 0015 (DECISIONS);
  los tres comentarios de `lib/red/` pasan a 0016. AGENTS.md §3 (`datos/biblioteca/`,
  `admin/biblioteca/`, `features/biblioteca/contenido/`, `lib/red/`,
  `lib/metadatos/`, las consultas y acciones nuevas, la tarea), §12 (existen
  `materiales` y `autorias`; la regla nueva: nada del servidor pide un link de
  una persona si no es por `pedirProtegido`) y §13 (Biblioteca hecha, dentro
  de la fase 3). README: la tarea en el párrafo del cron, la sección
  «Biblioteca» del admin, `lib/red/` y `lib/metadatos/` en el árbol, y
  Novedades con «el material que abre». Spec del admin: §5 (57, y por qué no
  63), §6 (`novedades.material_id`, la fila de `materiales`, la de `autorias`
  y el párrafo de Materiales) y §9 (57). DESIGN.md §7: «Acción de texto» y
  «Portada tipográfica de un material», con los contrastes medidos (§11 ya se
  había escrito en los pasos de UI). Aceptación: `git diff --stat main --
  docs AGENTS.md README.md DESIGN.md` → los cinco más el ADR nuevo; `pnpm lint`
  → exit 0.

- **Verificación — dos arreglos que salieron al verificar.** `material.ts`
  pasaba el tope de 100 de una utilidad (116 sin comentarios): los campos van
  a `campos-del-material.ts` (60) y los esquemas quedan en 59 (`7e9a4ae1`).
  Y en la `Lista` con miniatura, con los títulos largos de los materiales,
  «Editar» caía debajo del texto en escritorio: el bloque de la izquierda
  crece y parte su texto antes de empujar la acción (`flex-1 basis-64`), y la
  acción baja recién a 390 (`bfcc4629`, DESIGN.md §11 «Lista» lo dice).

## Verification

### 2026-09-27 — L DoD (lane de un XL) — PASS

Sobre `bfcc4629`, el árbol final de la lane.

- L1 estática: `pnpm typecheck` → exit 0; `pnpm lint` → exit 0; `node
  scripts/verificar-react-doctor.mjs` → exit 0, «react-doctor: 100/100, sin
  diagnósticos (apps/sitio/src: 874 archivos · packages/db/src: 3 ·
  packages/auth/src: 27 · packages/kit-admin/src: 19)». Topes: ningún `.tsx`
  nuevo o tocado pasa de 200 ni ninguna utilidad nueva de 100 (sin
  comentarios); `datos/actividad.ts` queda en 138 y ya estaba en 123 en
  `main` (DECISIONS).
- L2 comportamiento: `pnpm test` → exit 0 (kit-admin 3/3, auth 46/46, sitio
  350 pass · 0 fail · 1 skipped, el de las respuestas grabadas de Métricas,
  que ya estaba en `main`); `pnpm build` → exit 0 (`/biblioteca` y
  `/biblioteca/portada/[id]` estáticas, las cuatro del admin dinámicas);
  `pnpm migrate:status` → «18 migrations found… Database schema is up to
  date!». Arranca: `next start -p 3056` y `next dev -p 3046` contestan 200.
- Render: `node scripts/comparar-render.mjs
  "$LOCALAPPDATA/Temp/ed-biblioteca-base" apps/sitio` → 11 páginas iguales y
  `biblioteca.html: DISTINTA en texto` (exit 1, esperado); el texto de
  `biblioteca.html` sin «Copiar cita APA» es idéntico al de `main` (8
  botones, `iguales sin el boton: True`). El JS de `/`, `/biblioteca` y las
  fichas de novedades baja ~85–91 KB: el catálogo viaja como props.
- L3 punta a punta, **permisos con `next start`** (los tres roles tienen
  `editarBiblioteca`, así que no hay rol sin permiso: se probó sin sesión, con
  una cookie falsa y con la sesión de edita, con un material nuevo solo en
  borrador «ZZSECRETOBORRADORNUEVO» y un cambio sin publicar «ZZSECRETOCAMBIO»
  cargados antes del build):
  - `grep` de los dos en todo `.next/server/app` y `.next/static` → nada;
  - sin cookie: las cuatro rutas del admin → 307 a `/admin/entrar`, 0
    coincidencias; `/biblioteca/portada/<borrador>` → 404;
  - cookie falsa (`better-auth.session_token=falso.falso`, pasa el proxy):
    `/admin/biblioteca`, `/nuevo` y las dos fichas → 307 a `/admin/entrar`,
    0 coincidencias con los secretos ni con títulos publicados en el HTML
    entero; `/admin/biblioteca/portada` → 401;
  - sesión de edita: `/admin/biblioteca` → 200 con los dos (control
    positivo); `/biblioteca` y `/` → 200 sin ninguno.
  Los datos de prueba se borraron (57 publicados, 0 borradores).
- L3 punta a punta, **navegador** (Orca para leer y auditar; Playwright solo
  para lo que Orca no tiene: el ancho de 390 y las capturas, que en Orca dan
  «Screenshot timed out»):
  - contraste de todo el texto visible (auditoría por DOM, `body` entero:
    sidebar incluida), con un material en `roto` un momento para ver la
    insignia, el número y la fila del Inicio: lista filtrada, ficha,
    «Agregar» paso 1, «Agregar» paso 2 (el link de la RMF E, 9 marcas «De
    Crossref.», nada guardado) e Inicio → **ninguno por debajo de su mínimo**
    en los tres temas; mínimo 4,54:1 en claro y mixto, 6,01:1 en oscuro
    (7,08:1 en el Inicio);
  - 390 de ancho (lista, lista filtrada, ficha, «Agregar», Inicio,
    `/biblioteca`): 0 elementos fuera de pantalla, sin scroll horizontal; los
    filtros scrollean de costado, como dice DESIGN.md §11 «Filtro»;
  - foco con Tab (40 en la lista, 70 en la ficha, 20 en «Agregar», 60 en
    `/biblioteca`): todo lo enfocado tiene indicador visible, salvo el overlay
    de desarrollo de Next y los dos buscadores del sitio, que ya estaban en
    `main` y lo marcan en su contenedor (`focus-within:ring-2`);
  - «Copiar cita APA» en Chromium con permiso de portapapeles: foco
    `verde-concepto` de 2 px, Enter → «Cita copiada», el `status` dice «La
    cita APA se copió.», el portapapeles tiene la cita («Rojas Viveros, R.,
    Porras, A., Cabrera Chim, L. M. y Corona-Galindo, M. G. (2026). Taller…»)
    y a los 2,5 s vuelve a «Copiar cita APA»;
  - capturas (fuera del repo, `%LOCALAPPDATA%\Temp\biblioteca-capturas\`):
    lista claro 1280 y 390, lista con link roto mixto, lista oscuro 390, ficha
    claro 1280 y oscuro 390, Inicio mixto, `/biblioteca` 1280.
- Revisión de cierre: la lanza el padre (lane supervisada; work-run §4).
