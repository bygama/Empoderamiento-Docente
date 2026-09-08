# AI_GUIDELINES.md — Cómo escribir código IA-friendly

Reglas detalladas para que cualquier asistente de IA (Claude en particular)
pueda navegar y modificar este repo con eficiencia. Aplica a todo código y
documentación que se sume al proyecto.

---

## 1. Predictibilidad sobre cleverness

La meta no es código brillante: es código **predecible**. Si un patrón se
repite, repetirlo igual; si una decisión es estándar, no innovar.

- Misma estructura para todos los componentes.
- Misma forma de exportar (`export default` para componentes/páginas,
  `export const` named para hooks/utils).
- Misma forma de manejar errores y estados (loading / vacío / error).
- Mismo orden de imports.

---

## 2. Archivos chicos y focalizados

| Tipo                | Tamaño objetivo  |
| ------------------- | ---------------- |
| Componente UI       | < 150 líneas     |
| Hook personalizado  | < 80 líneas      |
| Utility / helper    | < 100 líneas     |

Si un archivo se acerca al límite, **partirlo antes** que después. Claude
trabaja mejor cuando puede leer un archivo entero con contexto suficiente.

**Cuando un componente se parte en tres o más piezas, las piezas van a una
subcarpeta** con el nombre del componente en kebab-case, y el compositor se
queda donde estaba (nadie tiene que actualizar sus imports):

```
components/
├── TeamProfileOverlay.tsx        ← el compositor, en su ruta de siempre
└── overlay/                      ← sus piezas
    ├── usePortalModal.ts         ← el portal, el lock y el foco
    ├── apertura-overlay.ts       ← la entrada
    ├── coreografia-overlay.ts    ← tiempos, cierre y helpers
    └── PerfilShell.tsx           ← un pedazo de markup
```

El reparto típico: los datos a `data.ts`, la coreografía a
`coreografia-<nombre>.ts` (una función `crear<Nombre>(…)` que devuelve su
limpieza y la llama el MISMO efecto de antes, en la misma posición), y cada
pedazo de markup a su propio archivo. Dos piezas no justifican la carpeta:
quedan al lado del compositor.

---

## 3. Naming

- **Componentes:** `PascalCase` → `HeroSection.tsx`, `BotonInscribite.tsx`.
- **Hooks:** `useCamelCase` → `useScrollProgress.ts`.
- **Utils / lib:** `camelCase` → `formatearFecha.ts`.
- **Tipos / interfaces:** `PascalCase` → `Trayecto`, `InscripcionFormData`.
- **Constantes:** `SCREAMING_SNAKE_CASE` → `MAX_INSCRIPCIONES`.
- **Carpetas:** `kebab-case` → `formularios-inscripcion/`.

Si el archivo exporta solo una cosa, **el nombre del archivo coincide con
el export**. Si exporta varias, el archivo lleva el nombre del concepto
agrupador.

---

## 4. Estructura de un componente típico

```tsx
import { ... } from "next/...";
import { ... } from "react";
import { ... } from "@/lib/...";
import { ... } from "@/components/...";

type TrayectoCardProps = {
  titulo: string;
  descripcion: string;
  duracion: string;
  href: string;
};

export default function TrayectoCard({
  titulo,
  descripcion,
  duracion,
  href,
}: TrayectoCardProps) {
  return (
    <article className="...">
      ...
    </article>
  );
}
```

**Reglas:**
- Imports agrupados: framework → externos → internos.
- Tipo de props arriba del componente, **nombrado** (no inline).
- Tipo termina en `Props` para props de componentes.
- Componentes default-exported para que Next pueda detectarlos en routes.

---

## 5. Path aliases

Usar siempre `@/` para imports internos:

```ts
import { Boton } from "@/components/ui/Boton";
import { siteConfig } from "@/config/site";
```

Nunca rutas relativas largas (`../../../`) — son ilegibles y frágiles al
mover archivos.

Configurar en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 6. TypeScript estricto

`tsconfig.json` debe tener:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

- **Sin `any`** salvo justificación documentada en comentario `// eslint-disable-next-line ...`
  con razón.
