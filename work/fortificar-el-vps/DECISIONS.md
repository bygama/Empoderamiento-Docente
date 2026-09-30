# DECISIONS — Fortificar el VPS

## 2026-09-30 — Las cuatro de Mateo

Con el plan de las tres revisiones a la vista:

- **La fase 1 va ya**, aunque corte unos segundos: el sitio todavía no está
  lanzado.
- **Cloudflare Tunnel.** El VPS no publica puertos web y es Cloudflare el que
  entra. Resuelve de una vez tres cosas:
  - que Docker publique por encima de `ufw`;
  - un camino por IPv6 que hacía llegar a todos como la misma IP;
  - que alguien le pegue a la IP directo.

  La otra opción era dejar los puertos abiertos solo a los rangos de
  Cloudflare, con un certificado de origen y mTLS: más piezas que mantener.
- **El botón Desplegar sigue sin aprobación:** cualquiera con acceso al repo.
  Se les pide a las tres cuentas que tengan 2FA en GitHub.
- **Las fuentes van al repo** (`next/font/local`). Cambia la regla de
  `AGENTS.md` §7: el build falló 2 de 5 veces bajando fuentes de Google (un
  bug conocido de Turbopack, que no reintenta).

## 2026-09-30 — El usuario `ubuntu` se neutraliza, no se borra

La imagen cloud lo trae con sudo sin contraseña. Se le sacan el sudo, los
grupos y el shell, y queda bloqueado y vencido. No se borra porque su uid, el
1000, es el del usuario `node` de la app: `userdel` choca con los procesos
que corren con ese uid, y un número sin nombre en `docker top` confunde más
de lo que ayuda.

## 2026-09-30 — `.next` es de quien corre la app; el resto, de root

La revisión proponía un sistema de archivos de solo lectura para la app. No
se puede tal cual: Next reescribe en `.next/server` las páginas que regenera
(ISR) cuando se publica algo. El código (`server.js`, `node_modules`) queda
de root, y `.next`, del usuario `node`. Probado en el VPS: `touch server.js`
da *Permission denied*, y una ruta nueva se escribe en `.next` sin errores.

## 2026-09-30 — El log del proxy enmascara la IP

Cada pedido se anota en JSON, con la IP en /24 (IPv4) y /48 (IPv6), sin
cookies, sin `Authorization` y sin `Set-Cookie`, igual que las visitas. Rota
con Docker (10 MB × 5). Sirve para ver un ataque o un error, no para seguir
a una persona.

## 2026-09-30 — La copia de los respaldos no borra por orden del VPS

La capa 3 espejaba: borraba lo que el VPS ya no listaba. Un VPS roto o tomado
podía vaciar la copia que tiene que salvarlo. Ahora tiene su propia
retención: por fecha, 14 días como el VPS (así la retención de los CV vale
también afuera), y siempre los 7 más nuevos. La llave de solo lectura que
sugería la revisión no se hizo: esa copia vive en la misma máquina que la
llave completa, y no protegería nada.

## 2026-09-30 — `MaxAuthTries` queda en el default

Con contraseñas apagadas, cada intento es una llave ofrecida, y adivinar una
llave no es posible. Bajarlo a 3 no suma seguridad y deja afuera a quien
tenga varias llaves en su agente SSH. Contra el ruido está fail2ban.
