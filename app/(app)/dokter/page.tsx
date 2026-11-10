import { prisma } from "@/lib/prisma";
import { tambahDokter, hapusDokter } from "./actions";

export const dynamic = "force-dynamic";

const kolom =
  "rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

export default async function DokterPage() {
  const [daftar, poli] = await Promise.all([
    prisma.dokter.findMany({
      orderBy: { id: "asc" },
      include: { poli: true, _count: { select: { antrian: true } } },
    }),
    prisma.poli.findMany({ orderBy: { nama: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Data Dokter</h1>
        <p className="text-sm text-gray-500">
          Daftar dokter, spesialis, dan jadwal praktek Klinik Pratama UNPAM.
        </p>
      </div>

      <form
        action={tambahDokter}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-blue-900">Tambah Dokter Baru</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="nama" required placeholder="Nama dokter, contoh: dr. muhammad iyad diya'ulhaq S.kom" className={kolom} />
          <input name="spesialis" required placeholder="Spesialis, contoh: Dokter Umum" className={kolom} />
          <input name="jadwal" required placeholder="Jadwal, contoh: Senin - Jumat, 08.00 - 14.00" className={kolom} />
          <select name="poliId" required defaultValue="" className={kolom}>
            <option value="" disabled>
              Pilih poli
            </option>
            {poli.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Tambah Dokter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Nama Dokter</th>
              <th className="pb-3">Spesialis</th>
              <th className="pb-3">Poli</th>
              <th className="pb-3">Jadwal Praktek</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((d, i) => {
              const dipakai = d._count.antrian > 0;
              return (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-3">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{d.nama}</td>
                  <td className="py-3 text-gray-600">{d.spesialis}</td>
                  <td className="py-3 text-gray-600">{d.poli.nama}</td>
                  <td className="py-3 text-gray-600">{d.jadwal}</td>
                  <td className="py-3">
                    <form action={hapusDokter}>
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        disabled={dipakai}
                        title={dipakai ? "Dokter ini sudah punya riwayat antrian" : "Hapus dokter"}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}