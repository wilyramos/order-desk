import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import type { ProductCategory } from "@/types/product";

const CATEGORIES: ProductCategory[] = ["iPhone", "Mac", "iPad", "Watch", "AirPods", "Accesorios"];

export default async function ProductsGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <p className="py-32 text-center text-xl text-[#6e6e73]">No hay productos todavía.</p>
    );
  }

  return (
    <>
      {CATEGORIES.map((category) => {
        const items = products.filter((p) => p.category === category);
        if (items.length === 0) return null;

        return (
          <section key={category} id={category} className="scroll-mt-14 bg-white text-[#1d1d1f]">
            <div className="mx-auto max-w-7xl px-6 py-24">
              <header className="mb-14 text-center">
                <h2 className="text-5xl font-semibold tracking-tight text-[#1d1d1f] md:text-6xl">
                  {category}
                </h2>
              </header>

              <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}