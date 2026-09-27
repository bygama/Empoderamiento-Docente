# PROGRESS — Métricas completas

## In progress

- 2026-09-27 — Lane abierta desde `main` en `782aeb2`, rama
  `mateo/metricas-completas`, dispatch `ctx_2f56b40105f3` (task
  `task_f6fdab703551`). Worktree listo: `pnpm install`, `pnpm generate`,
  `.env.local` copiado y apuntado a la base propia `ed_metricas` (creada en
  `ed-postgres`, con `pnpm migrate:deploy` hasta
  `20260927024335_indexacion_de_urls`).
- 2026-09-27 — Barrido de `work/`: solo `mapa-del-admin/`, la lane padre en
  curso. Nada mergeado con carpeta pendiente.
- 2026-09-27 — La API de Web Analytics de Vercel, verificada contra su
  documentación de hoy (SPEC §2): no da regiones ni ciudades; sí `hour`,
  `osName`, `browserName`, `utmCampaign` y filtros por país.
- 2026-09-27 — SPEC.md escrito (`37d2272`) y aprobado por el padre con las
  siete recomendaciones de §12 (DECISIONS). PLAN.md escrito: 19 pasos, los dos
  de la 8a al final.

## Hecho

- **Paso 1** — `contadores`, `enlaces` y `marcas` en
  `prisma/schema/metricas.prisma` (y los comentarios de `dimension` y `dias`
  al día), migración `20260927051631_contadores_enlaces_y_marcas` generada y
  aplicada en `ed_metricas`. `pnpm migrate:status` → «Database schema is up to
  date!»; `sitio typecheck` → 0. `ec87ee5`.
- **Paso 2** — `config/metricas.ts` (`PAISES_FIJOS`, `ZONA_HORARIA`,
  `NOMBRE_DE_LA_ZONA`, `EVENTOS` con `conCanal` y `publico`,
  `CANALES_DE_ENLACE`, `MINIMOS`, `MENOS_DE`), `lib/metricas/canales.ts`
  (`CANALES`, `NOMBRE_DEL_CANAL`, `canalDe(host, propio)`) y
  `lib/metricas/robots.ts` (`esRobot`). Tests de los dos: 10 pasan, exit 0.
  `5ad7727`.
- **Paso 3** — La copia de Vercel: `lib/metricas/mapear.ts` (sale de
  `vercel.ts` para que los dos queden bajo 100 líneas; `PEDIDO_POR_DIMENSION`
  con `sistema`, `navegador`, `campana` y `hora`), `vercel.ts` con `filtro`,
  `soloPais` y `fueraDePaises`, `periodos.ts` con `PERIODOS`, `periodoDe` y las
  seis ventanas, `datos/tareas/consultas-de-vercel.ts` (`CONSULTAS` y
  `DIMENSIONES_DEL_CRUCE`) y la tarea usándolas. Tests de `vercel`,
  `periodos` y la tarea: 22 pasan, 1 saltado (el de las respuestas grabadas,
  que espera a A1, como antes), exit 0; `sitio typecheck` → 0. `909c513`.
- **Paso 4** — `creo-un-enlace`, `borro-un-enlace`, `agrego-una-marca` y
  `borro-una-marca` en `datos/actividad.ts` (`verMetricas`, al Inicio), su
  frase y el módulo «Métricas» del filtro de Cuentas › Actividad. Tests de
  frase, actividad, filtros, consultas y actividad reciente: 15 pasan, exit 0;
  `sitio typecheck` → 0. `76de6a9`.
- **Paso 5** — `datos/contadores.ts`: `sumarContador` (un `INSERT … ON
  CONFLICT`, el canal vacío en un evento sin canal), `sumasDe` y `totalDe`.
  `contadores.test.ts` contra `ed_metricas`: 3 pasan (diez a la vez → 10),
  exit 0. `2464c98`.
- **Paso 6** — `datos/enlaces.ts` (`codigoDesde` con `slug` de `@ed/db`,
  `pareceCodigo`, `crearEnlace` con reintento ante el índice único,
  `borrarEnlace`, `enlacePorCodigo`), `datos/abrir-enlace.ts` (`destinoConUtm`,
  `esUnClic`, `contarClic` con `TOPE_DE_CLICS = 3` por HMAC, `abrirEnlace`:
  307, `no-store`, `X-Robots-Tag: noindex`, el conteo en `segundoPlano`),
  `app/(sitio)/l/[codigo]/route.ts` (con `notFound()`) y `/l/[codigo]` en
  `config/rutas.ts`. **Nombres:** el PLAN decía `datos/enlaces/abrir.ts`;
  quedó `datos/abrir-enlace.ts` para no tener un archivo y una carpeta con el
  mismo nombre. Tests de enlaces, abrir y rutas: 13 pasan, exit 0; typecheck
  0. `91fb0ca`.
