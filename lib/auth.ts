import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  // actions.tsx dan page.tsx memakai me.id
  return { id: session.userId, role: session.role };
}