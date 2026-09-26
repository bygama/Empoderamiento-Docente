# DECISIONS — Páginas: Inicio completo y la base de la edición

Append-only: fecha — decisión — por qué.

---

- 2026-09-26 — **El resaltado no es un séptimo tipo de campo.** Es un
  `parrafo`/`textoCorto` con un `.refine()` de la sección, y
  `lib/contenido/resaltado.ts` lo convierte en fragmentos. Zod 4.5.4 hereda la
  metadata del registro a través de los refinamientos (probado), así que el
  formulario sale igual y los seis tipos de AGENTS.md §12 no cambian. El brief
  pedía preguntar antes de sumar un séptimo; así no hace falta.
- 2026-09-26 — **Los 19 alts del hero se leen** (SPEC §8): se saca el
  `aria-hidden` de los dos campos de tarjetas. No pedirlos exigía un modo
  «decorativa» en `foto()`, que es abrir el tipo que AGENTS.md §12 cierra.
- 2026-09-26 — **SPEC aprobado por el padre con cuatro cambios** (orca ask,
  «SPEC aprobado con cuatro cambios. Escribí el PLAN»). Aprobados tal cual:
  `versiones_de_paginas` sin relleno hacia atrás (producción todavía no tiene
  filas en `paginas`), el resaltado sin séptimo tipo, la clave `seo` con solo
  Inicio en esta lane, las cuatro pestañas como rutas, el choque en las cuatro
  escrituras con el alta por `skipDuplicates`, el split de `HeroQuienes` y los
  cambios a AGENTS.md §3/§13 y DESIGN.md §11. Los cambios:
  1. **SEO: 60 y 160 son recomendaciones, no topes.** Van como contador con
     aviso cuando se pasan («Google muestra unos 60 caracteres»); el tope duro
     del esquema es generoso, así el inicial de hoy (72 y 241) valida. Guardar
     nunca se frena por el SEO no tocado, y las secciones jamás por el SEO.
  2. **Pestañas: gana la más específica** —la `href` más larga que es prefijo
     de la ruta, cortando en un límite de segmento—, y es LA regla: reemplaza
     la prop `exacta` que el padre le había aprobado a la lane 5, que la
     implementa. Si esta lane llega antes al editor, la implementa en
     `admin/armazon/Pestanas.tsx` con ese mismo algoritmo y el rebase las une.
  3. **Los alts del hero: el `aria-hidden` se queda.** Es un collage
     decorativo de 19 fotos: 19 imágenes seguidas en un lector de pantalla son
     ruido, el mensaje lo da el texto del hero, y cambiaría el HTML del sitio.
     El alt se sigue pidiendo porque es de la foto (tabla `fotos`) y sirve
     donde la foto aporta (Fotos, lane 9). La deuda se cierra con esta
     decisión y una línea de ayuda en el campo que lo diga en llano. Reemplaza
     la decisión de arriba («se leen»).
  4. **El error en el campo mismo entra en esta lane:** es la base del editor
     que 4b y 4c consumen. Si resulta más grande de lo que parece, se le
     pregunta al padre antes de sacarlo.
- 2026-09-26 — **Un componente del sitio importa de `features/*/contenido/`
  solo tipos.** Los esquemas traen Zod: un valor importado desde ahí por un
  componente cliente lo mete entero en el JS de la página (en «En números»
  fueron +749.870 bytes en `/`, que comparar-render mostró). Lo que el
  componente necesita correr —`partirCifra`— va en un módulo propio sin Zod
  (`features/home/contenido/cifra.ts`). Lo mira comparar-render en cada
  sección: los bytes de activos no pueden saltar.
- 2026-09-26 — **Rebase sobre `main` `5a07368`, con lo que pidió el padre**
  (mensaje «main trae permisos y actividad: sumalos en tu rebase»):
  1. Cada acción de esta lane chequea `puede(rol, "editarContenido")` justo
     después de la sesión —guardar, publicar, descartar, restaurar y subir
     una foto— y salen de `SIN_CAPACIDAD` las de `paginas.ts` y `fotos.ts`.
  2. En la actividad quedan publicar, descartar un borrador (solo si había
     uno) y restaurar una versión, con tres tipos nuevos en el registro
     cerrado (`publico-una-pagina`, `descarto-un-borrador`,
     `restauro-una-version`), sobre la página y su slug. **Guardar un
     borrador y subir una foto no se anotan:** el §5.8 del SPEC padre lista
     «publicó, descartó, restauró», y ninguno de los dos cambia el sitio;
     anotar cada guardado llenaría la historia de ruido. Fotos (lane 9)
     decide si subir una foto se anota.
  3. `pestanaActiva` es la de `main` (lane 5, mismo algoritmo y nombre): la
     mía se descartó en el rebase y quedó mi variante `sobreAzul` de
     `Pestanas` y un test del caso del editor.
  4. La migración quedaba antes de `20260926221013_sesion_ubicacion`: se
     regeneró sobre el `main` nuevo (base `ed_paginasinicio` recreada, las de
     `main` aplicadas, `pnpm migrate`) como
     `20260926231213_versiones_de_paginas`, con el mismo SQL, adentro del
     commit de versiones.
- 2026-09-26 — **Revisión r1 (Opus 5.5, medium, «el cambio entero contra su
  SPEC»): PASS** con 1 Important, 2 Minor y dos notas fuera de su lente.
  Rulings del padre:
  1. **Important — la imagen de redes por defecto en `VistaPreviaSeo`.** Su
     import estático no tipaba en un clon limpio: el tipo lo trae
     `next-env.d.ts`, que es generado y está en .gitignore (`pnpm typecheck`
     salía 2, TS2307, antes del primer build). El padre pidió usar
     `/opengraph-image.png`, pero esa URL da 404: el archivo vive en el route
     group `(sitio)` y Next lo sirve con un sufijo hasheado
     (`/opengraph-image-1whei1.png`). Se le preguntó con tres opciones y
     eligió una cuarta: **D, el import estático queda y un `.d.ts` commiteado
     (`src/tipos/imagenes.d.ts`) referencia `next/image-types/global`**, que
     es de donde Next lo saca (corrigió su «no sumes un .d.ts»). Descartadas:
     **A**, la URL hasheada como constante con un test contra el sufijo de
     Next, porque se ata a un detalle interno de Next; **B**, no mostrar la
     imagen del sitio en la vista previa, porque la empeora; **C**, mover la
     imagen a `app/`, porque cambia el `og:image` de todo el sitio y el admin
     la heredaría. (`20ec922`)
  2. **Fuera de lente — los nombres de las secciones de Inicio.** Con los
     títulos editables, los `aria-label` fijos ya no los seguían: «¿Quiénes
     somos?», «Misión» y «Áreas» pasan a `aria-labelledby` con el id de su
     `h2`; «Biblioteca y Novedades», con dos títulos editables, arma su
     `aria-label` con los dos (queda el mismo texto de hoy); «Cómo
     trabajamos» y «En números» no tienen título editable y no cambian. El
     HTML de `/` cambia solo en esos atributos, a propósito. (`b794654`)
  3. **Minor:** la línea de la base en PROGRESS (`8b53269`, era la base de
     arranque) y la clave «borrada» en el aviso de restaurar quedan como
     están: la carpeta se borra al cerrar.
  4. **No es de esta lane:** el `scrub: true` de `HeroQuienes` sigue en
     «Abierto»; lo levanta el padre aparte, con su verificación visual.
