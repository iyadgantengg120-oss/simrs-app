import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import { ANGGOTA } from "@/lib/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar role={session.role} nama={session.nama} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="flex-1 p-6">{children}</main>
        <footer className="border-t bg-white px-6 py-4 text-center text-xs text-gray-500">
          <p className="font-medium text-gray-700">
            Kelompok: {ANGGOTA.join(" • ")}
          </p>
          <p>Copyright © 2026 SIMRS Klinik Pratama UNPAM</p>
        </footer>
      </div>
    </div>
  );
}