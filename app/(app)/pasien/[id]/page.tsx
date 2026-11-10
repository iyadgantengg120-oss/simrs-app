import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function hitungUmur(tgl: Date) {
  const now = new Date();
  let umur = now.getFullYear() - tgl.getFullYear();
  const belumUlangTahun =
    now.getMonth() < tgl.getMonth() ||
    (now.getMonth() === tgl.getMonth() && now.getDate() < tgl.getDate());
  if (belumUlangTahun) umur--;
  return umur;
}

export default async function DetailPasienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pasien = await prisma.pasien.findUnique({
    where: { id: Number(id) },
    include: {
      antrian: {
        orderBy: { tanggal: "desc" },
        include: { dokter: true, poli: true, rekamMedis: true },
      },
    },
  });

  if (!pasien) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Detail Pasien</h1>
        <Link
          href="/pasien"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm text-white hover:bg-blue-800"
        >
          Kembali
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-blue-900">Data Diri</h2>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-gray-500">No RM</dt>
            <dd className="font-semibold text-blue-900">{pasien.noRM}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Nama</dt>
            <dd className="font-semibold">{pasien.nama}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Jenis Kelamin</dt>
            <dd>{pasien.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Umur</dt>
            <dd>{hitungUmur(pasien.tanggalLahir)} tahun</dd>
          </div>
          <div>
            <dt className="text-gray-500">Alamat</dt>
            <dd>{pasien.alamat}</dd>
          </div>
          <div>
            <dt className="text-gray-500">No. HP</dt>
            <dd>{pasien.noHp ?? "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-blue-900">
          Riwayat Berobat
        </h2>
        {pasien.antrian.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada riwayat berobat.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Tanggal</th>
                <th>No Antrian</th>
                <th>Poli</th>
                <th>Dokter</th>
                <th>Diagnosis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pasien.antrian.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2">
                    {new Date(a.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td>{a.noAntrian}</td>
                  <td>{a.poli.nama}</td>
                  <td>{a.dokter.nama}</td>
                  <td>{a.rekamMedis?.diagnosis ?? "-"}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}