import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DAFTAR_METODE, namaMetode } from "@/lib/metode";
import { simpanPembayaran } from "../actions";
import CetakButton from "../CetakButton";
import InfoRekening from "../InfoRekening";

export const dynamic = "force-dynamic";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default async function DetailKasirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const antrian = await prisma.antrian.findUnique({
    where: { id: Number(id) },
    include: {
      pasien: true,
      dokter: true,
      poli: true,
      pembayaran: true,
      rekamMedis: { include: { resepObat: { include: { obat: true } } } },
    },
  });

  if (!antrian) notFound();

  const rm = antrian.rekamMedis;
  const bayar = antrian.pembayaran;

  if (!rm) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="mb-4 text-gray-600">Pasien ini belum selesai diperiksa.</p>
        <Link href="/kasir" className="text-blue-700 hover:underline">
          Kembali ke Kasir
        </Link>
      </div>
    );
  }

  const biayaObat = rm.resepObat.reduce((s, r) => s + r.jumlah * r.obat.harga, 0);
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            {bayar ? "Struk Pembayaran" : "Proses Pembayaran"}
          </h1>
          <p className="text-sm text-gray-500">
            Antrian {antrian.noAntrian} - {antrian.pasien.nama}
          </p>
        </div>
        <Link
          href="/kasir"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm text-white hover:bg-blue-800"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 border-b pb-4 text-center">
          <p className="text-lg font-bold text-blue-900">Klinik Pratama UNPAM</p>
          <p className="text-xs text-gray-500">Struk Pembayaran</p>
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Pasien</dt>
            <dd className="font-semibold">
              {antrian.pasien.nama} ({antrian.pasien.noRM})
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Dokter / Poli</dt>
            <dd>
              {antrian.dokter.nama} / {antrian.poli.nama}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Diagnosis</dt>
            <dd>{rm.diagnosis}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tanggal</dt>
            <dd>
              {new Date(bayar ? bayar.createdAt : antrian.tanggal).toLocaleDateString(
                "id-ID"
              )}
            </dd>
          </div>
        </dl>

        {rm.resepObat.length > 0 && (
          <div className="mb-4 text-sm">
            <p className="mb-1 text-gray-500">Obat</p>
            {rm.resepObat.map((r) => (
              <div key={r.id} className="flex justify-between border-b py-1">
                <span>
                  {r.obat.nama} x {r.jumlah}
                </span>
                <span>{rp(r.jumlah * r.obat.harga)}</span>
              </div>
            ))}
          </div>
        )}

        {bayar ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Konsultasi</span>
              <span>{rp(bayar.biayaKonsultasi)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tindakan</span>
              <span>{rp(bayar.biayaTindakan)}</span>
            </div>
            <div className="flex justify-between">
              <span>Obat</span>
              <span>{rp(bayar.biayaObat)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold text-blue-900">
              <span>Total</span>
              <span>{rp(bayar.total)}</span>
            </div>
            <p className="text-gray-500">Metode: {namaMetode(bayar.metode)}</p>
            <div className="pt-3">
              <CetakButton />
            </div>
          </div>
        ) : (
          <form action={simpanPembayaran} className="space-y-4">
            <input type="hidden" name="antrianId" value={antrian.id} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Biaya konsultasi (Rp)
                </label>
                <input
                  type="number"
                  name="biayaKonsultasi"
                  min={0}
                  defaultValue={50000}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Biaya tindakan (Rp)
                </label>
                <input
                  type="number"
                  name="biayaTindakan"
                  min={0}
                  defaultValue={0}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Biaya obat (otomatis dari resep): <b>{rp(biayaObat)}</b>
            </p>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Metode pembayaran
              </label>
              <select name="metode" defaultValue="TUNAI" className={inputClass}>
                {DAFTAR_METODE.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <InfoRekening />
            <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
              Bayar & Buat Struk
            </button>
          </form>
        )}
      </div>
    </div>
  );
}