import { PUEDE, QUE_PERMITE, ROLES, puede, type Capacidad } from "@ed/auth";
import { SiONo, Tabla } from "@ed/kit-admin";

const CAPACIDADES = Object.keys(PUEDE) as Capacidad[];

const COLUMNAS = [{ etiqueta: "Puede" }, ...ROLES.map((rol) => ({ etiqueta: `${rol[0].toUpperCase()}${rol.slice(1)}`, centrada: true, ancho: "w-28" }))];

/**
 * Qué puede cada rol, capacidad por capacidad: la tabla de permisos
 * (DESIGN.md §11, «Tabla»). **Se arma recorriendo `PUEDE` y `QUE_PERMITE`**
 * de `permisos.ts`, así que no se puede desfasar de lo que el servidor
 * verifica. El ✓ se lee «Sí» y la raya, «No».
 */
export function TablaDePermisos() {
  const filas = CAPACIDADES.map((capacidad) => ({
    clave: capacidad,
    celdas: [QUE_PERMITE[capacidad], ...ROLES.map((rol) => <SiONo key={rol} si={puede(rol, capacidad)} />)],
  }));
  return <Tabla leyenda="Qué puede cada rol, capacidad por capacidad" columnas={COLUMNAS} filas={filas} />;
}
