import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

function namaDepan(nama: string) {
  return nama.trim().split(" ")[0];
}

export default async function LayarAntrianPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);

  const antrian = await prisma.antrian.findMany({
    where: { tanggal: { gte: awalHari } },
    orderBy: { id: "asc" },
    include: { pasien: true, dokter: true, poli: true },
  });

  const diperiksa = antrian.filter((a) => a.status === "DIPERIKSA");
  const menunggu = antrian.filter((a) => a.status === "MENUNGGU");
  const selesai = antrian.filter((a) => a.status === "SELESAI").length;

  const sekarang = new Date();
  const jam = sekarang.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  const tanggal = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <main className="min-h-screen bg-blue-950 p-6 text-white">
      <AutoRefresh detik={5} />

      <header className="mb-6 flex items-center justify-between rounded-2xl border-b-4 border-yellow-400 bg-blue-900 p-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white">
            <Image src="/logo-unpam.jpeg" alt="Logo UNPAM" fill className="scale-[1.2] object-cover" />
          </div>
          <div>
            <p className="text-2xl font-bold">Antrian Klinik Pratama UNPAM</p>
            <p className="text-sm text-blue-200">{tanggal}</p>
          </div>
        </div>
        <p className="text-4xl font-bold text-yellow-300">{jam}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-blue-900 p-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-yellow-300">Sedang Diperiksa</h2>
          {diperiksa.length === 0 ? (
            <p className="py-20 text-center text-2xl text-blue-200">
              Belum ada pasien yang sedang diperiksa
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {diperiksa.map((a) => (
                <div key={a.id} className="rounded-2xl bg-yellow-400 p-6 text-center text-blue-950">
                  <p className="text-7xl font-extrabold">{a.noAntrian}</p>
                  <p className="mt-3 text-2xl font-semibold">{namaDepan(a.pasien.nama)}</p>
                  <p className="text-sm">
                    {a.poli.nama} • {a.dokter.nama}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-blue-900 p-6">
          <h2 className="mb-4 text-xl font-semibold text-yellow-300">
            Menunggu ({menunggu.length})
          </h2>
          {menunggu.length === 0 ? (
            <p className="py-10 text-center text-blue-200">Tidak ada antrian menunggu</p>
          ) : (
            <ul className="space-y-3">
              {menunggu.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl bg-blue-800 px-4 py-3">
                  <span className="text-2xl font-bold">{a.noAntrian}</span>
                  <span className="text-right text-sm text-blue-100">
                    {namaDepan(a.pasien.nama)}
                    <br />
                    {a.poli.nama}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-blue-900 p-4 text-center">
          <p className="text-3xl font-bold">{antrian.length}</p>
          <p className="text-sm text-blue-200">Total antrian hari ini</p>
        </div>
        <div className="rounded-2xl bg-blue-900 p-4 text-center">
          <p className="text-3xl font-bold">{menunggu.length}</p>
          <p className="text-sm text-blue-200">Menunggu</p>
        </div>
        <div className="rounded-2xl bg-blue-900 p-4 text-center">
          <p className="text-3xl font-bold">{selesai}</p>
          <p className="text-sm text-blue-200">Selesai</p>
        </div>
      </div>

      <Link href="/dashboard" className="mt-6 inline-block text-sm text-blue-200 hover:underline">
        ← Kembali
      </Link>
    </main>
  );
}