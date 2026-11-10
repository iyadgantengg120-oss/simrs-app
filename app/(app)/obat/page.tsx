import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tambahObat, tambahStok, hapusObat } from "./actions";

export const dynamic = "force-dynamic";

const kolom =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

const rupiah = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

export default async function ObatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const kata = q.trim();

  const daftar = await prisma.obat.findMany({
    where: kata ? { nama: { contains: kata } } : undefined,
    orderBy: { nama: "asc" },
    include: { _count: { select: { resepObat: true } } },
  });

  const menipis = daftar.filter((o) => o.stok < 10).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Data Obat</h1>
        <p className="text-sm text-gray-500">
          Kelola daftar obat, stok, dan harga. Stok di bawah 10 ditandai merah.
        </p>
      </div>

      <form action={tambahObat} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-blue-900">Tambah Obat Baru</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <input name="nama" required placeholder="Nama obat" className={kolom} />
          <input name="satuan" required placeholder="Satuan (Tablet, Botol, ...)" className={kolom} />
          <input name="stok" type="number" min={0} required placeholder="Stok awal" className={kolom} />
          <input name="harga" type="number" min={0} required placeholder="Harga per satuan (Rp)" className={kolom} />
        </div>
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Tambah Obat
        </button>
      </form>

      <form className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <input
          name="q"
          defaultValue={kata}
          placeholder="Cari nama obat..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Cari
        </button>
        {kata && (
          <Link href="/obat" className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50">
            Reset
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm text-gray-500">
          {daftar.length} obat
          {menipis > 0 && <span className="ml-2 font-medium text-red-600">• {menipis} stok menipis</span>}
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">No</th>
              <th className="pb-3">Nama Obat</th>
              <th className="pb-3">Satuan</th>
              <th className="pb-3">Stok</th>
              <th className="pb-3">Harga</th>
              <th className="pb-3">Tambah Stok</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  Belum ada obat
                </td>
              </tr>
            )}
            {daftar.map((o, i) => {
              const dipakai = o._count.resepObat > 0;
              return (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{o.nama}</td>
                  <td className="py-3 text-gray-600">{o.satuan}</td>
                  <td className="py-3">
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        (o.stok < 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")
                      }
                    >
                      {o.stok}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{rupiah(o.harga)}</td>
                  <td className="py-3">
                    <form action={tambahStok} className="flex gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <input
                        name="jumlah"
                        type="number"
                        min={1}
                        required
                        placeholder="Jumlah"
                        className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-gray-900"
                      />
                      <button className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">
                        + Stok
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={hapusObat}>
                      <input type="hidden" name="id" value={o.id} />
                      <button
                        disabled={dipakai}
                        title={dipakai ? "Obat ini sudah pernah diresepkan" : "Hapus obat"}
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