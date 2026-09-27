# DESIGN.md — Empoderamiento Docente

Sistema de diseño para el sitio web institucional. Fuente: Manual de marca ED.
Este documento es la **fuente única de verdad** para tokens visuales: colores,
tipografías, jerarquía, espaciado e iconografía.

> Cubre lo que el sitio web necesita. Aplicaciones específicas de la marca
> (papelería, RRSS, merch) están detalladas en el Manual de marca ED y pueden
> tener variantes que este doc no replica.

---

## 1. Paleta cromática

### Tokens

> Valores canónicos = los del bloque `@theme` en `apps/sitio/src/app/globals.css`
> (ver §8). Esta tabla los documenta; si difieren, **gana `globals.css`**.

| Token            | Hex       | RGB              | Rol                                              |
| ---------------- | --------- | ---------------- | ------------------------------------------------ |
| `azul-principal` | `#1F2D4D` | 31, 45, 77       | Base, fondos oscuros, títulos sobre claro        |
| `azul-medio`     | `#4A6FA5` | 74, 111, 165     | Acentos en titulares, links, subtítulos          |
| `azul-claro`     | `#A9C5E8` | 169, 197, 232    | Fondos suaves, estados hover en superficies      |
| `verde-concepto` | `#1F9A78` | 31, 154, 120     | Conceptos, palabras clave, highlights de texto   |
| `naranja-accion` | `#E07A2F` | 224, 122, 47     | **Solo CTAs**: botones primarios, links de acción|
| `gris-fondo`     | `#F2F4F7` | 242, 244, 247    | Fondo claro alternativo a blanco                 |
| `gris-texto`     | `#6B7280` | 107, 114, 128    | Texto secundario, metadatos, captions            |
| `rojo-error`     | `#B42318` | 180, 35, 24      | **Solo errores y acciones destructivas** (admin) |

### Reglas de uso (no negociables)

1. **Azul es la base.** Toda página parte de azul (oscuro o claro).
2. **Naranja solo para acciones.** Botones primarios, "Inscribite", "Descargar
   programa", "Sumate". Nunca como decoración o fondo de sección.
3. **Verde para conceptos.** Resaltar palabras clave dentro de un titular,
   highlights tipo marcador, íconos conceptuales. Nunca compitiendo con naranja
   en el mismo bloque visual.
4. **Verde y naranja no conviven en primer plano.** Si hay un CTA naranja, el
   verde se reserva para texto/íconos lejos del CTA.
5. **Contraste mínimo:** texto sobre fondo debe pasar WCAG AA (4.5:1 cuerpo,
   3:1 títulos grandes).
6. **Rojo solo para errores y lo destructivo.** `rojo-error` no es de la
   marca: existe para que un error no se lea como una acción. Nunca
   decorativo. Da 6,57:1 sobre blanco y 5,75:1 sobre su tinte al 8 %. Sumado
   el 2026-09-22 con el admin (§11); hasta entonces los errores iban en
   naranja.

### Uso semántico (mapeo a la marca)

- **Pensamiento** → verde
- **Acción** → naranja
- **Identidad / institucional** → azul

---

## 2. Tipografía

| Uso          | Fuente             | Peso        |
| ------------ | ------------------ | ----------- |
| Títulos      | **Manrope**        | 700 Bold    |
| Subtítulos   | **Manrope**        | 500 Medium  |
| Cuerpo       | **Inter**          | 400 Regular |
| UI / botones | **Inter**          | 500 Medium  |
| Mono / código | **JetBrains Mono** | 400 / 500   |

Las tres se cargan vía `next/font/google` con `display: 'swap'` y subset
`latin` (ver `apps/sitio/src/app/layout.tsx`). Manrope (`font-display`) e Inter
(`font-sans`) son las principales; JetBrains Mono (`font-mono`) es auxiliar,
para notación / detalles tipo código.

### Escala tipográfica recomendada

Diseñada para móvil-primero. Usar `clamp()` o las utilidades fluidas de
Tailwind v4 para el rango fluido. Valores en rem, base 16px.

| Token          | Mobile      | Desktop     | Uso                          |
| -------------- | ----------- | ----------- | ---------------------------- |
| `text-display` | 2.5rem / 1.1| 4.5rem / 1.05 | Hero principal             |
| `text-h1`      | 2rem / 1.15 | 3rem / 1.1  | H1 de página                 |
| `text-h2`      | 1.5rem / 1.2| 2.25rem / 1.15 | Títulos de sección        |
| `text-h3`      | 1.25rem / 1.3 | 1.5rem / 1.25 | Subtítulos                |
| `text-body`    | 1rem / 1.6  | 1.125rem / 1.6 | Párrafos                  |
| `text-small`   | 0.875rem / 1.5 | 0.875rem / 1.5 | Captions, metadatos     |

**Reglas:**
- Títulos en Manrope Bold con `letter-spacing: -0.01em` (los displays más
  grandes con `-0.02em`).
- Cuerpo en Inter, `letter-spacing: 0`, `line-height: 1.6` mínimo.
- Evitar mayúsculas para textos largos. Mayúsculas con `tracking-wider` están
  ok para tags, eyebrows o etiquetas cortas.

---

## 3. Espaciado y layout

- Sistema base: **4px** (0.25rem). Usar la escala default de Tailwind.
- Contenedor máximo de contenido: `max-w-screen-xl` (1280px). Para texto largo,
  bajar a `max-w-prose` o `max-w-3xl`.
- Padding lateral en mobile: `px-5` (20px); desktop `px-8` o más.
- Separación entre secciones grandes: `py-20` desktop / `py-12` mobile.

---

## 4. Bordes y sombras

- Border radius por defecto: `rounded-xl` (12px) para tarjetas, `rounded-lg`
  para inputs, `rounded-full` para botones tipo pill (solo si la marca lo pide;
  default es `rounded-lg` para botones).
- Sombras: usar con moderación. Preferir borders sutiles (`border
  border-azul-claro/40`) sobre sombras pesadas. Sombra estándar para tarjetas
  elevadas: `shadow-md` con tinte azul (`shadow-azul-principal/10`).

---

## 5. Iconografía

- **Estilo:** línea (outline), trazo de 1.5–2px, esquinas redondeadas suaves.
- **Color por defecto:** `azul-principal`. Sobre fondos oscuros: blanco.
- **Tamaño:** 20px (inline en texto), 24px (UI), 48–64px (íconos de feature).
- **Set propio, sin librería externa.** Los íconos viven como componentes
  React en `apps/sitio/src/components/ui/icons/index.tsx` (SVG `currentColor`, stroke
  1.5px). Se decidió **no** usar `lucide-react` para no sumar una
  dependencia. Si falta un ícono, agregar un componente nuevo a ese archivo
  respetando el estilo (no inventar otra librería ni redibujar el logo).

### Set canónico

Cinco íconos forman el set de referencia del manual. Mapeo a los
componentes de `apps/sitio/src/components/ui/icons/`:

