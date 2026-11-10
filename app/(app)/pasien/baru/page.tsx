import Link from "next/link";
import FormPasien from "../FormPasien";
import { tambahPasien } from "../actions";

export default function PasienBaruPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900">Tambah Pasien Baru</h1>
        <p className="text-sm text-gray-500">
          Nomor rekam medis dibuat otomatis oleh sistem.
        </p>
      </div>
      <FormPasien action={tambahPasien} tombol="Simpan Pasien" />
      <Link href="/pasien" className="inline-block text-sm text-blue-700 hover:underline">
        ← Kembali ke daftar pasien
      </Link>
    </div>
  );
}