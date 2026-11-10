"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DAFTAR_METODE } from "@/lib/metode";

const METODE = DAFTAR_METODE.map((m) => m.value);

export async function simpanPembayaran(formData: FormData) {
  const antrianId = Number(formData.get("antrianId"));
  const biayaKonsultasi = Math.max(0, Number(formData.get("biayaKonsultasi")) || 0);
  const biayaTindakan = Math.max(0, Number(formData.get("biayaTindakan")) || 0);
  const metode = String(formData.get("metode") ?? "TUNAI");

  if (!antrianId || !METODE.includes(metode)) redirect("/kasir");

  const antrian = await prisma.antrian.findUnique({
    where: { id: antrianId },
    include: {
      pembayaran: true,
      rekamMedis: { include: { resepObat: { include: { obat: true } } } },
    },
  });

  if (!antrian || !antrian.rekamMedis) redirect("/kasir");
  if (antrian.pembayaran) redirect(`/kasir/${antrianId}`);

  const biayaObat = antrian.rekamMedis.resepObat.reduce(
    (sum, r) => sum + r.jumlah * r.obat.harga,
    0
  );
  const total = biayaKonsultasi + biayaTindakan + biayaObat;

  await prisma.pembayaran.create({
    data: { antrianId, biayaKonsultasi, biayaTindakan, biayaObat, total, metode },
  });

  revalidatePath("/kasir");
  redirect(`/kasir/${antrianId}`);
}