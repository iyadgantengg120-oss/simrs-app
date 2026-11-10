import { prisma } from "@/lib/prisma";
import { daftarAntrian } from "./actions";

export const dynamic = "force-dynamic";

export default async function PendaftaranPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const mulai = new Date();
  mulai.setHours(0, 0, 0, 0);
  const besok = new Date(mulai);
  besok.setDate(besok.getDate() + 1);

  const [pasien, dokter, antrian] = await Promise.all([
    prisma.pasien.findMany({ orderBy: { noRM: "asc" } }),
    prisma.dokter.findMany({ orderBy: { nama: "asc" }, include: { poli: true } }),
    prisma.antrian.findMany({
      where: { tanggal: { gte: mulai, lt: besok } },
      orderBy: { id: "asc" },
      include: { pasien: true, dokter: true, poli: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Pendaftaran & Antrian</h1>
        <p className="text-sm text-gray-500">
          Daftarkan pasien ke dokter, nomor antrian dibuat otomatis.
        </p>
      </div>

      <form
        action={daftarAntrian}
        className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Pasien</label>
            <select
              name="pasienId"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="" disabled>
                -- Pilih pasien --
              </option>
              {pasien.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.noRM} - {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Dokter</label>
            <select
              name="dokterId"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="" disabled>
                -- Pilih dokter --
              </option>
              {dokter.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama} ({d.poli.nama})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Daftarkan
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Antrian Hari Ini ({antrian.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Pasien</th>
              <th className="pb-3">Poli</th>
              <th className="pb-3">Dokter</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {antrian.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Belum ada antrian hari ini
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
                        : a.status === "DIPERIKSA"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800")
                    }
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}