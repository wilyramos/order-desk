"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mx-auto mt-10 block rounded-full bg-[#0066cc] px-6 py-3 text-[15px] text-white transition hover:bg-[#0071e3] print:hidden"
    >
      Print or save as PDF
    </button>
  );
}