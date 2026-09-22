# SPEC — El armazón del admin: la sidebar y el login con la marca

- **Fecha:** 2026-09-22
- **Estado:** diseño aprobado por el owner en conversación (shaping, secciones
  1 y 2); este SPEC espera su OK antes del PLAN
- **Decide:** Mateo
- **Tier:** M · rama `mateo/armazon-del-admin`, en el checkout principal
  (ningún criterio de aislamiento se cumple: nadie más usa este checkout y
  cada paso se deshace con un cambio de rama)
- **Lane 1 de 2.** La lane 2, `seguridad-del-acceso` (mails, bloqueo por
  cuenta, cookies, Argon2id, CSP con nonce), se abre cuando esta cierre.

---

## 1. Qué se quiere

Que el admin se vea y se recorra como algo de Empoderamiento Docente: una
**sidebar** con lo del admin arriba y el **árbol del sitio** abajo, y un
**login con la marca**. Todo con los tokens de `DESIGN.md`, accesible con
teclado y lector de pantalla, y usable desde el celular.

## 2. La sidebar

**Estructura.** El layout protegido (`app/(admin)/admin/(protegido)/layout.tsx`)
pasa a ser el armazón: sidebar fija a la izquierda (`w-72`) y el contenido a
la derecha sobre `gris-fondo`. La barra de arriba de hoy (nombre · rol ·
Salir) se muda al pie de la sidebar.

**Cómo se ve.**
- Fondo `azul-principal` y logo ED en negativo (`public/brand/`) arriba, que
  lleva a `/admin`.
- Texto blanco y `azul-claro` (7,68:1 sobre el azul).
- El ítem activo lleva fondo blanco al 10 %, una barra `azul-claro` a la
  izquierda y `aria-current="page"`.
- **Ni naranja ni verde en la sidebar.** El naranja es el CTA de cada
  pantalla; el verde, los conceptos.

**Qué muestra.**
1. **Inicio**: la portada con las métricas, en `/admin`.
2. **Sitio**: las siete páginas en el orden del registro
   (`contenido/paginas.ts`), que es el orden del menú público.
   - Cada página es un `<details>` nativo. La página de la ruta actual se
     abre sola.
   - Adentro van sus **secciones registradas**, con link a
     `/admin/paginas/<slug>#seccion-<clave>`. Para eso, `Seccion.tsx` suma
     ese `id` y un `scroll-margin`.
   - Una página sin secciones se ve atenuada, con «Todavía no se edita» y
     sin link.
   - Las páginas con cambios sin publicar llevan un punto, con texto para
     lectores de pantalla y no solo color. El dato es el `sinPublicar` de
     `listaDePaginas()`.
3. **Pie**: nombre, rol y «Salir».

El árbol sale **solo del registro**, sin una segunda lista para mantener. La
sección que la fase B registre aparece sola.

**Datos.** El layout lee el registro, que es código, y `listaDePaginas()`,
que es una consulta. Si la consulta falla, la sidebar se arma igual desde el
registro, sin los puntos, y deja el error en el log. Nunca voltea el admin.

**En el celular (menos de `lg`).**
- Una barra arriba con el logo y un botón «Menú» (`aria-expanded`,
  `aria-controls`).
- La sidebar se abre como un panel sobre el contenido:
  - el foco entra al panel y se queda adentro con Tab;
  - se cierra con Escape, con el fondo o al navegar, y el foco vuelve al
    botón;
  - el scroll de atrás queda bloqueado;
  - con `prefers-reduced-motion`, no hay animación.

**Código.**
- El compositor es `admin/armazon/BarraLateral.tsx` y sus piezas van en
  `admin/armazon/barra-lateral/` (AI_GUIDELINES §2).
- Solo el panel móvil lleva `"use client"`; el resto son Server Components.
- Cada archivo tiene 200 líneas o menos.
- La pantalla «Páginas» (`/admin/paginas`) se queda como vista general,
  porque muestra las fechas de publicación.

## 3. El login con la marca

Vale para las tres pantallas de acceso (entrar, olvidé y nueva contraseña),
que comparten `admin/armazon/Pantalla.tsx`.

**Pantalla partida.**
- **Izquierda (desde `lg`):** un panel `azul-principal` con:
  - el logo ED en negativo y «Admin del sitio»;
  - el patrón de la marca (`DESIGN.md` §6): la grilla de puntos blanca al
    12 % y **una sola** forma plana `azul-medio` que sale del borde de
    abajo. Es decorativo (`aria-hidden`).
- **Derecha:** el formulario sobre blanco (`max-w-sm`), con el título en
  Manrope Bold y la bajada en `gris-texto`.
- **Celular:** el panel azul queda como una franja arriba, con el logo chico
  y sin el patrón grande.

**El CTA.**
- «Entrar», «Mandarme el enlace» y «Guardar» son el único naranja de cada
  pantalla: **fondo `naranja-accion` con texto `azul-principal`, 4,54:1**
  (AA).
- Blanco sobre ese naranja da 3,00:1 y no pasa.
- Esto cambia la regla de `DESIGN.md` §7 («Texto: blanco»), así que
  **`DESIGN.md` se edita primero** (AGENTS.md §5.2), con el OK que el owner
  dio al aprobar el diseño.

**Formularios.**
- Foco visible en `azul-medio`.
- Los errores van con `role="alert"`, y el campo afectado con `aria-invalid`
  y `aria-describedby`.
- **Mostrar u ocultar la contraseña** con un botón con ojo (`aria-pressed`,
  «Mostrar contraseña»). Los íconos del ojo se suman al set propio
  (`components/ui/icons/`), con el estilo de `DESIGN.md` §5.
- «Nueva contraseña» lleva `minLength={12}` y la ayuda «Doce caracteres o
  más», atada al campo con `aria-describedby`.
- Los `autocomplete` de hoy, que están bien, se mantienen.
- Cada pantalla tiene su `<title>`: «Entrar · Admin ED», «Olvidé mi
  contraseña · Admin ED» y «Nueva contraseña · Admin ED».
- Los primitivos siguen en `admin/armazon/Campos.tsx` (`Campo`, `Boton`,
  `Aviso`), restilados.

## 4. Definición de terminado

- La sidebar y el login se ven y se comportan como dicen §2 y §3, y el
  editor de páginas sigue funcionando igual adentro del armazón nuevo.
- **Comprobado en el navegador de Orca:**
  - en escritorio y en el ancho de un celular;
  - el panel móvil con teclado: el foco entra, queda adentro, sale con
    Escape y vuelve al botón;
  - los links de sección llevan al bloque del editor;
  - el punto «sin publicar» aparece después de guardar un borrador;
  - el login entra, y los tres CTAs se ven como pide §3.
- El contraste de cada combinación nueva se mide con la fórmula de WCAG y
  pasa AA.
- `pnpm typecheck`, `pnpm lint`, `pnpm react-doctor` (100/100 sin
  diagnósticos), `pnpm test` y `pnpm build` en verde.
- Revisión de cierre hecha y sus hallazgos resueltos o anotados.

## 5. Fuera de alcance

- La seguridad del acceso (mails, bloqueo, cookies, Argon2id, nonce): es la
  lane 2.
- El contraste de los tres CTAs del sitio (`ButtonPrimary`, `Header` y
  `PieMenu`, con blanco sobre naranja a 3,00:1): se anota para un cambio
  aparte.
- Las entidades de la fase 2 en la sidebar: se suman cuando existan.
- El choque entre guardar y una publicación ajena (`editar-paginas.ts:38`).
- Dependencias nuevas.
