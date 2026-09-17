import { TransicionFaro } from "@/features/novedades/components/TransicionFaro";

// El provider vive en el layout (no en las páginas) para que el telón de la
// transición sobreviva a la navegación listado ↔ ficha.
export default function NovedadesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TransicionFaro>{children}</TransicionFaro>;
}
