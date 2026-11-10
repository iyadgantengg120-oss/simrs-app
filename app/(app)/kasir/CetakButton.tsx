"use client";

export default function CetakButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-blue-900 hover:bg-yellow-300 print:hidden"
    >
      Cetak Struk
    </button>
  );
}