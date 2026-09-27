import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Buscador, Filtro } from "@/admin/armazon/Buscador";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Paginado } from "@/admin/armazon/Paginado";
import { EncabezadoDeCuentas } from "@/admin/cuentas/EncabezadoDeCuentas";
import { CUANDO, hayFiltros, leerFiltros, urlDeActividad } from "@/admin/cuentas/actividad/filtros";
import { ListaDeActividad } from "@/admin/cuentas/actividad/ListaDeActividad";
import { MODULOS_DE_ACTIVIDAD, moduloDe } from "@/admin/cuentas/actividad/modulos";
import { tiposQueVe } from "@/datos/actividad";
import { listarActividad } from "@/datos/consultas/actividad";
import { listarCuentas } from "@/datos/consultas/cuentas";
import { sesionActual } from "@/datos/sesion";

export const metadata: Metadata = { title: "Actividad" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Cuentas › Actividad (SPEC de work/cuentas §4.4): quién hizo qué y cuándo,
// con el buscador, tres filtros y paginada en la base. Muestra solo los tipos
// que el rol de quien mira puede ver (`QUIEN_VE`).
export default async function Actividad({ searchParams }: Props) {
  const sesion = await sesionActual();
  if (!sesion) redirect("/admin/entrar");
  const filtros = leerFiltros(await searchParams);
  const tipos = tiposQueVe(sesion.user.rol).filter((t) => !filtros.modulo || moduloDe(t) === filtros.modulo);
  const [pagina, cuentas] = await Promise.all([
    listarActividad({ tipos, persona: filtros.persona, dias: filtros.cuando && CUANDO[filtros.cuando].dias, texto: filtros.q, pagina: filtros.pagina }),
    listarCuentas(),
  ]);
  const conFiltros = hayFiltros(filtros);
  return (
    <div className="space-y-8">
      <EncabezadoDeCuentas detalle="Quién hizo qué en el admin, y cuándo. Se guarda 12 meses." />
      <Buscador accion="/admin/cuentas/actividad" etiqueta="Buscar en la actividad" valor={filtros.q} hayFiltros={conFiltros}>
        <Filtro etiqueta="Persona" nombre="persona" valor={filtros.persona} opciones={[{ valor: "", texto: "Todas" }, ...cuentas.map((c) => ({ valor: c.id, texto: c.nombre }))]} />
        <Filtro
          etiqueta="Módulo"
          nombre="modulo"
          valor={filtros.modulo}
          opciones={[{ valor: "", texto: "Todos" }, ...Object.entries(MODULOS_DE_ACTIVIDAD).map(([valor, texto]) => ({ valor, texto }))]}
        />
        <Filtro
          etiqueta="Cuándo"
          nombre="cuando"
          valor={filtros.cuando}
          opciones={[{ valor: "", texto: "Todo" }, ...Object.entries(CUANDO).map(([valor, { texto }]) => ({ valor, texto }))]}
        />
      </Buscador>
      {pagina.filas.length ? (
        <ListaDeActividad filas={pagina.filas} cuentasQueExisten={new Set(cuentas.map((c) => c.id))} />
      ) : (
        <EstadoVacio
          titulo={conFiltros ? "No hay actividad con esos filtros" : "Todavía no hay actividad"}
          texto={conFiltros ? "Probá con otros, o sacá los filtros para ver todo." : "Cuando alguien entre o toque algo en el admin, va a aparecer acá."}
        />
      )}
      <Paginado etiqueta="Páginas de la actividad" pagina={pagina.pagina} paginas={pagina.paginas} hrefDe={(n) => urlDeActividad(filtros, n)} />
    </div>
  );
}
