import { Guarda } from "@/admin/armazon/Guarda";

// Novedades es de los tres roles: la guarda deja afuera a quien no puede
// editarlas, y cada acción lo vuelve a chequear (AGENTS.md §12).
export default function LayoutDeNovedades({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="editarNovedades">{children}</Guarda>;
}
