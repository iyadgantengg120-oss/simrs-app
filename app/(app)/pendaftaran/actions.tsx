"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function awalHari() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function daftarAntrian(formData: FormData) {
  const pasienId = Number(formData.get("pasienId"));
  const dokterId = Number(formData.get("dokterId"));

  if (!pasienId || !dokterId) {
    redirect("/pendaftaran?error=" + encodeURIComponent("Pilih pasien dan dokter dulu"));
  }

  const dokter = await prisma.dokter.findUnique({ where: { id: dokterId } });
  if (!dokter) {
    redirect("/pendaftaran?error=" + encodeURIComponent("Dokter tidak ditemukan"));
  }

  const mulai = awalHari();
  const besok = new Date(mulai);
  besok.setDate(besok.getDate() + 1);

  const sudahAda = await prisma.antrian.findFirst({
    where: {
      pasienId,
      tanggal: { gte: mulai, lt: besok },
      status: { in: ["MENUNGGU", "DIPERIKSA"] },
    },
  });
  if (sudahAda) {
    redirect(
      "/pendaftaran?error=" +
        encodeURIComponent("Pasien ini masih punya antrian aktif hari ini")
    );
  }

  const jumlah = await prisma.antrian.count({
    where: { tanggal: { gte: mulai, lt: besok } },
  });
  const noAntrian = `A-${String(jumlah + 1).padStart(2, "0")}`;

  await prisma.antrian.create({
    data: { noAntrian, pasienId, dokterId, poliId: dokter.poliId },
  });

  revalidatePath("/pendaftaran");
  redirect("/pendaftaran");
}