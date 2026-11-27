import Link from "next/link";
import type { CSSProperties } from "react";

export default function Hero() {
  return (
    <section className="flex min-h-[560px] flex-col items-center justify-center overflow-hidden bg-[#fbfbfd] px-6 py-24 text-center">
      <p
        className="hero-enter text-xl font-semibold tracking-tight text-[#e30000]"
        style={{ "--reveal-delay": "0ms" } as CSSProperties}
      >
        Nuevo
      </p>

      <h1
        className="apple-display hero-enter mt-2 text-6xl font-semibold text-[#1d1d1f] md:text-8xl"
        style={{ "--reveal-delay": "120ms" } as CSSProperties}
      >
        iPhone 18 Pro.
      </h1>

      <p
        className="hero-enter mt-5 max-w-xl text-xl leading-snug tracking-[-0.01em] text-[#1d1d1f] md:text-2xl"
        style={{ "--reveal-delay": "240ms" } as CSSProperties}
      >
        Pantalla ProMotion, chip A20 Pro y la mayor duración de batería en un iPhone.
      </p>

      <div
        className="hero-enter mt-8 flex flex-wrap items-center justify-center gap-6 text-xl"
        style={{ "--reveal-delay": "360ms" } as CSSProperties}
      >
        <Link
          href="#iPhone"
          className="rounded-full bg-[#0066cc] px-6 py-2.5 text-[17px] text-white transition-colors duration-300 hover:bg-[#0071e3]"
        >
          Comprar
        </Link>
        <Link href="#Mac" className="text-[17px] text-[#0066cc] transition-opacity hover:underline">
          Explorar Mac ›
        </Link>
      </div>
    </section>
  );
}