| Ícono              | Concepto    | Componente    | Uso típico                              |
| ------------------ | ----------- | ------------- | --------------------------------------- |
| Bombilla           | Ideas       | `Lightbulb`   | Reflexiones, blog, contenido editorial  |
| Libro abierto      | Formación   | `BookOpen`    | Cursos, talleres, material didáctico    |
| Dos personas       | Comunidad   | `Users`       | Comunidad, testimonios, eventos         |
| Diana con flecha   | Objetivos   | `Target`      | Propósito, misión, metas                |
| Gráfico ascendente | Crecimiento | `TrendingUp`  | Transformación, resultados, impacto     |

Estos cinco cubren los pilares semánticos de ED. El archivo incluye además
íconos de UI accesoria (`ArrowRight`, `Menu`, `X`, `Compass`, redes, etc.)
que se usan sin pasar por esta tabla.

---

## 6. Patrón gráfico

El sistema gráfico de la marca combina **dos elementos** que se usan juntos o
por separado como fondo decorativo:

1. **Grid de puntos** — matriz regular de dots, separación uniforme.
2. **Formas planas** — círculos y semicírculos sólidos como acento visual,
   parcialmente superpuestos al grid o emergiendo de los bordes de la pieza.

### Reglas de uso

- **Puntos:** color `gris-texto` al 30–40% de opacidad sobre fondo claro;
  blanco al 10–15% sobre fondo azul.
- **Forma plana verde** (`verde-concepto`) → acento conceptual. Acompaña
  títulos o íconos que refuerzan el contenido editorial.
- **Forma plana azul** (`azul-medio` o `azul-claro`) → acento institucional.
  Acompaña bloques de identidad: headers, footers, separadores.
- Una sola forma plana por bloque visual. Nunca verde + naranja juntos en la
  misma composición (ver §1).

### Implementación

- Puntos: SVG inline o `background-image` con `radial-gradient`.
- Formas: SVG inline (mejor control responsive) o `<div>` con `border-radius:
  50%` y `clip-path` / `overflow: hidden` del contenedor para semicírculos.
- Usar como fondo decorativo en hero, separadores y portadas de sección.
  Evitar saturar: máximo un patrón cada 2–3 secciones.

---

## 7. Componentes guía

### Botón primario (CTA)

- Fondo: `naranja-accion`
- Texto: `azul-principal`, Inter Medium. Da **4,54:1**, que pasa AA (§1,
  regla 5). El blanco sobre `naranja-accion` da 3,00:1: no llega al 4,5:1
  que pide el texto de un botón. Cambiado el 2026-09-22 con el admin
  (`work/armazon-del-admin/`). Los tres CTAs del sitio (`ButtonPrimary`, el
  del `Header` y el de `PieMenu`) siguen en blanco y se pasan en un cambio
  aparte.
- Hover: aclarar 10% (`naranja-accion/90` sobre blanco), que da 5,07:1.
  Con el texto azul, oscurecer 10% bajaría el contraste a 3,75:1.
- Padding: `px-6 py-3`, `rounded-lg`
- Solo uno por sección visible cuando se pueda; jamás dos botones naranjas
  compitiendo.

### Botón secundario

- Fondo: transparente
- Borde: `azul-principal`
- Texto: `azul-principal`
- Hover: fondo `azul-claro/30`

### Tarjeta de contenido

- Fondo: blanco o `gris-fondo`
- Borde sutil opcional
- Radius: `rounded-xl`
- Padding: `p-6` mobile, `p-8` desktop

### Highlight de palabra clave (estilo marca)

Marcador verde detrás de palabra clave en titulares — efecto característico
del manual:

```
<span class="bg-verde-concepto/30 px-1 -mx-1">palabra</span>
```

Reservar para una palabra por titular, no abusar.

---

## 8. Mapeo a Tailwind

Implementado en `apps/sitio/src/app/globals.css` con bloque `@theme` de Tailwind v4.
Cualquier cambio en los tokens visuales se aplica acá y se propaga
automáticamente a las clases utilitarias.

```css
@theme {
  /* paleta */
  --color-azul-principal: #1f2d4d;
  --color-azul-medio: #4a6fa5;
  --color-azul-claro: #a9c5e8;
  --color-verde-concepto: #1f9a78;
  --color-naranja-accion: #e07a2f;
  --color-gris-fondo: #f2f4f7;
  --color-gris-texto: #6b7280;
  --color-rojo-error: #b42318;

  /* tipografías expuestas por next/font/google en apps/sitio/src/app/layout.tsx */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  /* escala fluida mobile → desktop (con line-height pareada) */
  --text-display: clamp(2.5rem, 1rem + 5vw, 4.5rem);
  --text-display--line-height: 1.05;
  --text-h1: clamp(2rem, 0.75rem + 4vw, 3rem);
  --text-h1--line-height: 1.1;
  --text-h2: clamp(1.5rem, 0.75rem + 2vw, 2.25rem);
  --text-h2--line-height: 1.15;
  --text-h3: clamp(1.25rem, 0.875rem + 1vw, 1.5rem);
  --text-h3--line-height: 1.25;
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-body--line-height: 1.6;
  --text-small: 0.875rem;
  --text-small--line-height: 1.5;

  /* escala del admin (§11): fija, sin clamp */
  --text-admin-titulo: 1.5rem;
  --text-admin-titulo--line-height: 2rem;
  --text-admin-titulo--letter-spacing: -0.01em;
  --text-admin-seccion: 1.125rem;
  --text-admin-seccion--line-height: 1.75rem;
  --text-admin-seccion--letter-spacing: -0.01em;
  --text-admin-cuerpo: 1rem;
  --text-admin-cuerpo--line-height: 1.5rem;
  --text-admin-meta: 0.875rem;
  --text-admin-meta--line-height: 1.25rem;
}
```

Clases utilitarias generadas automáticamente:

- **Paleta:** `bg-azul-principal`, `text-naranja-accion`, `border-verde-concepto`,
  `bg-gris-fondo/40` (con opacidad), etc.
- **Tipografía:** `font-sans` (Inter, default del cuerpo), `font-display` (Manrope,
  para títulos).
- **Escala:** `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`,
  `text-small` (cada una ya incluye su line-height). En el admin, solo
  `text-admin-titulo`, `text-admin-seccion`, `text-admin-cuerpo` y
  `text-admin-meta` (§11).

Las fuentes se cargan con `next/font/google` en `apps/sitio/src/app/layout.tsx`, que
las inyecta como CSS vars (`--font-inter`, `--font-manrope`) que luego
consume el `@theme`.

---

## 9. Tono visual general

- **Sobrio, profesional, cálido.** ED dialoga con profesionales de la educación.
  Evitar estética infantil, ilustraciones de niños caricaturescos, o gradientes
  agresivos.
- **Minimalismo con propósito.** Espacio en blanco generoso. El faro y el haz
  de luz son la metáfora principal — la luz del faro puede inspirar elementos
  sutiles de gradiente azul claro, pero sin exagerar.
- **Movimiento contenido (GSAP + Lenis).** Animaciones suaves, transiciones
  largas (400–800ms), easing tipo `power2.out`. Nada de bounces ni efectos
  llamativos. La animación acompaña la lectura, no la interrumpe.

---

## 10. Logo

El logo combina **wordmark "ED"** (E arriba, D abajo) con un **isotipo de
faro** dentro de un recuadro vertical, más la tagline "EMPODERAMIENTO
DOCENTE". El faro es la metáfora central de marca (guía, orientación,
referencia).

