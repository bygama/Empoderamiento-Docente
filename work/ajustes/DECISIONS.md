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
- 2026-09-26 — **Los pasos 4 y 5 del PLAN van en un commit.** Pasar
  `seBorraEl` y los bordes a recibir los plazos cambia la firma de lo que usan
  la retención, la ficha, el Inicio y los formularios: a mitad de camino no
  compila. El cambio sigue siendo uno: de dónde salen los plazos.
- 2026-09-26 — **Vencido es `lt`, también en el Inicio.** La tarea borra lo
  recibido antes del borde (`lt`); el pendiente de los CV que se borran en 7
  días usaba `lte`. Ahora los dos usan la misma condición
  (`llegoVencido`, en `datos/privacidad.ts`), y el test de la política
  compara la consulta con la ficha en cada fecha, con la misma regla.
- 2026-09-26 — **La retención no usa respaldo.** Si la base no contesta al
  leer los plazos, la tarea falla y queda en su corrida: borrar con un plazo
  supuesto borraría antes de lo prometido o guardaría de más. Lo que se
  muestra (formularios, ficha, Inicio) sí cae a los plazos de antes.
- 2026-09-26 — **Un error previo, arreglado porque esta lane lo vuelve
  alcanzable:** en un campo de opción opcional, un valor de más contestaba
  «Invalid input», en inglés (la unión de Zod sin su error). Con los países
  editables, un formulario abierto antes de sacar un país llega a ese caso.
  Una línea en `lib/formularios/campos.ts`.
- 2026-09-26 — **Las fechas nuevas son `timestamp(3)`**, el tipo que Prisma
  da a `DateTime` en todo el esquema, y no `timestamptz` como decía la tabla
  del SPEC §8: se sigue la convención del repo.
- 2026-09-27 — **Una cuenta suspendida deja de recibir avisos.** `destinatariosDe`
  no la excluía (Cuentas sumó la suspensión después de Mensajes). Ajustes ›
  Avisos tiene que decir la verdad sobre quién recibe, así que las dos
  consultas miran `suspendida: false`.
- 2026-09-27 — **Lo que escribe en la base una acción va en
  `datos/acciones/editar-…`**, como `editar-paginas.ts`, y no en
  `datos/redirecciones.ts` como decía el PLAN: es la convención del árbol
  (AGENTS.md §3). Lo mismo con `editar-plazos.ts` y
  `editar-datos-del-sitio.ts`.
- 2026-09-27 — **Privacidad: una sola acción con `confirmado`**, no dos
  (`cuantoSeBorraria` y `guardarPlazos` en el PLAN). Sin confirmar, la acción
  cuenta lo que borraría de más y no guarda; así la cuenta y el guardado miran
  los mismos plazos, y no hay una ventana entre las dos.
- 2026-09-27 — **«Hacia» se elige en un desplegable** con las rutas del
  sitemap, no se escribe: así no se puede apuntar a una página que no existe,
  y la validación del servidor lo chequea igual.
- 2026-09-27 — **Sin capturas de pantalla en la verificación de UI**: la
  pestaña del navegador de Orca no está visible en la ventana (la comparten el
  padre y las otras lanes) y `screenshot` da timeout. Cambiar la vista de la
  ventana es intrusivo, así que la UI se verifica con el árbol de
  accesibilidad y sondas del DOM (estilos calculados, foco, `aria-*`).
- 2026-09-27 — **Rebasada sobre `main` en `77611c1`** (Novedades y el kit, y las
  páginas editables, mergeadas). Conciliaciones, cada una en su commit:
  - **Contacto y Novedades** reciben a la vez su contenido editable (de las
    lanes de páginas y Novedades) y los datos del sitio; el cierre de Novedades
    toma sus textos del contenido y las redes de la base.
  - **Una sola `redireccionDe`**, en `consultas/redirecciones.ts` sobre
    `leerSinRomper`: Novedades tenía la suya en `consultas/novedades.ts`
    (el SPEC §5.1 ya lo preveía). La ficha de una novedad importa esta.
  - **El sitemap lista las fichas de la base** (`slugsConFicha`), y publicar una
    novedad revalida `/sitemap.xml` (una ruta más en `revalidar-novedades.ts`).
  - **`datosDelSitio` y `plazosDeGuarda` sobre `leerSinRomper`**, que llegó con
    la misma regla de respaldo que yo había escrito dos veces.
  - **Los controles del kit** (`TextoCorto`, `ENTRADA`, `Seleccion`) y
    `useFrenarSalida` del armazón; «Hacia» pasa a la `Seleccion` del kit. El kit
    no trae tabla: la `Tabla` del armazón queda.
  - **El ADR de Ajustes es el 0015:** Novedades llegó antes con el 0014.
  - Las migraciones de Ajustes son posteriores a la de Novedades
    (`20260927002934`): no hubo que regenerarlas; en `ed_ajustes` se aplicó la
    de Novedades con `migrate:deploy` y `migrate:status` quedó al día.
- 2026-09-27 — **react-doctor dio 90/100 después del rebase, y se arregló por
  código:** `no-derived-useState` en Datos del sitio (el estado pasa a ser
  solo los cambios sobre lo guardado, y guardar revalida la pantalla) y
  `async-await-in-loop` en la indexación (las inspecciones, a la vez y
  aisladas, sin el freno de 35 s). Cambia un detalle del SPEC §5.3, que quedó
  anotado ahí.
- 2026-09-27 — **`datos/actividad.ts` pasa el tope de utilidades** (138
  líneas de código; en `main` ya tenía 123): sus tres registros suman una
  entrada por tipo, y Ajustes suma cinco. Partirlo es un cambio aparte, que
  queda como seguimiento en el reporte.