- **Paso 7** — `datos/recibir-evento.ts` (el PLAN decía
  `datos/contadores/recibir.ts`: mismo motivo) con `recibirEvento`, el tope de
  60 por hora por IP, `materialExiste` en falso hasta la 8a, y
  `app/api/contar/route.ts`. `recibir-evento.test.ts`: 7 pasan, exit 0;
  typecheck 0. `0c85073`.
- **Paso 8** — `lib/contadores/contar.ts` (`cuerpoDelEvento` puro y
  `contar`), `FormularioCV` cuenta `cv-vio` al montar (con un ref contra el
  doble efecto), `cv-empezo` en el primer `onChange` del formulario y
  `cv-envio` tras el `ok`; la coreografía de Contacto, `contacto-envio`. La
  vista del CV quedó en `FormularioCV`, que solo vive en esa página: no hizo
  falta otro componente. `contar.test.ts`: 4 pasan; typecheck, eslint de lo
  tocado y `verificar-react-doctor.mjs` (100/100, sin diagnósticos) → 0.
  `3a0fd57`.
- **Paso 9** — `datos/marcas.ts` (`crearMarca`, `borrarMarca`,
  `fechaDeMarcaValida`), `datos/acciones/marcas.ts` (`agregarMarca`,
  `borrarMarca`) y `datos/acciones/enlaces.ts` (`crearEnlaceDesdeElAdmin`,
  `borrarEnlaceDesdeElAdmin`): sesión, `verMetricas`, Zod, el destino dentro
  de `rutasDelSitio()` y `registrarActividad`. `acciones-con-sesion.test.ts`:
  13 pasan; `marcas.test.ts`: 1 pasa; typecheck 0. `eb8bb45`.
- **Paso 10** — `lib/metricas/agregar.ts` (`sumarPorValor`,
  `visitasPorCanal`, `parte`, `curvaDe`), `datos/consultas/nombres-de-rutas.ts`,
  `datos/consultas/resumen.ts` (`resumenDe`, `dominioPropio`) y
  `datos/consultas/marcas.ts` (`TIPOS_QUE_MARCAN`, `marcasDeLaActividad`,
  `marcasDe` con `tiposQueVe(rol)`); `tarjetaDe` acepta 90. Tests de agregar y
  marcas: 6 pasan; typecheck 0. `5c85760`.
- **Paso 11** — `admin/armazon/Curva.tsx` + `curva/calculos.ts` (con test: 3
  pasan), el Resumen nuevo en `admin/metricas/` (`Resumen.tsx`, que reemplaza
  a `PanelMetricas.tsx`; `resumen/` con `EstadoDeLaCopia`, `SinCopia`,
  `CuerpoDelResumen`, `CurvaConMarcas`, `ListaDeMarcas`, `AgregarMarca`;
  `SelectorDePeriodo`, `formato.ts`, `poco-trafico.ts`), «Actualizar ahora» en
  las acciones del encabezado, la página envuelta en `<Guarda
  capacidad="verMetricas">`. `Seccion` se mudó de `admin/busquedas/` a
  `admin/metricas/` (ahora la usan cuatro pantallas) con su `Bloque`;
  `tarjetas()` salió de `consultas/metricas.ts` (quedó sin uso);
  `LARGO_DE_UNA_MARCA` pasó a `config/metricas.ts` para no llevar Prisma al
  cliente. DESIGN.md §11: «Gráficos» (la curva y sus marcas), el estado de
  poco dato en «Estado vacío» y el período en «Filtro». Gate del paso:
  typecheck 0, eslint 0, react-doctor 100/100 (el primer intento dio 98 por
  `only-export-components` en `SelectorDePeriodo.tsx`: `periodoAnterior` se
  fue a `formato.ts`). **En el navegador** (Orca, perfil aislado
  `metricas-completas`, dev en el 3029 con variables de Vercel de prueba,
  `ed_metricas` sembrada con un script de scratch, cuenta `edita`): el
  período enciende su píldora, las cifras dicen «+18 % contra los 30 días
  anteriores», la curva tiene 30 días, su frase y la marca «1»; agregar una
  marca lleva el foco al día, la guarda, la muestra primera en la lista (hoy
  no está en la curva, que llega a ayer) y devuelve el foco al botón; borrarla
  confirma en el lugar con el foco en «Cancelar» y queda
  `agrego-una-marca`/`borro-una-marca` en `actividad`; las publicaciones
  sembradas en `actividad` salen como marcas solas; con poco tráfico, «Por
  dónde llegan» dice «Hay 6 visitas en estos 7 días; … hacen falta 20»; a
  390 de ancho no hay desborde. Las capturas de pantalla de Orca no andan
  (`Screenshot timed out`: la ventana no tiene foco), así que la evidencia
  son sondas del DOM. `2ff9678`, `5f449e6` (hashes de antes del rebase).