### Variantes oficiales

| Variante     | Cuándo usar                                                 |
| ------------ | ----------------------------------------------------------- |
| **Completo** | Header del sitio, footer, presentaciones, papelería formal. |
| **Isotipo**  | Favicon, avatar RRSS, espacios reducidos, watermarks.       |
| **Negativo** | Sobre fondos oscuros (azul principal). Todo en blanco.      |

### Colores

- **Sobre claro:** ED + faro + "EMPODERAMIENTO" en `azul-principal`; "DOCENTE"
  en `azul-medio`.
- **Sobre azul:** ED + faro + "EMPODERAMIENTO" en blanco; "DOCENTE" en
  `azul-claro`.
- **Monocromo:** solo si el medio lo exige (impresión a 1 tinta). Default es
  la versión a color.

### Reglas de uso

- **Margen de seguridad:** mínimo equivalente a la altura de la "E" del
  wordmark en todos los lados.
- **Tamaño mínimo (web):** 24px de alto para el isotipo; 120px de ancho para
  el logo completo. Por debajo de eso, usar solo isotipo.
- **No deformar, no rotar, no cambiar colores fuera de la paleta, no agregar
  efectos** (sombra, glow, gradientes).
- **No colocar sobre fondos de bajo contraste** (gris medio, foto saturada
  sin tratar). Si va sobre foto, usar overlay azul oscuro con 60%+ opacidad.

### Archivos

Los SVG oficiales se guardan en `apps/sitio/public/brand/`:

- `logo-completo.svg` — versión sobre claro, con tagline.
- `logo-completo-negativo.svg` — versión sobre azul, con tagline.
- `isotipo.svg` — ED + faro, sin tagline.
- `isotipo-negativo.svg` — isotipo sobre azul oscuro.

Hasta tenerlos en el repo, usar placeholder textual o el favicon de Next.js.
**Nunca** generar ni redibujar el logo con IA o trazado manual.

---

## 11. Admin

El admin (`/admin`) es una herramienta de trabajo, no una pieza de marca: lo
usa el equipo de ED unas pocas veces por mes, y pesa más la claridad que la
velocidad. Usa la paleta y las fuentes de la marca con estas reglas propias.
Las piezas viven en `apps/sitio/src/admin/armazon/` y no saben nada de ED.
Sumado el 2026-09-22 (`work/editor-sin-pared/`); el armazón, la
sidebar y los temas, el 2026-09-24; el título de pestaña, las pestañas, el
índice de tarjetas, la lista, el estado vacío y la pantalla de acceso nueva,
el 2026-09-26 (`work/patrones-del-admin/`); «Sin permiso» y el apartado, el
mismo día (`work/roles-y-actividad/`); las pestañas de una página, el error en
el campo, el largo recomendado, el aviso con una acción, «Qué cambió» y la
vista previa de buscador y redes, también (`work/paginas-inicio/`); el
número, el filtro, el buscador, «volver», confirmar lo que no se deshace y
la casilla, ese mismo día (`work/mensajes/`); la cifra y el Inicio, también
(`work/inicio/`); el paginado y la tabla, también (`work/cuentas/`). Todos
los contrastes están
medidos con la fórmula de WCAG 2.x. En el tema mixto el contenido usa los
valores del claro, así que donde abajo dice «claro» vale para los dos.

### Fondo y armazón

- El contenido va sobre **blanco**, en una tarjeta que toca arriba, abajo y
  a la derecha de la ventana. Solo las dos esquinas que dan a la sidebar son
  redondas (`rounded-l-2xl`), y la tarjeta scrollea por dentro para que esas
  curvas queden siempre a la vista. En el celular ocupa todo el ancho, debajo
  de la barra del menú.
- La sidebar va sobre `gris-fondo` en el tema claro, y ahí sí lleva texto:
  `azul-principal` al 80 % (6,78:1) y lo secundario en `azul-medio`
  (4,65:1). `gris-texto` no va sobre `gris-fondo`: da 4,39:1 y no llega a AA.
- Fuera de la sidebar, `gris-fondo` queda solo como relleno sin texto encima
  (un hover, una miniatura vacía).

### Sidebar

- **Un nivel y tres grupos**, separados por un divisor: lo que se mira todos
  los días (Inicio, Mensajes, Métricas), lo que se publica (Contenido,
  Novedades, Biblioteca) y, pegado abajo, lo que se configura (Cuentas,
  Ajustes), que quien edita no ve. El registro está en
  `apps/sitio/src/admin/armazon/barra-lateral/modulos.ts`; lo que hay adentro
  de cada módulo va en pestañas, no en la sidebar.
- **Cada entrada:** el ícono del set propio a 20 px y el nombre en
  `text-admin-cuerpo`, 44 px de alto, `rounded-xl`. La activa es una pastilla
  `white` con `shadow-sm`, y se anuncia con `aria-current`.
- **Arriba**, el isotipo actual (`logotipo-principal-ed`, sin margen
  transparente, así queda centrado) en una ficha de 44 px, con el nombre al
  lado. **Abajo**, la cuenta, que abre Mi cuenta · Ver el sitio · el tema ·
  Salir. Un divisor separa cada una del menú.
- Ni naranja ni verde: el naranja es el CTA de cada pantalla y el verde, los
  conceptos.
- **Las marcas de una entrada**, empujadas a la derecha: el punto de
  «cambios sin publicar» (Contenido) o el número (abajo, «El número»:
  Mensajes, con los sin leer que tu rol ve).

### El número

Cuántos de algo esperan, en una entrada de la sidebar o en una pestaña.
`apps/sitio/src/admin/armazon/Numero.tsx`.

- **Una pastilla** `rounded-full`, 20 px de alto y de ancho mínimo, `px-1.5`,
  en meta medium con cifras tabulares: relleno `azul-principal` y el número
  en `white`, el tono fuerte de las insignias, porque pide atención. Con los
  tokens del tema se invierte sola: claro 13,63:1, mixto (la sidebar)
  9,40:1, oscuro 13,59:1; la pastilla contra su fondo, 9,40:1 o más en los
  tres.
- **Se ve el número y se anuncia la frase**: la cifra va `aria-hidden` y al
  lado un `sr-only` «(3 sin leer)», como el punto dice «(cambios sin
  publicar)». Quien la usa dice qué cuenta.
- **Con 0 no se dibuja**; de 100 para arriba, «99+».
- **Cuenta solo lo que tu rol ve**: el de Mensajes suma los nuevos de
  Contacto, y los de CV solo para quien dirige o administra.
- Primer consumidor: la entrada de Mensajes y sus pestañas Contacto · CV
  (sumado el 2026-09-26, `work/mensajes/`).

### Temas: claro, mixto y oscuro

Se eligen en el menú de la cuenta y quedan en una cookie, así el servidor
dibuja el tema correcto desde la primera carga. **El de fábrica es el
mixto.** No hay una segunda paleta en las clases: cada tema le da otros
valores a los mismos tokens (`apps/sitio/src/app/globals.css`), y el admin se
redibuja solo.

