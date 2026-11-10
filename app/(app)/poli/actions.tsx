"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function pastikanAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") throw new Error("Tidak diizinkan");
}

export async function tambahPoli(formData: FormData) {
  await pastikanAdmin();
  const nama = String(formData.get("nama") || "").trim();
  if (!nama) return;
  await prisma.poli.upsert({ where: { nama }, update: {}, create: { nama } });
  revalidatePath("/poli");
}

export async function hapusPoli(formData: FormData) {
  await pastikanAdmin();
  const id = Number(formData.get("id"));
  const dipakai =
    (await prisma.dokter.count({ where: { poliId: id } })) +
    (await prisma.antrian.count({ where: { poliId: id } }));
  if (dipakai > 0) return;
  await prisma.poli.delete({ where: { id } });
  revalidatePath("/poli");
}