- **Rebase sobre `main` con la 8a** (`d051c6a`), entre el paso 11 y el 12:
  ver DECISIONS. Pusheado con el pre-push en verde (typecheck, react-doctor
  100/100, lint). `44438c8`.
- **Paso 12** — Origen: `lib/metricas/mejor-hora.ts` (`grillaDeHoras` con
  `Intl` en `ZONA_HORARIA`, `mejoresFranjas`, `franjasEnPalabras`; test con el
  cambio de horario de Chile del 6/9/2026 y la madrugada UTC que es la noche
  anterior), `lib/metricas/ocultar.ts` (`ocultarMenores`),
  `datos/consultas/origen.ts` (`origenDe`: una sola lectura, lo chico a
  «Otros», el cruce con `DIMENSIONES_DEL_CRUCE`), la pantalla
  (`admin/metricas/Origen.tsx`, `origen/` con `CuerpoDeOrigen`, `Dispositivos`,
  `PaginaPorPais`, `filas.ts`; `MejorHora.tsx`) y su página con la guarda.
  `dominioPropio()` saca el `www.`. DESIGN.md §11: la grilla y «lo chico no
  se nombra». Tests: 5 pasan; typecheck, eslint y react-doctor (100/100) → 0.
  **En el navegador:** los seis bloques con sus anclas; Chile, México y
  Argentina arriba; «Regiones» dice que Vercel no las da; los dispositivos en
  castellano; el cruce con «menos de 3»; 168 celdas con su `title` («los
  lunes de 0 a 1: 4 visitas») y la frase «Cuando más gente entra, en hora de
  Chile: …»; con poco tráfico, «De dónde llegan» y la mejor hora dicen cuánto
  falta; sin desborde a 390. `3a492ee`, `038f5f2`.
- **Paso 13** — `datos/consultas/que-hace-la-gente.ts` (el período termina
  hoy) y la pantalla (`QueHaceLaGente.tsx`, `acciones/CaminoDelCV.tsx`,
  `acciones/Contactos.tsx`) con su página. **En el navegador:** la tabla del
  camino por canal con su total y los contactos «142, −2 % contra los 30 días
  anteriores» con su reparto por canal. typecheck, eslint, react-doctor → 0.
  `32da712`.
- **Paso 14** — Links para compartir, en tres commits: (1) el código pasa a
  `lib/metricas/codigo.ts` (con `@ed/db/slug`, así el formulario lo muestra
  sin llevar Prisma al cliente) y `/l/[codigo]` pasa de `route.ts` a
  `page.tsx`: la ruta de API daba un 404 **vacío** con `notFound()`; la página
  da la del sitio («Página no encontrada», con `noindex`) y redirige igual con
  307; `destinoDelEnlace(cabeceras, codigo)` reemplaza a `abrirEnlace`; (2) la
  pantalla (`Enlaces.tsx`, `enlaces/CrearEnlace.tsx`, `ListaDeEnlaces.tsx`,
  `Copiar.tsx` sobre el `useCopiar` que ya existía) con
  `datos/consultas/enlaces.ts` (`enlacesConCifras`, `destinosPosibles`,
  `baseDeLosLinks`) y la línea de §11 en «Lista»; (3) se borran las guías de
  Métricas. Tests de abrir, enlaces, código y rutas: 13 pasan; typecheck,
  eslint, react-doctor → 0. **De punta a punta:** crear «Charla en Viña del
  Mar» desde la pantalla (vista previa del código, aviso con el link,
  `creo-un-enlace` en actividad); `curl` a `/l/charla-en-vina-del-mar` con un
  `User-Agent` de iPhone → `307`, `location:
  /contacto?utm_source=instagram&utm_medium=link&utm_campaign=charla-en-vina-del-mar`
  y un `enlace-clic`; con `LinkedInBot` → 307 y no cuenta; un código que no
  existe → 404 con la página del sitio; borrar confirma con el foco en
  «Cancelar», deja `borro-un-enlace` y el link pasa a 404. `POST /api/contar`
  con `curl`: 204 siempre, `cv-vio` desde `www.linkedin.com` suma uno en
  `redes`, `enlace-clic` y basura no suman. **Cabecera:** en `next dev` la
  página redirige con `Cache-Control: no-cache, must-revalidate`; el `no-store`
  de producción se mide con `next start` en work-verify.
