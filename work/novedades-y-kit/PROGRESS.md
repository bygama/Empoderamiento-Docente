# PROGRESS — Novedades y el kit del admin

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_novedades` con las 13 migraciones de `main` aplicadas
  (`pnpm migrate:deploy` → «All migrations have been successfully applied»;
  `pnpm migrate:status` → «Database schema is up to date!»), `.env.local`
  copiado y apuntado a ella. SPEC.md escrito desde el brief del padre (lane 6
  de `work/mapa-del-admin/`), con seis propuestas (§14).
- Lo que dejan las lanes vecinas, sin mergear todavía (leído en sus ramas):
  la 3b (`cuentas`) trae `Volver.tsx`, `Buscador.tsx` y el paginado; la 3c
  (`inicio`) trae `admin/actividad/frase.ts` y los registros de pendientes y
  de accesos rápidos. El PLAN deja la UI del módulo para después de rebasear,
  así los consume en vez de duplicarlos.
- 2026-09-26 — **SPEC aprobado por el padre** con las seis propuestas y dos
  condiciones (DECISIONS). PLAN.md escrito: 18 pasos.
- 2026-09-26 — **Build de base** para `scripts/comparar-render.mjs`: `pnpm
  build` sobre `48ed711` (el código de `main`; la base sin filas de páginas),
  exit 0, guardado en `%TEMP%\ed-novedades-base\.next` (11 páginas
  prerenderizadas).

- **Paso 1 — el kit nace** (`a4e6482`). `packages/kit-admin` (`@ed/kit-admin`,
  peer `react`/`react-dom`/`next`, dev las herramientas de los otros
  packages: el lockfile solo suma el importer y variantes de peers, ningún
  paquete nuevo). Mudados con `git mv`: `TextoCorto`, `Parrafo`,
  `PieDelCampo`, `largo`, `cambio`, `clases` (+ `claseDeBoton`), `ListaFija`
  (`ResumenDeItem` propio), `CampoFoto` (`maximoBytes` por prop) y
  `RutaInterna` → `Seleccion` (`{ valor, etiqueta }`, `sinElegir`). Nuevos:
  `Boton`, `Aviso`, `iconos` (los cuatro trazos del set) y `foto.ts` (subpath
  `./foto`). `armazon/Boton.tsx`, `clases.ts` y `Campos.tsx` re-exportan con
  el comentario de DECISIONS (A). `Campo.tsx` y los demás imports, al kit;
  `lib/contenido/fotos.ts` y `descripcion.ts` toman los tipos del kit. El kit
  en `apps/sitio/package.json`, `@source` en `globals.css`, y en el script
  `react-doctor` y `PROYECTOS`. ESLint del kit con `settings.next.rootDir`
  apuntando a la app (sin eso, `no-html-link-for-pages` avisaba que no
  encontraba `pages/`). Aceptación: `pnpm typecheck` (4 proyectos), `pnpm
  lint`, `pnpm test` (auth 28/28; sitio 177 pass, 0 fail, 1 skipped: «las
  respuestas grabadas de la API se mapean enteras — sin respuestas grabadas:
  falta correr A1», el de métricas que espera el deploy), `node scripts/verificar-react-doctor.mjs` → «100/100, sin
  diagnósticos (… packages/kit-admin/src: 14 archivos)», `pnpm build` exit 0;
  `field-sizing` está en 1 CSS de `.next/static`; grep de `from "@/`,
  «novedad» y «Empoderamiento» en `packages/kit-admin/src`: sin resultados.
- **Paso 2 — Casilla, Fecha y ListaVariable** (`3ea7eac`). `Casilla` (la
  etiqueta entera marca, 40 px), `Fecha` (año escrito, mes y día elegidos con
  «Sin mes»/«Sin día»; el día se suelta si el mes nuevo no lo tiene) con sus
  partes puras en `partesDeFecha.ts` (no `fecha.ts`: choca con `Fecha.tsx` en
  un disco sin mayúsculas), y `ListaVariable` (subir/bajar con íconos de 40
  px, «Quitar», «Agregar …», el tope explicado en vez de deshabilitar, cada
  cambio anunciado sin género —«Agregaste sección 3»—, el foco al campo nuevo,
  a «Agregar» o al botón que queda del ítem movido; `claveDe` estable por
  ítem). Íconos `ChevronArriba`, `ChevronAbajo`, `Mas`. El kit suma su script
  `test` (`tsx`, ya en el lockfile). Aceptación: `pnpm --filter @ed/kit-admin
  test` 3/3, `pnpm typecheck` y `pnpm lint` exit 0,
  `verificar-react-doctor` 100/100 (kit: 19 archivos).
