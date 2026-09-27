import { Guarda } from "@/admin/armazon/Guarda";

// La Biblioteca es de los tres roles: la guarda deja afuera a quien no puede
// editarla, cada página lo vuelve a chequear antes de leer y cada acción
// también (AGENTS.md §12).
export default function LayoutDeBiblioteca({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="editarBiblioteca">{children}</Guarda>;
}
