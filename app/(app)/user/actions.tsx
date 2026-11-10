"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ROLES = ["ADMIN", "DOKTER", "PENDAFTARAN", "PENDIRI"];
const BASE = "/user";

function fail(msg: string): never {
  redirect(`${BASE}?error=${encodeURIComponent(msg)}`);
}

export async function tambahUser(formData: FormData) {
  await requireAdmin();

  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!nama || !username || !password) fail("Semua kolom wajib diisi.");
  if (password.length < 6) fail("Password minimal 6 karakter.");
  if (!ROLES.includes(role)) fail("Role tidak valid.");

  const ada = await prisma.user.findUnique({ where: { username } });
  if (ada) fail("Username sudah dipakai.");

  await prisma.user.create({
    data: { nama, username, role, password: await bcrypt.hash(password, 10) },
  });

  revalidatePath(BASE);
  redirect(`${BASE}?ok=${encodeURIComponent("User berhasil ditambahkan")}`);
}

export async function ubahUser(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const nama = String(formData.get("nama") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!id || !nama || !username) fail("Nama dan username wajib diisi.");
  if (!ROLES.includes(role)) fail("Role tidak valid.");
  if (password && password.length < 6) fail("Password minimal 6 karakter.");

  const dipakai = await prisma.user.findFirst({
    where: { username, NOT: { id } },
  });
  if (dipakai) fail("Username sudah dipakai.");

  // jangan sampai admin terakhir diturunkan rolenya
  if (role !== "ADMIN") {
    const target = await prisma.user.findUnique({ where: { id } });
    if (target?.role === "ADMIN") {
      const jumlahAdmin = await prisma.user.count({ where: { role: "ADMIN" } });
      if (jumlahAdmin <= 1) fail("Tidak bisa menurunkan admin terakhir.");
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      nama,
      username,
      role,
      // password hanya diganti kalau diisi
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath(BASE);
  redirect(`${BASE}?ok=${encodeURIComponent("Data user diperbarui")}`);
}

export async function hapusUser(formData: FormData) {
  const me = await requireAdmin();
  const id = Number(formData.get("id"));

  if (!id) fail("User tidak ditemukan.");
  if (id === me.id) fail("Kamu tidak bisa menghapus akun sendiri.");

  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === "ADMIN") {
    const jumlahAdmin = await prisma.user.count({ where: { role: "ADMIN" } });
    if (jumlahAdmin <= 1) fail("Tidak bisa menghapus admin terakhir.");
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath(BASE);
  redirect(`${BASE}?ok=${encodeURIComponent("User dihapus")}`);
}