| Token                                   | Claro     | Mixto (solo la sidebar)      | Oscuro    |
| --------------------------------------- | --------- | ---------------------------- | --------- |
| `white` (la superficie)                 | `#FFFFFF` | `#33466C` (pastilla y menú)  | `#172239` |
| `gris-fondo` (el fondo de atrás)        | `#F2F4F7` | `#1F2D4D` (el azul de marca) | `#0E1628` |
| `azul-principal` (texto, relleno fuerte)| `#1F2D4D` | `#FFFFFF`                    | `#E8EEF7` |
| `gris-texto`                            | `#6B7280` | `#C5D0E0`                    | `#A3AEC0` |
| `azul-medio`                            | `#4A6FA5` | `#A9C5E8`                    | `#8FB0E0` |
| `azul-claro` (bordes, divisores)        | `#A9C5E8` | `#40547C`                    | `#34476C` |
| `rojo-error`                            | `#B42318` | igual que claro              | `#F58B80` |

- **Mixto:** el contenido en claro y la sidebar (con la barra del celular)
  invertida sobre el azul de la marca. El marco que asoma detrás de las
  esquinas redondas también es azul. Texto 13,63:1, secundario 8,74:1,
  acento 7,68:1, y 9,40:1 sobre la pastilla activa.
- **Oscuro:** se invierte todo el admin. `white` pasa a ser la superficie
  oscura y `azul-principal` el texto claro, así que el relleno fuerte con
  texto `white` (una insignia, las iniciales) sigue leyéndose al revés.
  Texto 13,59:1 sobre la tarjeta, secundario 7,08:1, acento 7,14:1, error
  6,71:1.
- **Lo que la inversión no cubre** usa la variante `dark:`, que vale para
  todo lo que va sobre fondo oscuro: el logo pasa a su versión negativa, y
  el texto del botón primario no se invierte, porque sobre el naranja va el
  fondo oscuro (6,01:1).
- Solo el admin con sesión lleva tema: el login y el sitio público quedan
  como están.

### Tipo: cuatro tamaños, y ninguno más

| Token                | Tamaño / interlineado     | Fuente      | Uso                                                  |
| -------------------- | ------------------------- | ----------- | ---------------------------------------------------- |
| `text-admin-titulo`  | 1.5rem / 2rem (24/32 px)  | Manrope 700 | El `h1` de cada pantalla                             |
| `text-admin-seccion` | 1.125rem / 1.75rem (18/28)| Manrope 700 | Títulos de sección y de grupo                        |
| `text-admin-cuerpo`  | 1rem / 1.5rem (16/24)     | Inter 400   | Lo que se escribe y se lee: inputs, párrafos         |
| `text-admin-meta`    | 0.875rem / 1.25rem (14/20)| Inter 400 o 500 | Etiquetas, ayudas, contadores, botones, insignias |

- En el admin no van `text-xs`, `text-sm` … `text-3xl` ni
  `font-[family-name:…]`: Manrope es `font-display`.
- **La jerarquía sale de bajar lo secundario**, no de subir lo principal: la
  etiqueta en meta medium `azul-principal`; la ayuda y el contador en meta
  regular `gris-texto` (4,83:1).
- El cuerpo va en 16 px porque por debajo iOS hace zoom al enfocar un input.
  Su interlineado es 1,5 y no el 1,6 de §2: en el admin el cuerpo son
  controles y textos cortos, no lectura larga.
- Los dos títulos ya traen el `-0.01em` de §2 en el token.
- **La única excepción** es «Admin del sitio» en el panel de la marca de la
  pantalla de acceso (abajo): `text-h1` de la escala del sitio (§2). Es el
  único momento de marca del admin; ninguna otra pantalla la toma de
  precedente.

### Bordes y foco

- **Borde de un control** (input, casilla, botón secundario): `gris-texto`,
  4,83:1. Un control pide 3:1 (WCAG 1.4.11); `azul-claro` da 1,77:1 y no
  sirve de borde.
- **Divisores decorativos:** `azul-claro/60`. No informan nada, así que no
  se miden.
- **Foco:** `outline` de 2 px `azul-medio` (5,11:1) separado 2 px. Sobre
  `azul-principal` va en `azul-claro` (7,68:1): `azul-medio` ahí da 2,67:1.
- **Un campo con error** (`aria-invalid`): borde `rojo-error` (6,57:1).

### Campos: el error y el largo

- **El error va en el campo mismo**, debajo, en meta `rojo-error` (6,57:1),
  con `aria-invalid` y apuntado por `aria-describedby`; se borra en cuanto
  se edita el campo. El aviso del encabezado lo resume con las etiquetas del
  formulario («Hay 2 campos para revisar. El primero: Hero › Tarjetas › …»),
  nunca con claves, y el foco va al primero, abriendo lo que lo tape.
- **En una lista fija**, el ítem cerrado con un error lo dice: el ícono
  `Alerta` y «Con error» en meta medium `rojo-error`, en el lugar de su
  resumen. El color solo no alcanza.
- **El contador** cuenta contra el tope y se ve desde el 80 %. Si el campo
  tiene un **largo recomendado** (el SEO: 60 y 160, lo que muestra Google),
  cuenta contra ese y se ve siempre; pasado, un aviso en meta medium
  `azul-principal` (13,63:1) debajo del campo. No es un error: no pone
  `aria-invalid` ni frena el guardado, así que no va en rojo.

### Insignias de estado

Una pastilla `rounded-full` en meta medium, **siempre con texto**: el color
acompaña, no informa solo. Sin verde ni naranja, porque conviven con el
botón primario (§1, regla 4); la jerarquía sale del contraste.

| Tono        | Sobre blanco                                              | Sobre `azul-principal`                                  | Para                        |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------- | --------------------------- |
| **fuerte**  | relleno `azul-principal`, texto blanco (13,63:1)          | relleno blanco, texto `azul-principal` (13,63:1)        | lo que pide atención        |
| **normal**  | borde y punto `azul-medio` (5,11:1), texto `azul-principal` | borde y punto `azul-claro` (7,68:1), texto blanco (13,63:1) | el estado estable       |
| **apagada** | borde y texto `gris-texto` (4,83:1)                       | borde y texto `azul-claro` (7,68:1)                     | lo que todavía no empezó    |

### Botones

Cuatro variantes de **40 px de alto**, `rounded-lg`, `px-4`, en meta medium.

| Variante        | Sobre blanco                                          | Hover                                                   | Sobre `azul-principal`                                      |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| **primario**    | `naranja-accion`, texto `azul-principal` (4,54:1; §7) | `naranja-accion/90` (5,07:1)                            | igual, pero el hover subraya: el `/90` sobre azul da 3,93:1 |
| **secundario**  | borde y texto `azul-principal` (§7)                   | fondo `azul-claro/30` (11,63:1)                         | borde y texto blanco; hover fondo `white/10` (10,02:1)      |
| **terciario**   | sin borde, texto `azul-medio` (5,11:1)                | subrayado: con fondo `azul-claro/30` daría 4,36:1       | texto `azul-claro` (7,68:1)                                 |
| **destructivo** | el terciario en `rojo-error` (6,57:1)                 | subrayado                                               | texto `azul-claro` (7,68:1): `rojo-error` ahí da 2,07:1     |

