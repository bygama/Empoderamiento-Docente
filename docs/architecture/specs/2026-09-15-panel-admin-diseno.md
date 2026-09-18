# Panel de administración — diseño

- **Fecha:** 2026-09-15
- **Estado:** aprobado en conversación (Facundo), pendiente de plan de implementación
- **Decide:** Facundo, con Gastón y Mateo
- **Reemplaza:** la dirección de backend del ADR-0002 (Supabase) → se registra en el ADR-0003

---

## 1. Qué se quiere

Un panel para que ED cambie el contenido del sitio sin tocar código: textos,
títulos, fotos, publicaciones de la biblioteca, novedades, casos de
investigación, equipo, aliados y datos de contacto. Completo antes que
vistoso, con una experiencia que entienda gente no técnica.

Lo usan tres personas: **Gastón** (administrador), **Raquel** y **Daniela**
(editoras). No hay paso de aprobación: quien edita, publica.

**Regla de alcance: se edita todo menos la estructura.** Las escenas
animadas están armadas a medida para una cantidad exacta de piezas y para
textos que entran en un espacio calibrado a mano (las nueve estaciones de
la espiral, las seis preguntas de líneas, las seis áreas, la constelación).
Esa estructura no se toca desde el panel: la cantidad de piezas es fija y
cada texto tiene un largo máximo. Lo que va adentro se edita libremente.

## 2. Decisión: Payload adentro de la app

El panel es **Payload 3** (CMS open source, MIT) montado en `/admin` dentro
del mismo proyecto Next. Lo que trae hecho y que pedimos: borradores con
autoguardado, botón Publicar, historial de versiones con Restaurar, vista
previa del sitio real con el borrador puesto, biblioteca de imágenes,
listas con buscador y filtros, usuarios con roles, interfaz en español.

Base de datos en **Neon** (Postgres serverless, integración nativa de
Vercel, una rama de base por cada preview de PR). Fotos en **Vercel Blob**.
Correos del panel (recuperar contraseña) por **Resend**. Las tres piezas se
instalan desde el Marketplace de Vercel, con las variables provisionadas
solas y facturación unificada.

Se descartó un panel a medida (Drizzle + Clerk + formularios propios):
mismo alcance en cinco a ocho semanas contra dos o tres, y todos los bugs
nuestros. Se descartaron los CMS alojados afuera (Sanity, Contentful):
contradicen la decisión de tener la base en Neon y suman cuentas.

Verificado el 2026-09-15: Payload soporta Next 16 con Turbopack desde la
3.73 (el repo está en Next 16.3.4). Hay un issue abierto sobre builds de
producción con Turbopack (`payloadcms/payload#15429`); ver riesgos.

## 3. Cómo queda el repo

```
src/
├── app/
│   ├── (sitio)/            ← el sitio de hoy, con su layout (fuentes, header,
│   │   ├── layout.tsx         footer, Lenis). Las URLs públicas no cambian.
│   │   ├── page.tsx
│   │   ├── biblioteca/ contacto/ investigacion/ novedades/ que-hacemos/ quienes-somos/
│   │   ├── not-found.tsx
│   │   └── api/vista-previa/route.ts   ← activa el modo borrador y redirige
│   ├── (payload)/          ← GENERADO por Payload: admin, api, layout, importMap
│   ├── globals.css
│   └── favicon.ico, apple-icon.png, opengraph-image.png (aplican a todo)
├── cms/                    ← definición del panel (nuestra)
│   ├── colecciones/        ← fotos, novedades, materiales, casos, equipo, aliados, usuarios
│   ├── paginas/            ← una "global" por página + ajustes
│   ├── campos/             ← campos reutilizables (texto con límite, lista fija, seo)
│   ├── acceso.ts           ← roles y permisos
│   ├── revalidar.ts        ← hooks que regeneran las rutas al publicar
│   └── migraciones/        ← migraciones de esquema para producción (commiteadas)
├── contenido/              ← capa de lectura que usa el sitio (obtenerNovedades(), …)
├── payload.config.ts
└── payload-types.ts        ← GENERADO (pnpm payload generate:types), commiteado
```

