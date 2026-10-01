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

- **Fase 1, cerrada:**
  - un reinicio del VPS a propósito: SSH y el sitio vuelven solos en 2
    minutos, con los 6 contenedores, el swap, fail2ban y `live-restore`;
  - `main` deployado con el botón, y los contenedores recreados para tomar la
    rotación de logs (verificado: `max-size 10m`, `max-file 5` en los seis).
- **Las fuentes en el repo** (#220, decisión de Mateo):
  - los 6 woff2 latin con su OFL y las métricas de respaldo exactas de Google;
  - texto 0 % distinto en las 16 capturas;
  - un build sin red a Google pasa;
  - en producción, el deploy no baja nada de Google.
- **Fase 2, el acceso** (#226, ADR-0019). Un agente lo implementó en su
  worktree, y otro lo revisó por separado en dos rondas:
  - la primera pidió cambios: el chequeo de contraseñas filtradas gastaba el
    enlace de invitación o de reset;
  - la segunda aprobó, con un arreglo chico (las fotos de Blob se validan
    estrictas al guardar, no al leer).

  En producción, sin `X-Powered-By` y sin errores en la app.
- **Fase 3, Cloudflare** (#230, runbook §15). Mateo creó la cuenta y el
  token `ed-operacion` (de cuenta, sin vencimiento, solo desde las IP del VPS),
  y cambió los nameservers. Lo demás, por la API:
  - la configuración de la zona y las reglas de caché;
  - las reglas administradas del WAF y el tope de 10 POST cada 10 s a
    `/api/auth/`;
  - el túnel `ed-vps`, probado primero con un nombre de prueba (después
    borrado), y el dominio y `www` pasados a él.

  Se aplicó en el tiempo «mientras se propagan»: túnel con IP fija y puertos
  abiertos. 33 s sin sitio, al recrear la red `borde` con su subred.
  Verificado:
  - por Cloudflare (EZE) y directo al VPS, todo en 200;
  - por los dos caminos, el proxy ve la IP de quien pide.
- **Medido** (Globalping y desde Argentina):
  - desde Argentina, el primer byte del HTML pasa de ~0,9 s directo a 0,2–0,46
    s, y lo estático sale del borde (de 1,1 s a 0,17 s el JS);
  - México, 120–320 ms (DFW); Chile, ~450 ms, porque el plan gratis lo manda
    por São Paulo.

## Abierto

- **Desde el 2026-10-02 (48 h después del cambio de nameservers):** cerrar
  los puertos. `IP_PUBLICADA=127.0.0.1` y sacar `CLOUDFLARE_ESQUEMA` del
  `.env`, `docker compose up -d`, el túnel a `http://proxy:80`, y borrar del
  `ufw` el 80 y el 443 (runbook §15, «Dos tiempos»).
- Rotar el token `ed-operacion` (pasó por el chat). Es poco urgente: solo sirve
  desde las IP del VPS.
- Que Mateo sea Super Administrator de la cuenta de Cloudflare (hoy es la de
  Gastón), y 2FA en GitHub para los tres.
- El aviso por correo si el túnel se cae (el token ya puede): falta a qué
  correo.
- DNSSEC: prenderlo en Cloudflare y cargar el DS en Hostinger, con cuidado (un
  DS mal puesto deja el dominio sin resolver).
- El HTML en el borde (opción B): solo si las mediciones lo piden. Hoy el
  primer byte desde Argentina es 0,2–0,46 s.