- **Un solo primario por pantalla** (§7).
- **Un botón no se deshabilita para explicar algo.** Se deshabilita solo
  mientras corre una acción, y el que corre lo dice («Guardando…», con
  `aria-busy`). Si no hay nada que hacer, contesta con un aviso.
- Un link que navega con aspecto de botón usa las mismas clases.

### Encabezado de página

Cada pantalla abre con un encabezado: las migas (opcionales, meta
`azul-medio`), el `h1` en `text-admin-titulo` con su insignia al lado, una
línea de detalle en meta `gris-texto` y, a la derecha, las acciones, con un
solo primario. Los avisos de la pantalla van adentro del encabezado, abajo.
Fondo blanco con un divisor inferior; si es fijo, queda `sticky` arriba.

- **Con cambios sin guardar** (modo navy), todo el encabezado pasa a
  `azul-principal`: el texto en blanco (13,63:1), el detalle en `azul-claro`
  (7,68:1), y las insignias y los botones toman su columna «sobre
  `azul-principal`». Vuelve a blanco al guardar.
- **En el celular** (por debajo de `lg`), el título, la insignia y el
  detalle hacen scroll con la página; las acciones y los avisos van en una
  barra fija abajo, con el mismo modo navy y el área segura del iPhone.
- **Migas** solo donde hay tres niveles (hoy, el editor de páginas:
  Contenido / Páginas / Inicio). Las demás pantallas las ubican la sidebar y
  las pestañas, y un detalle, su «← volver» (abajo).

### Volver

La vuelta de un detalle a su lista: «← Contacto».
`apps/sitio/src/admin/armazon/Volver.tsx`, en el slot `volver` del
encabezado.

- **Arriba del título, adentro del encabezado**, donde el editor lleva sus
  migas: un detalle tiene dos niveles y no necesita más. Meta medium
  `azul-medio` (5,11:1 · 7,14:1), subrayado en hover; sobre el encabezado
  navy, `azul-claro` (7,68:1). La flecha es decorativa: el link se lee con el
  nombre de la lista.
- **El detalle, debajo del encabezado**: el `h1` es la cosa (el nombre de
  quien escribió), con su insignia de estado; sus datos en una lista de
  definición, la etiqueta en meta `gris-texto` y el valor en cuerpo, en dos
  columnas desde `sm`; lo largo (un mensaje), en su sección con título.
- Primer consumidor: la ficha de un mensaje y de un CV. Si otra lane deja
  uno antes en `main`, queda uno solo (DECISIONS de `work/mensajes/`).
  También: Invitar y la ficha de una cuenta («← Cuentas», `work/cuentas/`).

### Confirmar lo que no se deshace

Borrar algo para siempre («Borrar ahora») pide confirmación, **en el lugar
del botón** y no en un diálogo del navegador, que no se puede estilar y
frena todo. `apps/sitio/src/admin/armazon/Confirmacion.tsx`.

- **Un grupo con la pregunta** en meta medium `rojo-error` (6,57:1) y un
  borde izquierdo del mismo color, «Sí, borrar» destructivo y «Cancelar»
  terciario. La pregunta dice qué y que no vuelve: «¿Borrar el mensaje para
  siempre? No se puede deshacer.»
- **El foco va a «Cancelar»**, lo seguro, que lleva la pregunta como
  descripción (`aria-describedby`): el lector la lee entera. Mientras corre,
  «Borrando…» con `aria-busy`.
- **Hecho, vuelve a la lista** con un aviso de confirmación en su
  encabezado: «Se borró el mensaje para siempre.»
- Primer consumidor: «Borrar ahora» en la ficha de un mensaje y de un CV.
  También, en la ficha de una cuenta: «Borrar la cuenta», «Cancelar la
  invitación» y «Pasarle la dirección» (`work/cuentas/`). Suspender, cerrar
  sus sesiones o cambiarle el correo no preguntan: se deshacen con otro clic.

### Título de pestaña

El layout raíz del admin declara el template `%s · Admin ED` y cada pantalla
da solo su nombre: «Páginas · Admin ED», «Entrar · Admin ED». Una pantalla
no repite a su padre, salvo que su nombre solo sea ambiguo: el editor dice
«Inicio · Páginas · Admin ED» porque tres páginas del sitio se llaman como un
módulo (Inicio, Biblioteca, Novedades), y sus otras pestañas anteponen la
suya: «SEO · Inicio · Páginas · Admin ED».

### Pestañas

Las pantallas de un módulo, cuando tiene más de una (el tercer nivel del
menú). `apps/sitio/src/admin/armazon/Pestanas.tsx`.

- **Son links, no el patrón ARIA de tabs:** navegan. Un `nav` con el nombre
  del módulo como `aria-label`, una lista, y la activa con
  `aria-current="page"`. La activa sale de la ruta, así un layout puede
  ponerlas sin que cada página diga cuál es: **gana la más específica**, la
  de `href` más largo entre las que son la ruta o la contienen (cortando en un
  segmento: `/admin/metricas` no contiene a `/admin/metricasx`). Así la puerta
  de un módulo puede ser una pestaña más: Resumen es `/admin/metricas` y no se
  enciende en `/admin/metricas/busquedas`. En el
  editor, `/…/inicio/seo` enciende «SEO» y no también «Secciones».
- **Van en el encabezado**, en su propia fila al pie y pegadas a su divisor
  (el slot `pestanas` de `Encabezado`). El `h1` es el módulo; la pestaña
  encendida dice la pantalla, y el título de pestaña del navegador también.
- **Cada una:** meta medium, 44 px de alto, `px-3`; la fila corre `-mx-3`
  para que el texto de la primera quede alineado con el título. La activa en
  `azul-principal` con una barra de 2 px abajo (13,63:1 en el claro, 13,59:1
  en el oscuro); las demás en `gris-texto` (4,83:1 y 7,08:1), que pasan a
  `azul-principal` en hover. El foco, el de siempre pero por dentro
  (`-outline-offset-2`): afuera lo cortaría el scroll horizontal.
- **Sobre azul** (el encabezado del editor con cambios sin guardar): la
  activa en blanco con su barra (13,63:1 · 13,59:1 en el oscuro), las demás
  en `azul-claro` (7,68:1 · 7,95:1) y el foco en `azul-claro`, porque el
  `azul-medio` ahí da 2,67:1.
- **En el celular** la fila scrollea de costado si no entra; las cinco de
  Contenido entran a 390 de ancho, las cinco de Métricas no y scrollean.
- **Una pestaña puede llevar su número** (abajo, «El número»), después de la
  etiqueta: Mensajes › Contacto 3 · CV 1.
- Primer consumidor: las cinco pantallas de Contenido (Páginas, Casos,
  Equipo, Aliados, Fotos). El índice no las lleva, porque ya son las cinco en
  tarjetas, ni el editor, que lo ubican sus migas. Las usa también Métricas
  (Resumen, Búsquedas, Origen, Qué hace la gente, Links para compartir), que
  no tiene índice: su puerta es Resumen, la primera pestaña.
