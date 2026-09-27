#!/bin/sh
# El respaldo diario del VPS (compose.yaml, servicio `respaldo`, 03:30 UTC):
# las dos bases (`ed` y `umami`) con pg_dump, y las fotos y los CV en tar.gz,
# en `respaldos/<AAAA-MM-DD>/` del host. Se guardan los últimos
# DIAS_DE_RESPALDO (14 por defecto).
#
# A mano: docker compose exec respaldo sh /respaldo/respaldar.sh
# Restaurar: scripts/restaurar.sh <AAAA-MM-DD> (docs/deploy/vps.md).
#
# Un respaldo que vive en el mismo disco que los datos no cubre perder el
# disco: el runbook dice cómo copiarlos fuera del VPS.
set -eu
umask 077

dias="${DIAS_DE_RESPALDO:-14}"
fecha=$(date -u +%Y-%m-%d)
destino="/respaldos/$fecha"
# Se arma aparte y se renombra al final: una carpeta con fecha es un respaldo
# entero, nunca uno a medias.
parcial="/respaldos/.$fecha.parcial"

echo "[respaldo] $(date -u +%Y-%m-%dT%H:%M:%SZ): empieza el del $fecha"
rm -rf "$parcial"
mkdir -p "$parcial"
for base in ed umami; do
  pg_dump -h db -U postgres -Fc -d "$base" -f "$parcial/$base.dump"
done
tar -czf "$parcial/fotos.tar.gz" -C /datos/fotos .
tar -czf "$parcial/cv.tar.gz" -C /datos/cv .
rm -rf "$destino"
mv "$parcial" "$destino"
# Del dueño del host (el usuario del deploy), para poder copiarlos afuera sin
# sudo; nadie más los lee: llevan CV y datos de contacto.
chown -R "${DUENO_DE_RESPALDOS:-1000:1000}" "$destino"

# Quedan los últimos $dias; los más viejos se borran.
ls -1 /respaldos | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | sort -r | tail -n +"$((dias + 1))" | while read -r viejo; do
  rm -rf "/respaldos/$viejo" && echo "[respaldo] borrado el del $viejo"
done

echo "[respaldo] listo: $destino, $(du -sh "$destino" | cut -f1); hay $(ls -1 /respaldos | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')"
