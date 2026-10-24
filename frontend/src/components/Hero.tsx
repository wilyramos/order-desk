import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex min-h-[560px] flex-col items-center justify-center bg-[#fbfbfd] px-6 py-24 text-center">
      <p className="text-xl font-semibold text-[#e30000]">Nuevo</p>

      <h1 className="mt-2 text-6xl font-semibold leading-none tracking-tight text-[#1d1d1f] md:text-8xl">
        iPhone 18 Pro.
      </h1>

      <p className="mt-4 max-w-xl text-xl leading-snug text-[#1d1d1f] md:text-2xl">
        Pantalla ProMotion, chip A20 Pro y la mayor duración de batería en un iPhone.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xl">
        <Link
          href="#iPhone"
          className="rounded-full bg-[#0066cc] px-6 py-2.5 text-white transition hover:bg-[#0071e3]"
        >
          Comprar
        </Link>
        <Link href="#Mac" className="text-[#0066cc] hover:underline">
          Explorar Mac ›
        </Link>
      </div>
    </section>
  );
}