- Segundo consumidor: las pantallas de una página en el editor —Secciones ·
  SEO · Qué cambió · Versiones—, cada una su ruta. El `h1` es la página, con
  sus migas; la pestaña dice la pantalla. Cambiar de pestaña con algo sin
  guardar pregunta, como cualquier salida del editor.

### Índice de tarjetas

La puerta de un módulo con varias pantallas: una grilla de tarjetas (una
columna, dos desde `sm`, tres desde `lg`).
`apps/sitio/src/admin/armazon/IndiceDeTarjetas.tsx`.

- **Cada tarjeta entera es el link.** El link es el nombre, y su `::after` se
  estira sobre la tarjeta: se toca en cualquier lado, pero el lector de
  pantalla lee «Páginas» y no el párrafo entero, que va como
  `aria-describedby`. El foco se dibuja en la tarjeta entera
  (`has-[a:focus-visible]`), en `azul-medio` (5,11:1 · 7,14:1 en el oscuro).
- **Adentro:** el nombre en `text-admin-seccion`; qué es, en una línea, en
  meta `gris-texto` (4,83:1 · 7,08:1); y abajo su estado: una línea en meta
  `azul-principal` o una insignia («Por hacer», apagada).
- **Caja:** `rounded-xl`, `p-5`, borde `azul-claro/60` decorativo, que pasa a
  `azul-medio` en hover. Sin sombra.
- Primer consumidor: `/admin/contenido`. Lo reusa Ajustes.

### Lista

Filas separadas por un divisor, en una caja con el mismo borde
(`azul-claro/60`, `rounded-xl`). `apps/sitio/src/admin/armazon/Lista.tsx`.

- **Cada fila:** a la izquierda lo principal (cuerpo medium
  `azul-principal`, con lo que haga falta al lado en meta `gris-texto`) y una
  línea de detalle en meta `gris-texto` (4,83:1 · 7,08:1); a la derecha las
  insignias y la acción, que bajan a su propia línea si no entran.
- **Atenuada:** lo principal baja a `gris-texto` y una nota ocupa el lugar de
  la acción («Todavía no se edita desde acá»). No se esconde: se explica.
- **Desplegable:** un `details` debajo de la fila, sin JavaScript y anunciado
  como botón. El resumen en meta medium `azul-medio` (5,11:1 · 7,14:1) con un
  chevron que gira; adentro, links en meta `azul-medio` que subrayan en hover.
- **Una acción que navega** es un link con cara de botón secundario, con el
  nombre de la fila para el lector («Editar Inicio»).
- Primer consumidor: la lista de Páginas. También las guías de los módulos
  por hacer, las cuatro listas de Métricas › Búsquedas (sin acción: lo
  principal y sus cifras en el detalle), las versiones de una página (la más
  nueva con la insignia «En el sitio», normal, y sin acción; las demás,
  «Restaurar como borrador») las bandejas de Mensajes (quién lo tomó como
  insignia normal, «Abrir» como acción) y dos del Inicio: los pendientes y
  la actividad reciente, de una línea, con el cuándo a la derecha en meta
  `gris-texto` (4,83:1 · 7,08:1).

### Filtro

La misma lista recortada por un valor que va en la URL (los estados de una
bandeja: `?estado=en-curso`). No son pantallas del módulo, así que no son
pestañas: van debajo del encabezado, a la izquierda del buscador.
`apps/sitio/src/admin/armazon/Filtro.tsx`.

- **Píldoras que son links**, en un `nav` con su `aria-label` («Estado de
  los mensajes») y la activa con `aria-current="page"`. La activa la dice
  quien lo usa, porque sale del query y no de la ruta.
- **Cada una:** meta medium, 40 px de alto, `px-4`, `rounded-full`. La
  activa con borde y texto `azul-principal` (13,63:1 · 13,59:1), **sin
  relleno**, para que su número siga viéndose; las demás en `gris-texto`
  (4,83:1 · 7,08:1), que en hover pasan a `azul-principal` sobre
  `azul-claro/30` (11,63:1). El foco, el de siempre.
- **Puede llevar su número** («Nuevo 3»). En el celular la fila scrollea de
  costado si no entra (las cuatro de Mensajes, a 390 de ancho).
- Primer consumidor: los estados de las bandejas de Mensajes (Nuevo · En
  curso · Cerrado · Spam). También Cuentas › Actividad, con tres filtros
  apilados (módulo, persona y cuándo), cada uno con su «todos» primero; cada
  opción conserva los otros filtros y la búsqueda.

### Buscador

Una caja en las listas largas, a la derecha del filtro.
`apps/sitio/src/admin/armazon/Buscador.tsx`.

- **Un formulario GET con `role="search"`**, sin JavaScript: lo buscado
  queda en la URL (`?q=`) y conserva lo demás (el estado). Su nombre
  accesible dice dónde busca («Buscar en Contacto»); la etiqueta va
  `sr-only` y la caja dice qué mira («Nombre, correo o texto»).
- **La caja es la `ENTRADA` del admin** y el botón «Buscar», secundario:
  buscar no es la acción de la pantalla. Con algo buscado aparece «Borrar la
  búsqueda», terciario, que vuelve a la lista entera.
- **Sin resultados, el estado vacío lo dice** con lo buscado y dónde («Nada
  coincide con «zzz» en Cerrado»). En el celular, la caja ocupa el ancho.
- Primer consumidor: las bandejas de Mensajes. Si otra lane deja uno antes
  en `main`, queda uno solo (DECISIONS de `work/mensajes/`). También Cuentas ›
  Actividad («Buscar en la actividad»), que conserva sus tres filtros.

### Paginado

Las páginas de una lista paginada en el servidor.
`apps/sitio/src/admin/armazon/Paginado.tsx`.

- **«Más nuevas» · «Página 2 de 7» · «Más viejas»**: las listas largas del
  admin van de la más nueva a la más vieja, y así se dice. Los dos son links
  con cara de botón secundario; en una punta, el que no va no aparece (no se
  deshabilita). El medio, en meta `gris-texto` (4,83:1 · 7,08:1).
- Cada página es una URL que conserva los filtros. Con una sola página no se
  dibuja.
- Primer consumidor: Cuentas › Actividad, de a 50.

### Tabla

Para lo que se lee cruzando filas y columnas; una lista de cosas es una
`Lista`, no una tabla. Hoy hay una sola, la de permisos, y la pieza vive con
ella (`apps/sitio/src/admin/cuentas/TablaDePermisos.tsx`) hasta que haya una
segunda.

- **La caja de la `Lista`:** borde `azul-claro/60`, `rounded-xl`, filas
  separadas por el mismo divisor, `px-4 py-3`, todo en meta. Encabezados de
  columna y de fila de verdad (`th` con `scope`) y un `caption` para el
  lector.
- **Encabezados en meta medium** `azul-principal`; las celdas, en regular.
- **Un sí o un no se dibujan y se dicen:** el ✓ (`Check`, 16 px,
  `azul-principal`) se lee «Sí»; la raya, en `gris-texto` (4,83:1 · 7,08:1),
  se lee «No». El dibujo va con `aria-hidden` y la palabra, solo para el
  lector.
- En el celular la caja scrollea de costado (`overflow-x-auto`) y la tabla
  no baja de `min-w-lg`.
