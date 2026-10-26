import ProductCard from "@/components/ProductCard";
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
      <p className="py-32 text-center text-xl font-normal text-[#6e6e73]">
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
              <header className="mb-8">
                <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] md:text-5xl">
                  {category}.{" "}
                  <span className="text-[#6e6e73]">
                    Lo último y lo mejor.
                  </span>
                </h2>
              </header>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}