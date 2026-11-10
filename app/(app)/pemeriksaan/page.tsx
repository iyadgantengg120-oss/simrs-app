import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { mulaiPeriksa } from "./actions";

export const dynamic = "force-dynamic";

export default async function PemeriksaanPage() {
  const mulai = new Date();
  mulai.setHours(0, 0, 0, 0);
  const besok = new Date(mulai);
  besok.setDate(besok.getDate() + 1);

  const [antrian, selesai] = await Promise.all([
    prisma.antrian.findMany({
      where: {
        tanggal: { gte: mulai, lt: besok },
        status: { in: ["MENUNGGU", "DIPERIKSA"] },
      },
      orderBy: { id: "asc" },
      include: { pasien: true, dokter: true, poli: true },
    }),
    prisma.antrian.count({
      where: { tanggal: { gte: mulai, lt: besok }, status: "SELESAI" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Pemeriksaan Dokter</h1>
        <p className="text-sm text-gray-500">
          Pilih pasien dari antrian untuk mulai diperiksa. Sudah selesai hari
          ini: {selesai} pasien.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Antrian Menunggu ({antrian.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Pasien</th>
              <th className="pb-3">Poli</th>
              <th className="pb-3">Dokter</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {antrian.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  Tidak ada antrian yang menunggu
                </td>
              </tr>
            )}
            {antrian.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-3 font-semibold text-blue-800">{a.noAntrian}</td>
                <td className="py-3 text-gray-900">
                  {a.pasien.nama} ({a.pasien.noRM})
                </td>
                <td className="py-3 text-gray-600">{a.poli.nama}</td>
                <td className="py-3 text-gray-600">{a.dokter.nama}</td>
                <td className="py-3">
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-medium " +
                      (a.status === "MENUNGGU"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800")
                    }
                  >
                    {a.status}
                  </span>
                </td>
                <td className="py-3">
                  {a.status === "MENUNGGU" ? (
                    <form action={mulaiPeriksa}>
                      <input type="hidden" name="antrianId" value={a.id} />
                      <button className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800">
                        Periksa
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/pemeriksaan/${a.id}`}
                      className="rounded-lg bg-yellow-400 px-4 py-1.5 text-xs font-semibold text-blue-900 hover:bg-yellow-300"
                    >
                      Lanjutkan
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}