- Primer consumidor: «Qué puede cada rol», en Cuentas, plegada en un
  desplegable debajo de la frase de cada rol. Se arma desde `permisos.ts`.

### Estado vacío

Donde todavía no hay nada: qué pasa, en el título (cuerpo medium), y qué
hacer, en una frase en meta `gris-texto` (4,83:1 · 7,08:1). Borde punteado
`azul-claro`, decorativo, `rounded-xl`, `p-6`: dice «acá va a haber algo» sin
competir con el contenido. `apps/sitio/src/admin/armazon/EstadoVacio.tsx`.

- **La acción principal llega con Novedades** («Todavía no hay novedades.
  [Nueva novedad]»), su primer consumidor.
- **Con pasos**, cuando lo que falta es configurar algo: una lista ordenada
  debajo de la frase, en meta `azul-principal` (13,63:1 · 13,59:1 en el
  oscuro) con el número en medium, porque son instrucciones y no una
  aclaración. Cada paso dice quién lo hace. Primer consumidor: «Conectá Search
  Console», en Métricas › Búsquedas (sumado el 2026-09-26,
  `work/busquedas-de-google/`).
- Primer consumidor: los tres estados sin datos del panel de métricas. Lo
  usan también las secciones de Búsquedas sin filas, cada estado de una
  bandeja de Mensajes, que dice qué llega ahí o cuándo se borra, y, en el
  Inicio, «Todo al día» y la actividad sin eventos: nunca una lista vacía
  muda.

### Sin permiso

Lo que ve quien entra por URL a una sección que su rol no usa: la sidebar ya
no se la muestra, así que llega por un link viejo o tipeando.
`apps/sitio/src/admin/armazon/SinPermiso.tsx`, que dibuja
`apps/sitio/src/admin/armazon/Guarda.tsx`.

- **Es solo un encabezado**, adentro del armazón y con la sidebar: el `h1`
  dice de quién es la sección («Esta sección es de quien dirige o
  administra», armado desde la tabla de permisos, no escrito a mano); el
  detalle, en meta `gris-texto` (4,83:1 · 7,08:1), tu rol y su frase; y a la
  derecha **«Ir al Inicio»**, secundario.
- **Sin primario**: acá no hay nada que hacer. Sin ícono de candado ni tono
  de error: no es una falla, es un lugar que no es tuyo.
- No se esconde qué sección es: la URL ya lo dijo. Se explica de quién es.
- Lo dibujan dos guardas. La del layout de cada módulo **solo oculta la
  interfaz**: Next manda la página en el payload aunque el layout diga «Sin
  permiso». La que protege los datos es la de cada página de un módulo que
  deja afuera a algún rol (hoy Cuentas y la bandeja de CV; Ajustes, mientras
  es una guía), que lo chequea antes de leer nada (AGENTS.md §12).

### Apartado

Una pantalla de ajustes partida en apartados: a la izquierda qué es y **qué
pasa si se toca**; a la derecha, lo que se toca.
`apps/sitio/src/admin/armazon/Apartado.tsx`.

- **Desde `lg`, dos columnas**: un tercio con el título en
  `text-admin-seccion` y una frase en meta `gris-texto` (4,83:1 · 7,08:1),
  y dos tercios con el formulario. Por debajo, uno arriba del otro.
- **La frase dice la consecuencia**, no repite el título: «Al cambiarla se
  cierran tus otras sesiones y te llega un correo que lo avisa».
- Van en una pila separados por un divisor `azul-claro/60`, `py-8`, y el
  `id` de cada uno es su ancla (`/admin/mi-cuenta#contrasena`).
- **Los formularios de adentro no pasan de `max-w-md`**: un nombre o una
  contraseña a todo el ancho se leen como un párrafo.
- **Sin primario si los apartados son independientes**: en Mi cuenta hay tres
  formularios y ninguno es la acción de la pantalla, así que los tres botones
  son secundarios. El aviso de cada uno va entre sus campos y su botón.
- Primer consumidor: Mi cuenta (Perfil, Contraseña, Tu rol, Sesiones y
  Avisos). Lo reusa Ajustes.

### Casilla

La nativa, en `accent-azul-principal`, de 16 px: el navegador le da el
borde (3:1 o más, WCAG 1.4.11) y la invierte sola donde hay
`color-scheme: dark`. **La etiqueta la envuelve**, así se marca tocando la
frase y no solo el cuadrito.

- **Cuando prende un campo** («Lleva un botón», en el editor), la etiqueta
  va en meta medium, pegada al campo que prende.
- **Cuando las casillas son lo que se elige** (los avisos de Mi cuenta),
  cada fila es de 44 px con el texto en cuerpo, y van juntas en un
  `fieldset` con su `legend` en meta medium («Mandame un correo con cada»).
- Primer consumidor: el campo opcional del editor (`admin/campos/Campo.tsx`);
  registrada con los avisos de Mi cuenta (2026-09-26, `work/mensajes/`).

### Cifra

Una cifra con su comparación: la etiqueta, el número y cómo le fue contra el
período anterior. `apps/sitio/src/admin/armazon/Cifra.tsx`. No confundir con
«El número», la pastilla con la cuenta de sin leer.

- **Adentro:** la etiqueta en meta `gris-texto` (4,83:1 · 7,08:1 en el
  oscuro); la cifra en `text-admin-titulo` Manrope 700 `azul-principal`
  (13,63:1 · 13,59:1), con los miles de `es-AR`; abajo, la comparación en
  meta `gris-texto`: «+12 % contra la semana anterior», «Igual que la semana
  anterior», «Sin datos previos». Cada uso nombra su período («el período
  anterior» si no dice otro).
- **La comparación va sin color**, ni verde ni rojo: subir no siempre es
  mejorar (el puesto en Google mejora cuando baja, y por eso no se compara
  en porcentaje), y el rojo es solo para errores.
- **Sin datos, «—»**, con «Todavía no hay datos» abajo y «Sin datos» para el
  lector: nunca un cero inventado. Un cero es un cero solo si la fuente
  existe y contó cero. Si no hay por algo que se puede decir, la nota lo
  dice con las mismas palabras que la pantalla del módulo («Faltan las
  variables de Vercel»); si la consulta falló, «No se pudo leer».
- **Caja:** `rounded-xl`, `p-4`, borde `azul-claro` decorativo, fondo
  `white`. Sin sombra.
- Primer consumidor: el panel de Métricas › Resumen, donde nació como su
  tarjeta; pasó al armazón con su segundo consumidor, el Inicio. Lo usa
  también Búsquedas.

### Inicio

La primera pantalla del admin: responde «¿qué tengo que hacer?» y «¿cómo va
el sitio?» de un vistazo. `apps/sitio/src/admin/inicio/`.

- **El orden de lectura:** el saludo («Hola, Daniela», el `h1`) con lo que
  pasó desde tu última visita en el detalle, en una frase; los pendientes;
  los números de la semana; la actividad reciente. En el celular, uno abajo
  del otro en ese orden.
- **Desde `lg`, dos columnas** (3 y 2 de 5): lo que hay que hacer a la
  izquierda (los pendientes y, abajo, la actividad) y cómo va el sitio a la
  derecha (la semana, que ocupa las dos filas). Las dos preguntas quedan
  arriba del pliegue.
