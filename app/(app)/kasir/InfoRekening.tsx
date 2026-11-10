import { REKENING } from "@/lib/metode";

export default function InfoRekening() {
  return (
    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 print:hidden">
      <p className="mb-2 font-semibold">Tujuan pembayaran non-tunai</p>
      {REKENING.map((r) => (
        <p key={r.nama}>
          <b>{r.nama}</b>: {r.nomor} a.n. {r.atasNama}
        </p>
      ))}
    </div>
  );
}