- Payload necesita ser dueño de su layout raíz; por eso el sitio pasa a un
  route group `(sitio)` con el `layout.tsx` actual y Payload vive en
  `(payload)`. Los route groups no cambian las URLs.
- Lo generado por Payload (`src/app/(payload)/**`, `payload-types.ts`) queda
  fuera del lint y de la regla de 200 líneas de AGENTS.md §6: no es código
  nuestro. react-doctor sigue corriendo sobre `src` y tiene que seguir en
  100/100; se comprueba en el primer PR y, si lo generado lo baja, se
  discute con el owner antes de seguir (regla §5.8: nunca se apaga en
  silencio).
- Todo `@payloadcms/*` se instala en la misma versión y se actualiza a
  propósito, todas las piezas juntas (Payload publica seguido).

## 4. Cómo lee el sitio

- Las páginas siguen siendo **estáticas**. En el build leen el contenido
  por la API local de Payload (`getPayload`) a través de `src/contenido/`.
  Al publicar, un hook `afterChange` / `afterDelete` regenera solo las rutas
  afectadas con `revalidatePath` (por ejemplo, una novedad regenera `/`,
  `/novedades` y su ficha). Sin cache intermedio que mantener.
- **`src/contenido/`** traduce lo que devuelve Payload a los tipos que ya
  existen en cada feature (`Novedad`, `Material`, `CasoInvestigacion`,
  `Profile`, etcétera). Los componentes y las coreografías no cambian de
  contrato: cambia de dónde salen los datos.
- Hoy 46 componentes importan los datos directo desde los `data.ts` (16 de
  cliente, 30 de servidor). Pasan a recibir el contenido por props desde la
  página, que es servidor. Es un cambio mecánico y ancho; se hace sección
  por sección (ver §7).
- Los archivos que son **geometría o animación, no contenido**, quedan en
  código: `linterna-geometria.ts`, `geometria-torre.ts`, `vibora-escena.ts`,
  `niveles-escena.ts`, `tintes.ts`, `constelacion-mirada.ts`,
  `datos-figura.ts`. Si un archivo mezcla geometría con texto (como
  `red-datos.ts`), el texto pasa a un campo y la geometría queda en código.
- **Vista previa:** el botón del panel abre la página real en un iframe.
  Esa URL pasa por `api/vista-previa`, que valida un secreto, activa
  `draftMode` y redirige a la página; con el modo borrador activo,
  `src/contenido/` pide los documentos en borrador (`draft: true`). Sin la
  cookie, la página estática de siempre.
- **Fotos:** salen de Vercel Blob por `next/image` (`remotePatterns` para el
  host de Blob). Payload genera los tamaños con `sharp` (ya aprobado en
  `pnpm-workspace.yaml`). El alt es obligatorio.

## 5. Modelo de contenido

### 5.1 Colecciones (listas con buscador, filtros y orden)

| Colección    | Qué guarda                                                                                         | Origen hoy                                   |
| ------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `fotos`      | Imagen + alt obligatorio + punto focal. Solo imágenes, hasta 8 MB.                                 | `public/**`                                  |
| `novedades`  | Fecha, categoría, título, bajada, imagen, destacada, cuerpo (secciones con párrafos), publicación. | `features/novedades/data/novedades.ts`       |
| `materiales` | Título, autores, descripción, tipo, tema, público, año, fecha, formato, páginas, portada, URL.     | `features/biblioteca/data/materiales.ts`     |
| `casos`      | Número, pregunta, eje, indicio, ficha, tinte, contexto, lámina, evidencias, análisis, aprendizaje… | `features/investigacion/data/casos.ts`       |
| `equipo`     | Perfil completo: nombre, rol, lugar, figura, etapas con hitos y publicaciones, categorías.         | `features/quienes-somos/data/equipo.ts`      |
| `aliados`    | Nombre, logo, URL, **autorizado** (sin marcar no se publica: AGENTS.md §5.4).                      | `config/aliados.ts`                          |
| `usuarios`   | Mail, nombre, rol. Con auth de Payload.                                                            | no existe                                    |