- **Sin primario:** nada es «la» acción de esta pantalla. Las acciones de
  los pendientes son secundarias, «Ver métricas» y «Ver toda la actividad»
  (quien usa Cuentas, hacia Cuentas › Actividad) son terciarios, y los accesos
  rápidos («Nueva novedad», cuando exista) van como secundarios en las
  acciones del encabezado.
- **Lo único con peso fuerte es la cuenta de pendientes:** una insignia
  fuerte al lado del título «Pendientes» (13,63:1 · 13,59:1). Sin
  pendientes no está, y en su lugar va «Todo al día» con el estado vacío.
- **Los pendientes** son una `Lista`, ordenada por urgencia: qué pasa, el
  detalle y el link a la pantalla que lo resuelve, con el nombre de la fila
  para el lector. **La semana**, `Cifra` uno abajo del otro en el celular y
  en la columna de la derecha (de a dos, ahí las etiquetas largas bajan de
  línea y los números quedan a distinta altura); de a dos solo entre `sm` y
  `lg`, y si quedan impares (quien edita no ve los CV), el último toma las
  dos columnas. Debajo, el período una sola vez. **La actividad**, una
  `Lista` de una línea por evento, solo con lo que cambia algo del sitio o
  del admin (publicar, descartar, restaurar…): las sesiones y la cuenta
  propia taparían eso y quedan en Cuentas › Actividad.
- **Los dos títulos de arriba van a la misma altura:** «Pendientes» tiene 40
  px de alto, como la fila de «Esta semana» con su link. Si la semana es más
  alta que la columna de la izquierda, el sobrante va abajo, nunca entre los
  pendientes y la actividad.
- **Lo que un bloque no pudo leer lo dice en su lugar** («No se pudo revisar
  las páginas», «No se pudo leer»): un módulo con un problema no tumba la
  pantalla, y un pendiente que falló nunca se lee como «Todo al día».

### Pantalla de acceso

Entrar, olvidé y nueva contraseña: el panel de la marca a la izquierda y el
formulario a la derecha. Es **el único momento de marca del admin**, y no
lleva tema. `apps/sitio/src/admin/armazon/Pantalla.tsx`.

- **El panel** (`azul-principal`, desde `lg` 5/12 del ancho): el logo
  negativo arriba a 240 px; la grilla de puntos de §6 en blanco al 8 %; **el
  haz del faro**, la capa de puntos encendidos de Biblioteca (blanco al
  34 %), quieta, recortada por una cuña que sale de la lámpara del logo y baja
  hacia el formulario (§9: el faro guía, sin exagerar); «Admin del sitio»
  abajo, en blanco a `text-h1` (la excepción de tipo); y **una** forma plana,
  el círculo `azul-medio` de 256 px que sale de la esquina de abajo.
- **El haz no toca el logo:** se apaga dentro de un círculo de 250 px
  alrededor de la lámpara, más que el margen de seguridad de §10 (la esquina
  más lejana del logo queda a 201 px). El logo no se redibuja ni se le suma
  nada.
- **Contrastes:** «Admin del sitio», blanco sobre `azul-principal` 13,63:1;
  sobre un punto de la grilla, 10,66:1; si tocara el círculo, 5,11:1. Los
  puntos y el círculo son decorativos (`aria-hidden`).
- **En el celular** el panel es una franja arriba, con la grilla, el logo a
  144 px (§10 pide 120 como mínimo) y «Admin del sitio» en
  `text-admin-seccion` negrita blanca; sin el haz ni el círculo. El
  formulario va arriba, no centrado.
- El formulario: el `h1` en `text-admin-titulo`, la bajada en meta, y el
  primario naranja a todo el ancho (§7).

### Avisos

Un banner dentro del contenido, **nunca un toast**: el toast se va antes de
que lo lea quien usa lector de pantalla o quien lee despacio.

| Tono             | Colores                                                                        | Rol             | Ícono    |
| ---------------- | ------------------------------------------------------------------------------ | --------------- | -------- |
| **error**        | texto `rojo-error` sobre su tinte al 8 % (5,75:1), borde izquierdo `rojo-error` | `role="alert"`  | `Alerta` |
| **confirmación** | texto `azul-principal` sobre `azul-claro/30` (11,63:1), borde izquierdo `azul-medio` | `role="status"` | `Check`  |

- Sin verde: al lado de «Publicar» rompería la regla 4 de §1.
- Una × opcional lo cierra, y el aviso siguiente reemplaza al anterior.
- **Una acción adentro**, si hay algo que la resuelva («Recargar», cuando otra
  persona guardó mientras tanto): un botón de texto subrayado en meta medium,
  en el color del aviso (5,75:1 en el error, 11,63:1 en la confirmación), fuera
  del texto con el `role`, para que no se anuncie como parte del mensaje.
- `gris-texto` no va sobre `azul-claro/30`: da 4,12:1.

### Qué cambió

El borrador contra lo publicado, antes de publicar (la pestaña «Qué cambió»
del editor). `apps/sitio/src/admin/paginas/ListaDeCambios.tsx`.

- **Por parte**: el nombre en `text-admin-seccion` con el divisor de las
  secciones, y debajo una fila por campo que cambió, separadas por el divisor
  `azul-claro/60`.
- **Cada fila**: dónde, en meta medium y con las etiquetas del formulario
  («Tarjetas › Tarjeta 3 › Foto»); debajo, «Antes» y «Ahora» uno al lado del
  otro desde `md`. Antes va en `gris-texto` (4,83:1 · 7,08:1) y ahora en
  `azul-principal`: la jerarquía sale del contraste. **Sin rojo ni verde**:
  cambiar no es un error ni un concepto, y al lado de «Publicar» el verde
  rompería la regla 4 de §1.
- **Una foto**: la miniatura 4/3 de 160 px con su foco, alt vacío, y su texto
  alternativo escrito debajo. Lo que no había o ya no está dice «Nada».
- **Vacía**: el `EstadoVacio`, «No hay cambios sin publicar», o «El borrador
  es igual a lo publicado» si lo hay pero no cambia nada.

### Vista previa de buscador y redes

Cómo se ve una página en Google y al compartir el link, en vivo con lo que
está en el formulario (la pestaña SEO). `VistaPreviaSeo.tsx`.

- **Dos figuras**, una al lado de la otra desde `lg`, con su `figcaption`
  en meta medium, en cajas `rounded-xl` con borde `azul-claro/60`.
- **Google**: el dominio (y el camino) en meta `gris-texto`, el título en
  `text-admin-seccion` `azul-medio` (5,11:1), como el link de un
  resultado sin serlo, y la descripción en meta `gris-texto`. Los dos se
  cortan donde corta el buscador (60 y 160), en una palabra, con «…».
- **Redes**: la imagen en `aspect-40/21` (1200 × 630), recortada desde el
  centro como la recortan las redes, y abajo el dominio, el título en cuerpo
  medium y la descripción en dos renglones. Sin imagen propia va la del
  sitio (`opengraph-image`), y lo dice.
- Es ilustración: la imagen va con alt vacío y lo que es va escrito debajo
  («Imagen propia: …» o «Sin imagen propia: va la del sitio.»).
