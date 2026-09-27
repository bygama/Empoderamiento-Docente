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
