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
  son sondas del DOM. `2ff9678`, `5f449e6`.

## Abierto

- La lane 8a (`mateo/biblioteca`, en revisión) no está en `main`: lo que
  depende de ella va al final del PLAN (SPEC §11).
