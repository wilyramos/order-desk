import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/types/product";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 0,
});

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col justify-between rounded-3xl bg-[#f5f5f7] p-8 text-left transition-all duration-300 hover:shadow-xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#6e6e73]">
          {product.category}
        </p>

        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#1d1d1f] md:text-3xl">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-[#6e6e73]">
          {product.description}
        </p>
      </div>

      <div className="relative my-8 h-60 w-full overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-light text-[#86868b]">
            {product.category.charAt(0)}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-normal text-[#1d1d1f]">
          Desde{" "}
          <span className="font-semibold">
            {priceFormatter.format(product.price)}
          </span>
        </p>

        <div className="mt-4 flex items-center gap-4">
          <AddToCartButton product={product} />
          <Link
            href={`/products/${product._id}`}
            className="inline-flex items-center text-sm font-normal text-[#0066cc] hover:underline"
          >
            Más información <span className="ml-1 text-base">›</span>
          </Link>
        </div>
      </div>
    </article>
  );
}