import { prisma } from "@/lib/prisma";
import { namaMetode } from "@/lib/metode";
import CetakLaporan from "./CetakLaporan";

export const dynamic = "force-dynamic";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; tanggal?: string }>;
}) {
  const sp = await searchParams;
  const periode = ["harian", "mingguan", "bulanan"].includes(sp.periode ?? "")
    ? (sp.periode as string)
    : "harian";

  let acuan = new Date();
  if (sp.tanggal && /^\d{4}-\d{2}-\d{2}$/.test(sp.tanggal)) {
    const t = new Date(sp.tanggal + "T00:00:00");
    if (!isNaN(t.getTime())) acuan = t;
  }
  acuan.setHours(0, 0, 0, 0);

  let mulai: Date;
  let akhir: Date;
  if (periode === "harian") {
    mulai = new Date(acuan);
    akhir = new Date(acuan);
    akhir.setDate(akhir.getDate() + 1);
  } else if (periode === "mingguan") {
    akhir = new Date(acuan);
    akhir.setDate(akhir.getDate() + 1);
    mulai = new Date(akhir);
    mulai.setDate(mulai.getDate() - 7);
  } else {
    mulai = new Date(acuan.getFullYear(), acuan.getMonth(), 1);
    akhir = new Date(acuan.getFullYear(), acuan.getMonth() + 1, 1);
  }

  const hariAkhir = new Date(akhir);
  hariAkhir.setDate(hariAkhir.getDate() - 1);
  const rentang =
    periode === "harian"
      ? mulai.toLocaleDateString("id-ID")
      : `${mulai.toLocaleDateString("id-ID")} - ${hariAkhir.toLocaleDateString("id-ID")}`;

  const [bayar, jumlahKunjungan] = await Promise.all([
    prisma.pembayaran.findMany({
      where: { createdAt: { gte: mulai, lt: akhir } },
      orderBy: { createdAt: "asc" },
      include: { antrian: { include: { pasien: true, poli: true } } },
    }),
    prisma.antrian.count({
      where: { tanggal: { gte: mulai, lt: akhir }, status: "SELESAI" },
    }),
  ]);

  const totalPendapatan = bayar.reduce((s, p) => s + p.total, 0);
  const totalKonsultasi = bayar.reduce((s, p) => s + p.biayaKonsultasi, 0);
  const totalTindakan = bayar.reduce((s, p) => s + p.biayaTindakan, 0);
  const totalObat = bayar.reduce((s, p) => s + p.biayaObat, 0);

  const perMetode = new Map<string, { jumlah: number; total: number }>();
  for (const p of bayar) {
    const cur = perMetode.get(p.metode) ?? { jumlah: 0, total: 0 };
    cur.jumlah += 1;
    cur.total += p.total;
    perMetode.set(p.metode, cur);
  }

  const inputClass =
    "rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Laporan</h1>
        <p className="text-sm text-gray-500">
          Laporan {periode} Klinik Pratama UNPAM - {rentang}
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-6 shadow-sm print:hidden">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Periode</label>
          <select name="periode" defaultValue={periode} className={inputClass}>
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan (7 hari)</option>
            <option value="bulanan">Bulanan</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">Tanggal acuan</label>
          <input
            type="date"
            name="tanggal"
            defaultValue={fmt(acuan)}
            className={inputClass}
          />
        </div>
        <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
          Tampilkan
        </button>
        <CetakLaporan />
      </form>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-2xl font-bold text-blue-900">{jumlahKunjungan}</p>
          <p className="text-sm text-gray-500">Kunjungan selesai</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-2xl font-bold text-blue-900">{bayar.length}</p>
          <p className="text-sm text-gray-500">Transaksi dibayar</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm md:col-span-2">
          <p className="text-2xl font-bold text-green-700">{rp(totalPendapatan)}</p>
          <p className="text-sm text-gray-500">Total pendapatan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">
            Rincian Pendapatan
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Konsultasi</span>
              <span>{rp(totalKonsultasi)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tindakan</span>
              <span>{rp(totalTindakan)}</span>
            </div>
            <div className="flex justify-between">
              <span>Obat</span>
              <span>{rp(totalObat)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-blue-900">
              <span>Total</span>
              <span>{rp(totalPendapatan)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-blue-900">
            Per Metode Bayar
          </h2>
          {perMetode.size === 0 ? (
            <p className="text-sm text-gray-400">Belum ada pembayaran</p>
          ) : (
            <div className="space-y-2 text-sm">
              {Array.from(perMetode.entries()).map(([metode, v]) => (
                <div key={metode} className="flex justify-between">
                  <span>
                    {namaMetode(metode)} ({v.jumlah}x)
                  </span>
                  <span>{rp(v.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-blue-900">
          Daftar Pembayaran
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3">Tanggal</th>
              <th className="pb-3">No</th>
              <th className="pb-3">Pasien</th>
              <th className="pb-3">Poli</th>
              <th className="pb-3">Metode</th>
              <th className="pb-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bayar.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  Tidak ada pembayaran pada periode ini
                </td>
              </tr>
            )}
            {bayar.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-3 text-gray-600">
                  {new Date(p.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="py-3 font-semibold text-blue-800">
                  {p.antrian.noAntrian}
                </td>
                <td className="py-3 text-gray-900">{p.antrian.pasien.nama}</td>
                <td className="py-3 text-gray-600">{p.antrian.poli.nama}</td>
                <td className="py-3 text-gray-600">{namaMetode(p.metode)}</td>
                <td className="py-3 text-right font-semibold">{rp(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}