import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RekamMedisPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const kata = q.trim();

  const daftar = await prisma.rekamMedis.findMany({
    where: kata
      ? {
          antrian: {
            pasien: {
              OR: [{ nama: { contains: kata } }, { noRM: { contains: kata } }],
            },
          },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      antrian: { include: { pasien: true, dokter: true, poli: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Rekam Medis</h1>
        <p className="text-sm text-gray-500">
          Arsip hasil pemeriksaan semua pasien.
        </p>
      </div>

      <form className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <input
          name="q"
          defaultValue={kata}
          placeholder="Cari nama pasien atau nomor RM..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Cari
        </button>
        {kata && (
          <Link
            href="/rekam-medis"
            className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Reset
          </Link>
        )}
      </form>

      <p className="text-sm text-gray-500">
        Menampilkan {daftar.length} rekam medis{kata ? ` untuk "${kata}"` : ""}
      </p>

      {daftar.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">
          Belum ada rekam medis
        </div>
      )}

      {daftar.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <Link
                href={`/pasien/${r.antrian.pasien.id}`}
                className="text-lg font-semibold text-blue-900 hover:underline"
              >
                {r.antrian.pasien.nama}
              </Link>
              <span className="ml-2 text-sm font-semibold text-blue-800">
                {r.antrian.pasien.noRM}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(r.createdAt).toLocaleDateString("id-ID")} -{" "}
              {r.antrian.noAntrian} - {r.antrian.poli.nama} -{" "}
              {r.antrian.dokter.nama}
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-gray-500">Keluhan</dt>
              <dd>{r.keluhan}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Diagnosis</dt>
              <dd className="font-semibold">{r.diagnosis}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tindakan</dt>
              <dd>{r.tindakan}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Resep</dt>
              <dd>{r.resep ?? "-"}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}