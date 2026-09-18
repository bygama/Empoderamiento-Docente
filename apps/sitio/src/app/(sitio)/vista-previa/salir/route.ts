import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Apaga el modo borrador y vuelve al inicio.
export async function POST(): Promise<Response> {
  const borrador = await draftMode();
  borrador.disable();
  redirect("/");
}
