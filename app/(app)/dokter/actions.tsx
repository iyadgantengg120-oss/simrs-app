"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function pastikanAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") throw new Error("Tidak diizinkan");
}

export async function tambahDokter(formData: FormData) {
  await pastikanAdmin();
  const nama = String(formData.get("nama") || "").trim();
  const spesialis = String(formData.get("spesialis") || "").trim();
  const jadwal = String(formData.get("jadwal") || "").trim();
  const poliId = Number(formData.get("poliId"));
  if (!nama || !spesialis || !jadwal || !poliId) return;
  await prisma.dokter.create({ data: { nama, spesialis, jadwal, poliId } });
  revalidatePath("/dokter");
  revalidatePath("/poli");
}

export async function hapusDokter(formData: FormData) {
  await pastikanAdmin();
  const id = Number(formData.get("id"));
  const dipakai = await prisma.antrian.count({ where: { dokterId: id } });
  if (dipakai > 0) return;
  await prisma.dokter.delete({ where: { id } });
  revalidatePath("/dokter");
  revalidatePath("/poli");
}