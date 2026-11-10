"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Pill,
  ClipboardList,
  Monitor,
  HeartPulse,
  Wallet,
  FileText,
  FileSpreadsheet,
  UserCog,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/login/actions";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { href: "/pasien", label: "Data Pasien", icon: Users, roles: ["ADMIN"] },
  { href: "/dokter", label: "Data Dokter", icon: Stethoscope, roles: ["ADMIN"] },
  { href: "/poli", label: "Data Poli", icon: Building2, roles: ["ADMIN"] },
  { href: "/obat", label: "Data Obat", icon: Pill, roles: ["ADMIN"] },
  { href: "/pendaftaran", label: "Pendaftaran", icon: ClipboardList, roles: ["ADMIN", "PENDAFTARAN"] },
  { href: "/antrian", label: "Layar Antrian", icon: Monitor, roles: ["ADMIN", "PENDAFTARAN"] },
  { href: "/pemeriksaan", label: "Pemeriksaan", icon: HeartPulse, roles: ["ADMIN", "DOKTER"] },
  { href: "/kasir", label: "Kasir", icon: Wallet, roles: ["ADMIN", "PENDAFTARAN"] },
  { href: "/rekam-medis", label: "Rekam Medis", icon: FileText, roles: ["ADMIN"] },
  { href: "/laporan", label: "Laporan", icon: FileSpreadsheet, roles: ["ADMIN"] },
  { href: "/user", label: "Manajemen User", icon: UserCog, roles: ["ADMIN"] },
];

const namaRole: Record<string, string> = {
  ADMIN: "Administrator",
  DOKTER: "Dokter",
  PENDAFTARAN: "Petugas Pendaftaran",
};

export default function Sidebar({ role, nama }: { role: string; nama: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-blue-900 text-white print:hidden">
      <div className="flex items-center gap-3 border-b border-blue-800 p-5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-white">
          <Image src="/logo-unpam.jpeg" alt="Logo UNPAM" fill className="scale-[1.2] object-cover" />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight">SIMRS</p>
          <p className="text-xs text-blue-200">Klinik Pratama UNPAM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menu
          .filter((m) => m.roles.includes(role))
          .map((m) => {
            const aktif = pathname === m.href || pathname.startsWith(m.href + "/");
            return (
              <Link
                key={m.href}
                href={m.href}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition " +
                  (aktif
                    ? "bg-yellow-400 text-blue-950"
                    : "text-blue-100 hover:bg-blue-800")
                }
              >
                <m.icon size={18} />
                {m.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-blue-800 p-4">
        <p className="truncate text-sm font-semibold">{nama}</p>
        <p className="mb-3 text-xs text-blue-200">{namaRole[role] ?? role}</p>
        <form action={logout}>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-medium hover:bg-red-700">
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}