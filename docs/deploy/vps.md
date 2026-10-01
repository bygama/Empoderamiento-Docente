# Deploy en un VPS de Hostinger (Docker Compose)

Del VPS vacío al sitio andando, y después el día a día. El porqué de cada pieza
está en el [ADR-0018](../architecture/adrs/0018-deploy-en-vercel-o-en-un-vps.md);
el otro camino, en [`vercel.md`](vercel.md). El código es el mismo: lo que
cambia son las variables.

> **La única entrada es `scripts/desplegar.sh`.** `docker compose up` a secas
> no arranca desde cero: el sitio se prerenderiza leyendo la base, así que la
> imagen `app` recién existe cuando el servicio `construir` corrió `next build`
> adentro del compose, con la base. El script hace todo en orden y se puede
> correr las veces que haga falta.

En el VPS se usa todo lo del VPS: la base, las fotos, los CV, las visitas
(Umami) y los respaldos viven ahí. Lo único de afuera es Resend, para los
correos (y Search Console, que es de Google).

## Producción hoy

Desde el 2026-09-30, `empoderamientodocente.org` corre acá (antes, en Vercel).

| | |
| --- | --- |
| **Servidor** | Hostinger KVM 2, Ubuntu 24.04, `2.24.68.136` |
| **DNS** | en **Cloudflare** (el dominio sigue registrado en Hostinger, con los nameservers de Cloudflare): el dominio y `www` entran por el túnel (§15). Los MX, el SPF, el DMARC, los `hostingermail-*._domainkey`, `autoconfig` y `autodiscover` son del correo de Hostinger: van en gris y no se tocan |
| **Entrar** | `ssh deploy@2.24.68.136`, con una llave por persona (§13). Root y las contraseñas están cerrados por SSH |
| **Deployar** | el botón de GitHub (§14), o por SSH `cd ~/ed && git pull && scripts/desplegar.sh` |
| **Los secretos** | el `.env` del servidor, y su copia, la clave de sudo de `deploy`, la de root y la de admin de Umami, en la máquina de Mateo. Nunca en el repo ni en un chat |
| **La copia de los respaldos** (capa 3, §8) | todos los días, en la máquina de Mateo |

## Qué corre

| Servicio | Qué es | Puertos |
| --- | --- | --- |
| `proxy` | Caddy: TLS automático con Let's Encrypt, `/umami/script.js` y `/umami/api/send` a Umami, todo lo demás a la app | **80 y 443, los únicos publicados** |
| `app` | el sitio y el admin (`node server.js` del standalone) | ninguno |
| `db` | Postgres 17 con las bases `ed` y `umami`, cada una con su usuario | ninguno |
| `analitica` | Umami 3.4.0 | ninguno |
| `cron` | todos los días a las 04:00 UTC llama a `/api/cron/diario` | ninguno |
| `respaldo` | todos los días a las 03:30 UTC respalda las dos bases, las fotos y los CV | ninguno |
| `migrar` | `prisma migrate deploy`, y termina | — |
| `construir` | `next build` con la base, para la imagen `app` (lo corre `desplegar.sh`) | — |
| `herramientas` | los comandos de `apps/sitio/scripts/` con el entorno de la app | — |

## Qué VPS

Medido en local (`docker stats`, 2026-09-27):

- **El compose en marcha usa unos 350 MB** (la app ~115, Umami ~145, Postgres
  ~55, Caddy ~12).
- **El build (`construir`) llega a unos 5 GB** en el pico, y casi no baja con
  menos CPUs (con 2, el mismo pico: lo pesado es Turbopack). Con un tope de
  3 GB lo mata el sistema.

Por eso:

- **KVM 2** (2 vCPU, 8 GB, 100 GB NVMe) alcanza sin nada más. Es el
  recomendado.
- **KVM 1** (1 vCPU, 4 GB, 50 GB) anda **con 4 GB de swap**, y el build tarda
  más. Crear la swap, una vez:

  ```sh
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  free -h   # tiene que decir Swap: 4.0Gi
  ```

## 1. El servidor

En el panel de Hostinger, el VPS con **Ubuntu 24.04 LTS**; su IP es la
`<IP del VPS>` de los comandos. Los ejemplos usan una clave SSH llamada `ed-vps`
(`~/.ssh/ed-vps` y `~/.ssh/ed-vps.pub`); si no la tenés, `ssh-keygen -t
ed25519 -f ~/.ssh/ed-vps`.

