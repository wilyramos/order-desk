import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/types/product";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <article className="flex flex-col items-center px-4 pb-6 pt-8 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#6e6e73]">
        {product.category}
      </p>

      <h3 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[#1d1d1f] md:text-[32px]">
        {product.name}
      </h3>

      <p className="mt-2 line-clamp-2 min-h-[2.75rem] max-w-xs text-[17px] leading-snug text-[#6e6e73]">
        {product.description}
      </p>

      <div className="relative mt-6 h-64 w-full">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl font-semibold text-gray-300">
            {product.category.charAt(0)}
          </div>
        )}
      </div>

      <p className="mt-6 text-[17px] text-[#1d1d1f]">
        Desde <span className="font-semibold">{priceFormatter.format(product.price)}</span>
      </p>

      <div className="mt-5 flex items-center justify-center gap-5 text-[17px]">
        <AddToCartButton product={product} />
        <Link href={`/products/${product._id}`} className="text-[#0066cc] hover:underline">
          Más información ›
        </Link>
      </div>
    </article>
  );
}