#!/bin/sh
# Lo corre la imagen de Postgres la primera vez que arranca con el volumen
# vacío (/docker-entrypoint-initdb.d): una base por servicio, cada una con su
# usuario y su clave, y ninguno con permisos sobre la del otro. Con el volumen
# ya creado no vuelve a correr.
set -eu

psql -v ON_ERROR_STOP=1 --username postgres \
  -v clave_ed="$CLAVE_DB_ED" -v clave_umami="$CLAVE_DB_UMAMI" <<'SQL'
CREATE ROLE ed LOGIN PASSWORD :'clave_ed';
CREATE DATABASE ed OWNER ed;
REVOKE ALL ON DATABASE ed FROM PUBLIC;
CREATE ROLE umami LOGIN PASSWORD :'clave_umami';
CREATE DATABASE umami OWNER umami;
REVOKE ALL ON DATABASE umami FROM PUBLIC;
SQL
