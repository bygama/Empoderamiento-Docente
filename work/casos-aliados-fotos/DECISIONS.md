# DECISIONS — Casos, Aliados y Fotos

- 2026-09-27 — **SPEC aprobado por el padre con las doce propuestas (A a L) y
  tres resguardos.** Aprobadas las tablas `casos` y `aliados`, los cambios a
  `fotos` (url única, `subida_por` nulo, `image/svg+xml` solo por
  importación), las tres migraciones con sus datos y los cambios a AGENTS.md
  §3 y §5.4 y a DESIGN.md §11. Los resguardos:
  1. **SVG:** entra solo por la importación (los logos del repo, de
     confianza) y nunca por subida: subir lo rechaza por el contenido (no por
     la extensión), con un test que intenta subir uno y recibe el rechazo.
     Como se sirven como estáticos de `public/`, queda escrito por qué es
     seguro: son archivos del repositorio.
  2. **Reemplazar:** la reescritura de URLs va en una transacción y el
     archivo viejo se borra **después** de que confirme; si el borrado falla,
     queda en el log y una tarea del cron diario limpia los archivos que
     ninguna fila usa. La base nunca apunta a un archivo que no existe.
  3. **El SQL generado** de cada migración lleva un comentario con de qué
     salió y cómo se generó (el script no se commitea).

- 2026-09-27 — **Lo que se repite de la ficha de una entidad sube al
  armazón, sin tocar lo que Biblioteca (8a, en vuelo) cambia** (paso 15).
  Casos es el segundo consumidor: `AccionesDeLaFicha` se mudó de
  `admin/novedades/` a `admin/armazon/` (8a no lo toca) y la fila de «Deshacer»
  pasó a `FilaDeAccion` (la usan Novedades y Fotos). El «Qué cambió» plegado y
  el `Bloque` del formulario nacen en el armazón como piezas nuevas; los de
  Novedades quedan como están, porque 8a está cambiando `QueCambio.tsx` y
  `FormularioDeNovedad.tsx`: que Novedades use los del armazón es un cambio
  mecánico para cuando las dos lanes estén en `main` (Abierto). Por lo mismo,
  la miniatura del logo en la lista de Aliados va adentro de lo principal de
  la `Fila`, sin sumarle una prop (8a le suma `miniatura`).
- 2026-09-27 — **Subir una foto a la biblioteca tiene su pantalla**
  (`/admin/contenido/fotos/subir`), como «Nueva novedad», y no un
  formulario que se abre en la grilla (el SPEC §7.3 decía «en la misma
  pantalla»): reusa el `CampoFoto` del kit entero (alt obligatorio, tope,
  errores) y al subir lleva a la ficha.
- 2026-09-27 — **«Ver» en Cuentas › Actividad lleva a un caso, no a un
  aliado ni a una foto** (paso 3). El SPEC decía «a la ficha del aliado o de
  la foto, nada si se borró»; saber si todavía existen pedía otra consulta en
  la pantalla de Actividad, que Ajustes (en vuelo) también toca. Se sigue el
  precedente de Novedades: lo que se puede borrar no lleva link. Los casos,
  que no se borran, sí. El SPEC §9 quedó al día.
- 2026-09-27 — **La migración se crea en una terminal de Orca** (paso 2):
  `migrate dev --create-only` pide confirmar el aviso del índice único y se
  niega en un shell no interactivo. Se corre en una pestaña de Orca y se le
  contesta ahí; el archivo es el que genera Prisma, con los datos sumados
  antes de la primera aplicación.
- 2026-09-27 — **Lo que la exploración encontró y el SPEC toma** (antes de la
  aprobación): los casos se consumen solo en componentes del navegador
  (`CasosInvestigacion`, `useAccionesLugar`, `useHistorialLugar`), así que
  entran por prop desde `InvestigacionEnAccion`, el único del servidor; el
  expediente se dibuja recién al abrirlo, y en el HTML prerenderizado está
  solo la pila. `LineasInvestigacion` cruza cada línea con un caso por su
  slug, escrito en código (`CASO_DE_CADA_LINEA`): con el slug editable eso se
  rompía en silencio (SPEC §4.1). Los topes de cada texto salen de los
  largos de hoy y de lo que la escena aguanta (la pregunta, dos renglones de
  48ch en la tapa; el indicio, una caja de `h-5`). Los dos
  `origen-03-pregunta.webp` son idénticos byte a byte.