**Tu clave pública en el root**, una sola vez. O por el panel de Hostinger (la
sección de claves SSH del VPS: pegás el contenido de `ed-vps.pub`), o desde tu
máquina con la contraseña de root que eligiste al crear el VPS, la primera y
última vez que se usa:

```sh
# Linux, macOS o Git Bash
ssh-copy-id -i ~/.ssh/ed-vps.pub root@<IP del VPS>
# PowerShell (Windows no trae ssh-copy-id)
type $env:USERPROFILE\.ssh\ed-vps.pub | ssh root@<IP del VPS> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

`ssh -i ~/.ssh/ed-vps root@<IP del VPS>` tiene que entrar sin pedir la contraseña.
Adentro, como root:

```sh
# Un usuario sin root, con sudo (adduser te pide su contraseña: es la de sudo),
# y la misma clave
adduser deploy && usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

> **No cierres esa sesión hasta el final de este paso.** Si algo de abajo sale
> mal, es tu única puerta: con la contraseña apagada y sin la clave, quedás
> afuera y solo queda la consola del panel de Hostinger.

**En otra terminal**, comprobá que `ssh -i ~/.ssh/ed-vps deploy@<IP del VPS>` entra sin
contraseña y que `sudo -v` acepta la de `deploy`. Recién entonces, en la
sesión de root que quedó abierta, cerrá el root y las contraseñas.

Ubuntu lee primero `/etc/ssh/sshd_config.d/*.conf` (el `Include` está arriba de
`sshd_config`), y en SSH **gana el primer valor que se lee**. En las imágenes
cloud, `50-cloud-init.conf` suele traer `PasswordAuthentication yes`, así que
cambiar solo `sshd_config` no alcanza (probado en Ubuntu 24.04: con
`PasswordAuthentication no` en `sshd_config` y ese archivo, `sshd -T` dice
`yes`). Por eso va un archivo propio que se lee antes que todos:

```sh
# Lo que hay hoy, en todos los archivos (sin los comentarios)
grep -RiE "^\s*(passwordauthentication|permitrootlogin)" /etc/ssh/sshd_config /etc/ssh/sshd_config.d/
# El nuestro, que se lee primero; y el de cloud-init, que no contradiga
printf 'PermitRootLogin no\nPasswordAuthentication no\nKbdInteractiveAuthentication no\n' > /etc/ssh/sshd_config.d/00-ed.conf
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config.d/*.conf
sshd -t && systemctl restart ssh
# La configuración que de verdad rige
sshd -T | grep -Ei "passwordauthentication|permitrootlogin"
```

La última línea tiene que decir exactamente esto (si dice `yes`, algún archivo
de `sshd_config.d/` lo sigue pisando: volvé al `grep`):

```
permitrootlogin no
passwordauthentication no
```

Y otra vez **en otra terminal**, con la sesión de root todavía abierta: `ssh -i
~/.ssh/ed-vps deploy@<IP del VPS>` entra; `ssh root@<IP del VPS>` y `ssh -o
PubkeyAuthentication=no deploy@<IP del VPS>` contestan `Permission denied
(publickey)`. Recién ahí cerrá la sesión de root. De acá en más, todo como
`deploy`.

El firewall deja pasar SSH y la web, nada más:

```sh
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 443/udp
sudo ufw enable && sudo ufw status
```

> Docker publica sus puertos por encima de `ufw`: un puerto publicado queda
> abierto aunque `ufw` diga que no. Por eso en el compose **solo `proxy`
> publica** (80 y 443). No agregues `ports:` a otro servicio.

Actualizaciones de seguridad solas: `sudo apt update && sudo apt upgrade -y &&
sudo apt install -y unattended-upgrades`.

