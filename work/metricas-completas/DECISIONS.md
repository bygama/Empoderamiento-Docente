# DECISIONS — Métricas completas

- 2026-09-27 — **SPEC aprobado por el padre con las siete recomendaciones de
  §12** («SPEC aprobado con tus siete recomendaciones. Escribí el PLAN.»), y
  las tablas `contadores`, `enlaces` y `marcas` tal cual §4.2:
  1. La copia de Vercel crece **sin migración** (`dimension` es texto), y el
     cruce página × país se copia filtrado por Chile, México, Argentina y el
     resto: cuatro consultas por corrida.
  2. El resumen semanal viene **apagado de fábrica** (`deFabrica` en el
     registro de avisos); se prende en Mi cuenta o en Ajustes › Avisos.
  3. Las marcas automáticas **salen de `actividad`**, sin tocar las acciones de
     publicar; las de a mano se guardan en `marcas` y **se pueden borrar**, con
     su tipo `borro-una-marca`. (El padre: «es la mejor idea del SPEC».)
  4. Las visitas de un link salen de Vercel por el `utm_campaign` que agrega la
     redirección 307; los clics se cuentan en el servidor, sin robots; un CV
     cuenta para un link solo por el código en la URL, sin guardar nada en el
     navegador. **El ADR escribe el límite** (si la persona sale y vuelve por
     otro lado, el CV no se atribuye al link) y por qué se acepta: no guardar
     nada de la persona.
  5. «Menos de 3, oculto» en **todo** Origen, no solo en las regiones.
  6. Lo que depende de la lane 8a va **al final del PLAN**; la 8a está en
     revisión y probablemente entre antes. Si no, se pregunta al llegar.
  7. **`America/Santiago`** para la grilla de la mejor hora y para decidir que
     es lunes, como **una sola constante con nombre en un solo lugar**
     (`config/metricas.ts`), y la pantalla dice «hora de Chile» donde muestra
     horas.
- 2026-09-27 — **El ADR de esta lane es el 0017**, aprobado por el padre: el
  0016 lo toma la Biblioteca (lane 8a) en su PR. Si al rebasear el número
  choca, se concilia ahí.
- 2026-09-27 — **La 8a entró a `main` (`d051c6a`)**, avisó el padre por el
  buzón: «consultado N veces este mes» ya se puede hacer. Rebasé enseguida,
  después del paso 11 y antes del 12, en vez de esperar al 17: conciliar
  temprano es más barato. Conflictos resueltos juntando las dos partes en
  `datos/actividad.ts`, `admin/actividad/frase.ts` (y su test),
  `config/rutas.ts` y DESIGN.md §11 («Filtro»). Las migraciones de la 8a
  (`…030549_biblioteca`, `…031500_material_de_las_novedades`) son anteriores a
  la mía (`…051631`), así que la mía no se regenera. Después del rebase:
  typecheck, lint y test (470: 469 pasan, 1 saltado) en verde.
- 2026-09-27 — **Arreglé un test intermitente que no era de esta lane**
  (`datos/avisos.test.ts`, de Ajustes): fallaba en dos de cuatro corridas
  enteras por una carrera con otros archivos que crean cuentas en paralelo
  (PROGRESS, «Tried and failed»). El gate tiene que ser confiable y esta lane
  toca ese archivo (el resumen semanal), así que el arreglo va acá: el test
  mide «repetirlo no cambia nada» contra las cuentas que ya estaban, sin
  aflojar el caso sin carreras (sigue exigiendo cero).
- 2026-09-27 — **Dos utilidades que esta lane llevó por encima de 100 líneas
  se achicaron** (AGENTS.md §6): `lib/metricas/canales.ts` (106 → 62, la
  lista de dominios en una línea por canal) y `datos/avisos.ts` (114 → 92,
  mandar el aviso de un mensaje nuevo pasó a `datos/avisar-mensaje-nuevo.ts`,
  sin cambios). `datos/actividad.ts` ya pasaba en `main` (217); esta lane le
  suma los cuatro tipos de Métricas (231): queda como seguimiento, como lo dejó la
  Biblioteca.
- 2026-09-27 — **`/l/[codigo]` es una página, no una ruta de API**: con
  `route.ts`, `notFound()` contestaba un 404 vacío; como página da el 404 del
  sitio y el `redirect()` es el mismo 307, sin caché por ser dinámica (en
  `next start`: `private, no-cache, no-store, max-age=0, must-revalidate`).
- 2026-09-27 — **Ronda de arreglos 1** (revisión de cierre r1: FAIL, 3
  IMPORTANT y 4 MINOR). Lo que se decidió en cada uno:
- 2026-09-27 — **IMPORTANT 1, el test intermitente de avisos, se arregla en
  el código, no en el test.** `e88b941` aflojaba la aserción; la revisión lo
  rechazó con razón: la carrera era real. `ponerQuienRecibe` cambiaba **todas**
  las cuentas de la base y leía y escribía sueltos, así que una cuenta borrada
  en el medio hacía fallar la acción entera por `avisos_cuenta_id_fkey`, y una
  invitada en el medio quedaba apagada sin que nadie la hubiera visto. Ahora
  toca solo las cuentas **mostradas** en la pantalla (`mostradas`, validada
  con Zod) y lo hace en una transacción que las traba con `FOR KEY SHARE`
  (`datos/quien-recibe.ts`): un borrado espera a que termine. El test de la
  ventana borra una cuenta desde otra conexión justo antes de escribir: sin
  la traba da `avisos_cuenta_id_fkey`, con ella pasa. Las aserciones volvieron
  a ser exactas. Sin `--test-concurrency=1` ni reintentos.