- **Tipar bordes**: props públicas, retornos de funciones exportadas,
  payloads de API.
- **Inferir adentro**: dentro del cuerpo de funciones, dejar que TS infiera.

---

## 7. Comentarios

**Por defecto, no comentar.** Buenos nombres + tipos + estructura clara
hacen innecesarios la mayoría de los comentarios.

Comentar solo cuando:
- Hay una restricción no obvia ("este orden es importante porque…").
- Se documenta un workaround ("hack temporal mientras X resuelve Y").
- Hay una invariante sutil ("siempre es ≥ 0 porque…").

**Nunca comentar:**
- Lo que el código ya dice (`// incrementar contador` arriba de `count++`).
- Referencias a tickets/PRs (eso va en el commit).
- "TODO" sin contexto: si hay un TODO, debe decir **qué** falta y **por qué
  no se hizo ahora**.

---

## 8. Manejo de errores

> Hoy el sitio corre 100% frontend (sin API routes ni backend integrado). El
> backend elegido a futuro es **Supabase** (ver §12). Cuando se sumen
> formularios u operaciones contra Supabase, validar input con **Zod**,
> capturar excepciones y devolver un mensaje genérico al cliente (sin filtrar
> detalles internos).

- **Componentes:** usar `error.tsx` y `not-found.tsx` de Next.js para
  manejo a nivel de route.
- **Funciones puras:** preferir tipos `Result<T, E>` o devolver `null`
  explícito antes que tirar excepciones, salvo que sea un programming error.

---

## 9. Server vs Client Components

- **Server por defecto.** No agregar `"use client"` salvo necesidad real.
- **Necesitan `"use client"`:** hooks de React (useState, useEffect),
  event handlers, browser APIs, GSAP/Lenis.
- **Aislar la frontera:** un componente client no debería ser muy grande.
  Idealmente: container client → renders children server.

---

## 10. Estilos con Tailwind

- **Tokens primero.** Usar las clases derivadas de los tokens de
  `DESIGN.md` (`bg-azul-principal`, `text-naranja-accion`, etc.).
- **Sin valores arbitrarios** (`bg-[#1F2A44]`) salvo prototipo. Si hace
  falta un valor nuevo, agregarlo a los tokens.
- **Sin `@apply` extensivo.** Mantener clases en JSX, salvo casos puntuales
  (botones reutilizables vía componente, no clase compuesta).
- **Orden de clases:** mantener un orden consistente y legible (layout →
  spacing → tipografía → color → estado). No hay formatter de Tailwind
  configurado por ahora; cuidar el orden a mano.

---

## 11. Animaciones (GSAP / Lenis)

- Encapsular lógica en hooks: `useFadeInOnScroll`, `useLenisScroll`.
- Cleanup obligatorio con `gsap.context()` dentro de `useEffect`.
- Respetar `prefers-reduced-motion`:
  ```ts
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;
  ```
- Animar solo `transform` y `opacity`. Nunca `width`, `height`, `top`,
  `left`.
- **El `will-change` es de la coreografía, no del markup.** Nunca en un
  `className` ni en un `style` de JSX: ahí queda puesto para siempre y el
  navegador mantiene una capa por elemento aunque no se anime nada. Lo pone
  y lo saca quien anima:
  ```ts
  // Dentro del gsap.context() / matchMedia: el revert lo limpia solo.
  gsap.set(capas, { willChange: "transform" });
  ```
  Si la animación no pasa por GSAP, `el.style.willChange = "transform"` al
  empezar y `el.style.willChange = ""` en la limpieza — el hint dura lo que
  dura el movimiento.

---

## 12. Backend y persistencia

**Backend elegido: [Supabase](https://supabase.com) (Postgres gestionado +
Auth + Storage). Todavía NO está integrado.** Hoy el sitio corre 100%
frontend: no hay `@supabase/supabase-js` en `package.json`, ni cliente
(`src/lib/supabase/`), ni tablas, ni env vars, ni `src/app/api/`. Los datos
institucionales son estáticos y viven en `src/config/` (§13). La decisión
está registrada en
[`architecture/adrs/0002-adoptar-supabase-persistencia.md`](architecture/adrs/0002-adoptar-supabase-persistencia.md).