- **Paso 15** — `config/avisos.ts` suma `resumen-semanal` (`verMetricas`) y
  `deFabrica` (Contacto y CV `true`, el resumen `false`); `datos/avisos.ts`
  lo respeta en `destinatariosDe` (prendido: `none` apagada; apagado: `some`
  prendida), `avisosDe`, `avisosDeTodas` y `ponerQuienRecibe` (con `recibe()`),
  y el índice de Ajustes alerta «Nadie recibe…» solo por uno que viene
  prendido. `avisos.test.ts` (con uno nuevo del resumen): 6 pasan. `74534a5`.
- **Paso 16** — `mandarCorreo` gana `idempotencia`; `correos/resumen-semanal.ts`
  (la plantilla); `datos/tareas/numeros-del-resumen.ts` (los números de
  «Esta semana» del Inicio con su corte por rol, más vistas y contactos; la
  página más vista); `datos/tareas/resumen-semanal.ts` (`enLaZona` con
  `ZONA_HORARIA`, `diasQueFaltan`, `mandarResumenSemanal`, la tarea
  `resumen-semanal` en `TAREAS_DIARIAS`); Resend la lleva en
  `config/conexiones.ts`; Mi cuenta › Avisos dice «Llega los lunes a la
  madrugada, hora de Chile.» o cuántos días faltan. `Destinatario` suma
  `DestinatarioConRol` para el corte por rol. Tests de correos, la tarea,
  conexiones y avisos: 25 pasan; typecheck, eslint y react-doctor → 0 (el
  primer intento dio 98 por `js-hoist-intl`: el `Intl.DateTimeFormat` de
  `enLaZona` subió al módulo). En el navegador: Mi cuenta de quien edita
  muestra la casilla del resumen apagada, con su nota. `97abefa`.
- **Paso 17** — La 8a ya estaba en `main` (rebase de antes del paso 12):
  `materialExiste` contra `materiales` publicados; `contar("material-consultado",
  id)` en el link de un material del catálogo, de los destacados y del Inicio;
  `datos/consultas/materiales-consultados.ts` (`masConsultados`,
  `consultasDelMes`); «Materiales más consultados» en Qué hace la gente; el
  número del Inicio lee `materialesConsultados()` (y con él, el resumen
  semanal). Test nuevo de `materialesSegun`: 12 pasan con los de
  `recibir-evento`. **De punta a punta:** el dev server, levantado antes del
  rebase, tenía el cliente de Prisma viejo (`recibirEvento: TypeError` en su
  log: `base.material` no existía); reiniciado (terminal
  `term_ca18c1e1-…`), un `curl` con un material publicado suma 1, uno con un
  id que no existe no suma, y un clic en «Leer en RELIME» de `/biblioteca`
  suma otro; Qué hace la gente los lista y el Inicio dice «Materiales
  consultados 2». `8571be2`.
- **Paso 18** — La lista de `/admin/biblioteca` dice «Consultado N veces este
  mes» (o «Sin consultas este mes») debajo de cada material, con
  `consultasDelMes()` leído junto con la lista. En el navegador: las dos
  filas consultadas dicen «Consultado 1 vez este mes». typecheck, eslint,
  react-doctor → 0. `f876d3a`.
- **Paso 19** — ADR-0017 (con el límite de atribución de un CV a un link y
  por qué se acepta, como pidió el padre) y su fila en el índice; el README
  («Las métricas y lo programado», con la tabla de qué ve ED, de dónde sale y
  cuándo llega); AGENTS.md §3; el spec del admin (§5 las rutas, §6 las
  tablas). `grep -n 0017 docs/architecture/adrs/README.md` → la fila 48.
  `4b37e51`, `5681b08`, `788140b`, `e05da1d`.

## Abierto

- La lane 8a (`mateo/biblioteca`, en revisión) no está en `main`: lo que
  depende de ella va al final del PLAN (SPEC §11).
