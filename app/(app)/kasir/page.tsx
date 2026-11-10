import { namaMetode } from "@/lib/metode";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default async function KasirPage() {
  const [belumBayar, sudahBayar] = await Promise.all([
    prisma.antrian.findMany({
      where: { status: "SELESAI", rekamMedis: { isNot: null }, pembayaran: { is: null } },
      orderBy: { id: "asc" },
      include: { pasien: true, poli: true, rekamMedis: true },
    }),
    prisma.pembayaran.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { antrian: { include: { pasien: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Kasir</h1>
        <p className="text-sm text-gray-500">
          Pasien yang sudah selesai diperiksa dan menunggu pembayaran.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Belum Dibayar ({belumBayar.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Pasien</th>
              <th className="pb-3">Poli</th>
              <th className="pb-3">Diagnosis</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {belumBayar.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Tidak ada tagihan
                </td>
              </tr>
            )}
            {belumBayar.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="py-3 font-semibold text-blue-800">{a.noAntrian}</td>
                <td className="py-3 text-gray-900">
                  {a.pasien.nama} ({a.pasien.noRM})
                </td>
                <td className="py-3 text-gray-600">{a.poli.nama}</td>
                <td className="py-3 text-gray-600">{a.rekamMedis?.diagnosis}</td>
                <td className="py-3">
                  <Link
                    href={`/kasir/${a.id}`}
                    className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    Proses
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Pembayaran Terakhir
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">Tanggal</th>
              <th className="pb-3">Pasien</th>
              <th className="pb-3">Metode</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Struk</th>
            </tr>
          </thead>
          <tbody>
            {sudahBayar.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Belum ada pembayaran
                </td>
              </tr>
            )}
            {sudahBayar.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-3 text-gray-600">
                  {new Date(p.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="py-3 text-gray-900">{p.antrian.pasien.nama}</td>
                <td className="py-3 text-gray-600">{p.metode}</td>
                <td className="py-3 font-semibold">{rp(p.total)}</td>
                <td className="py-3">
                  <Link
                    href={`/kasir/${p.antrianId}`}
                    className="text-blue-700 hover:underline"
                  >
                    Lihat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}