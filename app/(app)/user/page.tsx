import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tambahUser, ubahUser, hapusUser } from "./actions";

export const dynamic = "force-dynamic";

const ROLES = ["ADMIN", "DOKTER", "PENDAFTARAN", "PENDIRI"];
const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600";

export default async function ManajemenUserPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; ok?: string }>;
}) {
  const me = await requireAdmin();
  const { q, error, ok } = await searchParams;
  const kata = (q ?? "").trim();

  const daftar = await prisma.user.findMany({
    where: kata
      ? { OR: [{ nama: { contains: kata } }, { username: { contains: kata } }] }
      : {},
    orderBy: { createdAt: "desc" },
    select: { id: true, nama: true, username: true, role: true },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-900">Manajemen User</h1>
        <p className="text-sm text-gray-600">
          Kelola akun dan hak akses pengguna sistem.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {ok}
        </p>
      )}

      {/* Tambah user */}
      <form action={tambahUser} className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-blue-900">Tambah User</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <input
            name="nama"
            placeholder="Nama lengkap"
            className={input}
            required
          />
          <input
            name="username"
            placeholder="Username"
            className={input}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min. 6)"
            className={input}
            required
          />
          <select name="role" className={input} defaultValue="PENDAFTARAN">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Simpan
        </button>
      </form>

      {/* Pencarian */}
      <form className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <input
          name="q"
          defaultValue={kata}
          placeholder="Cari nama atau username..."
          className={input}
        />
        <button className="rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800">
          Cari
        </button>
      </form>

      <p className="text-sm text-gray-600">Menampilkan {daftar.length} user</p>

      {/* Daftar user */}
      <div className="space-y-3">
        {daftar.map((u) => (
          <details key={u.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between">
              <span>
                <b className="text-blue-900">{u.nama}</b>{" "}
                <span className="text-sm text-gray-500">@{u.username}</span>
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {u.role}
              </span>
            </summary>

            <form action={ubahUser} className="mt-4 grid gap-4 md:grid-cols-4">
              <input type="hidden" name="id" value={u.id} />
              <input
                name="nama"
                defaultValue={u.nama}
                className={input}
                required
              />
              <input
                name="username"
                defaultValue={u.username}
                className={input}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password baru (kosongkan jika tidak diganti)"
                className={input}
              />
              <select name="role" defaultValue={u.role} className={input}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 md:col-span-4">
                <button className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Update
                </button>
              </div>
            </form>

            {u.id !== me.id && (
              <form action={hapusUser} className="mt-3">
                <input type="hidden" name="id" value={u.id} />
                <button className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">
                  Hapus
                </button>
              </form>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}