import { Guarda } from "@/admin/armazon/Guarda";

// Mensajes es de los tres roles por Contacto; la bandeja de CV suma su propia
// guarda con `verCV` (`[bandeja]/page.tsx`).
export default function LayoutDeMensajes({ children }: { children: React.ReactNode }) {
  return <Guarda capacidad="verContacto">{children}</Guarda>;
}
