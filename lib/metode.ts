export const DAFTAR_METODE = [
  { value: "TUNAI", label: "Tunai" },
  { value: "TRANSFER", label: "Transfer Bank Lain" },
  { value: "SEABANK", label: "SeaBank" },
  { value: "DANA", label: "DANA" },
  { value: "QRIS", label: "QRIS" },
];

export function namaMetode(value: string) {
  return DAFTAR_METODE.find((m) => m.value === value)?.label ?? value;
}

// GANTI tulisan ISI_... dengan nomor dan nama aslimu
export const REKENING = [
  { nama: "SeaBank", nomor: "901464099753", atasNama: "muhammad iyad diya ulhq" },
  { nama: "DANA", nomor: "082123182143", atasNama: "muhammad iyad diya ulhq" },
];