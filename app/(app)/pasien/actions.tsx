"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function pastikanAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") throw new Error("Tidak diizinkan");
}

function ambilData(formData: FormData) {
  return {
    nama: String(formData.get("nama") || "").trim(),
    jenisKelamin: String(formData.get("jenisKelamin") || ""),
    tanggalLahir: new Date(String(formData.get("tanggalLahir") || "")),
    alamat: String(formData.get("alamat") || "").trim(),
    noHp: String(formData.get("noHp") || "").trim() || null,
  };
}

export async function tambahPasien(formData: FormData) {
  await pastikanAdmin();
  const data = ambilData(formData);
  if (!data.nama || !data.jenisKelamin || !data.alamat || isNaN(data.tanggalLahir.getTime())) return;

  const terakhir = await prisma.pasien.findFirst({ orderBy: { id: "desc" } });
  const urut = terakhir ? parseInt(terakhir.noRM.replace("RM-", ""), 10) + 1 : 1;
  const noRM = "RM-" + String(urut).padStart(4, "0");

  await prisma.pasien.create({ data: { ...data, noRM } });
  revalidatePath("/pasien");
  redirect("/pasien");
}

export async function hapusPasien(formData: FormData) {
  await pastikanAdmin();
  const id = Number(formData.get("id"));
  const dipakai = await prisma.antrian.count({ where: { pasienId: id } });
  if (dipakai > 0) return;
  await prisma.pasien.delete({ where: { id } });
  revalidatePath("/pasien");
}