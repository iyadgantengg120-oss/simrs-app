import { prisma } from "@/lib/prisma";
import { tambahPoli, hapusPoli } from "./actions";

export const dynamic = "force-dynamic";

export default async function PoliPage() {
  const daftar = await prisma.poli.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { dokter: true, antrian: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Data Poli</h1>
        <p className="text-sm text-gray-500">
          Kelola daftar poli yang tersedia di Klinik Pratama UNPAM.
        </p>
      </div>

      <form
        action={tambahPoli}
        className="flex flex-wrap gap-3 rounded-2xl bg-white p-6 shadow-sm"
      >
        <input
          name="nama"
          required
          placeholder="Nama poli baru, contoh: Poli Anak"
          className="min-w-64 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Tambah Poli
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Nama Poli</th>
              <th className="pb-3">Jumlah Dokter</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((p, i) => {
              const dipakai = p._count.dokter + p._count.antrian > 0;
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{p.nama}</td>
                  <td className="py-3 text-gray-600">{p._count.dokter}</td>
                  <td className="py-3">
                    <form action={hapusPoli}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        disabled={dipakai}
                        title={dipakai ? "Poli ini sudah dipakai" : "Hapus poli"}
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