- **Paso 3 — el esquema de una novedad** (`20e2581`).
  `features/novedades/contenido/novedad.ts` (`esquemaNovedad`,
  `esquemaBorrador`, los tipos) y `modelo.ts`, sin Zod (`CATEGORIAS`,
  `etiquetaDeCategoria`, `TOPES`, `compararFechas`, `anclasDe`,
  `borradorVacio`): partidos para que Zod no viaje al navegador (DECISIONS).
  `@ed/db` suma el subpath `./slug`. Aceptación: `tsx --test
  src/features/novedades/contenido/novedad.test.ts` 5/5; typecheck y lint
  exit 0.
- **Paso 4 — la tabla y las nueve** (`ba8f651`). `prisma/schema/novedades.prisma`,
  `pnpm migrate --create-only --name novedades` → `20260927002934_novedades`,
  y en ese archivo, antes de aplicarlo, el índice parcial y el `INSERT` de las
  nueve, generado por un script de `.scratch/` (sin commitear) que valida cada
  fila con `esquemaNovedad`. Ese script frenó en dos imágenes fuera de
  `public/fotos/`: el validador suma `public/novedades/` y
  `public/quienes-somos/` (DECISIONS), con test. Los alt, del repo (cuatro) o
  escritos mirando la foto (cinco). Aceptación: `pnpm migrate` aplicó;
  `pnpm migrate:status` → «Database schema is up to date!»; la consulta del
  PLAN da `9|1|1`; y marcar una segunda destacada en una transacción da
  `duplicate key value violates unique constraint
  "novedades_una_sola_destacada"`.
- **Paso 5 — lo que lee el sitio** (`17de2af`). `datos/consultas/novedades.ts`:
  `novedadesVisibles` (pura), `novedadesDelSitio` (con `cache` y
  `draftMode`), `novedadPorSlug`, `redireccionDe`. El guardado de `filaDe`
  pasa a `datos/consultas/leer-sin-romper.ts`, que usan las dos (su test de
  páginas sigue 4/4). `NovedadDelSitio` en `novedad.ts`. Aceptación: `tsx
  --test src/datos/consultas/novedades.test.ts` 4/4; typecheck y lint exit 0.
- **Paso 6 — el sitio muestra las de la base** (`b84a03e`). Hero (la fecha
  de la más nueva, o sin tablero si no hay), destacadas, filtros, tarjeta,
  ficha y guía, e Inicio (`ultimasNovedades`), por props; la ficha busca
  `redireccionDe` antes del 404 y `slugsConFicha` (sin `draftMode`: corre
  fuera de un pedido) alimenta `generateStaticParams`. `fechaCorta` pasa a
  `modelo.ts`. `NovedadDestacada` (217 líneas de código) se parte al tocarla:
  `destacada/LinkNota.tsx`, `TapaDestacada.tsx`, `SegundaDestacada.tsx`. La
  ficha deja su `eslint-disable` de `exhaustive-deps`: el efecto depende de
  `secciones`, que es la referencia del prop. Los íconos de las categorías
  del `data.ts` no los usaba ningún componente: se van con él (el SPEC §4.2
  decía que se quedaban). Aceptación: typecheck, lint, `pnpm --filter sitio
  test` (186 pass, 0 fail, 1 skipped, el de A1), `pnpm build` (prerenderiza
  `/novedades/unesco-montevideo` y `/novedades/relime-2025` desde la base) y
  `node scripts/comparar-render.mjs %TEMP%\ed-novedades-base apps/sitio`:
  sale 1 con **una sola página distinta, `novedades.html` («en texto,
  imagenes»)**; las otras diez, iguales. Comparando los `<h3>` de las dos,
  la única diferencia es el orden de «Problematizar la matemática escolar,
  en Bolema» y «Los criterios de la derivada desde la variación, en AIEM»
  (SPEC §7.2, aprobado); las 33 imágenes son las mismas y el texto tiene el
  mismo largo y las mismas palabras. El JS del Inicio baja 14680 bytes: el
  `data.ts` ya no viaja. (`f31558e`, aparte: react-doctor marcó
  `only-export-components` en `destacada/LinkNota.tsx`, que exportaba el
  color; pasa a `destacada/verde-sobre-azul.ts`.)
