"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

export default function AddToCartButton({
  product,
  size = "sm",
}: {
  product: Product;
  size?: "sm" | "lg";
}) {
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
      className={`rounded-full font-medium transition-colors duration-200 ${
        size === "lg" ? "w-full px-6 py-3 text-[17px]" : "px-4 py-1.5 text-sm"
      } ${
        added
          ? "bg-[#1d1d1f] text-white"
          : "bg-[#0071e3] text-white hover:bg-[#0077ed] active:bg-[#006edb]"
      } disabled:cursor-not-allowed disabled:bg-[#e8e8ed] disabled:text-[#86868b]`}
    >
      {!inStock ? "Agotado" : added ? "Agregado ✓" : size === "lg" ? "Agregar a la bolsa" : "Comprar"}
    </button>
  );
}