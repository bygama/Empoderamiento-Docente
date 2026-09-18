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
- Texto: blanco, Inter Medium
- Hover: oscurecer 10%
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
}
```

Clases utilitarias generadas automáticamente:

- **Paleta:** `bg-azul-principal`, `text-naranja-accion`, `border-verde-concepto`,
  `bg-gris-fondo/40` (con opacidad), etc.
- **Tipografía:** `font-sans` (Inter, default del cuerpo), `font-display` (Manrope,
  para títulos).
- **Escala:** `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`,
  `text-small` (cada una ya incluye su line-height).

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

Los SVG oficiales se guardan en `public/brand/`:

- `logo-completo.svg` — versión sobre claro, con tagline.
- `logo-completo-negativo.svg` — versión sobre azul, con tagline.
- `isotipo.svg` — ED + faro, sin tagline.
- `isotipo-negativo.svg` — isotipo sobre azul oscuro.

Hasta tenerlos en el repo, usar placeholder textual o el favicon de Next.js.
**Nunca** generar ni redibujar el logo con IA o trazado manual.
