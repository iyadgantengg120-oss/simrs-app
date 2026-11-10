-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Poli" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Dokter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "spesialis" TEXT NOT NULL,
    "jadwal" TEXT NOT NULL,
    "poliId" INTEGER NOT NULL,
    CONSTRAINT "Dokter_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "Poli" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pasien" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "noRM" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "alamat" TEXT NOT NULL,
    "noHp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Antrian" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "noAntrian" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "pasienId" INTEGER NOT NULL,
    "dokterId" INTEGER NOT NULL,
    "poliId" INTEGER NOT NULL,
    CONSTRAINT "Antrian_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Antrian_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "Dokter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Antrian_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "Poli" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RekamMedis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "antrianId" INTEGER NOT NULL,
    "keluhan" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "tindakan" TEXT NOT NULL,
    "resep" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RekamMedis_antrianId_fkey" FOREIGN KEY ("antrianId") REFERENCES "Antrian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Obat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "harga" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ResepObat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rekamMedisId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "aturanPakai" TEXT,
    CONSTRAINT "ResepObat_rekamMedisId_fkey" FOREIGN KEY ("rekamMedisId") REFERENCES "RekamMedis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResepObat_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Poli_nama_key" ON "Poli"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_noRM_key" ON "Pasien"("noRM");

-- CreateIndex
CREATE UNIQUE INDEX "RekamMedis_antrianId_key" ON "RekamMedis"("antrianId");