- **Paso 7 — RSS e imagen para redes** (`e7ea8e3`). `lib/rss.ts` (+ test,
  2/2), `features/novedades/rss.ts` (el feed: link a la ficha o al listado,
  `guid` por slug, la fecha como día), `/novedades/rss.xml` (`force-static`)
  y el `<link rel="alternate">` en `/novedades`; `novedadesPublicadas()` sin
  `draftMode` para lo que corre fuera de un pedido. `features/novedades/imagen-para-redes/`:
  `generar.tsx` (`ImageResponse`, Manrope 700 latín `.woff` de
  `@fontsource/manrope` 5 con su `OFL.txt` al lado, el logo negativo como
  fondo —un `<img>` lo frena `@next/next/no-img-element` fuera de un
  `opengraph-image`—) y `tamano.ts` aparte, para que la metadata de la ficha
  no cargue `next/og`. La grilla de puntos no la dibuja Satori (probé dos
  sintaxis): el fondo va liso. `/novedades/[slug]/imagen-para-redes`
  (`force-static`, con `generateStaticParams`); la ficha pone `og:image` con
  la propia o la generada. `seoInicial` de Novedades en
  `contenido/seo.ts` (lo toma el paso 8). Aceptación: `pnpm build` exit 0,
  prerenderiza el RSS y las dos imágenes; el `.nft.json` de la ruta de la
  imagen incluye `manrope-latin-700-normal.woff` y `logo-ed-negativo.png`; el
  HTML de la ficha trae `og:image` = `…/novedades/relime-2025/imagen-para-redes`
  (1200 × 630, alt con el título). Con `next start` en su pestaña de Orca, en
  el 3024: el RSS da 9 `<item>` y `Content-Type: application/rss+xml;
  charset=utf-8`; `/novedades/relime-2025/imagen-para-redes` → `200
  image/png`; una ficha o una imagen que no existe → 404.
- **Rebase sobre `main` (`490547f`, con Mensajes)**, pedido por el padre
  (DECISIONS, 2026-09-27): sin conflictos; `Buscador` seguía el import
  viejo de `ENTRADA` → `2876603`. `pnpm migrate:deploy` aplicó
  `20260926231819_mensajes` en `ed_novedades` (la nuestra, `…002934`, va
  después); `migrate:status` al día; typecheck, lint y `pnpm test` (kit 3/3,
  auth 28/28, sitio 229 pass, 0 fail, 1 skipped, el de A1) en verde.
- **Paso 8 — la página Novedades se edita** (`70410f6`). Seis secciones en
  `features/novedades/contenido/` (`hero`, `destacadas`, `ultimas`,
  `movimiento` con el acento validado contra la frase, `lanzamientos` con la
  tarjeta del final, que el INVENTARIO no listaba y es copy visible,
  `cierre` con los dos textos según haya redes) y `seoDeNovedadesInicial`; la
  línea de `novedades` en `contenido/paginas.ts`. Los componentes reciben su
  `contenido`; `EdEnMovimiento` (226) y `LanzamientosRecientes` (239) se
  parten al tocarlos: `coreografia-movimiento.ts` y `lanzamientos/`
  (`useRiel`, `Lanzamiento`, `FinalDelRiel`). Las listas fijas usan el texto
  de clave (react-doctor frena la del índice). `openGraphDeLaPagina` en
  `config/metadata.ts`, igual a la de la 4c (que todavía no está en `main`):
  sin eso, el `openGraph` de la página pisaba la imagen del sitio. El
  `data.ts` se borra. Aceptación: `pnpm --filter sitio test` 229/0/1, lint,
  react-doctor 100/100, `pnpm build`; `comparar-render` contra la base vieja:
  en `novedades.html` las mismas 803 palabras y los mismos 51 links (solo el
  orden de §7.2), y en la cabecera el RSS y el SEO propio (og/twitter title y
  description de la página, con la misma imagen del sitio); en las dos fichas
  solo la cabecera (og/twitter con el título, la bajada y la imagen
  generada). Contacto y `sumate-al-equipo` difieren por Mensajes, que esta
  rama no toca.
- **Paso 9 — escribir en la base** (`cc0ba61`, `8321173`, `43a9657`).
  `modelo.ts` pasaba las 100 líneas: fechas a `fechas.ts` y los nombres de
  los campos (`dondeEsta`) a `etiquetas.ts`. `datos/acciones/novedades-en-base.ts`
  (errores por campo, slug ocupado —publicado o en un borrador, con
  `borrador.path`—, `tituloDe`, `columnasDe`, `borradorSinTapa`),
  `editar-novedades.ts` (crear, guardar, descartar, borrar) y
  `publicar-novedades.ts` (publicar con la destacada única y el 308 sin
  cadenas, despublicar). `choqueCon` dice qué se abrió. Aceptación: `tsx
  --test` de `editar-novedades.test.ts` 3/3 y `publicar-novedades.test.ts`
  4/4, sin saltear; después, la destacada de verdad sigue siendo
  `relime-2025` y hay 9 filas. React-doctor pidió el `Promise.all` al soltar
  las destacadas (`43a9657`).
