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
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
        added
          ? "bg-[#1d1d1f] text-white"
          : "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#006edb]"
      } disabled:cursor-not-allowed disabled:bg-[#e8e8ed] disabled:text-[#86868b]`}
    >
      {added ? "Agregado ✓" : "Comprar"}
    </button>
  );
}