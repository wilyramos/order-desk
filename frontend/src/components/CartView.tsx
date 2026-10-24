"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const priceFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export default function CartView() {
  const { items, total, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl text-[#6e6e73]">Tu carrito está vacío.</p>
        <Link href="/#iPhone" className="mt-6 inline-block text-lg text-[#0066cc] hover:underline">
          Ver productos ›
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-black/10">
        {items.map(({ product, quantity }) => (
          <li key={product._id} className="flex items-center gap-6 py-6">
            <div className="relative h-24 w-24 shrink-0 rounded-2xl bg-[#f5f5f7]">
              {product.image && (
                <Image src={product.image} alt={product.name} fill sizes="96px" className="object-contain p-2" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-lg font-semibold">{product.name}</p>
              <p className="text-[#6e6e73]">{priceFormatter.format(product.price)}</p>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center rounded-full bg-[#f5f5f7]">
                  <button
                    type="button"
                    onClick={() => setQuantity(product._id, quantity - 1)}
                    className="px-4 py-1.5 text-lg hover:opacity-60"
                  >
                    −
                  </button>
                  <span className="min-w-[2ch] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(product._id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-1.5 text-lg hover:opacity-60 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(product._id)}
                  className="text-sm text-[#0066cc] hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <p className="font-semibold">{priceFormatter.format(product.price * quantity)}</p>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-3xl bg-[#f5f5f7] p-6">
        <h2 className="text-xl font-semibold">Resumen</h2>
        <div className="mt-4 flex justify-between text-lg">
          <span>Total</span>
          <span className="font-semibold">{priceFormatter.format(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block rounded-full bg-[#0066cc] py-3 text-center text-white transition hover:bg-[#0071e3]"
        >
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}