Los `select` (categoría de novedad, tipo / tema / público de material,
formato, estado de caso, tinte de carpeta) tienen exactamente las opciones
que hoy existen en código: agregar una opción es un cambio de código,
porque el diseño las conoce.

El cuerpo de las novedades sigue siendo **texto plano por párrafo**
(secciones con título y lista de párrafos), como hoy: sin editor de texto
enriquecido en esta etapa. Si lo piden, se evalúa después con su
renderizador.

### 5.2 Páginas (una ficha por página) y Ajustes

`inicio`, `que-hacemos`, `quienes-somos`, `investigacion`, `biblioteca`,
`novedades` (la portada: movimiento y lanzamientos) y `contacto`. Cada una
tiene sus secciones con los campos que hoy están en los componentes o en su
`data.ts`, más una pestaña **SEO** (título y descripción de la página).

`ajustes`: mail de contacto, WhatsApp, dirección, países, redes y las
personas de referencia. Reemplaza a `src/config/site.ts` como fuente; el
layout y los metadatos lo leen en el build.

**Regla de inventario:** todo texto o imagen visible que hoy está en un
componente o en un `data.ts` pasa a un campo con el mismo nombre en
español. No se crean campos que no existan hoy. El inventario campo por
campo se hace en el plan de cada fase.

### 5.3 Estructura fija, en el modelo

- **Listas coreografiadas:** cantidad exacta (`minRows === maxRows`): nueve
  estaciones, seis preguntas, seis áreas, y las demás que el plan releve.
  Para las listas cuya cantidad hoy varía (etapas de un perfil, evidencias
  de un caso), el rango permitido es el mínimo y el máximo que hoy existen
  en los datos.
- **Textos con largo máximo:** cada campo de texto lleva `maxLength`,
  contador y un aviso que explica el límite ("un renglón en pantalla",
  "tres renglones"). El límite se calcula del contenido actual (el valor
  más largo que hoy entra, redondeado) o de la calibración existente, como
  los anchos en `ch` de la hoja 03.
- Las opciones de los `select` son cerradas (§5.1).

### 5.4 Borradores, versiones y publicación

Todas las colecciones y páginas: borrador con autoguardado, botón
**Publicar**, historial de **20 versiones** por documento con **Restaurar**,
y **Vista previa**. Publicar dispara la regeneración de rutas (§4).

## 6. Acceso

- Login en `/admin` con mail y contraseña. "Olvidé mi contraseña" manda un
  correo por Resend con un link para elegir una nueva. No hay registro
  público: los usuarios los crea un administrador.
- **Roles:** `administrador` (todo, incluidos usuarios) y `editor`
  (crea, edita, publica y borra contenido; de usuarios solo ve y cambia su
  propio perfil y contraseña). Los dos publican.
- **Primer acceso:** Gastón crea su usuario en la pantalla inicial del
  panel y después da de alta a Raquel y Daniela con su mail. Cada una entra
  por "olvidé mi contraseña" para elegir la suya.
- Cinco intentos fallidos bloquean el usuario quince minutos.
- Todo lo del panel es privado: `/admin` y `/api` de Payload no se indexan y
  ninguna clave llega al navegador.

## 7. Infraestructura, entornos y migración

- **Vercel:** un proyecto conectado al repo, preview por PR, producción
  desde `main`. Build: `pnpm payload migrate && pnpm build`.
- **Neon:** integración nativa. Producción usa la rama principal; cada
  preview de PR recibe su rama de base automáticamente; cada desarrollador
  usa una rama propia en local. En desarrollo el esquema se sincroniza solo
  (`push`); en producción corren **migraciones commiteadas**
  (`src/cms/migraciones/`).
- **Blob:** dos stores, `ed-fotos` (producción) y `ed-fotos-dev` (local y
  previews), cada uno con su token en el entorno que corresponde.
