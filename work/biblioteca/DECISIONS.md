# DECISIONS — Biblioteca

- 2026-09-26 — **SPEC aprobado por el padre, con dos precisiones.** Tablas
  `materiales`, `autorias` y `novedades.material_id` (fk `SET NULL`, reemplaza
  `publicacion`): aprobadas. La defensa de SSRF con `node:https` y un `lookup`
  propio, sin dependencias: aprobada, con el `lookup` validando la IP resuelta
  también en cada redirección. Las propuestas A, B, D, E, F, G, H, J, K, L, M y
  N, tal cual (A: el SPEC padre decía 63 de memoria; son 57).
- 2026-09-26 — **C, precisada por el padre:** el texto `autores` al lado de
  `autorias` dejaba dos fuentes de verdad para los 54 materiales normales. La
  columna es **nula por defecto** y el sitio deriva el texto de las autorías
  («A, B y C»); solo las 3 firmas que no son una lista la llevan escrita, como
  excepción explícita. El formulario lo dice: «Cómo se lee la firma, solo si no
  es una lista de autores». El render tiene que quedar igual en los 57.
- 2026-09-26 — **I, precisada por el padre:** las citas de las 36 con DOI salen
  de Crossref **al escribir la migración** (una vez, en esta máquina) y quedan
  en el SQL como datos fijos: aplicar una migración nunca depende de la red. El
  comentario del SQL dice de dónde y cuándo salieron.
