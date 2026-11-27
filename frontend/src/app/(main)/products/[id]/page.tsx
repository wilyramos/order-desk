// File: frontend/src/app/(main)/products/[id]/page.tsx

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { getProduct, getProducts } from "@/lib/api";
import { TAX_RATE } from "@/lib/tax";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const HIGHLIGHTS = [
  {
    title: "Recojo en tienda",
    text: "Haz tu pedido en línea y recógelo cuando esté listo.",
  },
  {
    title: "Pago con tarjeta o efectivo",
    text: "Elige cómo pagar al finalizar la compra.",
  },
  {
    title: "Factura por correo",
    text: "Recibe la factura de tu compra en tu correo electrónico.",
  },
];

async function RelatedProducts({ productId, category }: { productId: string; category: string }) {
  const related = (await getProducts())
    .filter((p) => p.category === category && p._id !== productId)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="bg-[#f5f5f7] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <h2 className="apple-display mb-10 text-3xl font-semibold text-[#1d1d1f] md:text-4xl">
            También te puede interesar.
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((product, i) => (
            <Reveal key={product._id} delay={i * 100}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const priceWithTax = product.price * (1 + TAX_RATE);

  return (
    <>
      {/* Barra secundaria con el nombre y la compra rápida */}
      <div className="sticky top-11 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 lg:px-8">
          <span className="text-xl font-semibold tracking-tight text-[#1d1d1f]">{product.name}</span>
          <span className="text-xs text-[#6e6e73]">Desde {money.format(product.price)}</span>
        </div>
      </div>

      {/* Portada */}
      <section className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <nav aria-label="Ruta de navegación" className="text-xs text-[#6e6e73]">
          <Link href="/" className="hover:text-[#1d1d1f] hover:underline">
            Tienda
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/#${product.category}`} className="hover:text-[#1d1d1f] hover:underline">
            {product.category}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#1d1d1f]">{product.name}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Imagen */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#f5f5f7]">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="hero-enter object-contain p-10 md:p-16"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-9xl font-light text-[#86868b]">
                  {product.category.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Información y compra */}
          <div className="flex flex-col">
            {lowStock && (
              <p className="text-sm font-medium text-[#b64400]">Quedan solo {product.stock} unidades</p>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#6e6e73]">
              {product.category}
            </p>
            <h1 className="apple-display mt-2 text-4xl font-semibold text-[#1d1d1f] md:text-5xl">
              Compra {product.name}
            </h1>

            <p className="mt-6 text-[17px] leading-relaxed text-[#1d1d1f]">{product.description}</p>

            <div className="mt-8 border-t border-[#d2d2d7] pt-8">
              <p className="text-2xl font-semibold text-[#1d1d1f]">{money.format(product.price)}</p>
              <p className="mt-1 text-sm text-[#6e6e73]">
                {money.format(priceWithTax)} con impuesto ({Math.round(TAX_RATE * 100)}%) incluido
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-[#d2d2d7] p-5">
              <p className="text-sm font-semibold text-[#1d1d1f]">Disponibilidad</p>
              <p className={`mt-1 text-sm ${inStock ? "text-[#008009]" : "text-[#e30000]"}`}>
                {inStock ? "Disponible para recojo en tienda" : "Agotado por el momento"}
              </p>
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} size="lg" />
            </div>

            <Link
              href="/carrito"
              className="mt-4 text-center text-sm text-[#0066cc] hover:underline"
            >
              Ver bolsa <span className="ml-0.5">›</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ventajas de comprar */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <Reveal>
          <h2 className="apple-display text-3xl font-semibold text-[#1d1d1f] md:text-4xl">
            Por qué comprar aquí.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="h-full rounded-3xl bg-[#f5f5f7] p-8">
                <h3 className="text-xl font-semibold text-[#1d1d1f]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <RelatedProducts productId={product._id} category={product.category} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-20 lg:grid-cols-[1.4fr_1fr] lg:px-8">
      <div className="aspect-square w-full animate-pulse rounded-3xl bg-[#f5f5f7]" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-20 w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="bg-white text-[#1d1d1f]">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}
