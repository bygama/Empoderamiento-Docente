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
- 2026-09-27 — **La cita vacía es la generada** (paso 1): el mismo criterio que
  el padre fijó para la firma en C. `cita` guardada solo cuando alguien la
  escribió o cuando la fuente trae lo que la generada no sabe (volumen, número
  y páginas de Crossref); vacía, el sitio arma la cita con los datos de hoy,
  así nunca queda vieja al corregir un título. «Sigue a los datos hasta que se
  escribe» (propuesta I) es exactamente eso.
- 2026-09-27 — **`biblioteca/portadas` entra en las carpetas de fotos** en el
  paso 1 y no en el 2: el esquema de la portada la valida, y sin ella las 57
  de hoy no pasarían.
- 2026-09-27 — **La migración `material_de_las_novedades` sale de `prisma
  migrate diff`, no de `migrate dev --create-only`** (paso 4): `migrate dev`
  se niega a correr sin terminal interactiva cuando la migración borra una
  columna con datos (`publicacion` tenía uno). El SQL del esquema es el que
  Prisma escribe (`migrate diff --from-config-datasource --to-schema`), partido
  para mover los datos antes del `DROP`, y el comentario del archivo lo dice.
  Después de aplicarla, `migrate diff` da «This is an empty migration» (sin
  drift) y `migrate status`, al día.
- 2026-09-27 — **Las opciones del material de una novedad van en orden
  alfabético** y marcan las que no están en el sitio («· no está en el
  sitio»): con 57 y creciendo, se buscan por título; el botón de una que no
  está en el sitio no sale.
- 2026-09-27 — **El dev server corre en el 3046, no en el 3026** (paso 10): el
  3026 lo tiene un `next start` de la lane hermana `ajustes` (su worktree,
  visto con `Get-NetTCPConnection`), que no es mío para cortarlo. El 3046
  estaba libre; `NEXT_PUBLIC_SITE_URL` apunta a él.
- 2026-09-27 — **El ADR es el 0016, no el 0015** (paso 15): la lane hermana
  `ajustes` ya tomó el 0015 en su rama (`origin/mateo/ajustes`, «Llevar a la
  base lo que Ajustes edita»), con su PR abierto. SPEC §14 y PLAN paso 15 dicen
  0015 porque se escribieron antes; el código (`lib/red/`) y los docs dicen
  0016. Si al mergear el orden cambia, el número se corre en un solo lugar
  (el índice) y en tres comentarios.
- 2026-09-27 — **DESIGN.md §7 suma «Acción de texto» y «Portada tipográfica
  de un material»** (paso 15): son del sitio, no del admin, así que no van en
  §11. La portada lleva tres colores que no son tokens (`#14203A`, `#177B60`,
  `#3D4A63`): salen de las 57 portadas que ya existían y la generada los copia.
  La firma en blanco al 72 % da 2,56:1 sobre `verde-concepto`; es decorativa
  (`alt=""`, la fila repite el texto) y se deja como en las de hoy — queda
  anotado para Mateo.
- 2026-09-27 — **`material.ts` se parte en dos** (verificación): pasaba el
  tope de 100 de una utilidad (116 sin comentarios). Los constructores de cada
  campo van a `campos-del-material.ts` (60) y `material.ts` junta los dos
  esquemas y los tipos (59). **`datos/actividad.ts` queda en 138**: ya estaba
  en 123 en `main`, y es el registro donde AGENTS.md §12 manda sumar los tipos
  de cada módulo (los cinco de la Biblioteca son 15 líneas). Partirlo es un
  cambio aparte, de quien lo decida para todos los módulos.
