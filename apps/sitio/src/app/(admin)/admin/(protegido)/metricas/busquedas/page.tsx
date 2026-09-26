import type { Metadata } from "next";
import { headers } from "next/headers";
import { esRol, PUEDE } from "@ed/auth";
import { PanelBusquedas } from "@/admin/busquedas/PanelBusquedas";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";
import { auth } from "@/datos/auth";

export const metadata: Metadata = { title: "Búsquedas" };

// El layout ya verificó la sesión; acá se lee otra vez solo para saber el rol:
// quien puede configurar las conexiones ve cómo conectar Search Console.
export default async function Busquedas() {
  const rol = (await auth.api.getSession({ headers: await headers() }))?.user.rol;
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("busquedas").que} />
      <PanelBusquedas puedeConectar={esRol(rol) && PUEDE.configurarConexiones(rol)} />
    </div>
  );
}
