"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function mulaiPeriksa(formData: FormData) {
  const id = Number(formData.get("antrianId"));
  if (!id) redirect("/pemeriksaan");

  const antrian = await prisma.antrian.findUnique({ where: { id } });
  if (antrian && antrian.status === "MENUNGGU") {
    await prisma.antrian.update({
      where: { id },
      data: { status: "DIPERIKSA" },
    });
  }
  redirect(`/pemeriksaan/${id}`);
}

export async function simpanPemeriksaan(formData: FormData) {
  const antrianId = Number(formData.get("antrianId"));
  const keluhan = String(formData.get("keluhan") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const tindakan = String(formData.get("tindakan") ?? "").trim();
  const resep = String(formData.get("resep") ?? "").trim();

  if (!antrianId) redirect("/pemeriksaan");

  const kembali = (pesan: string) =>
    redirect(`/pemeriksaan/${antrianId}?error=` + encodeURIComponent(pesan));

  if (!keluhan || !diagnosis || !tindakan) {
    kembali("Keluhan, diagnosis, dan tindakan wajib diisi");
  }

  const antrian = await prisma.antrian.findUnique({
    where: { id: antrianId },
    include: { rekamMedis: true },
  });
  if (!antrian || antrian.rekamMedis) redirect("/pemeriksaan");

  // Ambil baris obat dari form
  const obatIds = formData.getAll("obatId");
  const jumlahs = formData.getAll("jumlah");
  const aturans = formData.getAll("aturanPakai");

  const items: { obatId: number; jumlah: number; aturanPakai: string | null }[] = [];
  for (let i = 0; i < obatIds.length; i++) {
    const obatId = Number(obatIds[i]);
    const jumlah = Math.floor(Number(jumlahs[i]));
    const aturan = String(aturans[i] ?? "").trim();
    if (obatId > 0 && jumlah > 0) {
      items.push({ obatId, jumlah, aturanPakai: aturan || null });
    }
  }

  // Cek stok (jumlah per obat dijumlahkan kalau obat yang sama dipilih dua kali)
  const total = new Map<number, number>();
  for (const it of items) {
    total.set(it.obatId, (total.get(it.obatId) ?? 0) + it.jumlah);
  }
  const daftarObat = await prisma.obat.findMany({
    where: { id: { in: Array.from(total.keys()) } },
  });
  for (const [obatId, butuh] of total) {
    const o = daftarObat.find((x) => x.id === obatId);
    if (!o) kembali("Obat tidak ditemukan");
    if (o && o.stok < butuh) {
      kembali(`Stok ${o.nama} tidak cukup (sisa ${o.stok} ${o.satuan})`);
    }
  }

  await prisma.$transaction([
    prisma.rekamMedis.create({
      data: {
        antrianId,
        keluhan,
        diagnosis,
        tindakan,
        resep: resep || null,
        resepObat: { create: items },
      },
    }),
    ...Array.from(total.entries()).map(([obatId, jumlah]) =>
      prisma.obat.update({
        where: { id: obatId },
        data: { stok: { decrement: jumlah } },
      })
    ),
    prisma.antrian.update({
      where: { id: antrianId },
      data: { status: "SELESAI" },
    }),
  ]);

  revalidatePath("/pemeriksaan");
  revalidatePath("/pendaftaran");
  revalidatePath("/obat");
  redirect("/pemeriksaan");
}