- **Paso 10 — las acciones del admin** (`5e271b5`). `novedades.ts` (crear,
  guardar, borrar), `ciclo-de-novedades.ts` (publicar, despublicar,
  descartar), `abrirVistaPreviaDeNovedad` en `vista-previa.ts`,
  `revalidar-novedades.ts` y `datos/vista-previa.ts` (`encenderVistaPrevia`,
  sin «use server»). Cuatro tipos en `datos/actividad.ts`. Partidas en tres
  para quedar bajo 100 líneas. Aceptación: `acciones-con-sesion.test.ts` y
  `actividad.test.ts` 17/17; lint; react-doctor 100/100.
- **Antes del paso 11**: `git fetch` — `main` sigue en `490547f` (la 3b y la
  3c sin mergear): la UI consume `Buscador`, `Volver` y `Confirmacion` de
  Mensajes. Dev server en su pestaña de Orca (`next dev -p 3024`, con
  `NEXT_PUBLIC_SITE_URL` pisada), perfil de navegador propio
  `novedades-y-kit`, cuenta `novedades.prueba@ejemplo.org` (administra) en
  `ed_novedades`. **Las capturas no salen**: `orca screenshot` da «the
  browser tab may not be visible or the window may not have focus» (la
  ventana de Orca no muestra este worktree; no le robo el foco a nadie). La
  verificación visual va por el DOM (`orca eval`) hasta que se pueda.
- **Paso 11 — la lista** (`241997e`). `datos/consultas/lista-de-novedades.ts`
  (`filasDeLaLista` pura + test 2/2), `admin/novedades/PantallaDeNovedades.tsx`
  y `ListaDeNovedades.tsx`, rutas `novedades/` (layout con la guarda,
  `error.tsx`, `page.tsx` Publicadas, `borradores/page.tsx`), `EstadoVacio`
  con `accion`, la guía de `por-hacer` borrada. React-doctor leyó el
  `includes` de un texto como el de una lista: va en `tieneLoBuscado`.
  Aceptación: `guarda.test.ts` 4/4; react-doctor 100/100; en el navegador,
  `/admin/novedades` lista las nueve (RELIME con «★ Destacada»),
  `?q=relime` deja una y ofrece «Borrar la búsqueda», Borradores vacía dice
  «No hay borradores.», el título de la pestaña es «Borradores · Novedades
  · Admin ED» y hay un solo primario.
- **Paso 12 — la ficha y guardar** (`287ed5b`, `b161e23`).
  `useFrenarSalida`, `useErroresDelEditor` y el aviso con «Recargar»
  (`AvisoDeLaAccion`) pasan de `admin/paginas/` al armazón: los usan dos
  módulos. `datos/consultas/ficha-de-novedad.ts`, `admin/novedades/formulario.ts`,
  `FormularioDeNovedad`, `CuerpoDeNovedad`, `EncabezadoDeLaFicha` (+
  `AccionesDeLaFicha`, por la complejidad que marcó react-doctor),
  `FichaDeNovedad`, `useGuardarNovedad`, `publicaciones.ts`, rutas `nueva/`
  y `[id]/`. Dos cosas que salieron probando: (1) «Cambios sin guardar» no
  se apagaba al abrir una guardada, porque el `jsonb` reordena las claves:
  `mismoDocumento` compara sin mirar el orden; (2) el `revalidatePath` del
  primer guardado refrescaba la ruta nueva (`/[id]`) y rearmaba la ficha,
  perdiendo el aviso: crear y guardar un borrador ya no revalidan (las
  pantallas del admin son dinámicas). Aceptación en el navegador: la URL
  sigue al título («prueba-de-la-ficha»), el encabezado pasa a azul, el
  primer guardado crea la fila, pasa a `/admin/novedades/<id>` y dice
  «Borrador guardado.»; al recargar sigue ahí y sin «Cambios sin guardar»;
  un año «20» da el error en el campo, «Hay un campo para revisar: Fecha —
  …», `aria-invalid` y el foco en `fecha-campo`.
