import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Users, Stethoscope, ClipboardList, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const warnaStatus: Record<string, string> = {
  MENUNGGU: "bg-yellow-100 text-yellow-800",
  DIPERIKSA: "bg-blue-100 text-blue-800",
  SELESAI: "bg-green-100 text-green-800",
};

export default async function DashboardPage() {
  const session = await getSession();
  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);

  const [totalPasien, totalDokter, antrianHariIni, totalKunjungan, terbaru] =
    await Promise.all([
      prisma.pasien.count(),
      prisma.dokter.count(),
      prisma.antrian.count({ where: { tanggal: { gte: awalHari } } }),
      prisma.antrian.count(),
      prisma.antrian.findMany({
        take: 5,
        orderBy: { id: "desc" },
        include: { pasien: true, dokter: true, poli: true },
      }),
    ]);

  const hari = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(awalHari);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const jumlah = await Promise.all(
    hari.map((d) => {
      const besok = new Date(d);
      besok.setDate(d.getDate() + 1);
      return prisma.antrian.count({ where: { tanggal: { gte: d, lt: besok } } });
    })
  );
  const maks = Math.max(...jumlah, 1);

  const kartu = [
    { label: "Total Pasien", nilai: totalPasien, icon: Users, warna: "bg-blue-600" },
    { label: "Total Dokter", nilai: totalDokter, icon: Stethoscope, warna: "bg-green-600" },
    { label: "Antrian Hari Ini", nilai: antrianHariIni, icon: ClipboardList, warna: "bg-yellow-500" },
    { label: "Total Kunjungan", nilai: totalKunjungan, icon: Activity, warna: "bg-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Selamat datang, {session?.nama}. Berikut ringkasan Klinik Pratama UNPAM.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((k) => (
          <div key={k.label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className={"flex h-12 w-12 items-center justify-center rounded-xl text-white " + k.warna}>
              <k.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{k.nilai}</p>
              <p className="text-sm text-gray-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-blue-900">Grafik Kunjungan 7 Hari Terakhir</h2>
          <div className="flex gap-3">
            {hari.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center">
                <span className="mb-1 text-xs font-medium text-gray-600">{jumlah[i]}</span>
                <div className="flex h-40 w-full items-end">
                  <div
                    className="w-full rounded-t bg-blue-600"
                    style={{ height: `${(jumlah[i] / maks) * 100}%`, minHeight: 4 }}
                  />
                </div>
                <span className="mt-2 text-xs text-gray-500">
                  {d.toLocaleDateString("id-ID", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-blue-900">Antrian Terbaru</h2>
          {terbaru.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Belum ada antrian</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">No</th>
                  <th className="pb-2">Pasien</th>
                  <th className="pb-2">Poli</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 font-semibold text-blue-800">{a.noAntrian}</td>
                    <td className="py-2 text-gray-800">{a.pasien.nama}</td>
                    <td className="py-2 text-gray-600">{a.poli.nama}</td>
                    <td className="py-2">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + warnaStatus[a.status]}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}