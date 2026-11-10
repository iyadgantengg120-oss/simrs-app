import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { simpanPemeriksaan } from "../actions";

export const dynamic = "force-dynamic";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function hitungUmur(tgl: Date) {
  const now = new Date();
  let umur = now.getFullYear() - tgl.getFullYear();
  const belumUlangTahun =
    now.getMonth() < tgl.getMonth() ||
    (now.getMonth() === tgl.getMonth() && now.getDate() < tgl.getDate());
  if (belumUlangTahun) umur--;
  return umur;
}

export default async function FormPemeriksaanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [antrian, daftarObat] = await Promise.all([
    prisma.antrian.findUnique({
      where: { id: Number(id) },
      include: {
        pasien: true,
        dokter: true,
        poli: true,
        rekamMedis: { include: { resepObat: { include: { obat: true } } } },
      },
    }),
    prisma.obat.findMany({ orderBy: { nama: "asc" } }),
  ]);

  if (!antrian) notFound();

  const rm = antrian.rekamMedis;
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Form Pemeriksaan</h1>
          <p className="text-sm text-gray-500">
            Antrian {antrian.noAntrian} - {antrian.poli.nama} - {antrian.dokter.nama}
          </p>
        </div>
        <Link
          href="/pemeriksaan"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm text-white hover:bg-blue-800"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">Data Pasien</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-gray-500">No RM</dt>
            <dd className="font-semibold text-blue-900">{antrian.pasien.noRM}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Nama</dt>
            <dd className="font-semibold">{antrian.pasien.nama}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Jenis Kelamin</dt>
            <dd>{antrian.pasien.jenisKelamin}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Umur</dt>
            <dd>{hitungUmur(antrian.pasien.tanggalLahir)} tahun</dd>
          </div>
        </dl>
      </div>

      {rm ? (
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-green-700">
            Pemeriksaan sudah selesai
          </h2>
          <div className="text-sm">
            <p className="text-gray-500">Keluhan</p>
            <p>{rm.keluhan}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Diagnosis</p>
            <p>{rm.diagnosis}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Tindakan</p>
            <p>{rm.tindakan}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Obat</p>
            {rm.resepObat.length === 0 ? (
              <p>-</p>
            ) : (
              rm.resepObat.map((r) => (
                <p key={r.id}>
                  {r.obat.nama} x {r.jumlah} {r.obat.satuan}
                  {r.aturanPakai ? ` (${r.aturanPakai})` : ""}
                </p>
              ))
            )}
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Catatan resep</p>
            <p>{rm.resep ?? "-"}</p>
          </div>
        </div>
      ) : (
        <form
          action={simpanPemeriksaan}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <input type="hidden" name="antrianId" value={antrian.id} />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Keluhan / Anamnesis
            </label>
            <textarea name="keluhan" rows={3} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Diagnosis</label>
            <textarea name="diagnosis" rows={2} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Tindakan</label>
            <textarea name="tindakan" rows={2} className={inputClass} />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-blue-900">
              Resep obat (maksimal 3, kosongkan yang tidak dipakai)
            </p>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-6">
                  <select
                    name="obatId"
                    defaultValue=""
                    className={inputClass + " md:col-span-3"}
                  >
                    <option value="">-- Tidak ada obat --</option>
                    {daftarObat.map((o) => (
                      <option key={o.id} value={o.id} disabled={o.stok <= 0}>
                        {o.nama} (stok {o.stok} {o.satuan}) - {rp(o.harga)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="jumlah"
                    min={1}
                    defaultValue={1}
                    placeholder="Jumlah"
                    className={inputClass}
                  />
                  <input
                    name="aturanPakai"
                    placeholder="Aturan pakai, mis. 3x1"
                    className={inputClass + " md:col-span-2"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Catatan resep (boleh dikosongkan)
            </label>
            <textarea name="resep" rows={2} className={inputClass} />
          </div>
          <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
            Simpan Rekam Medis
          </button>
        </form>
      )}
    </div>
  );
}