- 2026-09-27 — **IMPORTANT 2, `/l/` es una página, y lo que se había perdido
  al pasarla se recuperó con el proxy** (opción B, aprobada por el padre:
  «falla del lado seguro: sin la cabecera no se cuenta nada, y el 404 sigue
  siendo la página del sitio»). Por qué no un `route.ts`: ahí `notFound()`
  contesta un 404 vacío, sin la página del sitio. Lo que se perdió al pasarla
  a página: el `route.ts` contaba solo el `GET`, y una página no ve el
  método, así que un `HEAD` (los que mandan las vistas previas y los
  chequeadores de links) contaba como un clic. Ahora el proxy pone el método
  real en `x-ed-metodo` en **todo** pedido a `/l/` y la página cuenta solo si
  dice `GET` (`lib/metricas/clic.ts`). **No se puede falsificar:** el proxy
  pisa la cabecera que venga de afuera con `req.method` antes de pasar el
  pedido (`NextResponse.next({ request: { headers } })`), y el matcher cubre
  `/l/`; los dos con test. Sin la cabecera no cuenta nada: si el proxy dejara
  de correr, se pierden clics, no se inventan.
- 2026-09-27 — **IMPORTANT 3, la copia pide solo lo que da el plan.**
  `PLAN_DE_VERCEL = { ventanaDeReporteDias: 30, utm: false }` en
  `config/metricas.ts`, con su fuente: la página de límites de Web Analytics
  de Vercel (actualizada el 2026-08-25), Hobby, «Reporting Window: 1 Month» y
  «UTM Parameters: -». Lo de UTM apareció al leer esa misma página: sin UTM,
  `campana` siempre volvería vacía, así que no se pide y las visitas de un
  link van «—» con la explicación (se prende cambiando la constante). La
  corrida copia como mucho 30 días y guarda las ventanas de 7, su anterior y
  30; cada una en su `try`, y la que falla va al detalle. La fila `total`, la
  marca de agua, depende solo de las filas del día. En 90 días: vistas
  sumando las filas del día (solo con el período entero copiado) y
  visitantes «—» con el porqué; la comparación, solo contra un período
  anterior entero. Test con una respuesta 400 grabada.
- 2026-09-27 — **MINOR 4, una sola semana para todo el resumen, contada en
  días UTC.** La semana sale del lunes de Chile (`semanaAntesDe`) y todos los
  números la reciben. Cada uno la cuenta en días **UTC**, no en horas de
  Chile: los contadores y las filas de Vercel se guardan por día UTC y no se
  pueden partir, y contar los CV en hora de Chile los haría discrepar del
  resto. El correo dice «del 21 al 27» y los siete números cuentan esos siete
  días UTC (en Chile, del domingo 20 a las 21 al domingo 27 a las 21, con
  UTC−3). `numerosPara` es el «Esta semana» del Inicio, que cuenta los siete
  días hasta hoy a propósito: el correo dejó de usarlo y
  `numerosDelResumen(rol, semana)` usa la semana que recibe.
- 2026-09-27 — **El resumen espera a la copia de Vercel** (`despuesDe` en
  `lib/tareas/`): el lunes las dos corren en la misma corrida y la ventana del
  domingo la escribe la copia. Sin esperar, el resumen leía la ventana vieja
  (antes) o no encontraba la del domingo (ahora). La espera cuenta en el
  tiempo de la que espera, así la corrida entera sigue cabiendo en los 60
  segundos de la función. Alternativa descartada: mandar el resumen los
  martes, que contradice el «los lunes» del brief.
- 2026-09-27 — **Los clics de Google del resumen van casi siempre «—»**:
  Search Console da los datos con 2 o 3 días de atraso, y el lunes a la
  madrugada todavía no llegó el domingo. Contar otra semana para Google
  rompería la regla de una sola semana, así que el renglón dice por qué no
  hay número. **Para el owner:** si prefiere sacar ese renglón del correo, es
  una línea en `numeros-del-resumen.ts`.
- 2026-09-27 — **MINOR 6:** el camino del CV dice «vistas de la página»
  (§3), porque `cv-vio` cuenta cargas.
- 2026-09-27 — **MINOR 7, el JS de las páginas públicas: no se reprodujo el
  aumento.** Medido sumando los chunks que carga cada página prerenderizada
  (los `<script src>` de `.next/server/app/<pagina>.html`), `main` contra la
  rama con `next build` de las dos: las páginas que no cuentan
  (`quienes-somos`, `novedades`, `investigacion`, `que-hacemos`, `_not-found`)
  cargan **los mismos chunks, byte a byte**; las cuatro que cuentan (Inicio,
  Biblioteca, Contacto, Súmate) suman de 0,6 a 0,8 KB (0,2 a 0,3 KB en gzip),
  y el código de contar aparece solo en sus chunks propios. No hubo nada que
  mover. Los números y el script, en PROGRESS; si la revisión midió otra cosa,
  con ese script se compara igual.
- 2026-09-27 — **Segundo rebase, sobre `ddc8ca1` (la lane 9 en `main`)**, a
  pedido del padre. Conflictos resueltos juntando las dos partes:
  `datos/actividad.ts`, `admin/actividad/frase.ts` y su test, DESIGN.md §11,
  `datos/tareas/diarias.ts` (las dos tareas nuevas) y AGENTS.md §3.
  `admin/cuentas/actividad/modulos.ts` y `config/rutas.ts` se juntaron solos
  y se revisaron. **La migración se regeneró** con Prisma sobre una base con
  las migraciones de `main` (`migrate dev --create-only`): pasó de
  `20260927051631_…` a `20260927073235_contadores_enlaces_y_marcas`, con el
  SQL idéntico (`diff` vacío), y entró en su commit original.