Cuando se integre (p. ej. al sumar un formulario de inscripción o de envío de
CV) — **no antes, y confirmando con el usuario**:

- **SDK oficial `@supabase/supabase-js`** para el acceso a datos; schema,
  queries y políticas de seguridad definidas en Supabase.
- **RLS (Row Level Security) activada** en toda tabla con datos sensibles;
  la autorización no se delega solo a la capa de aplicación.
- **Validar los bordes con Zod** antes de leer/escribir cualquier input.
- **Env vars por contexto:** `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicas (se exponen al cliente); la
  `SUPABASE_SERVICE_ROLE_KEY` es secreta y **solo server-side** — nunca
  prefijada con `NEXT_PUBLIC_` ni usada en el browser. Placeholders en
  `.env.example`.
- **No exponer detalles internos** en los mensajes de error al cliente.
- **Migraciones / schema:** confirmar el diseño de tablas y políticas con el
  humano antes de crearlas. No inventar tablas ni columnas no acordadas.

---

## 13. Configuración centralizada

`src/config/site.ts` exporta la config institucional (forma real):

```ts
export const siteConfig = {
  name: "Empoderamiento Docente",
  shortName: "ED",
  url: "https://empoderamientodocente.org",
  description: "…",
  contacto: { email: "…", direccion: { ... } },
  paises: ["Chile", "México", "Argentina", "Colombia", "Brasil"],
  redes: {} as { instagram?: string; linkedin?: string; facebook?: string },
  mensajesPilares: [ ... ],
} as const;
```

Cualquier valor que aparezca en más de un componente vive acá. No
hardcodear el mail, la dirección ni los handles de redes en JSX. Los
handles de redes siguen vacíos hasta tenerlos confirmados — no inventar URLs.

---

## 14. Documentación viva

Cuando un cambio toca:
- **Tokens visuales** → editar `DESIGN.md`.
- **Convenciones de código** → editar este archivo.
- **Términos del dominio** → editar `docs/GLOSSARY.md`.
- **Cómo trabajar con sub-agentes** → editar `AGENTS.md`.
- **Estructura general / setup** → editar `CLAUDE.md`.
- **Una decisión arquitectónica importante** → crear ADR en
  `docs/architecture/adrs/` (ver `skills/adr-create/SKILL.md`).

La regla: **si Claude en una sesión futura no podrá deducir esto leyendo el
código, va en un `.md`.**

---

## 15. Nombres de variables que ayudan a la IA

- Preferir `formularioInscripcion` sobre `form`.
- Preferir `cantidadDeTrayectos` sobre `n`.
- Preferir `respuestaApi` sobre `res` (en lugares donde no haya
  ambigüedad por convención de Next).
- Booleanos siempre como predicado: `estaCargando`, `hayError`,
  `puedeInscribirse`.

---

## 16. Tests (cuando aplique)

> Decidir framework en init. Recomendado: Vitest + Testing Library.

Cuando se sumen tests:
- **Co-locados:** `Boton.tsx` → `Boton.test.tsx`.
- **Describir comportamiento, no implementación.**
- **Nombres en español** ("debería deshabilitar el botón cuando…").

---

## 17. Performance

- Imágenes via `next/image`, siempre con `alt` descriptivo.
- Fuentes via `next/font/google`, `display: 'swap'`.
- Lazy import (`dynamic`) para componentes pesados below-the-fold (mapas,
  carruseles).
- Auditar con Lighthouse antes de cada release. Target: LCP < 2.5s, CLS < 0.1.

---

## 18. Resumen ejecutivo (cheat sheet)

- Archivos chicos, nombres claros, tipos en bordes.
- Tokens, no hardcodes.
- Lenguaje inclusivo siempre.
- Comentarios solo para el "por qué".
- El `will-change` lo pone y lo saca la coreografía, nunca el markup.
- Server por defecto, client cuando hace falta.
- Commits atómicos con Conventional Commits.
- Cualquier decisión que no se infiere del código va a un `.md`.
