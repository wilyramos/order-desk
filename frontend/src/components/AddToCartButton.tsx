"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inStock = product.stock > 0;

  function handleClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!inStock}
      className="rounded-full bg-[#0066cc] px-5 py-2 text-white transition hover:bg-[#0071e3] disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {added ? "Agregado ✓" : "Comprar"}
    </button>
  );
}