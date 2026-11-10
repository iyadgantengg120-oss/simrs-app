import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const namaPasien = [
  "Ahmad Fauzi", "Siti Nurhaliza", "Budi Santoso", "Dewi Lestari", "Rizky Pratama",
  "Nur Aini", "Andi Wijaya", "Putri Ayu", "Hendra Gunawan", "Lina Marlina",
  "Agus Salim", "Rina Wulandari", "Dedi Kurniawan", "Maya Sari", "Fajar Nugroho",
  "Yuni Astuti", "Eko Prasetyo", "Fitri Handayani", "Joko Susilo", "Ratna Dewi",
  "Bambang Hermawan", "Sri Rahayu", "Wahyu Hidayat", "Indah Permata", "Rudi Hartono",
  "Tuti Alawiyah", "Irfan Maulana", "Ani Yulianti", "Dimas Aditya", "Mega Silvia",
];

async function main() {
  await prisma.resepObat.deleteMany();
  await prisma.rekamMedis.deleteMany();
  await prisma.antrian.deleteMany();
  await prisma.pasien.deleteMany();
  await prisma.dokter.deleteMany();
  await prisma.poli.deleteMany();
  await prisma.user.deleteMany();

  const akun = [
    { username: "admin", password: "admin123", nama: "Administrator", role: "ADMIN" },
    { username: "dokter", password: "dokter123", nama: "dr. Rina Kusuma", role: "DOKTER" },
    { username: "pendaftaran", password: "daftar123", nama: "Petugas Pendaftaran", role: "PENDAFTARAN" },
  ];
  for (const a of akun) {
    await prisma.user.create({
      data: { ...a, password: await bcrypt.hash(a.password, 10) },
    });
  }

  const poliList = ["Poli Umum", "Poli Gigi", "Poli KIA", "Poli Lansia"];
  const poli = [];
  for (const nama of poliList) {
    poli.push(await prisma.poli.create({ data: { nama } }));
  }

  const dokterList = [
    { nama: "dr. Rina Kusuma", spesialis: "Dokter Umum", jadwal: "Senin - Jumat, 08.00 - 14.00" },
    { nama: "drg. Bima Perkasa", spesialis: "Dokter Gigi", jadwal: "Senin - Kamis, 09.00 - 15.00" },
    { nama: "dr. Sari Anggraini, Sp.OG", spesialis: "Kebidanan dan Kandungan", jadwal: "Selasa dan Kamis, 10.00 - 14.00" },
    { nama: "dr. Hadi Wibowo", spesialis: "Dokter Umum", jadwal: "Senin - Sabtu, 14.00 - 20.00" },
  ];
  for (let i = 0; i < dokterList.length; i++) {
    await prisma.dokter.create({ data: { ...dokterList[i], poliId: poli[i].id } });
  }

  for (let i = 0; i < namaPasien.length; i++) {
    await prisma.pasien.create({
      data: {
        noRM: "RM-" + String(i + 1).padStart(4, "0"),
        nama: namaPasien[i],
        jenisKelamin: i % 2 === 0 ? "Laki-laki" : "Perempuan",
        tanggalLahir: new Date(1960 + ((i * 7) % 50), i % 12, 1 + ((i * 3) % 28)),
        alamat: "Jl. Raya Pamulang No. " + (i + 1) + ", Tangerang Selatan",
        noHp: "0812" + String(30000000 + i * 1234567).slice(0, 8),
      },
    });
  }
  console.log("Seed selesai: 3 user, 4 poli, 4 dokter, 30 pasien");
}

main().finally(() => prisma.$disconnect());