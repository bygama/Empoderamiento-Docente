# 404 y pasada transversal · plan de implementación (fase 6)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** cerrar el lane: 404 afinada en 320, rotación sin recarga en cada escena nueva, movimiento reducido en todo, safe-area, diff final sin clases `md:`/`lg:` alteradas, y la verificación completa de la fase 3 del brief.

**Spec:** `work/mobile-tablet-secciones-restantes/AUDITORIA.md` §4 (E1), §5–7 y el brief (fase 3: viewports 320/360/375/390/414/430, 768/820/1024 en vertical y horizontal, 1280/1440/1920).

## Global Constraints
Las de los planes 1–5. Nadie commitea.

### Task 1: 404
- [ ] `apps/sitio/src/app/(sitio)/not-found.tsx`: contenedor principal `max-md:pt-28 max-md:gap-y-4`; links de la grilla `max-lg:min-h-12`. Verificar con `qa-base` en 320×568 y 390×844 que no haya recortes ni targets < 44 px. Commit propuesto: `design(404): aire bajo el header y targets táctiles en celular`.

### Task 2: rotación y redimensionado sin recarga
- [ ] Script `C:\Users\gasto\AppData\Local\Temp\edqa\restantes\pw\qa-rotacion.mjs`: por cada ruta incluida, abrir en 390×844, scrollear a mitad de cada escena nueva (`[data-modo]`), `page.setViewportSize({ width: 844, height: 390 })`, esperar 1200 ms, comprobar: `document.documentElement.scrollWidth === innerWidth`, cantidad de `ScrollTrigger.getAll()` (exponer con `window.__st = ScrollTrigger.getAll().length` vía `page.evaluate(() => (window as any).gsap?…)` — si GSAP no está en window, contar `[data-modo]` y verificar que cada zona tenga el modo esperado para el nuevo ancho/alto) y sin errores de consola; volver a 390×844 y repetir. Cada escena decide su modo en un efecto que depende de `reduced`: para que responda a la rotación sin recarga, cada `useIsomorphicLayoutEffect` de modo debe suscribirse a los `matchMedia` que usa (`mq.addEventListener("change", decidir)`) y limpiar. Aplicarlo en: `PuenteInvestigacion`, `EdEnMovimiento`, `OrigenEd`, `MiradaEd` (modoMovil), `LineasInvestigacion`, `CierreInvestigacion`, `HistoriaMovil`, y en Contacto (`esMovil` se lee en cada llamada: nada que hacer). Commit propuesto: `fix(movil): las escenas re-deciden su modo al rotar el dispositivo`.

### Task 3: movimiento reducido y safe-area
- [ ] `qa-base` con `REDUCIDO=1` en 390×844t para las 7 rutas incluidas: ningún `[data-modo]` en `movil`/`vivo`; sin escenas sticky con pista; sin errores. Revisar `env(safe-area-inset-bottom)` en: hoja de filtros (Biblioteca), expediente (pista y volver), perfil (Quiénes somos), barra de guía (Novedades). Ajustes puntuales si faltan.

### Task 4: diff final y verificación
- [ ] `git diff -U0 -- apps/sitio/src | grep -E '^-' | grep -vE '^---' | grep -E '(^|[^a-z-])(md|lg|sm|xl):'` debe listar solo líneas cuyo reemplazo conserva las mismas clases (revisar una por una y anotar en el informe).
- [ ] Ningún archivo bajo `features/home`, `features/que-hacemos`, `app/(sitio)/page.tsx`, `app/(sitio)/que-hacemos`, `components/`, `lib/`, `config/`, `globals.css` en `git status`.
- [ ] Gate completo + `pnpm build`.
- [ ] Fase 3 del brief: `qa-base` de las 7 rutas incluidas en 320×568t, 360×800t, 375×812t, 390×844t, 414×896t, 430×932t, 768×1024t, 1024×768t, 820×1180t, 1180×820t, 1024×1366t, 1366×1024t; y de las 9 rutas en 1280×800, 1440×900, 1920×1080 → `comparar` contra `base/` (incluidas: `pasosDist=0`, `geoIgual=true`; protegidas contra `base-limpia/`).
- [ ] `verification-before-completion` y `requesting-code-review` (revisión de rama completa) → correcciones → informe final con todo lo que pide el brief.
- [ ] Normalizar CRLF en todos los archivos tocados (`for f in $(git status --short -- apps/sitio/src | awk '{print $2}'); do sed -i 's/\r*$/\r/' "$f"; done`) antes del gate final: las ediciones de los agentes dejan LF.
