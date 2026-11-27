import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getProducts } from "@/lib/api";
import type { ProductCategory } from "@/types/product";

const CATEGORIES: ProductCategory[] = [
  "iPhone",
  "Mac",
  "iPad",
  "Watch",
  "AirPods",
  "Accesorios",
];

export default async function ProductsGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="py-32 text-center text-2xl font-normal tracking-tight text-[#6e6e73]">
        No hay productos disponibles por el momento.
      </p>
    );
  }

  return (
    <div className="bg-[#f5f5f7] py-12">
      {CATEGORIES.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (items.length === 0) return null;

        return (
          <section key={category} id={category} className="scroll-mt-16 py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Reveal>
                <header className="mb-8">
                  <h2 className="apple-display text-4xl font-semibold text-[#1d1d1f] md:text-5xl">
                    {category}.{" "}
                    <span className="text-[#6e6e73]">Lo último y lo mejor.</span>
                  </h2>
                </header>
              </Reveal>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product, i) => (
                  <Reveal key={product._id} delay={(i % 3) * 100}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
