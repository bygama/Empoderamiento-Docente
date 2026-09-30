# PROGRESS — Fortificar el VPS

## 2026-09-30

- **Las tres revisiones**, de solo lectura, con su evidencia: el VPS, el
  acceso, y la caché con Cloudflare. El resumen de hallazgos queda fuera del
  repo, en la máquina de Mateo, hasta que cada uno esté arreglado.
- **`next` 16.3.4 → 16.3.8** por GHSA-vcvr-r3jv-pc5j (#216). Gate completo:
  typecheck, lint, react-doctor 100/100, 594 tests y build. En producción se
  verificó adentro del contenedor.
- **Fase 1, en el servidor** (`docs/deploy/vps.md` §1, «Endurecer»):
  - `ubuntu`, neutralizado;
  - root, sin claves;
  - SSH solo para `deploy`, sin reenvíos salvo el `-L` del túnel de Umami;
  - fail2ban en el SSH;
  - 4 GB de swap;
  - los parches de Docker, y el reinicio a las 05:00 UTC cuando uno lo pide;
  - `daemon.json` con logs rotados y `live-restore`.

  Después de cada cambio, `sshd -t` y una entrada nueva por SSH.
- **Fase 1, en el repo** (rama `mateo/fortificar-el-vps`):
  - `compose.yaml`: dos redes (el proxy no llega a la base); cada servicio
    sin capacidades de más, sin ganar privilegios, y con tope de memoria y de
    procesos; la base, la última que mata el sistema.
  - `deploy/Caddyfile`: el log de cada pedido con la IP enmascarada; sin
    `Server` ni `Via`; `/api/cron/*` da 404 y TRACE, 405; las `X-Vercel-*`
    del cliente no llegan a la app.
  - `Dockerfile`: el código, de root; `.next`, de `node`.
  - `desplegar.sh`: `--pull` en los dos builds.

  Probado antes del merge:
  - Caddy, en local contra un servidor que devuelve las cabeceras que
    recibe.
  - La rama, deployada en el VPS después de un respaldo a mano:
    - las páginas y el admin dan 200;
    - capacidades efectivas: 0 en `db`, `app` y `analitica`, y solo las
      anotadas en `cron`, `respaldo` y `proxy`;
    - desde el proxy, `nc db 5432` no llega, y desde la app sí;
    - el cron y el respaldo andan a mano;
    - el camino de restaurar (tar y chown) anda;
    - `touch server.js` falla y `.next` se escribe;
    - una ruta ISR nueva y una imagen nueva salen sin errores;
    - el log sale con la IP en /24.

  El primer intento de deploy falló por las fuentes de Google (la fase 4 lo
  saca), con un efecto que vale anotar: la base ya estaba en la red nueva y la
  app vieja en la otra, así que lo dinámico quedó cortado hasta el segundo
  intento, un par de minutos después.
- **La capa 3 de los respaldos**, rehecha: retención propia por fecha, nunca
  por lo que liste el VPS, y copia de nuevo si una fecha cambió en el VPS.
  Probada con carpetas viejas falsas.

## Abierto

- La fase 1 termina con un reinicio del VPS, para probar que todo vuelve
  solo, y con recrear los contenedores para que tomen la rotación de logs.
- Fase 2 (el acceso) y las fuentes: dos agentes en sus worktrees.
- Fase 3: la cuenta de Cloudflare y el token de Mateo.
- Pedirles 2FA en GitHub a Gastón y a querque.
