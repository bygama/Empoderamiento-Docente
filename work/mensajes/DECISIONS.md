# DECISIONS — Mensajes

- 2026-09-26 — **SPEC aprobado por el padre, con las seis propuestas**
  (`orca orchestration ask`, respuesta del padre de `work/mapa-del-admin/`,
  que tiene la aprobación delegada por Mateo, tablas incluidas).
  - **Almacenamiento de los CV:** un store privado de Vercel Blob aparte del
    de las fotos, `CV_BLOB_READ_WRITE_TOKEN`, `apps/sitio/.cv/` en local, 503
    sin token en producción, tope de 4 MB y el PDF verificado por sus bytes.
  - **Tablas** `mensajes`, `limites_por_ip` y `avisos`, tal cual el SPEC §4.
  - **(1)** Los estados son un **filtro** de la lista (`?estado=`) y las
    pestañas del encabezado son las bandejas: «mejor que dos filas de
    pestañas».
  - **(2)** Sin leer = estado Nuevo.
  - **(3)** El correo de aviso no lleva ningún dato de quien escribió, en
    ninguna bandeja: «es la decisión correcta». **Va escrito en el ADR con
    ese porqué** (una copia en cada buzón haría falsa la promesa de borrarlo).
  - **(4)** `CV_ABIERTO=si` y `/sumate-al-equipo`, **con tres condiciones:**
    1. La página es **del sitio, no del admin**: su diseño sale de DESIGN.md
       §1 a §10 y del lenguaje de la página de Contacto (sus componentes y su
       forma de enviar), no de §11. Nada de estética de formulario de admin en
       el sitio público.
    2. Mientras `CV_ABIERTO` no esté, además del 404: **fuera del sitemap y de
       cualquier link del sitio** («Sumate al equipo» sigue en `mailto:`).
    3. La lista de `config/cv.ts` dice **PROVISORIA** en un comentario que
       nombra qué falta (que ED la confirme) y el SPEC padre §8.
  - **(5)** Actividad: en Contacto, `sobre` = el tema; en CV, solo que se
    borró.
  - **(6)** Tres tareas del cron, plazos en `config/privacidad.ts`, lo que
    borra el cron fuera de `actividad`; **el detalle de cada corrida dice
    cuántos borró** («Se borraron 2 CV con sus archivos»): rastro sin datos
    personales.
  - **Patrones nuevos de §11** (número, filtro, confirmar lo que no se
    deshace, casilla, y buscador y «volver» si la 3b no los dejó): aprobados.
    **Con el buscador y «volver», si la 3b ya está en `main` al rebasear, se
    consumen los suyos y se borran los de esta lane: no quedan dos.**
- 2026-09-26 — **«Sin disco» se decide por `VERCEL`, no por `NODE_ENV`**
  (la lane, paso 5). El SPEC §3 dice «sin token en producción, 503»; lo que
  de verdad no se puede es escribir en el disco de una función de Vercel, que
  se pierde. Con `NODE_ENV` un `next start` local (el build de prueba) no
  podría recibir un CV. En Vercel, preview incluido, sin token: 503.
- 2026-09-26 — **Los campos de Contacto también se describen como lista**
  (`datos/formularios/contacto.ts`) y se validan con `esquemaDe`: los mismos
  mensajes en llano que el CV, y la institución a `datos` por `datosDe`. El
  formulario del sitio sigue dibujado a mano; la lista es solo del borde.