- **Paso 13 — publicar y lo demás** (`a96bfff`, `e99400a`). `ListaDeDiferencias`
  y `VistaPreviaFrenada` al armazón; `cambios.ts` (+ test 3/3), `QueCambio`,
  `SalidaDeNovedad` (descartar y borrar con `Confirmacion`, despublicar
  sin), `usePublicarNovedad` y `useSalidaDeNovedad` (partidos por el tope de
  100 líneas). Recorrido en el navegador con la novedad de prueba: subir la
  foto por el campo de archivo (`/api/fotos/<uuid>`), «Agregar sección» (el
  foco va al título nuevo), **Publicar** → «Publicada: el sitio ya la
  muestra.»; `/novedades/tercera-prueba` 200 con su cuerpo, en el listado,
  RSS con 10 `<item>`, su imagen 200 `image/png`; **cambiar la URL** y
  publicar → la vieja da `308 → /novedades/tercera-prueba-nueva`;
  **destacada** → «…y «Resignificar…» dejó de ser la destacada», la tapa de
  `/novedades` pasa a la nueva; **despublicar** → «…y dejó de ser la
  destacada», la ficha da 404 y «← Novedades» apunta a Borradores;
  **borrar** → la confirmación deja el foco en «Cancelar», vuelve a
  `/admin/novedades/borradores?borrada=1` con «Se borró la novedad.», sin
  fila ni redirecciones. En RELIME: volver a marcarla destacada («Qué
  cambió · un campo»), guardar un borrador («Cambios sin publicar») y
  **descartar** → «Se descartaron los cambios…», «Publicada», sin azul.
  **Vista previa**: con un título de borrador, la ficha y la tapa lo
  muestran con la barra «Volver al sitio publicado», y `curl` sin la cookie
  no; «Volver al sitio publicado» la apaga. RELIME quedó como estaba
  (publicada, destacada, sin borrador).
- **Rebase sobre `15def2c`** (la lane del Inicio en `main`). Sus registros
  tipados (`QUIEN_VE`, `VA_AL_INICIO`, `FRASES`) exigen una entrada por
  tipo de actividad: las cuatro de una novedad las ve quien edita novedades,
  van al Inicio y se leen «Ana publicó la novedad «…»».
- **Paso 14 — el panel lateral** (`8286a36`, `54bff98`). Las figuras de
  «Cómo se ve» pasan a `armazon/ComoSeVe.tsx` (la pestaña SEO de una página
  las compone igual, comprobado en `/admin/contenido/paginas/novedades/seo`);
  `PanelDeLaNovedad`, `SeVeEn` + `se-ve-en.ts` (test 4/4),
  `useImagenGenerada` (pide la imagen cuando lo escrito queda quieto 600 ms)
  y la ruta `/admin/novedades/imagen-para-redes` con su lógica en
  `datos/consultas/imagen-para-redes.ts`. `NOVEDADES_EN_EL_INICIO` (4) lo
  leen el Inicio del sitio y «Se ve en». Aceptación: react-doctor 100/100;
  `curl` sin cookie → **307** a `/admin/entrar` (el proxy) y con una cookie
  falsa → **401** «Hay que entrar al admin…» (la ruta misma). Con sesión, en
  la ficha de RELIME la imagen del panel carga `1200 × 630`; al escribir en
  el título, a los 200 ms sigue la dirección vieja y a los 2,7 s la nueva, y
  carga. «Usar otra» deja el foco en el mismo botón, que pasa a «Volver a la
  generada», y aparece el campo; volver lo saca y apaga «Cambios sin
  guardar». En `/nueva`: «Todavía no está en el sitio. Al publicarla, va a
  estar en:», la segunda nota de la tapa, sin ficha y en el Inicio.
- **Paso 15 — Novedades en el Inicio** (`37115b8`). `datos/inicio/de-las-novedades.ts`
  (el pendiente «N novedades en borrador hace más de 7 días», con los títulos)
  registrado en `PENDIENTES` con `editarNovedades` y «Ir a Borradores»; el
  acceso rápido «Nueva novedad» en `modulos.ts`. Test 3/3 (la frase, que lo
  ven los tres roles, y contra la base: cuenta el de 8 días y no el de 2).
  `pnpm --filter sitio test` 260/260 (1 salteado), lint y react-doctor 100.

## Abierto

- **`publicacion` es texto hasta la lane 8** (DECISIONS, B): la lane 8
  (`biblioteca-y-equipo`) la pasa a una relación con materiales.
