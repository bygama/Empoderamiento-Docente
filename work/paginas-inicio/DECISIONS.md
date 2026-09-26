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
