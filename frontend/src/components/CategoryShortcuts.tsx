import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { ProductCategory } from "@/types/product";

const SHORTCUTS: { category: ProductCategory; description: string }[] = [
  { category: "iPhone", description: "El más avanzado" },
  { category: "Mac", description: "Potencia y portabilidad" },
  { category: "iPad", description: "Creatividad sin límites" },
  { category: "Watch", description: "Tu salud, a la mano" },
  { category: "AirPods", description: "Sonido sin cables" },
  { category: "Accesorios", description: "Protege y completa" },
];

export default function CategoryShortcuts() {
  return (
    <section className="bg-white px-6 py-16">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {SHORTCUTS.map((item, i) => (
          <li key={item.category} className="h-full">
            <Reveal delay={i * 80} className="h-full">
              <Link
                href={`#${item.category}`}
                className="apple-lift flex h-full flex-col items-center justify-center rounded-3xl bg-[#f5f5f7] px-4 py-8 text-center transition-colors duration-500 hover:bg-[#e8e8ed]"
              >
                <span className="text-xl font-semibold tracking-tight text-[#1d1d1f]">{item.category}</span>
                <span className="mt-1 text-sm text-[#6e6e73]">{item.description}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
