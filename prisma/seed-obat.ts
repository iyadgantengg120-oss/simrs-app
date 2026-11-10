import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const daftar = [
  { nama: "Paracetamol 500 mg", satuan: "Tablet", stok: 200, harga: 1000 },
  { nama: "Amoxicillin 500 mg", satuan: "Kapsul", stok: 150, harga: 2500 },
  { nama: "Ibuprofen 400 mg", satuan: "Tablet", stok: 120, harga: 1500 },
  { nama: "Cetirizine 10 mg", satuan: "Tablet", stok: 100, harga: 2000 },
  { nama: "CTM 4 mg", satuan: "Tablet", stok: 150, harga: 500 },
  { nama: "Antasida DOEN", satuan: "Tablet", stok: 180, harga: 1000 },
  { nama: "Omeprazole 20 mg", satuan: "Kapsul", stok: 8, harga: 3000 },
  { nama: "Dexamethasone 0,5 mg", satuan: "Tablet", stok: 90, harga: 1000 },
  { nama: "Vitamin C 500 mg", satuan: "Tablet", stok: 250, harga: 1000 },
  { nama: "OBH Sirup 60 ml", satuan: "Botol", stok: 40, harga: 15000 },
  { nama: "Oralit", satuan: "Sachet", stok: 60, harga: 3000 },
];

async function main() {
  for (const o of daftar) {
    const ada = await prisma.obat.findFirst({ where: { nama: o.nama } });
    if (!ada) await prisma.obat.create({ data: o });
  }
  console.log("Seed obat selesai. Total obat:", await prisma.obat.count());
}

main().finally(() => prisma.$disconnect());