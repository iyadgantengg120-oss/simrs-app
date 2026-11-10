"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function pastikanAdmin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") throw new Error("Tidak diizinkan");
}

export async function tambahObat(formData: FormData) {
  await pastikanAdmin();
  const nama = String(formData.get("nama") || "").trim();
  const satuan = String(formData.get("satuan") || "").trim();
  const stok = Number(formData.get("stok"));
  const harga = Number(formData.get("harga"));
  if (!nama || !satuan) return;
  if (!Number.isInteger(stok) || stok < 0) return;
  if (!Number.isInteger(harga) || harga < 0) return;
  await prisma.obat.create({ data: { nama, satuan, stok, harga } });
  revalidatePath("/obat");
}

export async function tambahStok(formData: FormData) {
  await pastikanAdmin();
  const id = Number(formData.get("id"));
  const jumlah = Number(formData.get("jumlah"));
  if (!Number.isInteger(jumlah) || jumlah <= 0) return;
  await prisma.obat.update({
    where: { id },
    data: { stok: { increment: jumlah } },
  });
  revalidatePath("/obat");
}

export async function hapusObat(formData: FormData) {
  await pastikanAdmin();
  const id = Number(formData.get("id"));
  const dipakai = await prisma.resepObat.count({ where: { obatId: id } });
  if (dipakai > 0) return;
  await prisma.obat.delete({ where: { id } });
  revalidatePath("/obat");
}