Docker Engine, con su repositorio oficial
([docs.docker.com/engine/install/ubuntu](https://docs.docker.com/engine/install/ubuntu/)):

```sh
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker deploy   # y volvé a entrar por SSH
```

### Endurecer

Lo que se le hizo al de producción el 2026-09-30, después de una auditoría.
Cada bloque es independiente; todo con `sudo`.

**Nadie más que `deploy`.** La imagen cloud trae un usuario `ubuntu` con sudo
sin contraseña: se le saca todo (no se borra: su uid, el 1000, es el `node` de
la app, y queda más claro que un número suelto). Y el root, sin claves:

```sh
rm -f /etc/sudoers.d/90-cloud-init-users
for g in sudo adm lxd cdrom dip; do gpasswd -d ubuntu "$g"; done
usermod -s /usr/sbin/nologin -L -e 1 ubuntu && visudo -c
: > /root/.ssh/authorized_keys
sed -i 's/^\s*PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
```

**SSH, lo justo.** El `00-ed.conf` completo (reemplaza al de arriba):

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
AllowUsers deploy
X11Forwarding no
AllowAgentForwarding no
# El túnel al panel de Umami (§5) usa -L; nada más.
AllowTcpForwarding local
PermitTunnel no
LoginGraceTime 30
```

`sshd -t && systemctl reload ssh`, y probá entrar desde otra terminal antes de
cerrar la que tenés.

**fail2ban** para el SSH (`apt install -y fail2ban`), en
`/etc/fail2ban/jail.d/ed.conf`: `[sshd]` con `enabled = true`,
`backend = systemd`, `maxretry = 5`, `findtime = 10m` y `bantime = 1h`. Qué
bloqueó: `fail2ban-client status sshd`. Si te bloqueó a vos (tu IP, una hora):
`fail2ban-client set sshd unbanip <tu IP>` desde la consola del panel.

**4 GB de swap**, en cualquier plan: con la memoria justa, un pico del build o
una fuga no terminan en el sistema matando procesos.

```sh
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' > /etc/sysctl.d/60-ed-swap.conf && sysctl -p /etc/sysctl.d/60-ed-swap.conf
```

**Los parches, solos, y el reinicio cuando lo piden.** En
`/etc/apt/apt.conf.d/52unattended-ed`: los de Docker también, y el reinicio a
las **05:00 UTC** cuando un parche lo pide (el kernel), después del respaldo
(03:30) y del cron (04:00):

```
Unattended-Upgrade::Origins-Pattern {
        "origin=Docker,archive=${distro_codename},label=Docker CE";
};
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
Unattended-Upgrade::Automatic-Reboot-Time "05:00";
```

**Docker**, en `/etc/docker/daemon.json`: los logs rotan (10 MB × 5 por
contenedor) y `live-restore` deja los contenedores andando mientras Docker se
actualiza o se reinicia.

```json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" },
  "live-restore": true
}
```

Los logs rigen para los contenedores que se crean después de reiniciar Docker:
`systemctl restart docker` y `docker compose up -d --force-recreate` (unos
segundos sin sitio).

Lo demás está en el repo: dos redes (el proxy no llega a la base), y cada
servicio sin más capacidades que las que usa, sin ganar privilegios y con tope
de memoria y de procesos (`compose.yaml`); el código de la app es de root
(`Dockerfile`); y el proxy anota cada pedido con la IP enmascarada, no dice qué
servidor es y cierra `/api/cron` y TRACE (`deploy/Caddyfile`).

## 2. El DNS

Antes del primer deploy, para que Let's Encrypt pueda emitir el certificado:

- **El dominio:** un registro `A` (y `AAAA`, si el VPS tiene IPv6) del dominio
  a la IP del VPS, y `www` como CNAME al dominio. Caddy atiende el `DOMINIO`
  del `.env` y redirige `www.` a él, con su propio certificado.
- **Resend** (los correos): sumá el dominio en Resend y cargá en el DNS los
  registros que te da: **SPF** (TXT), **DKIM** (TXT o CNAME) y el MX del
  retorno. Sumá **DMARC**: un TXT en `_dmarc` con `v=DMARC1; p=none;
  rua=mailto:<un correo tuyo>`. En la configuración del dominio en Resend,
  **apagá el click tracking** (y el open tracking): reescribe los enlaces de
  los correos, y el de la contraseña tiene que llegar tal cual.
- **Search Console:** la propiedad de dominio se verifica con un TXT; la
  cuenta de servicio y sus tres variables están en el README
  («Variables de entorno»).

## 3. El código y las variables

```sh
git clone https://github.com/bygama/Empoderamiento-Docente.git ~/ed && cd ~/ed
cp .env.example .env && chmod 600 .env
```

Completá el `.env` (cada variable está explicada en `.env.example`). Las
claves de la base, en hexadecimal (`openssl rand -hex 24`), porque viajan
adentro de una URL; los secretos, con `openssl rand -base64 32`;
`DUENO_DE_RESPALDOS` con `$(id -u):$(id -g)` del usuario `deploy`. La clave
privada de Search Console va entre comillas dobles, con los `\n` como en el
JSON. **El `.env` nunca se commitea** (`.gitignore` lo deja afuera).

## 4. El primer deploy

```sh
scripts/desplegar.sh
```

Construye la imagen fuente, levanta la base, migra, corre el build con la
base, arma la imagen `app` con el commit como etiqueta y levanta todo. Necesita
internet (npm y las imágenes de Docker; las fuentes viven en el repo, así que
el build no baja nada de Google). Al final dice `Listo: https://<dominio> corre
<commit>`.

## 5. Umami

Su panel no sale a internet: se usa por un túnel. En el VPS, un Umami de un
rato, publicado solo en el loopback:

```sh
docker compose run --rm -d --name ed-panel-umami -p 127.0.0.1:3001:3000 analitica
```

Y en tu máquina: `ssh -L 3001:127.0.0.1:3001 deploy@<IP del VPS>`, y abrí
`http://localhost:3001`.

1. Entrá con `admin` / `umami` y **cambiá la contraseña** en el acto.
2. Settings › Websites › Add: el nombre y el dominio. Copiá su **Website ID**.
3. Settings › API keys: creá una. Copiá la **key** (se muestra una sola vez).
4. Ponelas en el `.env` (`UMAMI_WEBSITE_ID`, `UMAMI_API_KEY`) y corré
   `scripts/desplegar.sh` otra vez: el script de Umami va en el HTML
   prerenderizado, así que hace falta un build.
5. `docker stop ed-panel-umami`.

## 6. La primera cuenta y quien dirige

No hay registro público: las cuentas entran por un comando.

1. **Primero, un correo de prueba.** Date de alta a vos:
   `docker compose run --rm herramientas pnpm --filter sitio crear-cuenta <tu correo> "<tu nombre>" administra`.
   Entrá a `https://<dominio>/admin/olvide-mi-contrasena` con ese correo. **Si
   el correo no llega, pará acá** y revisá Resend (y Ajustes › Conexiones, más
   adelante): sin correos, nadie que dirige o administra puede entrar, porque el
   código del segundo factor llega por correo.
2. Elegí la contraseña, entrá con el código.
3. **Quien dirige:** si todavía no tiene cuenta,
   `docker compose run --rm herramientas pnpm --filter sitio crear-cuenta <correo> "<nombre>" dirige`;
   si ya la tiene, `… nombrar-direccion <correo>`. De ahí en más, las cuentas
   se manejan desde Cuentas.

## 7. El día a día

| Qué | Cómo |
| --- | --- |
| Deployar una versión nueva | el botón de GitHub (§14), o `git pull && scripts/desplegar.sh` (el sitio deja de contestar unos segundos, cuando se cambia el contenedor: ver «Corte»). Uno a la vez: si ya hay otro corriendo, el segundo frena y lo dice |
| Dar o sacar acceso | §13 |
| Ver qué corre | `docker compose ps` |
| El log de la app | `docker compose logs -f app` (o `proxy`, `analitica`…) |
| El cron | `docker compose logs --since 48h cron`; a mano, `docker compose exec cron node /etc/ed-cron/correr.mjs` |
| Los respaldos | `docker compose logs --since 48h respaldo`; a mano, `docker compose exec respaldo sh /respaldo/respaldar.sh` |
| Volver a la versión anterior | `scripts/volver.sh` lista las 5 que hay; `scripts/volver.sh <commit>` la pone a correr |
| Restaurar un respaldo | `scripts/restaurar.sh` lista los que hay; `scripts/restaurar.sh <AAAA-MM-DD>` (pide confirmación, y termina con un deploy: §8) |
| Un comando de `scripts/` | `docker compose run --rm herramientas pnpm --filter sitio <comando>` |

**Corte.** Medido en local: durante un `desplegar.sh`, el sitio deja de
contestar **unos 5 segundos** (5,3 s entre la última respuesta buena y la siguiente), mientras el contenedor `app` se cambia por el nuevo. El
build corre antes, con el sitio viejo andando.

**Volver atrás y las migraciones.** Una migración aplicada no se revierte.
Volver a una imagen anterior a una migración deja código viejo sobre el esquema
nuevo: es seguro si la migración solo agregó (tablas, columnas con valor por
defecto) y no lo es si renombró o borró algo que el código viejo usa. En ese
caso, lo que corresponde es un arreglo nuevo hacia adelante, o restaurar el
respaldo de antes de la migración (perdiendo lo que pasó después).

## 8. Los respaldos, en tres capas

Un respaldo que vive en el mismo disco que los datos no es un respaldo. Cada
capa cubre algo distinto:

1. **El diario, en `~/ed/respaldos/`** (servicio `respaldo`, 03:30 UTC, los
   últimos `DIAS_DE_RESPALDO`, 14 por defecto): las dos bases (`pg_dump`), las
   fotos y los CV. **Cubre** un error de la app, un borrado, una migración que
   salió mal. **No cubre** perder el disco o el VPS. Se restaura con
   `scripts/restaurar.sh <fecha>`, con el compose andando o bajado: levanta la
   base si no corre, la restaura con las fotos y los CV, y termina con un
   `desplegar.sh`, que migra si el respaldo es de antes de una migración y
   vuelve a armar las páginas del sitio con la base restaurada (se
   prerenderizan leyéndola). Probado desde volúmenes vacíos: base, fotos, CV,
   Umami y hasta las sesiones vuelven. Los CV respaldados siguen la retención
   de los CV: uno que la retención borró desaparece de los respaldos a los 14
   días.
2. **Los de Hostinger.** Todos los planes KVM traen un **backup semanal
   automático, gratis**, guardado fuera del servidor; se guardan dos semanales
   (y dos diarios, si se paga el backup diario). Además, **un snapshot manual**:
   uno solo, **vence al día** y se borra si se reinstala el sistema o se
   restaura un backup; sacalo antes de algo riesgoso (actualizar Ubuntu, tocar
   Docker). Se manejan en VPS › Manage › Backups & Monitoring › Snapshots &
   Backups, y **restaurar pisa el VPS entero** (fuente: [la ayuda de
   Hostinger](https://www.hostinger.com/support/1583232-how-to-back-up-or-restore-a-vps-at-hostinger/),
   actualizada el 2026-09-15). **Cubre** perder el VPS, con hasta una semana de
   atraso.
3. **Una copia fuera del VPS.** Desde tu máquina (o cualquier otra), al menos
   **una vez por semana**, y mejor todos los días:

   ```sh
   rsync -az deploy@<IP del VPS>:ed/respaldos/ ~/respaldos-ed/
   ```

   (`scp -r deploy@<IP del VPS>:ed/respaldos ~/respaldos-ed` si no hay `rsync`.)
   **Sin `--delete`:** la copia de afuera borra por su cuenta, por fecha (los
   de más de 14 días, como el VPS, así la retención de los CV vale también
   afuera), y guarda siempre los 7 más nuevos aunque el VPS deje de mandar. Si
   borrara lo que el VPS ya no lista, un VPS roto o tomado vaciaría también la
   copia que tiene que salvarlo. En la máquina de Mateo lo hace una tarea
   programada de Windows, todos los días a las 12:00, que además vuelve a
   copiar una fecha si su tamaño cambió en el VPS (un respaldo a mano del mismo
   día).
   **Cubre** perder el VPS y la cuenta de Hostinger. Los respaldos llevan CV y
   datos de contacto: van a un disco cifrado, y nunca a un lugar compartido.
   Guardá también **una copia del `.env`** fuera del VPS (en un gestor de
   contraseñas): no va en los respaldos, y trae la API key de Umami, que no se
   puede volver a leer.

### Restaurar en un VPS nuevo, desde la copia de afuera

Si se perdió el VPS (o se muda a otro), con la capa 3:

1. **El servidor y el DNS**, como la primera vez: §1 y §2, con el dominio
   apuntando a la IP nueva.
2. **El código y las variables:** `git clone` como en §3, y el `.env` de la
   copia (`scp .env deploy@<IP del VPS>:ed/.env`, y `chmod 600 .env`). Si no hay copia,
   uno nuevo desde `.env.example`: las claves y los secretos pueden ser otros
   (las sesiones abiertas se cierran y hay que volver a entrar), pero
   `UMAMI_API_KEY` hay que crearla de nuevo en el panel de Umami después (§5,
   pasos 3 y 4; el sitio de Umami y su `UMAMI_WEBSITE_ID` vuelven con la base).
3. **El respaldo:** la carpeta de la fecha, a `respaldos/` del clon:

   ```sh
   rsync -az ~/respaldos-ed/<AAAA-MM-DD> deploy@<IP del VPS>:ed/respaldos/
   ```

4. **`scripts/restaurar.sh <AAAA-MM-DD>`**, en el VPS. Sin nada corriendo y sin
   imagen del sitio, levanta la base (vacía, con sus dos usuarios), restaura
   las dos bases, las fotos y los CV, y corre el primer deploy con esa base.
   Termina en `Listo: https://<dominio> corre <commit>`. Probado en local así,
   sin volúmenes ni imagen del sitio: la foto con los mismos bytes, el CV, las
   novedades y las visitas de Umami.
5. El **recorrido final** (§12).

## 9. El disco

Hoy (medido en local): las dos bases, unos 20 MB; las fotos subidas, lo que
se suba (hasta 4 MB cada una; las del sitio viajan en la imagen); un respaldo
diario, unos 200 KB más el tamaño de las fotos y los CV, así que 14 días son
14 veces eso. Lo que más ocupa es Docker: la imagen fuente (~1,5 GB), Umami
(~1,5 GB), Postgres (~0,4 GB), las 5 imágenes `app` (~0,4 GB cada una, con
capas compartidas) y la caché del build (~2,5 GB). La caché de next/image
(el volumen `imagenes`), decenas de KB por imagen y tamaño: sobrevive al deploy,
y `desplegar.sh` la vacía cuando cambia `public/` (a mano:
`docker compose exec app sh -c 'rm -rf .next/cache/images/*'`). En total,
menos de 10 GB: los 50 GB de un KVM 1 alcanzan de sobra.

Cómo mirar: `df -h /` (el disco), `docker system df` (lo de Docker) y `du -sh
~/ed/respaldos`. Si se llena:

1. `docker builder prune -af` (la caché del build: se rehace sola).
2. `docker image prune -f` (las imágenes sin etiqueta; no uses `-a`: borraría
   las versiones guardadas para volver).
3. Bajá `DIAS_DE_RESPALDO` en el `.env` y `docker compose up -d respaldo`, o
   mové respaldos viejos afuera (capa 3) y borralos del VPS.

## 10. Mudanza

**Desde Vercel.** La base se trae de Neon con su URL directa:

```sh
pg_dump -Fc "<DATABASE_URL_UNPOOLED de Vercel>" -f ed.dump
docker compose stop app cron
docker compose cp ed.dump respaldo:/tmp/ed.dump
docker compose exec respaldo sh -c 'dropdb -h db -U postgres --force ed && createdb -h db -U postgres -O ed ed && pg_restore -h db -U postgres -d ed --no-owner --role=ed /tmp/ed.dump'
scripts/desplegar.sh
```

(`--no-owner --role=ed`: en Neon las tablas son de otro usuario.) Los **CV**
guardan la misma clave en Blob y en disco (`cv/<id>.pdf`): se bajan del store
privado y se copian al volumen `cv` con esa clave. Las **fotos** cambian de URL
(de Blob a `/api/fotos/<id>`), y hay que reescribir cada uso con el registro de
`apps/sitio/src/datos/fotos/`: **el script que hace las dos copias todavía no
existe** (es un seguimiento pendiente); mientras tanto, se puede
dejar el token de Blob en el `.env` y las fotos siguen en Blob. Después, las
variables: sin `VERCEL_*`, con las de Umami.

**Hacia Vercel.** Lo mismo al revés: `pg_dump` del compose
(`docker compose exec respaldo pg_dump -h db -U postgres -Fc -d ed -f /tmp/ed.dump`
y `docker compose cp respaldo:/tmp/ed.dump .`) y `pg_restore` en Neon.

## 11. Probarlo en local

Con Docker Desktop, en tu máquina, un `.env` con `DOMINIO=localhost` (Caddy usa
su certificado interno: el navegador avisa) y el Resend falso de
`compose.prueba.yaml`, que en producción no se usa: en producción la app nunca
manda un correo a la consola, así que sin él no se puede entrar con segundo
factor. Se suma con dos líneas en el `.env` local:

```sh
COMPOSE_FILE=compose.yaml:compose.prueba.yaml
COMPOSE_PATH_SEPARATOR=:
```

Los correos quedan en `docker compose logs correo`. En Windows, los scripts
corren en Git Bash (`bash scripts/desplegar.sh`).

## 12. El recorrido final

Con el sitio en el dominio, de punta a punta: **entrar al admin con segundo
factor**, **publicar una novedad** (Contenido › Novedades) y verla en
`/novedades`, **mandar un contacto** desde `/contacto` y **verlo en el
Inicio** del admin (y el aviso por correo, si hay alguien en Ajustes › Avisos).
Si los cuatro pasan, está en producción.

## 13. Quién entra

Se entra como `deploy`, con **una llave por persona** en
`~/.ssh/authorized_keys`, y cada línea termina con el nombre de su dueña o su
dueño (`cut -d' ' -f3- ~/.ssh/authorized_keys` los lista). Así se saca a una
persona sin tocar a las demás. `deploy` maneja Docker, y con eso el servidor
entero: solo gente de confianza.

- **Dar acceso.** La persona genera su llave en su máquina y manda solo la
  pública (el `.pub`; la privada no viaja):

  ```sh
  ssh-keygen -t ed25519 -f ~/.ssh/ed-vps -C "<nombre>-ed-vps"
  ```

  Alguien que ya entra la suma: `echo '<la línea del .pub>' >> ~/.ssh/authorized_keys`.
  Que pruebe entrar antes de dar el paso por hecho.
- **Sacar acceso.** Borrar su línea de `~/.ssh/authorized_keys`, y probar que
  las demás siguen entrando antes de cerrar la sesión.
- **Si una llave viajó por un chat**, se reemplaza por una generada en la
  máquina de la persona, y se borra la vieja.
- **Si nadie puede entrar:** el panel de Hostinger tiene una terminal en el
  navegador y cambia la contraseña de root; desde ahí se vuelve a sumar una
  llave.

## 14. El botón «Desplegar» de GitHub

Deploya `main` sin SSH: **Actions › Desplegar › Run workflow**, para
cualquiera con permiso de escritura en el repo. Siempre va `main`, aunque
GitHub ofrezca elegir rama. El log sale en la corrida y queda en
`~/desplegues/` del VPS (los últimos 20). El repo es público y ese log también;
`desplegar.sh` no imprime nada del `.env` salvo el dominio.

Cómo anda (`.github/workflows/desplegar.yml`): la corrida entra al VPS con su
propia llave, y el servidor **ata esa llave a un solo comando**,
`scripts/desplegar-desde-github.sh`, que trae `main` y corre `desplegar.sh`.
Pida lo que pida, esa llave no puede hacer otra cosa. El deploy corre
desprendido de la conexión: si la corrida se corta o se cancela, termina igual.

Armarlo (o rehacerlo en un VPS nuevo):

1. En tu máquina, una llave solo para el botón:
   `ssh-keygen -t ed25519 -N "" -C "github-actions (botón Desplegar)" -f boton`.
2. En el VPS, su línea en `~/.ssh/authorized_keys`, con las opciones delante:

   ```
   restrict,command="/home/deploy/ed/scripts/desplegar-desde-github.sh" <el contenido de boton.pub>
   ```

   `restrict` apaga el reenvío de puertos y del agente y la terminal;
   `command` la ata al script.
3. En GitHub (Settings › Secrets and variables › Actions), desde el clon:

   ```sh
   gh secret set VPS_LLAVE < boton
   gh variable set VPS_HOST --body <IP del VPS>
   gh variable set VPS_LLAVE_DEL_SERVIDOR --body "$(ssh-keyscan -t ed25519 <IP del VPS>)"
   ```

   La última es la llave del servidor, para que la corrida no le hable a un
   impostor: compará su huella (`ssh-keygen -lf -` con esa línea) con la de
   `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` en el VPS.
4. Borrá `boton` y `boton.pub` de tu máquina.

**Revocarlo:** borrar su línea del VPS y el secreto `VPS_LLAVE`.

## 15. Cloudflare adelante (Cloudflare Tunnel)

Desde el 2026-09-30 el sitio entra por Cloudflare: el DNS está en Cloudflare
(los nameservers del dominio, en Hostinger, apuntan a los suyos) y el sitio
llega al VPS por un **túnel**. El túnel sale del VPS hacia Cloudflare y los
pedidos entran por ahí, así que el VPS no necesita puertos web abiertos.
Cloudflare pone el certificado de cara al público, cachea lo estático en cada
país y frena lo obvio. El porqué está en `work/fortificar-el-vps/DECISIONS.md`.

**La cuenta y el token.** La cuenta de Cloudflare tiene a cada persona como
miembro (Super Administrator, al menos dos). Para operarla desde el servidor
hay un **token de cuenta**, `ed-operacion`, sin vencimiento y usable **solo
desde las IP del VPS**. Vive en `~/.config/ed/cloudflare-token` (600). Lleva
dos políticas:

- **Zona** `empoderamientodocente.org`: DNS, Zone (Read), Zone Settings, Zone
  DNS Settings, Zone WAF, Zone Transform Rules, Analytics (Read), Cache Purge,
  Cache Settings y SSL and Certificates.
- **Cuenta** («Entire Account»): Cloudflare One Connector: cloudflared y
  Notifications.

Un permiso de cuenta puesto en la política de la zona no sirve: el túnel y
las notificaciones son de la cuenta.

**El DNS.** Los registros del correo (MX, SPF, DMARC, los tres
`hostingermail-*._domainkey`, `autoconfig` y `autodiscover`) van **siempre en
gris** (DNS only): con la nube naranja, la firma DKIM y la configuración de
los clientes de correo se rompen. El dominio y `www` son CNAME al túnel
(`<id>.cfargotunnel.com`), en naranja.

**La zona.**
- SSL Full (strict), HTTPS siempre, TLS mínimo 1.2, TLS 1.3 y HTTP/3.
- **Apagado todo lo que reescribe el HTML:** Email Obfuscation, Rocket
  Loader, Speed Brain, Early Hints, Automatic HTTPS Rewrites, Server Side
  Excludes y 0-RTT (un GET repetido contaría dos veces un link corto).
- Browser Cache TTL: «Respect Existing Headers». Smart Tiered Cache prendido.
- **Reglas de caché:**
  - nunca se cachea `/admin`, `/api/auth` ni `/l/`;
  - `/_next/image` y `/api/fotos/` se cachean según su propio Cache-Control.
  - **El HTML no se cachea en el borde**: publicar en el admin se ve al
    instante. Las páginas mandan `s-maxage=31536000`, así que «Cache
    Everything» las dejaría un año viejas.
- Las reglas administradas gratis del WAF, y un tope de 10 POST cada 10 s por
  IP a `/api/auth/`.

**El túnel**, `ed-vps`, se maneja desde Cloudflare: qué nombre va a qué
servicio vive allá. En el VPS corre el servicio `tunel` de
`compose.cloudflare.yaml`, con IP fija en la red `borde`: Caddy le cree el
`CF-Connecting-IP` **solo a esa IP**. En el `.env`:

```
CLOUDFLARE_TUNNEL_TOKEN=<el del túnel>
COMPOSE_FILE=compose.yaml:compose.cloudflare.yaml
COMPOSE_PATH_SEPARATOR=:
```

**Dos tiempos.** Al cambiar los nameservers, hay resolvers que siguen hasta
48 h con los viejos y mandan a la gente directo al VPS.

1. **Mientras tanto:** `CLOUDFLARE_ESQUEMA=` (vacío) en el `.env`. Caddy
   sigue sacando su certificado y los puertos siguen abiertos, y el túnel le
   habla a `https://proxy:443` (con `originServerName` el dominio).
2. **Pasadas las 48 h:** se saca `CLOUDFLARE_ESQUEMA`, se pone
   `IP_PUBLICADA=127.0.0.1`, y `docker compose up -d`. En el mismo momento,
   el túnel pasa a `http://proxy:80`. Después se borran del `ufw` las reglas
   del 80 y el 443.

**Volver atrás** (sin Cloudflare): sacar del `.env` las líneas de esta
sección, el registro del dominio a un A gris con la IP del VPS, y
`scripts/desplegar.sh`.
