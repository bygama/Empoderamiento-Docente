# SPEC — Fortificar el VPS

## 1. Qué se quiere

Que el sitio en producción (`empoderamientodocente.org`, el VPS de Hostinger
desde el 2026-09-30) quede **endurecido de punta a punta** antes del
lanzamiento: el servidor, los contenedores, el acceso al admin y el camino
de cada pedido, con Cloudflare adelante. Y después, que sea rápido desde los
países de ED, medido.

Lo pidió Mateo el 2026-09-30: «un trabajo de seguridad en cuanto a puertos,
revisar bien cómo está el login, fortificar el VPS, que sería el objetivo
final», y ver la caché «y si hay que optimizar, lo haremos».

## 2. De dónde sale

Tres revisiones de solo lectura, el 2026-09-30, cada una con su evidencia:

- **El VPS:** puertos, SSH, Docker, firewall, contenedores, TLS, cabeceras,
  parches, logs y disco.
- **El acceso:** contraseñas, bloqueo, segundo factor, sesiones, roles,
  archivos, dependencias.
- **La caché y Cloudflare:** qué se cachea hoy en cada tipo de ruta, la
  configuración de Cloudflare y las opciones para el HTML.

Ninguna encontró un hallazgo crítico propio del código. El único crítico fue
de una dependencia: `next` 16.3.4, dentro de GHSA-vcvr-r3jv-pc5j (RCE en
`next/og`), publicado ese mismo día. Se arregló antes que nada (#216).

**El repo es público.** Esta lane describe lo que ya se arregló. Lo que
todavía está abierto se nombra en general hasta que su arreglo esté en
`main`.

## 3. Las cuatro fases

1. **El servidor y los contenedores** — sin depender de Cloudflare.
2. **El acceso al admin** — los arreglos de la revisión del login, con test.
3. **Cloudflare** — con Cloudflare Tunnel: el VPS deja de publicar puertos web.
   Además, la IP real, la configuración y la caché de lo estático, sin HTML
   en el borde.
4. **Medir y optimizar** — antes y después desde Argentina, Chile y México.
   Además, las fuentes en el repo, para que el build no dependa de Google.

## 4. Lo que queda afuera

- El HTML en el borde (opción B de la revisión de la caché): se vuelve a
  mirar solo si las mediciones de la fase 4 lo piden.
- Resend: lo configura Mateo cuando tenga la cuenta.
- La CSP del sitio público con `unsafe-inline`: se evalúa aparte, porque las
  páginas prerenderizadas no llevan nonce.
