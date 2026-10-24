"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartLink() {
  const { count } = useCart();

  return (
    <Link href="/carrito" className="transition-opacity hover:opacity-60">
      Carrito ({count})
    </Link>
  );
}