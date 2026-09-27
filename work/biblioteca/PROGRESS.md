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
