# DECISIONS — Los patrones del admin

- 2026-09-26 — **SPEC aprobado por el padre, con un cambio** (respuesta a
  `orca orchestration ask`). Las lecturas 1, 2, 4, 5, 6 y 7 del SPEC §9,
  aprobadas tal cual.
- 2026-09-26 — **Las pestañas no llevan número en esta lane** (el padre, al
  aprobar la lectura 3): construirlo «para las lanes 6 y 7» es un patrón sin
  consumidor, código muerto, lo que prohíbe la regla del padre («un patrón
  nace con su primer consumidor»). La pieza de pestañas queda sin prop de
  número; la lane 7 (Mensajes, la primera con un número real) lo suma y lo
  escribe en §11. §11 lo dice en una línea: «el número de una pestaña llega
  con Mensajes».
- 2026-09-26 — **El estado vacío tampoco lleva el lugar de la acción** (esta
  lane, por la misma regla que el número): ninguno de los tres estados de
  Métricas tiene acción, así que la prop no tendría consumidor. La lane 6 la
  suma con «Nueva novedad» y §11 lo dice en una línea.
- 2026-09-26 — **Una página sin secciones va sin insignia ni detalle** en la
  lista de Páginas: nunca se pudo editar, así que «Sin editar» y «El sitio
  muestra el contenido inicial del código» repetirían lo que ya dice la nota
  «Todavía no se edita desde acá». Las que tienen secciones llevan las tres
  insignias del SPEC §2.4.
- 2026-09-26 — **Las migas del editor siguen con «/»**, el separador que ya
  tiene `Encabezado`: el «›» del brief es cómo se escriben unas migas en
  prosa, no un cambio de diseño pedido.
