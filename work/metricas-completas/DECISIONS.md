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
