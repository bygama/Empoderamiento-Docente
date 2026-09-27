import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { puede } from "@ed/auth";
import { Buscador } from "@/admin/armazon/Buscador";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Filtro } from "@/admin/armazon/Filtro";
import { Paginado } from "@/admin/armazon/Paginado";
import { SinPermiso } from "@/admin/armazon/SinPermiso";
import { EncabezadoDeCuentas } from "@/admin/cuentas/EncabezadoDeCuentas";
import { CUANDO, conservados, hayFiltros, leerFiltros, urlDeActividad, type Filtros } from "@/admin/cuentas/actividad/filtros";
import { ListaDeActividad } from "@/admin/cuentas/actividad/ListaDeActividad";
import { MODULOS_DE_ACTIVIDAD, moduloDe } from "@/admin/cuentas/actividad/modulos";
import { TIPOS_DE_ACTIVIDAD } from "@/datos/actividad";
import { listarActividad } from "@/datos/consultas/actividad";
import { listarCuentas } from "@/datos/consultas/cuentas";
import { materialesQueExisten } from "@/datos/consultas/materiales-del-admin";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Actividad" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Las opciones de un filtro: la de «todas», que lo saca, y una por valor; cada una conserva lo demás. */
function opcionesDe(filtros: Filtros, clave: "persona" | "modulo" | "cuando", todas: string, valores: ReadonlyArray<[string, string]>) {
  return [[undefined, todas] as const, ...valores].map(([valor, etiqueta]) => ({ href: urlDeActividad({ ...filtros, [clave]: valor }, 1), etiqueta }));
}

// Cuentas › Actividad (SPEC de work/cuentas §4.4): quién hizo qué y cuándo,
// con el buscador, los filtros de persona, módulo y cuándo, y paginada en la
// base. Los tipos que el rol de quien mira no ve (`QUIEN_VE`) los saca la consulta.
export default async function Actividad({ searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  // La guarda del layout solo oculta la interfaz: esta página se renderiza
  // igual y viaja en el payload. El permiso se corta acá, antes de leer nada.
  if (!puede(sesion.user.rol, "usarCuentas")) return <SinPermiso capacidad="usarCuentas" rol={sesion.user.rol} />;
  const filtros = leerFiltros(await searchParams);
  const tipos = TIPOS_DE_ACTIVIDAD.filter((t) => !filtros.modulo || moduloDe(t) === filtros.modulo);
  const { rol } = sesion.user;
  const [pagina, cuentas] = await Promise.all([
    listarActividad(rol, { tipos, persona: filtros.persona, dias: filtros.cuando && CUANDO[filtros.cuando].dias, texto: filtros.q, pagina: filtros.pagina }),
    listarCuentas(rol),
  ]);
  const materiales = await materialesQueExisten(pagina.filas.flatMap((f) => (moduloDe(f.tipo) === "biblioteca" && f.sobreId ? [f.sobreId] : [])));
  const activa = urlDeActividad(filtros, 1);
  const conFiltros = hayFiltros(filtros);
  return (
    <div className="space-y-6">
      <EncabezadoDeCuentas detalle="Quién hizo qué en el admin, y cuándo. Se guarda 12 meses." />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Filtro etiqueta="Módulo" activa={activa} opciones={opcionesDe(filtros, "modulo", "Todos los módulos", Object.entries(MODULOS_DE_ACTIVIDAD))} />
          <Buscador etiqueta="Buscar en la actividad" accion="/admin/cuentas/actividad" q={filtros.q} ayuda="Quién o sobre qué" conservar={conservados(filtros)} />
        </div>
        <Filtro etiqueta="Persona" activa={activa} opciones={opcionesDe(filtros, "persona", "Todas las personas", cuentas.map((c) => [c.id, c.nombre]))} />
        <Filtro etiqueta="Cuándo" activa={activa} opciones={opcionesDe(filtros, "cuando", "Todo", Object.entries(CUANDO).map(([valor, { texto }]) => [valor, texto]))} />
      </div>
      {pagina.filas.length ? (
        <ListaDeActividad filas={pagina.filas} cuentasQueExisten={new Set(cuentas.map((c) => c.id))} materialesQueExisten={materiales} />
      ) : (
        <EstadoVacio
          titulo={conFiltros ? "No hay actividad con esos filtros" : "Todavía no hay actividad"}
          texto={conFiltros ? "Probá con otros filtros o con otra búsqueda." : "Cuando alguien entre o toque algo en el admin, va a aparecer acá."}
        />
      )}
      <Paginado etiqueta="Páginas de la actividad" pagina={pagina.pagina} paginas={pagina.paginas} hrefDe={(n) => urlDeActividad(filtros, n)} />
    </div>
  );
}
