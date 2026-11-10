import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hapusPasien } from "./actions";

export const dynamic = "force-dynamic";

function umur(tgl: Date) {
  const sekarang = new Date();
  let u = sekarang.getFullYear() - tgl.getFullYear();
  const belumUlangTahun =
    sekarang.getMonth() < tgl.getMonth() ||
    (sekarang.getMonth() === tgl.getMonth() && sekarang.getDate() < tgl.getDate());
  if (belumUlangTahun) u--;
  return u;
}

export default async function PasienPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const kata = q.trim();

  const daftar = await prisma.pasien.findMany({
    where: kata
      ? { OR: [{ nama: { contains: kata } }, { noRM: { contains: kata } }] }
      : undefined,
    orderBy: { id: "asc" },
    include: { _count: { select: { antrian: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Data Pasien</h1>
          <p className="text-sm text-gray-500">
            Kelola data pasien Klinik Pratama UNPAM.
          </p>
        </div>
        <Link
          href="/pasien/baru"
          className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800"
        >
          + Tambah Pasien
        </Link>
      </div>

      <form className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <input
          name="q"
          defaultValue={kata}
          placeholder="Cari nama atau nomor RM..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Cari
        </button>
        {kata && (
          <Link href="/pasien" className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50">
            Reset
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm text-gray-500">
          Menampilkan {daftar.length} pasien{kata ? ` untuk "${kata}"` : ""}
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No RM</th>
              <th className="pb-3">Nama</th>
              <th className="pb-3">L/P</th>
              <th className="pb-3">Umur</th>
              <th className="pb-3">Alamat</th>
              <th className="pb-3">No. HP</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  Tidak ada pasien yang cocok
                </td>
              </tr>
            )}
            {daftar.map((p) => {
              const dipakai = p._count.antrian > 0;
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-semibold text-blue-800">
                    <Link href={`/pasien/${p.id}`} className="hover:underline">
                      {p.noRM}
                    </Link>
                  </td>
                  <td className="py-3 font-medium text-gray-900">
                    <Link
                      href={`/pasien/${p.id}`}
                      className="hover:text-blue-700 hover:underline"
                    >
                      {p.nama}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600">{p.jenisKelamin === "Laki-laki" ? "L" : "P"}</td>
                  <td className="py-3 text-gray-600">{umur(p.tanggalLahir)} th</td>
                  <td className="max-w-64 truncate py-3 text-gray-600">{p.alamat}</td>
                  <td className="py-3 text-gray-600">{p.noHp ?? "-"}</td>
                  <td className="py-3">
                    <form action={hapusPasien}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        disabled={dipakai}
                        title={dipakai ? "Pasien ini sudah punya riwayat kunjungan" : "Hapus pasien"}
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