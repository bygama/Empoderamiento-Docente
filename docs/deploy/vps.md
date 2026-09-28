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
internet (npm, las imágenes de Docker y las fuentes de Google, que baja el
build). Al final dice `Listo: https://<dominio> corre <commit>`.

**Si `construir` falla por las fuentes de Google** (un error al bajar de
`fonts.gstatic.com`, o `Can't resolve
'@vercel/turbopack-next/internal/font/google/font'`), volvé a correr
`scripts/desplegar.sh`: el build baja las fuentes cada vez y a veces falla de
pasada. El script frena antes de tocar el sitio que corre, así que no se
rompió nada.

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
| Deployar una versión nueva | `git pull && scripts/desplegar.sh` (el sitio deja de contestar unos segundos, cuando se cambia el contenedor: ver «Corte»; si falla por las fuentes de Google, otra vez: §4) |
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
   rsync -az --delete deploy@<IP del VPS>:ed/respaldos/ ~/respaldos-ed/
   ```

   (`scp -r deploy@<IP del VPS>:ed/respaldos ~/respaldos-ed` si no hay `rsync`.)
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
capas compartidas) y la caché del build (~2,5 GB). En total, menos de 10 GB:
los 50 GB de un KVM 1 alcanzan de sobra.

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
