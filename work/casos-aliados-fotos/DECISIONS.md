# DECISIONS — Casos, Aliados y Fotos

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