- **Resend:** dominio verificado de ED para los correos del panel.
- **Variables:** `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`,
  `PAYLOAD_SECRET`, `VISTA_PREVIA_SECRET`, `NEXT_PUBLIC_SITE_URL`.
  Documentadas en `.env.example`; nunca commiteadas.
- **Siembra:** `scripts/sembrar-contenido.mts` lee los `data.ts` y `config`
  de hoy, sube las fotos de `public/` a Blob y crea los documentos. Es
  idempotente (salta lo que ya existe) y se corre una vez por entorno.
- **Sección por sección:** cada sección cambia su lectura a `src/contenido/`
  en su propio PR y en ese mismo PR se borra su `data.ts`. Nunca hay dos
  fuentes de verdad a la vez. Hasta que llega su turno, la sección sigue
  leyendo su archivo como hoy.

## 8. Fases (cada una en uno o varios PRs)

0. **Base:** Payload instalado, `(sitio)` y `(payload)`, `usuarios`,
   `fotos`, login, integraciones, deploy a Vercel con preview, y el
   **ADR-0003** (Neon + Payload reemplazan a Supabase). Acá se confirma que
   el build de producción y react-doctor pasan.
1. **Lo que cambia seguido:** `novedades` y `materiales` (con los destacados
   de la biblioteca en su página).
2. **Investigación y personas:** `casos`, `equipo`, `aliados`.
3. **Las siete páginas y Ajustes:** un PR por página.
4. **Cierre:** fotos restantes, guía de uso en español para Raquel, Daniela y
   Gastón (`docs/panel/guia-de-uso.md`), y actualización de AGENTS.md,
   README, `docs/README.md` y `docs/AI_GUIDELINES.md` §12.

## 9. Calidad y pruebas

- Los gates de siempre en cada PR: `pnpm typecheck`, `pnpm lint`,
  react-doctor 100/100, y `pnpm build` verde en el preview de Vercel.
- Un recorrido con Playwright contra el servidor local: entra al panel,
  edita una novedad, la publica y verifica que el sitio la muestra; después
  la restaura a la versión anterior. Se agrega a las herramientas de
  verificación del repo.
- Aceptación con Gastón en el preview de cada fase, con datos reales
  sembrados en la rama de Neon de ese PR.
- Se mantienen los estándares de contenido (§6 de AGENTS.md): lenguaje
  inclusivo y sin "alumnos" también en las etiquetas y ayudas del panel.

## 10. Riesgos

| Riesgo                                                          | Qué se hace                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Build de producción con Turbopack (issue #15429 de Payload)     | Se prueba en el primer deploy de la fase 0. Si falla, `next build --webpack` hasta que lo cierren. |
| Payload publica versiones cada semana                           | Versión fijada en el lockfile; se actualiza a propósito y todo `@payloadcms/*` junto.              |
| Lo generado por Payload baja react-doctor                       | Se mide en el PR de la fase 0; si pasa, se discute con el owner antes de seguir.                   |
| Los perfiles del equipo son el modelo más complejo (3089 líneas) | Van en la fase 2, con la estructura de cada etapa fija y los rangos de hoy.                        |
| 46 componentes cambian de fuente de datos                       | Sección por sección, un PR por vez, con el archivo viejo borrado en el mismo PR.                   |
| Un texto más largo rompe una escena                             | Límites en el modelo (§5.3), no en la buena voluntad.                                              |

## 11. Decisiones abiertas (ED)

- **Plan de Vercel:** el plan Hobby es de uso no comercial según sus
  términos; a ED le corresponde Pro. La arquitectura es la misma con
  cualquier plan.
- **Cuentas a nombre de quién:** recomendación, a nombre de ED, con los
  tres desarrolladores como miembros. El sitio y los datos son de ellas.

## 12. Fuera de alcance

Formularios (inscripción, CV), editor de texto enriquecido, más de un
idioma, comentarios, analíticas, edición de geometría o animaciones, cambios
de diseño del sitio, y aprobación previa a publicar.
