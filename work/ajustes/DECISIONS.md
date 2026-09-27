# DECISIONS — Ajustes

- 2026-09-26 — **SPEC aprobado por el padre con las cuatro recomendaciones**
  (`orca orchestration ask`, Mateo le delegó la aprobación, tablas incluidas).
  Aprobadas las tablas `datos_del_sitio`, `plazos_de_retencion`,
  `indexacion_de_urls`, la columna `redirecciones.a_mano` y el cambio de
  AGENTS.md §5.3.
  1. **Alargar un plazo no vale para lo ya recibido:** rige el menor entre el
     plazo prometido al llegar y cualquiera posterior; acortar vale para todo,
     con confirmación si borra algo. El porqué —es lo que se le prometió a la
     persona, y lo más defendible ante la ley— va en un ADR: el padre pidió
     el ADR-0012 o uno nuevo si cambia su decisión. Cambia su «los plazos son
     fijos, en `config/privacidad.ts`», así que va en uno nuevo, el 0014, que
     enmienda al 0012 (los ADR son inmutables: `adrs/README.md`).
  2. **Las personas de referencia no se mudan:** nada del sitio las lee. El
     bloque muerto sale de `config/site.ts`, anotado para el JSON-LD de la
     fase 4. El padre dijo «en el SPEC padre §10», pero ese SPEC es un anchor
     congelado que las hijas no editan: va en el spec del admin, donde está
     la fase 4, y se lo digo al padre en el reporte.
  3. **La fila «Cron diario» en Conexiones:** aprobada.
  4. **Los topes:** CV de 1 a 24 meses, Contacto de 1 a 36, Spam de 1 a 90
     días.
  Aprobadas también las lecturas: las redirecciones se aplican en la ruta
  atrapa-todo antes del 404; «hacia» es una ruta del sitemap y «desde» no;
  los países alimentan el campo País de los formularios, con la validación
  del servidor; `config/avisos.ts` es el registro donde la lane 11 suma el
  resumen semanal.
- 2026-09-26 — **Rebasada sobre `main` en `293e7ba`** (Cuentas mergeada)
  antes de escribir el PLAN, por dos novedades que trajo el padre:
  - **`Tabla` y `Paginado` ya existen** (DESIGN.md §11). La tabla vive con su
    único consumidor (`admin/cuentas/TablaDePermisos.tsx`) «hasta que haya una
    segunda». Redirecciones e indexación son datos que se leen cruzando filas
    y columnas: son esa segunda, así que la pieza sube a
    `admin/armazon/Tabla.tsx` y la tabla de permisos la consume. No se hace
    una propia.
  - **`guarda.test.ts` ya exige que cada `page.tsx` de Ajustes chequee
    `usarAjustes` antes de leer**, y las consultas de `datos/` con datos de
    Ajustes reciben el rol y exigen la capacidad. Se prueba con `next start`
    logueada con edita, buscando los datos en el HTML entero.
