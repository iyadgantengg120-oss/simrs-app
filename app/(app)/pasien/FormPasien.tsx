const kolom =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

type Nilai = {
  nama?: string;
  jenisKelamin?: string;
  tanggalLahir?: string;
  alamat?: string;
  noHp?: string;
};

export default function FormPasien({
  action,
  nilai = {},
  tombol,
}: {
  action: (formData: FormData) => Promise<void>;
  nilai?: Nilai;
  tombol: string;
}) {
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input name="nama" required defaultValue={nilai.nama} className={kolom} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Kelamin</label>
          <select name="jenisKelamin" required defaultValue={nilai.jenisKelamin ?? ""} className={kolom}>
            <option value="" disabled>Pilih jenis kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Lahir</label>
          <input type="date" name="tanggalLahir" required defaultValue={nilai.tanggalLahir} className={kolom} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">No. HP (opsional)</label>
          <input name="noHp" defaultValue={nilai.noHp} className={kolom} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Alamat</label>
        <textarea name="alamat" required rows={3} defaultValue={nilai.alamat} className={kolom} />
      </div>
      <button className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
        {tombol}
      </button>
    </form>
  );
}